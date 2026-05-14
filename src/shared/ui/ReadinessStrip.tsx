import type { ProjectReadinessReport } from "../../domain/validation/Validation";

export const ReadinessStrip = ({ readiness }: { readiness: ProjectReadinessReport }) => (
  <div className="readinessStrip">
    <span>Готовность {readiness.score}</span>
    <span>Блокеры {readiness.blockers.length}</span>
    <span>Предупреждения {readiness.warnings.length}</span>
    <span>Нет данных {readiness.missingData.length}</span>
    <span>Ручные CAD-действия {readiness.manualCadActions.length}</span>
  </div>
);
