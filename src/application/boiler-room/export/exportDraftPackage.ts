import type { EquipmentDefinition } from "../../../domain/equipment/Equipment";
import type { Project } from "../../../domain/project/Project";
import type { ProjectReadinessReport } from "../../../domain/validation/Validation";
import type { EngineeringDrawing } from "../../../domain/drawing/EngineeringDrawing";
import { buildCoverLetter, formatCoverLetterMarkdown } from "./buildCoverLetter";
import { exportDxf } from "./exportDxf";
import { exportEquipmentCsv } from "./exportEquipmentCsv";
import { exportProjectJson } from "./exportProjectJson";
import { exportSheetSvg } from "./exportSheetSvg";

export const exportDraftPackage = (project: Project, catalog: EquipmentDefinition[], drawing: EngineeringDrawing, readiness: ProjectReadinessReport) => ({
  "project.draft.json": exportProjectJson(project),
  "equipment.draft.csv": exportEquipmentCsv(project, catalog),
  "sheet.draft.svg": exportSheetSvg(drawing),
  "drawing.draft.dxf": exportDxf(drawing),
  "diagnostic-report.draft.md": `# Draft diagnostic\n\nStatus: ${readiness.status}\n\n${readiness.exportReadiness.reasons.map((reason) => `- ${reason}`).join("\n")}`,
  "cover-letter.draft.md": formatCoverLetterMarkdown(buildCoverLetter(project, catalog, readiness)),
});
