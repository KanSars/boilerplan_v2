import type { EquipmentDefinition } from "../../../domain/equipment/Equipment";
import type { Project } from "../../../domain/project/Project";

export const buildElementEvidenceReport = (project: Project, catalog: EquipmentDefinition[]) =>
  project.equipmentItems.map((item) => {
    const definition = catalog.find((entry) => entry.id === item.definitionId);
    return {
      itemId: item.id,
      label: item.label,
      definitionId: item.definitionId,
      sourceStatus: definition?.sourceStatus ?? "placeholder_dev",
      confidence: definition?.confidence ?? 0,
      evidenceLinks: definition?.evidenceLinks ?? [],
      blockers: definition?.sourceStatus === "placeholder_dev" ? ["dev fixture cannot be final"] : [],
    };
  });
