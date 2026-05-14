import type { Project } from "../../../domain/project/Project";

export const removeEquipmentPlacement = (project: Project, itemId: string): Project => ({
  ...project,
  placements: project.placements.map((placement) => (placement.itemId === itemId ? { ...placement, placed: false } : placement)),
  updatedAt: new Date().toISOString(),
});
