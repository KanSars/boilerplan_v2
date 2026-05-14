import type { EquipmentDefinition, EquipmentWithPlacement } from "../../../domain/equipment/Equipment";
import type { Project } from "../../../domain/project/Project";
import { computeBodyRect } from "../placement/computeWorldGeometry";

export const resolveEquipmentForProject = (project: Project, catalog: EquipmentDefinition[]): EquipmentWithPlacement[] =>
  project.equipmentItems.flatMap((instance) => {
    const definition = catalog.find((item) => item.id === instance.definitionId);
    if (!definition) return [];
    const placement = project.placements.find((item) => item.itemId === instance.id);
    return [{ instance, definition, placement, body: computeBodyRect(definition, placement) }];
  });
