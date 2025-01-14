import React from 'react';
import { MODE_FEATURES } from '../../shared/constants';
import { ProjectPage } from '../../shared/state';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Select } from '../components/Select';
import { UrlStateContext } from '../urlState';
import { Panel } from './Panel';

const IS_EXPORT = Boolean((window as any).DATASTATION_IS_EXPORT);

export function Dashboard({
  page,
  reevalPanel,
}: {
  page: ProjectPage;
  reevalPanel: (panelId: string, reset?: boolean) => void;
}) {
  const {
    state: { refreshPeriod },
    setState: setUrlState,
  } = React.useContext(UrlStateContext);
  const { panels } = page;

  async function evalAll() {
    for (let panel of panels) {
      await reevalPanel(panel.id);
    }
  }

  React.useEffect(() => {
    let done = false;
    let i: ReturnType<typeof setTimeout> = null;
    if (IS_EXPORT || !MODE_FEATURES.dashboard) {
      return;
    }

    async function loop() {
      while (!done) {
        clearTimeout(i);
        await new Promise<void>((resolve, reject) => {
          try {
            i = setTimeout(() => {
              try {
                evalAll();
                resolve();
              } catch (e) {
                reject(e);
              }
            }, (+refreshPeriod || 60) * 1000);
          } catch (e) {
            reject(e);
          }
        });
      }
    }

    loop();

    return () => {
      done = true;
      clearInterval(i);
    };
  }, [refreshPeriod, panels.map((p) => p.id).join(',')]);

  if (!MODE_FEATURES.dashboard) {
    return (
      <div className="section">
        <div className="text-center">
          This feature is only available in server mode.
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      {!IS_EXPORT && (
        <div className="flex-right">
          <Select
            label="Refresh every"
            onChange={(v: string) => setUrlState({ refreshPeriod: +v })}
            value={String(+refreshPeriod || 60)}
          >
            <option value="30">30 seconds</option>
            <option value="60">1 minute</option>
            <option value={String(60 * 5)}>5 minutes</option>
            <option value={String(60 * 15)}>15 minutes</option>
            <option value={String(60 * 60)}>1 hour</option>
          </Select>
        </div>
      )}
      {panels.map((panel) => (
        <ErrorBoundary key={panel.id}>
          <Panel panel={panel} />
        </ErrorBoundary>
      ))}
    </div>
  );
}
