import type { Placement } from "../../../domain/equipment/Equipment";
import type { Project } from "../../../domain/project/Project";

export const rotateEquipment = (project: Project, itemId: string, rotationDeg: Placement["rotationDeg"]): Project => ({
  ...project,
  placements: project.placements.map((placement) => (placement.itemId === itemId ? { ...placement, rotationDeg } : placement)),
  updatedAt: new Date().toISOString(),
});
