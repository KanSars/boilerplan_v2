import { useMemo, useRef, useState } from "react";
import { applyConnectionPointOverride } from "../application/boiler-room/equipment/applyConnectionPointOverride";
import { removeEquipmentFromProject } from "../application/boiler-room/equipment/removeEquipmentFromProject";
import { resolveEquipmentForProject } from "../application/boiler-room/equipment/resolveEquipmentForProject";
import { confirmSystemConnection } from "../application/boiler-room/connections/confirmSystemConnection";
import { buildEngineeringDrawing } from "../application/boiler-room/drawing/buildEngineeringDrawing";
import { buildPreliminaryRoutes } from "../application/boiler-room/routing/buildPreliminaryRoutes";
import { exportDraftPackage } from "../application/boiler-room/export/exportDraftPackage";
import { buildProjectReadinessReport } from "../application/boiler-room/validation/buildProjectReadinessReport";
import { applyReadinessDecisions, type ReadinessDecision, type ReadinessDecisionMap } from "../application/boiler-room/validation/applyReadinessDecisions";
import { createPilotProject } from "../application/boiler-room/project-setup/createProjectFromInputs";
import { resolveSystemConnections } from "../application/boiler-room/connections/resolveSystemConnections";
import { moveEquipment } from "../application/boiler-room/placement/moveEquipment";
import { rotateEquipmentToNextPosition } from "../application/boiler-room/placement/rotateEquipment";
import type { SystemConnection } from "../domain/connection/SystemConnection";
import type { EquipmentDefinition } from "../domain/equipment/Equipment";
import type { Project } from "../domain/project/Project";
import type { ValidationIssue } from "../domain/validation/Validation";
import { pilotEquipmentCatalog } from "../infrastructure/catalog/pilotCatalog";
import { helpText, workspaces, type HelpKey, type Workspace } from "../shared/config/workspaces";
import { translateExport, translateReadiness } from "../shared/formatting/boilerRoomFormatters";
import { ProjectInputsWorkspace } from "../widgets/project-inputs-workspace/ProjectInputsWorkspace";
import { EquipmentWorkspace } from "../widgets/equipment-workspace/EquipmentWorkspace";
import { PlanWorkspace } from "../widgets/plan-workspace/PlanWorkspace";
import { SchematicWorkspace } from "../widgets/schematic-workspace/SchematicWorkspace";
import { DrawingWorkspace } from "../widgets/drawing-workspace/DrawingWorkspace";
import { ReadinessWorkspace } from "../widgets/readiness-workspace/ReadinessWorkspace";
import { ExportWorkspace } from "../widgets/export-workspace/ExportWorkspace";
import { InspectorPanel } from "../widgets/inspector-panel/InspectorPanel";
import "./globals.css";

