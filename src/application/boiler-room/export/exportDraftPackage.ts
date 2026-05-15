import type { EquipmentDefinition } from "../../../domain/equipment/Equipment";
import type { Project } from "../../../domain/project/Project";
import type { ProjectReadinessReport } from "../../../domain/validation/Validation";
import type { EngineeringDrawing } from "../../../domain/drawing/EngineeringDrawing";
import type { DrawingExportAdapters } from "../../../domain/export/ExportAdapters";
import { buildCoverLetter, formatCoverLetterMarkdown } from "./buildCoverLetter";
import { exportEquipmentCsv } from "./exportEquipmentCsv";
import { exportProjectJson } from "./exportProjectJson";
import { exportPlanSvg } from "./exportPlanSvg";

export const exportDraftPackage = (project: Project, catalog: EquipmentDefinition[], drawing: EngineeringDrawing, readiness: ProjectReadinessReport, adapters: DrawingExportAdapters) => ({
  "project.draft.json": exportProjectJson(project),
  "equipment.draft.csv": exportEquipmentCsv(project, catalog),
  "plan.draft.svg": exportPlanSvg(project, catalog),
  "sheet.draft.svg": adapters.exportSheetSvg(drawing),
  "drawing.draft.dxf": adapters.exportDxf(drawing),
  "diagnostic-report.draft.md": buildDiagnosticReport(readiness),
  "cover-letter.draft.md": formatCoverLetterMarkdown(buildCoverLetter(project, catalog, readiness)),
});

const buildDiagnosticReport = (readiness: ProjectReadinessReport): string => [
  "# Диагностический отчет чернового пакета",
  "",
  `Статус готовности: ${readiness.status}`,
  `Оценка готовности: ${readiness.score}`,
  "",
  "## Что блокирует финальный пакет",
  ...(readiness.exportReadiness.reasons.length ? readiness.exportReadiness.reasons.map((reason) => `- ${reason}`) : ["- Нет блокирующих замечаний"]),
  "",
  "## Проверки по категориям",
  ...Object.entries(readiness.checks).flatMap(([category, issues]) => [
    "",
    `### ${category}`,
    ...(issues.length ? issues.map((issue) => `- [${issue.severity}/${issue.status}] ${issue.title}: ${issue.description} Исправление: ${issue.suggestedFix}`) : ["- Нет замечаний"]),
  ]),
  "",
  "## Ручные CAD-действия",
  ...(readiness.manualCadActions.length ? readiness.manualCadActions.map((item) => `- ${item.title}: ${item.description}`) : ["- Нет"]),
].join("\n");
