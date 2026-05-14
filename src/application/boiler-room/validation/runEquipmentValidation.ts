import type { EquipmentDefinition } from "../../../domain/equipment/Equipment";
import type { Project } from "../../../domain/project/Project";
import type { ValidationIssue } from "../../../domain/validation/Validation";

export const runEquipmentValidation = (project: Project, catalog: EquipmentDefinition[]): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const roles = new Set(project.equipmentItems.map((item) => item.role));
  const requiredRoles = ["primary_boiler", "supply_header", "return_header", "supply_shutoff", "return_shutoff", "gas_shutoff"];
  for (const role of requiredRoles) {
    if (!roles.has(role)) {
      issues.push(makeIssue(`missing_${role}`, "blocker", "Нет обязательного элемента", `Для пилота требуется элемент роли ${role}.`, [], "blocked", true));
    }
  }
  for (const item of project.equipmentItems) {
    const definition = catalog.find((entry) => entry.id === item.definitionId);
    if (!definition) {
      issues.push(makeIssue(`unknown_def_${item.id}`, "blocker", "Карточка оборудования не найдена", `Нет определения для ${item.definitionId}.`, [item.id], "blocked", true));
      continue;
    }
    if (definition.category === "placeholder" || definition.sourceStatus === "placeholder_dev") {
      issues.push(makeIssue(`placeholder_${item.id}`, "blocker", "Placeholder-оборудование в проекте", "Placeholder/dev fixture не допускается в final package.", [item.id], "blocked", true));
    }
    const hasUnknownPoint = definition.connectionPoints.some((point) => point.status === "unknown");
    if (hasUnknownPoint) {
      issues.push(makeIssue(`unknown_cp_${item.id}`, "blocker", "Unknown connection point", "Не все точки подключения определены.", [item.id], "needs_data", true));
    }
    const placeholders = definition.connectionPoints.filter((point) => point.status === "placeholder");
    for (const point of placeholders) {
      issues.push(makeIssue(`placeholder_cp_${item.id}_${point.id}`, "warning", "Placeholder-точка подключения", `${point.label} отмечена как placeholder и не войдет в final без закрытия.`, [item.id, point.id], "needs_data", true));
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
  status: ValidationIssue["status"],
  canBlockFinalExport: boolean,
): ValidationIssue => ({
  id,
  severity,
  category: "equipment",
  title,
  description,
  affectedEntities,
  source: "validation.equipment",
  suggestedFix: "Открыть карточку оборудования и закрыть данные или заменить элемент.",
  navigationTarget: { workspace: "equipment", entityId: affectedEntities[0] },
  status,
  canBlockFinalExport,
});