export const App = () => {
  const [project, setProject] = useState<Project>(() => createPilotProject());
  const [catalog, setCatalog] = useState<EquipmentDefinition[]>(() => pilotEquipmentCatalog);
  const [workspace, setWorkspace] = useState<Workspace>("plan");
  const [selectedId, setSelectedId] = useState("inst_boiler_1");
  const [routePreview, setRoutePreview] = useState(true);
  const [helpMode, setHelpMode] = useState(false);
  const [activeHelp, setActiveHelp] = useState<HelpKey>("plan");
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [selectedPointId, setSelectedPointId] = useState("supply");
  const [planZoom, setPlanZoom] = useState(1);
  const [schematicZoom, setSchematicZoom] = useState(1);
  const [drawingZoom, setDrawingZoom] = useState(1);
  const [issueDecisions, setIssueDecisions] = useState<ReadinessDecisionMap>({});
  const [toast, setToast] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const equipment = useMemo(() => resolveEquipmentForProject(project, catalog), [project, catalog]);
  const connections = useMemo(() => resolveSystemConnections(project, catalog), [project, catalog]);
  const routes = useMemo(() => buildPreliminaryRoutes(project, catalog, connections), [project, catalog, connections]);
  const rawReadiness = useMemo(() => buildProjectReadinessReport(project, catalog), [project, catalog]);
  const readiness = useMemo(() => applyReadinessDecisions(rawReadiness, issueDecisions), [rawReadiness, issueDecisions]);
  const drawing = useMemo(() => buildEngineeringDrawing(project, catalog, readiness), [project, catalog, readiness]);
  const selected = equipment.find((item) => item.instance.id === selectedId) ?? equipment[0];

  const updateLabel = (itemId: string, label: string) => {
    setProject((current) => ({
      ...current,
      equipmentItems: current.equipmentItems.map((item) => (item.id === itemId ? { ...item, label } : item)),
      updatedAt: new Date().toISOString(),
    }));
  };

  const deleteItem = (itemId: string) => {
    setProject((current) => {
      const updated = removeEquipmentFromProject(current, itemId);
      setSelectedId(updated.equipmentItems[0]?.id ?? "");
      return updated;
    });
  };

  const addEquipment = (definition: EquipmentDefinition) => {
    const count = project.equipmentItems.filter((item) => item.definitionId === definition.id).length + 1;
    const id = `inst_${definition.id}_${Date.now()}`;
    const label = definition.category === "valve" ? `Кран ${count}` : definition.category === "boiler" ? `К${count + 1}` : `${definition.name} ${count}`;
    setProject((current) => ({
      ...current,
      equipmentItems: [
        ...current.equipmentItems,
        { id, definitionId: definition.id, label, role: definition.category === "valve" ? "additional_valve" : "additional_equipment", quantity: 1, instanceParameters: {}, connectionPointOverrides: [], evidenceOverrides: [], status: "needs_confirmation", metadata: {} },
      ],
      placements: [...current.placements, { itemId: id, xMm: 2600 + count * 180, yMm: 900 + count * 160, rotationDeg: 0, placed: true, locked: false, metadata: {} }],
      updatedAt: new Date().toISOString(),
    }));
    setSelectedId(id);
    setAddMenuOpen(false);
    setWorkspace("plan");
  };

  const applyPointPatch = (field: "localX" | "localY" | "localZ" | "dnMm", value: number | undefined) => {
    if (!selected) return;
    const updated = applyConnectionPointOverride(selected.instance, selected.definition, {
      pointId: selectedPointId,
      field,
      newValue: value,
      reason: "Правка точки подключения в инспекторе v2",
      source: "user inspector override",
      status: "overridden",
      confidence: 0.9,
    });
    setProject((current) => ({
      ...current,
      equipmentItems: current.equipmentItems.map((item) => (item.id === updated.id ? updated : item)),
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateConnection = (connection: SystemConnection) => {
    setProject((current) => ({
      ...current,
      connectionOverrides: [...current.connectionOverrides.filter((item) => item.id !== connection.id), connection],
      updatedAt: new Date().toISOString(),
    }));
    setRoutePreview(true);
  };

  const confirmAllConnections = () => {
    setProject((current) => ({
      ...current,
      connectionOverrides: resolveSystemConnections(current, catalog).map((connection) => confirmSystemConnection(connection, "Подтверждено кнопкой Соединить/подтвердить в v2")),
      updatedAt: new Date().toISOString(),
    }));
    setRoutePreview(true);
  };

  const navigateToIssue = (issue: ValidationIssue) => {
    setWorkspace(issue.navigationTarget.workspace);
    const affectedEquipment = issue.affectedEntities.find((id) => project.equipmentItems.some((item) => item.id === id));
    if (affectedEquipment) setSelectedId(affectedEquipment);
    if (issue.navigationTarget.focus && issue.navigationTarget.workspace === "inputs") setActiveHelp("inputs");
  };

  const setIssueDecision = (issue: ValidationIssue, decision: ReadinessDecision) => {
    setIssueDecisions((current) => ({ ...current, [issue.id]: decision }));
    if (decision === "resolved" && issue.category === "connection" && issue.affectedEntities[0]) {
      const connection = connections.find((item) => item.id === issue.affectedEntities[0]);
      if (connection) updateConnection(confirmSystemConnection(connection, "Подтверждено из проверки готовности"));
    }
  };

  const download = (name: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPackage = (files: Record<string, string>) => Object.entries(files).forEach(([name, content]) => download(name, content));

  const saveProject = () => {
    const payload = JSON.stringify({ project, catalog, issueDecisions }, null, 2);
    localStorage.setItem("boilerplan-ai-v2-project", payload);
    download(`${project.id}.boilerplan.json`, payload);
    setToast("Проект сохранен в браузере и выгружен JSON-файлом.");
  };

  const loadProject = async (file: File) => {
    const payload = JSON.parse(await file.text()) as { project: Project; catalog?: EquipmentDefinition[]; issueDecisions?: ReadinessDecisionMap };
    setProject(payload.project);
    if (payload.catalog) setCatalog(payload.catalog);
    setIssueDecisions(payload.issueDecisions ?? {});
    setSelectedId(payload.project.equipmentItems[0]?.id ?? "");
    setToast("Проект загружен из файла.");
  };

  return (
    <div className="appShell">
      <header className="topBar">
        <div>
          <p className="eyebrow">Boilerplan AI v2</p>
          <h1>{project.name}</h1>
        </div>
        <div className="statusCluster">
          <span className={`readinessBadge ${readiness.exportReadiness.final === "final_ready" ? "ready" : "blocked"}`}>{translateReadiness(readiness.status)}</span>
          <span className="draftState">Черновик доступен · финал: {translateExport(readiness.exportReadiness.final)}</span>
          <button type="button" onClick={saveProject}>Сохранить</button>
          <button type="button" onClick={() => fileInputRef.current?.click()}>Загрузить</button>
          <button type="button" onClick={() => setWorkspace("readiness")}>Проверить</button>
          <button type="button" onClick={() => downloadPackage(exportDraftPackage(project, catalog, drawing, readiness))}>Скачать черновик</button>
          <input ref={fileInputRef} type="file" accept="application/json,.json" hidden onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) void loadProject(file);
            event.currentTarget.value = "";
          }} />
          <button
            type="button"
            className={helpMode ? "helpButton active" : "helpButton"}
            onMouseEnter={() => setActiveHelp(workspace)}
            onClick={() => setHelpMode((value) => !value)}
            aria-pressed={helpMode}
          >
            ?
          </button>
        </div>
      </header>

      {helpMode && <div className="helpBar">{helpText[activeHelp]}</div>}
      {toast && <div className="toastBar"><span>{toast}</span><button type="button" onClick={() => setToast("")}>Закрыть</button></div>}

      <div className="body">
        <nav className="workspaceNav" aria-label="Навигация по рабочим областям">
          {workspaces.map((item) => (
            <button
              key={item.id}
              type="button"
              className={workspace === item.id ? "active" : ""}
              onMouseEnter={() => setActiveHelp(item.help)}
              onClick={() => {
                setWorkspace(item.id);
                setActiveHelp(item.help);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <main className="workspace">
          {workspace === "inputs" && <ProjectInputsWorkspace project={project} readiness={readiness} onProject={setProject} />}
          {workspace === "equipment" && <EquipmentWorkspace equipment={equipment} catalog={catalog} selectedId={selectedId} onSelect={setSelectedId} onAdd={addEquipment} onCatalogUpdate={setCatalog} />}
          {workspace === "plan" && (
            <PlanWorkspace
              equipment={equipment}
              routes={routePreview ? routes : []}
              selectedId={selectedId}
              addMenuOpen={addMenuOpen}
              catalog={catalog}
              onSelect={setSelectedId}
              onMove={(id, xMm, yMm) => setProject((current) => moveEquipment(current, id, xMm, yMm))}
              onRotate={(id) => setProject((current) => rotateEquipmentToNextPosition(current, id))}
              onDelete={deleteItem}
              onConnect={() => {
                setActiveHelp("connect");
                setRoutePreview(true);
              }}
              onConfirmConnections={confirmAllConnections}
              onAdd={addEquipment}
              onToggleAdd={() => setAddMenuOpen((value) => !value)}
              onHelp={setActiveHelp}
              zoom={planZoom}
              onZoomChange={setPlanZoom}
            />
          )}
          {workspace === "schematic" && <SchematicWorkspace connections={connections} onConfirmAll={confirmAllConnections} onConnection={updateConnection} onHelp={setActiveHelp} zoom={schematicZoom} onZoomChange={setSchematicZoom} />}
          {workspace === "drawing" && <DrawingWorkspace drawing={drawing} zoom={drawingZoom} onZoomChange={setDrawingZoom} />}
          {workspace === "readiness" && <ReadinessWorkspace readiness={readiness} decisions={issueDecisions} onNavigate={navigateToIssue} onDecision={setIssueDecision} />}
          {workspace === "export" && <ExportWorkspace project={project} catalog={catalog} drawing={drawing} readiness={readiness} onDownload={download} />}
        </main>
        {["equipment", "plan"].includes(workspace) && selected && (
          <InspectorPanel
            selected={selected}
            selectedPointId={selectedPointId}
            onPointSelect={setSelectedPointId}
            onLabel={updateLabel}
            onRotate={() => setProject((current) => rotateEquipmentToNextPosition(current, selected.instance.id))}
            onDelete={() => deleteItem(selected.instance.id)}
            onPointPatch={applyPointPatch}
            onHelp={setActiveHelp}
          />
        )}
      </div>
    </div>
  );
};
