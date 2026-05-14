import type { Project } from "../../../domain/project/Project";

export const removeEquipmentFromProject = (project: Project, itemId: string): Project => ({
  ...project,
  equipmentItems: project.equipmentItems.filter((item) => item.id !== itemId),
  placements: project.placements.filter((placement) => placement.itemId !== itemId),
  connectionOverrides: project.connectionOverrides.filter((connection) => connection.from.itemId !== itemId && connection.to?.itemId !== itemId),
  routeOverrides: project.routeOverrides.filter((route) => !route.connectionId.includes(itemId)),
  updatedAt: new Date().toISOString(),
});
