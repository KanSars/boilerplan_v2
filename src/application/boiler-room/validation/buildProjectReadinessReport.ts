import type { EquipmentDefinition } from "../../../domain/equipment/Equipment";
import type { Project } from "../../../domain/project/Project";
import type { ProjectReadinessReport, ManualCadAction, ValidationIssue } from "../../../domain/validation/Validation";
import { buildPreliminaryRoutes } from "../routing/buildPreliminaryRoutes";
import { validateRoutes } from "../routing/validateRoutes";
import { resolveSystemConnections } from "../connections/resolveSystemConnections";
import { runCalculationValidation } from "./runCalculationValidation";
import { runConnectionValidation } from "./runConnectionValidation";
import { runEquipmentValidation } from "./runEquipmentValidation";
import { runInputValidation } from "./runInputValidation";
import { runPlacementValidation } from "./runPlacementValidation";

export const buildProjectReadinessReport = (project: Project, catalog: EquipmentDefinition[]): ProjectReadinessReport => {
  const connections = resolveSystemConnections(project, catalog);
  const routes = buildPreliminaryRoutes(project, catalog, connections);
  const issues = [
    ...runInputValidation(project),
    ...runEquipmentValidation(project, catalog),
    ...runPlacementValidation(project, catalog),
    ...runConnectionValidation(connections),
    ...validateRoutes(routes),
    ...runCalculationValidation(project),
    ...runEvidenceValidation(project),
  ];
  const blockers = issues.filter((issue) => issue.severity === "blocker" || (issue.canBlockFinalExport && ["blocked", "needs_data"].includes(issue.status)));
  const unresolved = issues.filter((issue) => issue.canBlockFinalExport && ["needs_confirmation", "draft"].includes(issue.status));
  const manualCadActions = buildManualCadActions(issues);
  const status = blockers.length > 0 ? "blocked" : unresolved.length > 0 ? "incomplete" : "readyForFinalPackage";
  const checks = issues.reduce<ProjectReadinessReport["checks"]>((acc, issue) => {
    acc[issue.category].push(issue);
    return acc;
  }, { input: [], equipment: [], placement: [], connection: [], routing: [], calculation: [], drawing: [], evidence: [] });
  const score = Math.max(0, Math.round(100 - blockers.length * 20 - unresolved.length * 8 - manualCadActions.length * 2));

  return {
    status,
    score,
    blockers,
    errors: issues.filter((issue) => issue.severity === "error"),
    warnings: issues.filter((issue) => issue.severity === "warning"),
    missingData: issues.filter((issue) => issue.status === "needs_data"),
    unresolvedReviewRequired: unresolved,
    manualCadActions,
    verifiedItems: ["pilot_scope_ru_gas_water", "room_dimensions_present", "pilot_catalog_loaded"],
    notApplicableItems: ["roof_boiler_room_rules", "steam_boiler_rules"],
    checks,
    evidenceStatus: issues.some((issue) => issue.category === "evidence") ? "placeholder" : "partial",
    exportReadiness: {
      draft: "draft_available",
      final: status === "readyForFinalPackage" ? "final_ready" : "final_blocked",
      reasons: blockers.concat(unresolved).map((issue) => issue.title),
    },
  };
};

const runEvidenceValidation = (project: Project): ValidationIssue[] => {
  const placeholderFields = Object.entries(project.projectInputs.sourceStatusByField).filter(([, value]) => value.status === "placeholder" || value.status === "unknown");
  return placeholderFields.map(([field]) => ({
    id: `evidence_${field}`,
    severity: "blocker",
    category: "evidence",
    title: "Недостаточный источник исходных данных",
    description: `${field} имеет статус placeholder/unknown.`,
    affectedEntities: [field],
    source: "validation.evidence",
    suggestedFix: "Указать источник и статус достоверности.",
    navigationTarget: { workspace: "inputs", focus: field },
    status: "needs_data",
    canBlockFinalExport: true,
  }));
};

const buildManualCadActions = (issues: ValidationIssue[]): ManualCadAction[] =>
  issues.filter((issue) => issue.status === "manual_cad_action").map((issue) => ({
    id: `manual_${issue.id}`,
    title: issue.title,
    description: issue.description,
    reason: issue.suggestedFix,
    affectedDrawingEntities: issue.affectedEntities,
    priority: "medium",
    source: issue.source,
    blocksFinalPackage: false,
  }));
