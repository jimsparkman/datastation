import fs from 'fs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ProjectState } from '../shared/state';
import { Dashboard } from '../ui/dashboard';
import { makeReevalPanel } from '../ui/PageList';
import { UrlStateContext } from '../ui/urlState';

export function renderPage(project: ProjectState, pageId: string) {
  const pageIndex = project.pages.findIndex((p) => p.id === pageId);
  const page = project.pages[pageIndex];
  const reevalPanel = makeReevalPanel(page, project, (p) => {});
  const view = (
    <UrlStateContext.Provider
      value={{
        state: { projectId: project.id, page: pageIndex, view: 'dashboard' },
        setState: (p) => {},
      }}
    >
      <Dashboard page={page} reevalPanel={reevalPanel} />
    </UrlStateContext.Provider>
  );

  return `<!doctype html>
<html>
  <head>
    <style type="text/css">${fs.readFileSync('ui/style.css').toString()}</style>
  </head>
  <body>${renderToString(view)}</body>
</html>`;
}
