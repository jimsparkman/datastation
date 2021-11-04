import fs from 'fs';
import path from 'path';
import SSH2Promise from 'ssh2-promise';
import SSH2Config from 'ssh2-promise/lib/sshConfig';
import { HOME } from '../desktop/constants';
import { decryptFields } from '../desktop/secret';
import log from '../shared/log';
import { ProjectState } from '../shared/state';

interface SSHConfig extends SSH2Config {
  retries: number;
  retry_factor: number;
  retry_minTimeout: number;
}

export function resolvePath(name: string) {
  if (name.startsWith('~/')) {
    name = path.join(HOME, name.slice(2));
  }
  return path.resolve(name);
}

export async function getSSHConfig(
  project: ProjectState,
  serverId: string
): Promise<SSHConfig> {
  const servers = (project.servers || []).filter((s) => s.id === serverId);
  if (!servers.length) {
    throw new Error('No such server.');
  }
  const server = servers[0];
  decryptFields(server);

  const config: SSHConfig = {
    host: server.address,
    port: server.port,
    readyTimeout: 20000,
    retries: 2,
    retry_factor: 2,
    retry_minTimeout: 2000,
  };

  if (server.type === 'ssh-agent') {
    config.agent = process.env.SSH_AGENT;
  }

  if (server.type === 'private-key') {
    config.username = server.username;
    if (server.privateKeyFile) {
      const buffer = fs.readFileSync(resolvePath(server.privateKeyFile));
      config.privateKey = buffer.toString();
      config.passphrase = server.passphrase_encrypt.value;
    }
  }

  if (server.type === 'password') {
    config.username = server.username;
    config.password = server.password_encrypt.value;
  }

  return config;
}

export async function tunnel<T>(
  project: ProjectState,
  serverId: string,
  destAddress: string,
  destPort: number,
  callback: (host: string, port: number) => Promise<T>
) {
  if (destAddress.includes('://')) {
    throw new Error('Tunnel address must not contain protocol.');
  }

  if (!serverId) {
    return callback(destAddress, destPort);
  }

  const config = await getSSHConfig(project, serverId);

  const ssh = new SSH2Promise(config);
  const tunnel = await ssh.addTunnel({
    remoteAddr: destAddress,
    remotePort: destPort,
  });
  try {
    log.info(
      `Connected to tunnel, proxying ${destAddress}:${destPort} via server to localhost:${tunnel.localPort}`
    );
    return await callback(tunnel.localAddress, tunnel.localPort);
  } finally {
    log.info('Closing tunnel');
    ssh.close();
  }
}