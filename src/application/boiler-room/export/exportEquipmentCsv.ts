import type { EquipmentDefinition } from "../../../domain/equipment/Equipment";
import type { Project } from "../../../domain/project/Project";

export const exportEquipmentCsv = (project: Project, catalog: EquipmentDefinition[]): string => {
  const rows = [["id", "label", "role", "definition", "category", "manufacturer", "model", "status"]];
  for (const item of project.equipmentItems) {
    const definition = catalog.find((entry) => entry.id === item.definitionId);
    rows.push([item.id, item.label, item.role, definition?.name ?? item.definitionId, definition?.category ?? "", definition?.manufacturer ?? "", definition?.model ?? "", item.status]);
  }
  return rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
};
