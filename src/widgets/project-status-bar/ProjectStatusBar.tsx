import type { ProjectReadinessReport } from "../../domain/validation/Validation";
import { translateExport, translateReadiness } from "../../shared/formatting/boilerRoomFormatters";

export const ProjectStatusBar = ({ readiness }: { readiness: ProjectReadinessReport }) => (
  <>
    <span className={`readinessBadge ${readiness.exportReadiness.final === "final_ready" ? "ready" : "blocked"}`}>
      {translateReadiness(readiness.status)}
    </span>
    <span className="draftState">Черновик доступен · финал: {translateExport(readiness.exportReadiness.final)}</span>
  </>
);
