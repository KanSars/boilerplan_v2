import type { ProjectReadinessReport, ValidationIssue } from "../../../domain/validation/Validation";

export type ReadinessDecision = "resolved" | "not_applicable" | "manual_cad_action" | "blocked";
export type ReadinessDecisionMap = Record<string, ReadinessDecision>;

export const applyReadinessDecisions = (report: ProjectReadinessReport, decisions: ReadinessDecisionMap): ProjectReadinessReport => {
  const transform = (issue: ValidationIssue): ValidationIssue | undefined => {
    const decision = decisions[issue.id];
    if (!decision) return issue;
    if (decision === "resolved" || decision === "not_applicable") return undefined;
    if (decision === "manual_cad_action") {
      return {
        ...issue,
        severity: "warning",
        status: "manual_cad_action",
        canBlockFinalExport: false,
        title: `${issue.title} — ручное CAD-действие`,
      };
    }
    return { ...issue, severity: "blocker", status: "blocked", canBlockFinalExport: true };
  };

  const issues = Object.values(report.checks).flatMap((items) => items).map(transform).filter((issue): issue is ValidationIssue => Boolean(issue));
  const blockers = issues.filter((issue) => issue.severity === "blocker" || (issue.canBlockFinalExport && ["blocked", "needs_data"].includes(issue.status)));
  const unresolved = issues.filter((issue) => issue.canBlockFinalExport && ["needs_confirmation", "draft"].includes(issue.status));
  const manualCadActions = issues.filter((issue) => issue.status === "manual_cad_action").map((issue) => ({
    id: `manual_${issue.id}`,
    title: issue.title,
    description: issue.description,
    reason: issue.suggestedFix,
    affectedDrawingEntities: issue.affectedEntities,
    priority: "medium" as const,
    source: issue.source,
    blocksFinalPackage: false,
  }));
  const checks = issues.reduce<ProjectReadinessReport["checks"]>((acc, issue) => {
    acc[issue.category].push(issue);
    return acc;
  }, { input: [], equipment: [], placement: [], connection: [], routing: [], calculation: [], drawing: [], evidence: [] });
  const status = blockers.length > 0 ? "blocked" : unresolved.length > 0 ? "incomplete" : "readyForFinalPackage";

  return {
    ...report,
    status,
    score: Math.max(0, Math.round(100 - blockers.length * 20 - unresolved.length * 8 - manualCadActions.length * 2)),
    blockers,
    errors: issues.filter((issue) => issue.severity === "error"),
    warnings: issues.filter((issue) => issue.severity === "warning"),
    missingData: issues.filter((issue) => issue.status === "needs_data"),
    unresolvedReviewRequired: unresolved,
    manualCadActions,
    checks,
    exportReadiness: {
      draft: "draft_available",
      final: status === "readyForFinalPackage" ? "final_ready" : "final_blocked",
      reasons: blockers.concat(unresolved).map((issue) => issue.title),
    },
  };
};
