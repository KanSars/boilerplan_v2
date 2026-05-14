import type { PipingRoute } from "../../../domain/routing/PipingRoute";
import type { ValidationIssue } from "../../../domain/validation/Validation";

export const validateRoutes = (routes: PipingRoute[]): ValidationIssue[] =>
  routes.flatMap<ValidationIssue>((route) => {
    if (route.status === "manual_cad_action") {
      return [{
        id: `route_manual_${route.id}`,
        severity: "warning",
        category: "routing",
        title: "Трасса требует ручного CAD-оформления",
        description: route.validationIssues.join(" "),
        affectedEntities: [route.id],
        source: "routing.validateRoutes",
        suggestedFix: "Оформить трассу в CAD или задать route override.",
        navigationTarget: { workspace: "schematic", entityId: route.connectionId },
        status: "manual_cad_action",
        canBlockFinalExport: false,
      } satisfies ValidationIssue];
    }
    return route.validationIssues.map((issue, index) => ({
      id: `route_issue_${route.id}_${index}`,
      severity: "warning",
      category: "routing",
      title: "Предварительная трасса не подтверждена",
      description: issue,
      affectedEntities: [route.id],
      source: "routing.validateRoutes",
      suggestedFix: "Подтвердить связь или задать ручной route override.",
      navigationTarget: { workspace: "schematic", entityId: route.connectionId },
      status: "needs_confirmation",
      canBlockFinalExport: true,
    } satisfies ValidationIssue));
  });
