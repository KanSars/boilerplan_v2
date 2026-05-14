import type { ValidationSeverity } from "../validation/Validation";

export type Requirement = {
  id: string;
  sourceDocumentId: string;
  sourceTitle: string;
  clause: string;
  originalText: string;
  normalizedText: string;
  appliesWhen: Record<string, string | number | boolean>;
  requiredFacts: string[];
  checkType: string;
  evaluationMethod: "formal_rule" | "ai_assisted" | "manual_cad_action";
  severity: ValidationSeverity;
  resultType: string;
  citations: string[];
  status: "placeholder" | "extracted" | "compiled" | "verified";
};

export type CompiledRule = {
  id: string;
  requirementId: string;
  version: string;
  description: string;
  status: Requirement["status"];
  missingFactsBlockFinal: boolean;
};

export type RuleResult = {
  ruleId: string;
  requirementId: string;
  result:
    | "pass"
    | "fail"
    | "warning"
    | "not_applicable"
    | "blocked_missing_data"
    | "needs_ai_interpretation"
    | "manual_review_required"
    | "manual_cad_action";
  message: string;
  missingFacts: string[];
};

export type EvidenceDataset = {
  documents: Array<{ id: string; title: string; path: string; placeholder: boolean; sourceHash?: string; rulesVersion: string; compiledAt: string }>;
  requirements: Requirement[];
  compiledRules: CompiledRule[];
};
