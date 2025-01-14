import { EOL } from './types';

function preamble(
  resultsFile: string,
  panelId: string,
  idMap: Record<string | number, string>
) {
  return `
try
    import JSON
catch e
    import Pkg
    Pkg.add("JSON")
    import JSON
end
function DM_getPanel(i)
  panelId = JSON.parse("${JSON.stringify(idMap).replaceAll(
    '"',
    '\\"'
  )}")[string(i)]
  JSON.parsefile(string("${resultsFile}", panelId))
end
function DM_setPanel(v)
  open("${resultsFile + panelId}", "w") do f
    JSON.print(f, v)
  end
end`;
}

function defaultContent(panelIndex: number) {
  if (panelIndex === 0) {
    return 'result = []\n# Your logic here\nDM_setPanel(result)';
  }

  return 'transform = DM_getPanel(0)\n# Your logic here\nDM_setPanel(transform)';
}

function exceptionRewriter(msg: string, programPath: string) {
  const matcher = RegExp(`${programPath}:([1-9]*)`.replaceAll('/', '\\/'), 'g');

  return msg.replace(matcher, function (_: string, line: string) {
    return `${programPath}:${+line - preamble('', '', {}).split(EOL).length}`;
  });
}

export const JULIA = {
  name: 'Julia',
  defaultPath: 'julia',
  defaultContent,
  preamble,
  exceptionRewriter,
};
