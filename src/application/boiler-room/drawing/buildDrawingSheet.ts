import type { EquipmentDefinition } from "../../../domain/equipment/Equipment";
import type { Project } from "../../../domain/project/Project";
import type { ProjectReadinessReport } from "../../../domain/validation/Validation";
import { buildEngineeringDrawing } from "./buildEngineeringDrawing";

export const buildDrawingSheet = (project: Project, catalog: EquipmentDefinition[], readiness: ProjectReadinessReport) =>
  buildEngineeringDrawing(project, catalog, readiness);
