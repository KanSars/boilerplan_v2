import type { ExportReadiness, ReviewStatus } from "./status";

export type ValidationSeverity = "info" | "warning" | "error" | "blocker";
export type ValidationCategory =
  | "input"
  | "equipment"
  | "placement"
  | "connection"
  | "routing"
  | "calculation"
  | "drawing"
  | "evidence";

export type NavigationTarget = {
  workspace: "inputs" | "equipment" | "plan" | "schematic" | "drawing" | "readiness" | "export";
  entityId?: string;
  focus?: string;
};

export type ValidationIssue = {
  id: string;
  severity: ValidationSeverity;
  category: ValidationCategory;
  title: string;
  description: string;
  affectedEntities: string[];
  source: string;
  relatedRequirementId?: string;
  suggestedFix: string;
  navigationTarget: NavigationTarget;
  status: ReviewStatus;
  canBlockFinalExport: boolean;
};

export type ManualCadAction = {
  id: string;
  title: string;
  description: string;
  reason: string;
  affectedDrawingEntities: string[];
  priority: "low" | "medium" | "high";
  source: string;
  blocksFinalPackage: boolean;
};

export type ProjectReadinessReport = {
  status: "draft" | "incomplete" | "blocked" | "readyForDraftDxf" | "readyForFinalPackage";
  score: number;
  blockers: ValidationIssue[];
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  missingData: ValidationIssue[];
  unresolvedReviewRequired: ValidationIssue[];
  manualCadActions: ManualCadAction[];
  verifiedItems: string[];
  notApplicableItems: string[];
  checks: Record<ValidationCategory, ValidationIssue[]>;
  evidenceStatus: "placeholder" | "partial" | "ready";
  exportReadiness: {
    draft: ExportReadiness;
    final: ExportReadiness;
    reasons: string[];
  };
};
