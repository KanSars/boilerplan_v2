import type { ReadinessDecision, ReadinessDecisionMap } from "../../application/boiler-room/validation/applyReadinessDecisions";
import type { ProjectReadinessReport, ValidationIssue } from "../../domain/validation/Validation";
import { translateCategory, translateExport, translateReview, translateSeverity } from "../../shared/formatting/boilerRoomFormatters";
import { ReadinessStrip } from "../../shared/ui/ReadinessStrip";

export const ReadinessWorkspace = ({
  readiness,
  decisions,
  onNavigate,
  onDecision,
}: {
  readiness: ProjectReadinessReport;
  decisions: ReadinessDecisionMap;
  onNavigate: (issue: ValidationIssue) => void;
  onDecision: (issue: ValidationIssue, decision: ReadinessDecision) => void;
}) => (
  <section>
    <div className="workspaceHeader">
      <p className="eyebrow">Готовность проекта</p>
      <h2>Проверка</h2>
      <ReadinessStrip readiness={readiness} />
    </div>
    <div className="readinessFilters">
      <span>Финал: {translateExport(readiness.exportReadiness.final)}</span>
      <span>Блокирует финал: {readiness.blockers.length + readiness.unresolvedReviewRequired.length}</span>
      <span>Закрыто вручную: {Object.keys(decisions).length}</span>
    </div>
    <div className="issueGrid">
      {Object.entries(readiness.checks).map(([category, issues]) => (
        <article key={category} className="issuePanel">
          <h3>{translateCategory(category)}</h3>
          {issues.length === 0 ? <p className="muted">Нет замечаний</p> : issues.map((issue) => (
            <div key={issue.id} className="issueItem">
              <button type="button" className="issueMain" onClick={() => onNavigate(issue)}>
                <strong>{issue.title}</strong>
                <span>{translateSeverity(issue.severity)} · {translateReview(issue.status)} · {issue.canBlockFinalExport ? "блокирует финал" : "не блокирует финал"}</span>
                <small>{issue.description}</small>
              </button>
              <div className="issueActions">
                <button type="button" onClick={() => onNavigate(issue)}>Исправить</button>
                <button type="button" onClick={() => onDecision(issue, "resolved")}>Закрыто</button>
                <button type="button" onClick={() => onDecision(issue, "not_applicable")}>Не применимо</button>
                <button type="button" onClick={() => onDecision(issue, "manual_cad_action")}>Ручное CAD</button>
                <button type="button" onClick={() => onDecision(issue, "blocked")}>Блокер</button>
              </div>
            </div>
          ))}
        </article>
      ))}
    </div>
  </section>
);


