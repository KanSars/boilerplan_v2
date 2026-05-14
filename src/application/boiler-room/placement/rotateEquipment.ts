import type { Placement } from "../../../domain/equipment/Equipment";
import type { Project } from "../../../domain/project/Project";

export const nextEquipmentRotation = (rotationDeg: Placement["rotationDeg"]): Placement["rotationDeg"] => {
  const rotations: Placement["rotationDeg"][] = [0, 90, 180, 270];
  return rotations[(rotations.indexOf(rotationDeg) + 1) % rotations.length];
};

export const rotateEquipmentToNextPosition = (project: Project, itemId: string): Project => {
  const placement = project.placements.find((item) => item.itemId === itemId);
  if (!placement) return project;
  return rotateEquipment(project, itemId, nextEquipmentRotation(placement.rotationDeg));
};

export const rotateEquipment = (project: Project, itemId: string, rotationDeg: Placement["rotationDeg"]): Project => ({
  ...project,
  placements: project.placements.map((placement) => (placement.itemId === itemId ? { ...placement, rotationDeg } : placement)),
  updatedAt: new Date().toISOString(),
});
