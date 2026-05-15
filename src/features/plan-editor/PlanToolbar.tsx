import type { EquipmentDefinition } from "../../domain/equipment/Equipment";
import type { HelpKey } from "../../shared/config/workspaces";
import { ZoomControls } from "../../shared/ui/ZoomControls";

export const PlanToolbar = ({
  zoom,
  onZoomChange,
  onToggleAdd,
  onConnect,
  onConfirmConnections,
  onHelp,
}: {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onToggleAdd: () => void;
  onConnect: () => void;
  onConfirmConnections: () => void;
  onHelp: (key: HelpKey) => void;
}) => (
  <div className="buttonRow">
    <button type="button" onMouseEnter={() => onHelp("add")} onClick={onToggleAdd}>Добавить объект</button>
    <button type="button" onMouseEnter={() => onHelp("connect")} onClick={onConnect}>Соединить автоматически</button>
    <button type="button" onMouseEnter={() => onHelp("connect")} onClick={onConfirmConnections}>Подтвердить связи</button>
    <ZoomControls value={zoom} onChange={onZoomChange} />
  </div>
);

export const PlanAddMenu = ({
  catalog,
  onAdd,
  categoryLabel,
}: {
  catalog: EquipmentDefinition[];
  onAdd: (definition: EquipmentDefinition) => void;
  categoryLabel: (category: string) => string;
}) => (
  <div className="addMenu">
    {catalog.filter((definition) => definition.category !== "dev_fixture").map((definition) => (
      <button key={definition.id} type="button" onClick={() => onAdd(definition)}>
        {definition.name}<small>{categoryLabel(definition.category)}</small>
      </button>
    ))}
  </div>
);
