import * as React from 'react';
import { ConnectorInfo, DatabaseConnectorInfo } from '../shared/state';
import { Button } from './components/Button';
import { Confirm } from './components/Confirm';
import { Input } from './components/Input';
import { DatabaseConnector } from './DatabaseConnector';

export function Connector({
  connector,
  updateConnector,
  deleteConnector,
}: {
  connector: ConnectorInfo;
  updateConnector: (dc: ConnectorInfo) => void;
  deleteConnector: () => void;
}) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className={`connector ${expanded ? 'connector--expanded' : ''}`}>
      <div className="connector-header vertical-align-center">
        {expanded ? (
          <Input
            className="connector-name"
            onChange={(value: string) => {
              connector.name = value;
              updateConnector(connector);
            }}
            value={connector.name}
          />
        ) : (
          <span className="connector-name">{connector.name}</span>
        )}
        <div className="flex-right">
          {!expanded && (
            <Button
              type="outline"
              icon
              data-testid="show-hide-connector"
              className="flex-right hover-button"
              onClick={() => setExpanded(true)}
              title="Edit"
            >
              edit_outline
            </Button>
          )}
          <span title="Delete data source">
            <Confirm
              right
              onConfirm={deleteConnector}
              message="delete this data source"
              action="Delete"
              className="hover-button"
              render={(confirm: () => void) => (
                <Button icon onClick={confirm} type="outline">
                  delete
                </Button>
              )}
            />
          </span>
        </div>
      </div>
      {expanded && (
        <React.Fragment>
          {connector.type === 'database' && (
            <DatabaseConnector
              connector={connector as DatabaseConnectorInfo}
              updateConnector={updateConnector}
            />
          )}
          <div className="text-center">
            <Button type="outline" onClick={() => setExpanded(false)}>
              Close
            </Button>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}
