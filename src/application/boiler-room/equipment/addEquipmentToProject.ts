import type { Project } from "../../../domain/project/Project";

export const addEquipmentToProject = (project: Project, definitionId: string, label: string, role = "project_equipment"): Project => {
  const id = `inst_${definitionId}_${project.equipmentItems.length + 1}`;
  return {
    ...project,
    equipmentItems: [
      ...project.equipmentItems,
      {
        id,
        definitionId,
        label,
        role,
        quantity: 1,
        instanceParameters: {},
        connectionPointOverrides: [],
        evidenceOverrides: [],
        status: "needs_confirmation",
        metadata: {},
      },
    ],
    updatedAt: new Date().toISOString(),
  };
};
