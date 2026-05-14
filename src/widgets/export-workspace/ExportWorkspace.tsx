import { buildEngineeringDrawing } from "../../application/boiler-room/drawing/buildEngineeringDrawing";
import { exportDraftPackage } from "../../application/boiler-room/export/exportDraftPackage";
import { exportFinalPackage } from "../../application/boiler-room/export/exportFinalPackage";
import type { EquipmentDefinition } from "../../domain/equipment/Equipment";
import type { Project } from "../../domain/project/Project";
import type { ProjectReadinessReport } from "../../domain/validation/Validation";
import { exportFileLabel } from "../../shared/formatting/boilerRoomFormatters";

export const ExportWorkspace = ({ project, catalog, drawing, readiness, onDownload }: { project: Project; catalog: EquipmentDefinition[]; drawing: ReturnType<typeof buildEngineeringDrawing>; readiness: ProjectReadinessReport; onDownload: (name: string, content: string) => void }) => {
  const draft = exportDraftPackage(project, catalog, drawing, readiness);
  const tryFinal = () => {
    const final = exportFinalPackage(project, catalog, drawing, readiness);
    Object.entries(final).forEach(([name, content]) => onDownload(name, content));
  };
  return (
    <section>
      <div className="workspaceHeader">
        <p className="eyebrow">Пакет выгрузки</p>
        <h2>Экспорт</h2>
      </div>
      <div className="exportGrid">
        <article>
          <h3>Черновые выгрузки</h3>
          <p>Доступны всегда и помечены как черновые или неполные при наличии незакрытых замечаний.</p>
          {Object.entries(draft).map(([file, content]) => <button key={file} type="button" className="fileButton" onClick={() => onDownload(file, content)}><span>{exportFileLabel(file)}</span><small>{file}</small></button>)}
        </article>
        <article>
          <h3>Финальный пакет</h3>
          <p>{readiness.exportReadiness.final === "final_ready" ? "Финальный пакет можно сформировать." : "Финальный пакет заблокирован до закрытия замечаний."}</p>
          <button type="button" disabled={readiness.exportReadiness.final !== "final_ready"} onClick={tryFinal}>Сформировать финальный пакет</button>
          {readiness.exportReadiness.reasons.map((reason) => <div key={reason} className="blockerLine">{reason}</div>)}
        </article>
      </div>
    </section>
  );
};


