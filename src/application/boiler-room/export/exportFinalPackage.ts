import type { EquipmentDefinition } from "../../../domain/equipment/Equipment";
import type { Project } from "../../../domain/project/Project";
import type { ProjectReadinessReport } from "../../../domain/validation/Validation";
import type { EngineeringDrawing } from "../../../domain/drawing/EngineeringDrawing";
import type { DrawingExportAdapters } from "../../../domain/export/ExportAdapters";
import { buildCoverLetter, formatCoverLetterMarkdown } from "./buildCoverLetter";
import { exportProjectJson } from "./exportProjectJson";

export const exportFinalPackage = (project: Project, catalog: EquipmentDefinition[], drawing: EngineeringDrawing, readiness: ProjectReadinessReport, adapters: DrawingExportAdapters) => {
  if (readiness.exportReadiness.final !== "final_ready") {
    throw new Error(`Final package blocked: ${readiness.exportReadiness.reasons.join("; ")}`);
  }
  return {
    "drawing.final.dxf": adapters.exportDxf(drawing),
    "cover-letter.final.md": formatCoverLetterMarkdown(buildCoverLetter(project, catalog, readiness)),
    "project-snapshot.final.json": exportProjectJson(project),
    "checks.final.json": JSON.stringify(readiness, null, 2),
    "evidence-snapshot.final.json": JSON.stringify({ refs: project.evidenceSnapshotRefs, status: readiness.evidenceStatus, generatedAt: new Date().toISOString() }, null, 2),
  };
};
