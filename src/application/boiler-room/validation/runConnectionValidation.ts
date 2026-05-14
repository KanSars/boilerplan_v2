import type { SystemConnection } from "../../../domain/connection/SystemConnection";
import type { ValidationIssue } from "../../../domain/validation/Validation";

export const runConnectionValidation = (connections: SystemConnection[]): ValidationIssue[] => {
  const required = ["T1", "T2", "G", "FLUE"] as const;
  const issues: ValidationIssue[] = [];
  for (const lineType of required) {
    if (!connections.some((connection) => connection.lineType === lineType)) {
      issues.push(makeIssue(`missing_${lineType}`, "blocker", `Нет связи ${lineType}`, `Обязательная логическая связь ${lineType} не построена.`, [], "blocked", true));
    }
  }
  for (const connection of connections) {
    if (connection.status === "ambiguous") {
      issues.push(makeIssue(`ambiguous_${connection.id}`, "blocker", "Неоднозначное подключение", connection.explanation, [connection.id], "needs_confirmation", true));
    }
    if (connection.reviewStatus === "needs_confirmation") {
      issues.push(makeIssue(`confirm_${connection.id}`, "warning", "Связь требует подтверждения", connection.explanation, [connection.id], "needs_confirmation", true));
    }
    if (connection.reviewStatus === "manual_cad_action") {
      issues.push(makeIssue(`manual_${connection.id}`, "warning", "Связь требует ручного CAD-действия", connection.explanation, [connection.id], "manual_cad_action", false));
    }
  }
  return issues;
};

const makeIssue = (
  id: string,
  severity: ValidationIssue["severity"],
  title: string,
  description: string,
  affectedEntities: string[],
  status: ValidationIssue["status"],
  canBlockFinalExport: boolean,
): ValidationIssue => ({
  id,
  severity,
  category: "connection",
  title,
  description,
  affectedEntities,
  source: "validation.connection",
  suggestedFix: "Открыть схему соединений, подтвердить или переопределить связь.",
  navigationTarget: { workspace: "schematic", entityId: affectedEntities[0] },
  status,
  canBlockFinalExport,
});
