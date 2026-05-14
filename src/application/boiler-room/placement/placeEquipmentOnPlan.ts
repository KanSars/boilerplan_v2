import type { Placement } from "../../../domain/equipment/Equipment";
import type { Project } from "../../../domain/project/Project";

export const placeEquipmentOnPlan = (project: Project, placement: Placement): Project => ({
  ...project,
  placements: [...project.placements.filter((item) => item.itemId !== placement.itemId), placement],
  updatedAt: new Date().toISOString(),
});
