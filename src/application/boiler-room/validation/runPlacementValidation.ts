import type { EquipmentDefinition } from "../../../domain/equipment/Equipment";
import type { Project } from "../../../domain/project/Project";
import type { ValidationIssue } from "../../../domain/validation/Validation";
import { bodyOverlaps, computeBodyRect, computeServiceZoneRect, rectInsideRoom } from "../placement/computeWorldGeometry";

export const runPlacementValidation = (project: Project, catalog: EquipmentDefinition[]): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const placed = project.equipmentItems.flatMap((item) => {
    const definition = catalog.find((entry) => entry.id === item.definitionId);
    const placement = project.placements.find((entry) => entry.itemId === item.id);
    return definition && placement && placement.placed ? [{ item, definition, placement, body: computeBodyRect(definition, placement), zone: computeServiceZoneRect(definition, placement) }] : [];
  });

  for (const entry of placed) {
    if (!rectInsideRoom(entry.body, project.room)) {
      issues.push(makeIssue(`outside_${entry.item.id}`, "blocker", "Оборудование вне помещения", `${entry.item.label} выходит за границы помещения.`, [entry.item.id], true));
    }
    if (!rectInsideRoom(entry.zone, project.room)) {
      issues.push(makeIssue(`service_zone_outside_${entry.item.id}`, "warning", "Зона обслуживания выходит за помещение", `${entry.item.label}: сервисная зона требует решения.`, [entry.item.id], true));
    }
  }

  for (let index = 0; index < placed.length; index += 1) {
    for (let next = index + 1; next < placed.length; next += 1) {
      if (bodyOverlaps(placed[index].body, placed[next].body)) {
        issues.push(makeIssue(`body_collision_${placed[index].item.id}_${placed[next].item.id}`, "blocker", "Пересечение оборудования", `${placed[index].item.label} пересекается с ${placed[next].item.label}.`, [placed[index].item.id, placed[next].item.id], true));
      }
      if (bodyOverlaps(placed[index].zone, placed[next].body) || bodyOverlaps(placed[next].zone, placed[index].body)) {
        issues.push(makeIssue(`service_collision_${placed[index].item.id}_${placed[next].item.id}`, "warning", "Пересечение зоны обслуживания", "Свободная зона обслуживания пересекает другое оборудование.", [placed[index].item.id, placed[next].item.id], true));
      }
    }
  }
  return issues;
};

const makeIssue = (
  id: string,
  severity: ValidationIssue["severity"],
  title: string,
  description: string,
  affectedEntities: string[],
  canBlockFinalExport: boolean,
): ValidationIssue => ({
  id,
  severity,
  category: "placement",
  title,
  description,
  affectedEntities,
  source: "validation.placement",
  suggestedFix: "Перейти на план и скорректировать размещение.",
  navigationTarget: { workspace: "plan", entityId: affectedEntities[0] },
  status: severity === "blocker" ? "blocked" : "needs_confirmation",
  canBlockFinalExport,
});
