import type { SystemConnection } from "../../domain/connection/SystemConnection";
import { resolveSystemConnections } from "../../application/boiler-room/connections/resolveSystemConnections";
import type { HelpKey } from "../../shared/config/workspaces";
import { ZoomControls } from "../../shared/ui/ZoomControls";
import { PilotSchematicDiagram } from "../../features/schematic-editor/PilotSchematicDiagram";
import { SystemConnectionList } from "../../features/schematic-editor/SystemConnectionList";

export const SchematicWorkspace = ({
  connections,
  onConfirmAll,
  onConnection,
  onHelp,
  zoom,
  onZoomChange,
}: {
  connections: ReturnType<typeof resolveSystemConnections>;
  onConfirmAll: () => void;
  onConnection: (connection: SystemConnection) => void;
  onHelp: (key: HelpKey) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}) => (
  <section>
    <div className="workspaceHeader toolbarHeader">
      <div>
        <p className="eyebrow">Логика системы</p>
        <h2>Схема соединений</h2>
      </div>
      <div className="buttonRow">
        <button type="button" onMouseEnter={() => onHelp("connect")} onClick={onConfirmAll}>Подтвердить все автосвязи</button>
        <ZoomControls value={zoom} onChange={onZoomChange} />
      </div>
    </div>
    <PilotSchematicDiagram zoom={zoom} />
    <SystemConnectionList connections={connections} onConnection={onConnection} />
  </section>
);
