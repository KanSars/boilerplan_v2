import type { SystemConnection } from "../connection/SystemConnection";
import type { EquipmentInstance, Placement } from "../equipment/Equipment";
import type { PipingRoute } from "../routing/PipingRoute";
import type { Room } from "../room/Room";
import type { ProjectInputs } from "./ProjectInputs";

export type Project = {
  id: string;
  name: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  projectInputs: ProjectInputs;
  room: Room;
  equipmentItems: EquipmentInstance[];
  placements: Placement[];
  connectionOverrides: SystemConnection[];
  routeOverrides: PipingRoute[];
  drawingSettings: {
    format: "A3";
    scale: number;
    draftWarnings: boolean;
  };
  evidenceSnapshotRefs: string[];
  metadata: Record<string, unknown>;
};
