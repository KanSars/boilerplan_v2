import type { EvidenceDataset, RuleResult } from "../../../domain/evidence/Evidence";
import type { Project } from "../../../domain/project/Project";

export const evaluateCompiledRules = (project: Project, dataset: EvidenceDataset): RuleResult[] =>
  dataset.compiledRules.map((rule) => {
    if (rule.id === "rule-pilot-minimal-kit") {
      const roles = new Set(project.equipmentItems.map((item) => item.role));
      const missing = ["primary_boiler", "supply_header", "return_header", "supply_shutoff", "return_shutoff", "gas_shutoff"].filter((role) => !roles.has(role));
      return {
        ruleId: rule.id,
        requirementId: rule.requirementId,
        result: missing.length ? "fail" : "pass",
        message: missing.length ? `Missing roles: ${missing.join(", ")}` : "Pilot minimum kit is present.",
        missingFacts: missing,
      };
    }
    return { ruleId: rule.id, requirementId: rule.requirementId, result: "needs_ai_interpretation", message: "Rule evaluator is not implemented yet.", missingFacts: [] };
  });
