import type { Project } from "../../../domain/project/Project";
import type { ValidationIssue } from "../../../domain/validation/Validation";

export const runInputValidation = (project: Project): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (project.room.widthMm <= 0 || project.room.lengthMm <= 0 || project.room.heightMm <= 0) {
    issues.push(issue("input_room_dimensions", "blocker", "input", "Некорректные размеры помещения", "Ширина, длина и высота должны быть больше нуля.", "inputs", true));
  }
  if (project.projectInputs.country !== "RU") {
    issues.push(issue("input_country_scope", "blocker", "input", "Пилот поддерживает только РФ", "Нормативный контекст за пределами РФ пока не реализован.", "inputs", true));
  }
  if (project.projectInputs.boilerRoomPlacement !== "standalone") {
    issues.push(issue("input_placement_scope", "blocker", "input", "Тип размещения вне пилота", "Финальный пакет поддержан только для отдельно стоящей котельной.", "inputs", true));
  }
  return issues;
};

const issue = (
  id: string,
  severity: ValidationIssue["severity"],
  category: ValidationIssue["category"],
  title: string,
  description: string,
  workspace: ValidationIssue["navigationTarget"]["workspace"],
  canBlockFinalExport: boolean,
): ValidationIssue => ({
  id,
  severity,
  category,
  title,
  description,
  affectedEntities: [],
  source: "validation.input",
  suggestedFix: "Проверить паспорт исходных данных.",
  navigationTarget: { workspace },
  status: severity === "blocker" ? "blocked" : "needs_data",
  canBlockFinalExport,
});
