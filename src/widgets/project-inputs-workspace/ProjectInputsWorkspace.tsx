import type { Project } from "../../domain/project/Project";
import type { ProjectReadinessReport } from "../../domain/validation/Validation";
import { updateProjectName, updateProjectPower, updateProjectRoom, updateProjectTemperatureSchedule } from "../../application/boiler-room/project-setup/updateProjectInputs";
import { sourceStatusText } from "../../shared/formatting/boilerRoomFormatters";
import { ReadinessStrip } from "../../shared/ui/ReadinessStrip";

export const ProjectInputsWorkspace = ({ project, readiness, onProject }: { project: Project; readiness: ProjectReadinessReport; onProject: (updater: (project: Project) => Project) => void }) => (
  <section>
    <div className="workspaceHeader">
      <p className="eyebrow">Паспорт проекта</p>
      <h2>Исходные данные</h2>
      <p>Эти данные используются одновременно для плана, проверок применимости, evidence-запросов и сопроводительного письма.</p>
    </div>
    <div className="formGrid">
      <label className="fieldCard"><span>Название</span><input value={project.name} onChange={(event) => onProject((current) => updateProjectName(current, event.target.value))} /><small>{sourceStatusText("от пользователя", 0.8)}</small></label>
      <label className="fieldCard"><span>Нормативная область</span><input value="РФ" readOnly /><small>{sourceStatusText("проверено", 1)}</small></label>
      <label className="fieldCard"><span>Тип размещения</span><input value="отдельно стоящая" readOnly /><small>{sourceStatusText("проверено", 1)}</small></label>
      <label className="fieldCard"><span>Тип / топливо</span><input value="газовая, природный газ" readOnly /><small>{sourceStatusText("проверено", 1)}</small></label>
      <label className="fieldCard"><span>Назначение</span><input value="отопление, водогрейная" readOnly /><small>{sourceStatusText("проверено", 1)}</small></label>
      <label className="fieldCard"><span>Мощность, кВт</span><input type="number" value={project.projectInputs.targetPowerKw} onChange={(event) => onProject((current) => updateProjectPower(current, Number(event.target.value)))} /><small>{sourceStatusText("паспортные данные", 0.65)}</small></label>
      <label className="fieldCard"><span>Температурный график</span><input value={`${project.projectInputs.temperatureSchedule.supplyC}/${project.projectInputs.temperatureSchedule.returnC}`} onChange={(event) => {
        const [supply, ret] = event.target.value.split("/").map(Number);
        if (Number.isFinite(supply) && Number.isFinite(ret)) onProject((current) => updateProjectTemperatureSchedule(current, supply, ret));
      }} /><small>{sourceStatusText("от пользователя", 0.8)}</small></label>
      <label className="fieldCard"><span>Ширина помещения, мм</span><input type="number" value={project.room.widthMm} onChange={(event) => onProject((current) => updateProjectRoom(current, { widthMm: Number(event.target.value) }))} /><small>{sourceStatusText("от пользователя", 0.8)}</small></label>
      <label className="fieldCard"><span>Длина помещения, мм</span><input type="number" value={project.room.lengthMm} onChange={(event) => onProject((current) => updateProjectRoom(current, { lengthMm: Number(event.target.value) }))} /><small>{sourceStatusText("от пользователя", 0.8)}</small></label>
      <label className="fieldCard"><span>Высота помещения, мм</span><input type="number" value={project.room.heightMm} onChange={(event) => onProject((current) => updateProjectRoom(current, { heightMm: Number(event.target.value) }))} /><small>{sourceStatusText("от пользователя", 0.8)}</small></label>
    </div>
    <ReadinessStrip readiness={readiness} />
  </section>
);


