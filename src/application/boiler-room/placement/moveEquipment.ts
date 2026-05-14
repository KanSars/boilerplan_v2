import type { Project } from "../../../domain/project/Project";

export const moveEquipment = (project: Project, itemId: string, xMm: number, yMm: number): Project => ({
  ...project,
  placements: project.placements.map((placement) => (placement.itemId === itemId ? { ...placement, xMm, yMm } : placement)),
  updatedAt: new Date().toISOString(),
});
