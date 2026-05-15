import type { EquipmentDefinition, EquipmentWithPlacement } from "../../domain/equipment/Equipment";
import { buildPreliminaryRoutes } from "../../application/boiler-room/routing/buildPreliminaryRoutes";
import type { HelpKey } from "../../shared/config/workspaces";
import { categoryLabel } from "../../shared/formatting/boilerRoomFormatters";
import { PlanActions } from "../../features/plan-editor/PlanActions";
import { PlanCanvas } from "../../features/plan-editor/PlanCanvas";
import { PlanAddMenu, PlanToolbar } from "../../features/plan-editor/PlanToolbar";

export const PlanWorkspace = ({
  equipment,
  routes,
  selectedId,
  addMenuOpen,
  catalog,
  onSelect,
  onMove,
  onRotate,
  onDelete,
  onConnect,
  onConfirmConnections,
  onAdd,
  onToggleAdd,
  onHelp,
  zoom,
  onZoomChange,
}: {
  equipment: EquipmentWithPlacement[];
  routes: ReturnType<typeof buildPreliminaryRoutes>;
  selectedId: string;
  addMenuOpen: boolean;
  catalog: EquipmentDefinition[];
  onSelect: (id: string) => void;
  onMove: (id: string, xMm: number, yMm: number) => void;
  onRotate: (id: string) => void;
  onDelete: (id: string) => void;
  onConnect: () => void;
  onConfirmConnections: () => void;
  onAdd: (definition: EquipmentDefinition) => void;
  onToggleAdd: () => void;
  onHelp: (key: HelpKey) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}) => (
  <section>
    <div className="workspaceHeader toolbarHeader">
      <div>
        <p className="eyebrow">Физическое размещение</p>
        <h2>План помещения</h2>
      </div>
      <PlanToolbar zoom={zoom} onZoomChange={onZoomChange} onToggleAdd={onToggleAdd} onConnect={onConnect} onConfirmConnections={onConfirmConnections} onHelp={onHelp} />
    </div>
    {addMenuOpen && <PlanAddMenu catalog={catalog} onAdd={onAdd} categoryLabel={categoryLabel} />}
    <PlanCanvas equipment={equipment} routes={routes} selectedId={selectedId} zoom={zoom} onSelect={onSelect} onMove={onMove} />
    <PlanActions selectedId={selectedId} onRotate={onRotate} onDelete={onDelete} />
  </section>
);
