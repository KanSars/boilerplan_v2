import { type PointerEvent, useMemo, useRef, useState } from "react";
import { applyReadinessDecisions, type ReadinessDecision, type ReadinessDecisionMap } from "../application/boiler-room/validation/applyReadinessDecisions";
import { applyConnectionPointOverride } from "../application/boiler-room/equipment/applyConnectionPointOverride";
import { removeEquipmentFromProject } from "../application/boiler-room/equipment/removeEquipmentFromProject";
import { resolveWorldConnectionPoints } from "../application/boiler-room/equipment/resolveConnectionPoints";
import { resolveEquipmentForProject } from "../application/boiler-room/equipment/resolveEquipmentForProject";
import { confirmSystemConnection } from "../application/boiler-room/connections/confirmSystemConnection";
import { overrideSystemConnection } from "../application/boiler-room/connections/overrideSystemConnection";
import { buildEngineeringDrawing } from "../application/boiler-room/drawing/buildEngineeringDrawing";
import { buildPreliminaryRoutes } from "../application/boiler-room/routing/buildPreliminaryRoutes";
import { exportDraftPackage } from "../application/boiler-room/export/exportDraftPackage";
import { exportFinalPackage } from "../application/boiler-room/export/exportFinalPackage";
import { buildProjectReadinessReport } from "../application/boiler-room/validation/buildProjectReadinessReport";
import { createPilotProject } from "../application/boiler-room/project-setup/createProjectFromInputs";
import { updateProjectName, updateProjectPower, updateProjectRoom, updateProjectTemperatureSchedule } from "../application/boiler-room/project-setup/updateProjectInputs";
import { resolveSystemConnections } from "../application/boiler-room/connections/resolveSystemConnections";
import type { SystemConnection } from "../domain/connection/SystemConnection";
import type { EquipmentDefinition, EquipmentWithPlacement, Placement } from "../domain/equipment/Equipment";
import type { Project } from "../domain/project/Project";
import type { ProjectReadinessReport, ValidationIssue } from "../domain/validation/Validation";
import { pilotEquipmentCatalog } from "../infrastructure/catalog/pilotCatalog";
import "./globals.css";

type Workspace = "inputs" | "equipment" | "plan" | "schematic" | "drawing" | "readiness" | "export";
type HelpKey = "inputs" | "equipment" | "plan" | "schematic" | "drawing" | "readiness" | "export" | "connect" | "add" | "override" | "final";

const workspaces: Array<{ id: Workspace; label: string; help: HelpKey }> = [
  { id: "inputs", label: "Исходные данные", help: "inputs" },
  { id: "equipment", label: "Оборудование", help: "equipment" },
  { id: "plan", label: "План", help: "plan" },
  { id: "schematic", label: "Схема", help: "schematic" },
  { id: "drawing", label: "Чертёж", help: "drawing" },
  { id: "readiness", label: "Проверка", help: "readiness" },
  { id: "export", label: "Экспорт", help: "export" },
];

const helpText: Record<HelpKey, string> = {
  inputs: "Паспорт проекта: размеры, РФ, тип котельной, топливо, источники и достоверность данных.",
  equipment: "Состав проекта и карточки оборудования. Здесь редактируются габариты, зоны обслуживания и точки подключения.",
  plan: "Физический план. Оборудование можно перетаскивать, поворачивать, добавлять и соединять предварительными трассами.",
  schematic: "Логика подключений: T1/T2, газ, дымоход. Автосвязи нужно подтвердить или переопределить.",
  drawing: "Чертежный лист A3 с CAD-обозначениями. Это preview модели EngineeringDrawing, не источник DXF.",
  readiness: "Проверка готовности. Final package нельзя сформировать, пока есть blockers, needs_data или неподтвержденные решения.",
  export: "Draft выгрузки доступны всегда. Final package доступен только после закрытия блокеров.",
  connect: "Строит предварительные трассы по логическим связям. Для final спорные связи нужно подтвердить.",
  add: "Добавляет новый экземпляр оборудования из каталога и сразу размещает его на плане.",
  override: "Правка точки подключения для конкретного экземпляра. Каталог при этом не меняется.",
  final: "Финальный пакет блокируется, если остались инженерные неизвестности или placeholder-данные.",
};

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

  const updatePlacement = (itemId: string, patch: Partial<Placement>) => {
    setProject((current) => ({
      ...current,
      placements: current.placements.map((placement) => (placement.itemId === itemId ? { ...placement, ...patch } : placement)),
      updatedAt: new Date().toISOString(),
    }));
  };

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
      const next = updated.equipmentItems[0];
      setSelectedId(next?.id ?? "");
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
      placements: [
        ...current.placements,
        { itemId: id, xMm: 2600 + count * 180, yMm: 900 + count * 160, rotationDeg: 0, placed: true, locked: false, metadata: {} },
      ],
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

  const confirmAllConnections = () => {
    setProject((current) => ({
      ...current,
      connectionOverrides: resolveSystemConnections(current, catalog).map((connection) => confirmSystemConnection(connection, "Подтверждено кнопкой Соединить/подтвердить в v2")),
      updatedAt: new Date().toISOString(),
    }));
    setRoutePreview(true);
  };

  const updateConnection = (connection: SystemConnection) => {
    setProject((current) => ({
      ...current,
      connectionOverrides: [...current.connectionOverrides.filter((item) => item.id !== connection.id), connection],
      updatedAt: new Date().toISOString(),
    }));
    setRoutePreview(true);
  };

  const navigateToIssue = (issue: ValidationIssue) => {
    setWorkspace(issue.navigationTarget.workspace);
    if (issue.navigationTarget.entityId) {
      const affectedEquipment = issue.affectedEntities.find((id) => project.equipmentItems.some((item) => item.id === id));
      if (affectedEquipment) setSelectedId(affectedEquipment);
    }
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
          <span className={`readinessBadge ${readiness.exportReadiness.final === "final_ready" ? "ready" : "blocked"}`}>
            {translateReadiness(readiness.status)}
          </span>
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
          {workspace === "inputs" && <InputsWorkspace project={project} readiness={readiness} onProject={setProject} />}
          {workspace === "equipment" && <EquipmentWorkspace equipment={equipment} catalog={catalog} selectedId={selectedId} onSelect={setSelectedId} onAdd={addEquipment} onCatalogUpdate={setCatalog} />}
          {workspace === "plan" && (
            <PlanWorkspace
              equipment={equipment}
              routes={routePreview ? routes : []}
              selectedId={selectedId}
              addMenuOpen={addMenuOpen}
              catalog={catalog}
              onSelect={setSelectedId}
              onMove={(id, xMm, yMm) => updatePlacement(id, { xMm, yMm })}
              onRotate={(id) => rotatePlacement(id, project, updatePlacement)}
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
            onRotate={() => rotatePlacement(selected.instance.id, project, updatePlacement)}
            onDelete={() => deleteItem(selected.instance.id)}
            onPointPatch={applyPointPatch}
            onHelp={setActiveHelp}
          />
        )}
      </div>
    </div>
  );
};

const InputsWorkspace = ({ project, readiness, onProject }: { project: Project; readiness: ProjectReadinessReport; onProject: (updater: (project: Project) => Project) => void }) => (
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

const EquipmentWorkspace = ({
  equipment,
  catalog,
  selectedId,
  onSelect,
  onAdd,
  onCatalogUpdate,
}: {
  equipment: EquipmentWithPlacement[];
  catalog: EquipmentDefinition[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: (definition: EquipmentDefinition) => void;
  onCatalogUpdate: (catalog: EquipmentDefinition[]) => void;
}) => {
  const selected = equipment.find((entry) => entry.instance.id === selectedId) ?? equipment[0];
  return (
    <section>
      <div className="workspaceHeader">
        <p className="eyebrow">Каталог, состав проекта и карточка</p>
        <h2>Оборудование</h2>
      </div>
      <div className="split">
        <div className="listPane">
          <h3>Состав проекта</h3>
          {["boiler", "header", "valve"].map((category) => (
            <div key={category} className="groupBlock">
              <h4>{categoryLabel(category)}</h4>
              {equipment.filter((item) => item.definition.category === category).map((item) => (
                <button key={item.instance.id} type="button" className={item.instance.id === selectedId ? "row active" : "row"} onClick={() => onSelect(item.instance.id)}>
                  <span>{item.instance.label}</span>
                  <small>{item.placement?.placed ? "размещено" : "не размещено"} · {translateReview(item.instance.status)}</small>
                </button>
              ))}
            </div>
          ))}
          <h3>Добавить из каталога</h3>
          {catalog.filter((item) => item.category !== "dev_fixture").map((definition) => (
            <button key={definition.id} type="button" className="row" onClick={() => onAdd(definition)}>
              <span>{definition.name}</span>
              <small>{categoryLabel(definition.category)} · {definition.dimensions.widthMm} x {definition.dimensions.depthMm} мм</small>
            </button>
          ))}
        </div>
        {selected && <EquipmentCardEditor item={selected} catalog={catalog} onCatalogUpdate={onCatalogUpdate} />}
      </div>
    </section>
  );
};

const EquipmentCardEditor = ({ item, catalog, onCatalogUpdate }: { item: EquipmentWithPlacement; catalog: EquipmentDefinition[]; onCatalogUpdate: (catalog: EquipmentDefinition[]) => void }) => {
  const [pointId, setPointId] = useState(item.definition.connectionPoints[0]?.id ?? "");
  const updateDefinition = (patch: Partial<EquipmentDefinition>) => {
    onCatalogUpdate(catalog.map((definition) => (definition.id === item.definition.id ? { ...definition, ...patch } : definition)));
  };
  const updateConnectionPoint = (id: string, patch: Partial<EquipmentDefinition["connectionPoints"][number]>) => {
    updateDefinition({ connectionPoints: item.definition.connectionPoints.map((point) => (point.id === id ? { ...point, ...patch } : point)) });
  };
  const selectedPoint = item.definition.connectionPoints.find((point) => point.id === pointId) ?? item.definition.connectionPoints[0];
  return (
    <div className="editorPane">
      <h3>{item.instance.label}: карточка оборудования</h3>
      <div className="cardEditorGrid">
        <label>Название<input value={item.definition.name} onChange={(event) => updateDefinition({ name: event.target.value })} /></label>
        <label>Производитель<input value={item.definition.manufacturer ?? ""} onChange={(event) => updateDefinition({ manufacturer: event.target.value })} /></label>
        <label>Модель<input value={item.definition.model ?? ""} onChange={(event) => updateDefinition({ model: event.target.value })} /></label>
      </div>
      <h4>Предпросмотр точек подключения</h4>
      <ConnectionPointPreview item={item} selectedPointId={pointId} onSelect={setPointId} />
      <h4>Точки подключения каталога</h4>
      <div className="cpGrid">
        {item.definition.connectionPoints.map((point) => (
          <button key={point.id} type="button" className={point.id === pointId ? "cpRow active" : "cpRow"} onClick={() => setPointId(point.id)}>
            <strong>{point.label}</strong>
            <span>{translatePointType(point.type)} · DN{point.dnMm ?? "-"} · {translateDirection(point.direction)}</span>
            <small>X {point.localX}, Y {point.localY}, Z {point.localZ ?? "-"} · {translateData(point.status)} · {point.confidence}</small>
          </button>
        ))}
      </div>
      {selectedPoint && (
        <div className="pointEditor">
          <label>Метка<input value={selectedPoint.label} onChange={(event) => updateConnectionPoint(selectedPoint.id, { label: event.target.value })} /></label>
          <label>X, мм<input type="number" value={selectedPoint.localX} onChange={(event) => updateConnectionPoint(selectedPoint.id, { localX: Number(event.target.value) })} /></label>
          <label>Y, мм<input type="number" value={selectedPoint.localY} onChange={(event) => updateConnectionPoint(selectedPoint.id, { localY: Number(event.target.value) })} /></label>
          <label>Z, мм<input type="number" value={selectedPoint.localZ ?? ""} onChange={(event) => updateConnectionPoint(selectedPoint.id, { localZ: event.target.value ? Number(event.target.value) : undefined })} /></label>
          <label>DN, мм<input type="number" value={selectedPoint.dnMm ?? ""} onChange={(event) => updateConnectionPoint(selectedPoint.id, { dnMm: event.target.value ? Number(event.target.value) : undefined })} /></label>
        </div>
      )}
      <small>Это режим правки карточки каталога. Правка конкретного экземпляра находится в правом инспекторе как override.</small>
    </div>
  );
};

const PlanWorkspace = ({
  equipment,
  routes,
  selectedId,
  addMenuOpen,
  catalog,
  onSelect,
  onMove,
  onRotate,
  onDelete,
  onConnect,
  onConfirmConnections,
  onAdd,
  onToggleAdd,
  onHelp,
  zoom,
  onZoomChange,
}: {
  equipment: EquipmentWithPlacement[];
  routes: ReturnType<typeof buildPreliminaryRoutes>;
  selectedId: string;
  addMenuOpen: boolean;
  catalog: EquipmentDefinition[];
  onSelect: (id: string) => void;
  onMove: (id: string, xMm: number, yMm: number) => void;
  onRotate: (id: string) => void;
  onDelete: (id: string) => void;
  onConnect: () => void;
  onConfirmConnections: () => void;
  onAdd: (definition: EquipmentDefinition) => void;
  onToggleAdd: () => void;
  onHelp: (key: HelpKey) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number } | null>(null);
  const [pan, setPan] = useState<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);
  const origin = { x: 0, y: 0 };
  const room = equipment[0]?.placement ? { widthMm: 6000, lengthMm: 4500 } : { widthMm: 6000, lengthMm: 4500 };
  const margin = 600;
  const planViewBox = `${-margin} ${-margin} ${room.widthMm + margin * 2} ${room.lengthMm + margin * 2}`;
  const pointFromEvent = (event: PointerEvent<SVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return { xMm: 0, yMm: 0 };
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const transformed = point.matrixTransform(svg.getScreenCTM()?.inverse());
    return { xMm: transformed.x - origin.x, yMm: transformed.y - origin.y };
  };
  const startDrag = (event: PointerEvent<SVGGElement>, item: EquipmentWithPlacement) => {
    if (!item.placement) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    setDrag({ id: item.instance.id, dx: point.xMm - item.placement.xMm, dy: point.yMm - item.placement.yMm });
    onSelect(item.instance.id);
  };
  const startPan = (event: PointerEvent<SVGSVGElement>) => {
    if (event.button !== 0 || drag) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setPan({ x: event.clientX, y: event.clientY, scrollLeft: viewport.scrollLeft, scrollTop: viewport.scrollTop });
  };
  const move = (event: PointerEvent<SVGSVGElement>) => {
    if (drag) {
      const point = pointFromEvent(event);
      onMove(drag.id, Math.round((point.xMm - drag.dx) / 25) * 25, Math.round((point.yMm - drag.dy) / 25) * 25);
      return;
    }
    if (pan) {
      const viewport = viewportRef.current;
      if (!viewport) return;
      viewport.scrollLeft = pan.scrollLeft - (event.clientX - pan.x);
      viewport.scrollTop = pan.scrollTop - (event.clientY - pan.y);
    }
  };
  const stopPointer = () => {
    setDrag(null);
    setPan(null);
  };
  return (
    <section>
      <div className="workspaceHeader toolbarHeader">
        <div>
          <p className="eyebrow">Физическое размещение</p>
          <h2>План помещения</h2>
        </div>
        <div className="buttonRow">
          <button type="button" onMouseEnter={() => onHelp("add")} onClick={onToggleAdd}>Добавить объект</button>
          <button type="button" onMouseEnter={() => onHelp("connect")} onClick={onConnect}>Соединить автоматически</button>
          <button type="button" onMouseEnter={() => onHelp("connect")} onClick={onConfirmConnections}>Подтвердить связи</button>
          <ZoomControls value={zoom} onChange={onZoomChange} />
        </div>
      </div>
      {addMenuOpen && (
        <div className="addMenu">
          {catalog.filter((definition) => definition.category !== "dev_fixture").map((definition) => (
            <button key={definition.id} type="button" onClick={() => onAdd(definition)}>
              {definition.name}<small>{categoryLabel(definition.category)}</small>
            </button>
          ))}
        </div>
      )}
      <div ref={viewportRef} className="zoomViewport">
        <div className="zoomContent" style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}>
          <svg
            ref={svgRef}
            className="planCanvas"
            viewBox={planViewBox}
            role="img"
            aria-label="План помещения"
            onPointerDown={startPan}
            onPointerMove={move}
            onPointerUp={stopPointer}
            onPointerCancel={stopPointer}
          >
        <defs>
          <pattern id="grid" width="500" height="500" patternUnits="userSpaceOnUse">
            <path d="M 500 0 L 0 0 0 500" fill="none" stroke="#e2e8f0" strokeWidth="8" />
          </pattern>
        </defs>
        <rect x={-margin} y={-margin} width={room.widthMm + margin * 2} height={room.lengthMm + margin * 2} fill="#ffffff" />
        <rect x={origin.x} y={origin.y} width={room.widthMm} height={room.lengthMm} fill="url(#grid)" stroke="#0f172a" strokeWidth="35" />
        <text x={origin.x} y={origin.y - 260} fontSize="150">Рабочий план размещения · сетка 500 мм</text>
        {routes.map((route) => route.points.length > 1 && (
          <polyline
            key={route.id}
            points={route.points.map((point) => `${origin.x + point.xMm},${origin.y + point.yMm}`).join(" ")}
            fill="none"
            stroke={route.medium === "natural_gas" ? "#a16207" : route.id.includes("t2") ? "#1d4ed8" : "#b91c1c"}
            strokeWidth="70"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={route.status === "needs_confirmation" ? "160 110" : undefined}
          />
        ))}
        {equipment.map((item) => {
          if (!item.placement?.placed) return null;
          const x = origin.x + item.body.xMm;
          const y = origin.y + item.body.yMm;
          const width = item.body.widthMm;
          const height = item.body.depthMm;
          const selected = selectedId === item.instance.id;
          const mark = equipmentMark(item);
          return (
            <g key={item.instance.id} onPointerDown={(event) => startDrag(event, item)} className={selected ? "selectedSvg draggable" : "draggable"}>
              <rect x={x - item.definition.serviceZones.leftMm} y={y - item.definition.serviceZones.rearMm} width={width + item.definition.serviceZones.leftMm + item.definition.serviceZones.rightMm} height={height + item.definition.serviceZones.frontMm + item.definition.serviceZones.rearMm} fill="#e0f2fe" opacity="0.28" stroke="#38bdf8" strokeWidth="18" strokeDasharray="80 50" />
              <EquipmentPlanSymbol x={x} y={y} width={width} height={height} item={item} />
              <text x={x + width / 2} y={y + height / 2 + 45} textAnchor="middle" fontSize="120" fontWeight="700">{mark}</text>
              {selected && resolveWorldConnectionPoints(item.instance, item.definition, item.placement).map((point) => <circle key={point.pointId} cx={origin.x + point.xMm} cy={origin.y + point.yMm} r="55" fill={pointColor(point.type)} stroke="#ffffff" strokeWidth="16" />)}
            </g>
          );
        })}
        <g transform={`translate(0 ${room.lengthMm + 320})`}>
          <text x="0" y="0" fontSize="140" fontWeight="700">Состав</text>
          {equipment.slice(0, 8).map((item, index) => (
            <text key={item.instance.id} x={(index % 4) * 1800} y={240 + Math.floor(index / 4) * 190} fontSize="120">
              {equipmentMark(item)} - {shortEquipmentName(item)}
            </text>
          ))}
        </g>
          </svg>
        </div>
      </div>
      <div className="planActions">
        <span className="planHint">Навигация: тяните пустое место плана. Редактирование: тяните объект. Голубой контур — зона обслуживания.</span>
        <button type="button" onClick={() => onRotate(selectedId)}>Повернуть выбранный</button>
        <button type="button" className="dangerButton" onClick={() => onDelete(selectedId)}>Удалить выбранный</button>
      </div>
    </section>
  );
};

const EquipmentPlanSymbol = ({ x, y, width, height, item }: { x: number; y: number; width: number; height: number; item: EquipmentWithPlacement }) => {
  if (item.definition.category === "valve") {
    const cy = y + height / 2;
    const cx = x + width / 2;
    return (
      <g>
        <line x1={x} y1={cy} x2={x + width} y2={cy} stroke="#111827" strokeWidth="18" />
        <polygon points={`${cx - 70},${cy - 70} ${cx},${cy} ${cx - 70},${cy + 70}`} fill="#ffffff" stroke="#111827" strokeWidth="18" />
        <polygon points={`${cx + 70},${cy - 70} ${cx},${cy} ${cx + 70},${cy + 70}`} fill="#ffffff" stroke="#111827" strokeWidth="18" />
      </g>
    );
  }
  if (item.definition.category === "header") {
    const cy = y + height / 2;
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill="#ffffff" stroke="#111827" strokeWidth="18" />
        <line x1={x + 40} y1={cy} x2={x + width - 40} y2={cy} stroke="#111827" strokeWidth="22" />
        <circle cx={x + width * 0.25} cy={cy} r="32" fill="#ffffff" stroke="#111827" strokeWidth="14" />
        <circle cx={x + width * 0.5} cy={cy} r="32" fill="#ffffff" stroke="#111827" strokeWidth="14" />
        <circle cx={x + width * 0.75} cy={cy} r="32" fill="#ffffff" stroke="#111827" strokeWidth="14" />
      </g>
    );
  }
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill="#f8fafc" stroke="#111827" strokeWidth="18" />
      <circle cx={x + width / 2} cy={y + height * 0.28} r={Math.min(width, height) * 0.12} fill="#ffffff" stroke="#111827" strokeWidth="14" />
      <line x1={x + width * 0.24} y1={y + height * 0.68} x2={x + width * 0.76} y2={y + height * 0.68} stroke="#111827" strokeWidth="20" />
    </g>
  );
};

const SchematicWorkspace = ({
  connections,
  onConfirmAll,
  onConnection,
  onHelp,
  zoom,
  onZoomChange,
}: {
  connections: ReturnType<typeof resolveSystemConnections>;
  onConfirmAll: () => void;
  onConnection: (connection: SystemConnection) => void;
  onHelp: (key: HelpKey) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}) => (
  <section>
    <div className="workspaceHeader toolbarHeader">
      <div>
        <p className="eyebrow">Логика системы</p>
        <h2>Схема соединений</h2>
      </div>
      <div className="buttonRow">
        <button type="button" onMouseEnter={() => onHelp("connect")} onClick={onConfirmAll}>Подтвердить все автосвязи</button>
        <ZoomControls value={zoom} onChange={onZoomChange} />
      </div>
    </div>
    <div className="schematicViewport">
      <div className="schematicStage" style={{ width: `${980 * zoom}px`, height: `${500 * zoom}px` }}>
        <svg className="schematicSvg" viewBox="0 0 980 500" role="img" aria-label="Технологическая схема соединений">
          <text x="28" y="34" className="schematicTitle">Принципиальная схема подключений</text>
          <SchematicNode x={90} y={210} w={150} h={150} label="К1" note="Котел RGT-100" />
          <SchematicNode x={640} y={122} w={250} h={64} label="КП1" note="Коллектор подачи DN32" compact />
          <SchematicNode x={640} y={368} w={250} h={64} label="КО1" note="Коллектор обратки DN32" compact />
          <SchematicValve x={430} y={154} label="ЗК1" />
          <SchematicValve x={430} y={400} label="ЗК2" />
          <SchematicValve x={165} y={430} label="ЗКГ1" />
          <path className="schematicPipe supply" d="M240 252 L335 252 L335 154 L396 154" />
          <path className="schematicPipe supply" d="M464 154 L640 154" />
          <SchematicArrow x={560} y={154} color="#b91c1c" direction="right" />
          <path className="schematicPipe return" d="M640 400 L464 400" />
          <path className="schematicPipe return" d="M396 400 L335 400 L335 318 L240 318" />
          <SchematicArrow x={300} y={318} color="#1d4ed8" direction="left" />
          <path className="schematicPipe gas" d="M165 480 L165 464" />
          <path className="schematicPipe gas" d="M165 396 L165 360" />
          <SchematicArrow x={165} y={394} color="#a16207" direction="up" />
          <path className="schematicPipe flue" d="M165 210 L165 88" />
          <text x="344" y="138" className="schematicLabel supplyText">T1 DN32</text>
          <text x="468" y="426" className="schematicLabel returnText">T2 DN32</text>
          <text x="190" y="456" className="schematicLabel gasText">Г DN25</text>
          <text x="188" y="122" className="schematicLabel">Дымоход DN200</text>
          <text x="640" y="226" className="schematicSmall">к системе отопления</text>
          <text x="640" y="472" className="schematicSmall">от системы отопления</text>
          <g transform="translate(28 480)">
            <line x1="0" y1="0" x2="42" y2="0" className="schematicPipe supply" />
            <text x="54" y="5" className="schematicSmall">T1 подача</text>
            <line x1="180" y1="0" x2="222" y2="0" className="schematicPipe return" />
            <text x="234" y="5" className="schematicSmall">T2 обратка</text>
            <line x1="370" y1="0" x2="412" y2="0" className="schematicPipe gas" />
            <text x="424" y="5" className="schematicSmall">Г газ</text>
          </g>
        </svg>
      </div>
    </div>
    <section className="connectionDetails">
      <h3>Связи схемы ({connections.length})</h3>
      <p className="muted">Здесь подтверждаются автосвязи, переопределяются спорные решения и фиксируются ручные CAD-действия.</p>
      <div className="connectionList">
        {connections.map((connection) => (
          <article key={connection.id} className="connectionCard">
            <strong>{connection.lineType} DN{connection.dnMm ?? "-"}</strong>
            <p>{connectionLabel(connection.from.itemId, connection.from.pointId)} {"->"} {connection.to ? connectionLabel(connection.to.itemId, connection.to.pointId) : "ручное оформление"}</p>
            <span>{translateConnection(connection.status)} · {translateReview(connection.reviewStatus)}</span>
            <small>{connection.explanation}</small>
            <div className="buttonRow left">
              <button type="button" onClick={() => onConnection(confirmSystemConnection(connection, "Подтверждено в схеме"))}>Подтвердить</button>
              <button type="button" onClick={() => onConnection(overrideSystemConnection(connection, { dnMm: connection.dnMm }, "Пользователь подтвердил ручное переопределение связи"))}>Переопределить</button>
              <button type="button" onClick={() => onConnection({ ...connection, status: "blocked", reviewStatus: "manual_cad_action", source: "user", userDecision: { decidedAt: new Date().toISOString(), reason: "Требуется ручное CAD-оформление", previousStatus: connection.status } })}>В ручное CAD</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  </section>
);

const SchematicNode = ({ x, y, w, h, label, note, compact = false }: { x: number; y: number; w: number; h: number; label: string; note: string; compact?: boolean }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx="4" className="schematicNode" />
    {!compact && <circle cx={x + w / 2} cy={y + 48} r="24" className="schematicBoilerCircle" />}
    <text x={x + w / 2} y={compact ? y + 25 : y + 88} textAnchor="middle" className="schematicNodeLabel">{label}</text>
    <text x={x + w / 2} y={compact ? y + 43 : y + 118} textAnchor="middle" className="schematicNodeNote">{note}</text>
  </g>
);

const SchematicValve = ({ x, y, label }: { x: number; y: number; label: string }) => (
  <g>
    <line x1={x - 34} y1={y} x2={x + 34} y2={y} className="schematicValveLine" />
    <polygon points={`${x - 20},${y - 18} ${x},${y} ${x - 20},${y + 18}`} className="schematicValve" />
    <polygon points={`${x + 20},${y - 18} ${x},${y} ${x + 20},${y + 18}`} className="schematicValve" />
    <text x={x} y={y - 28} textAnchor="middle" className="schematicSmall">{label}</text>
  </g>
);

const SchematicArrow = ({ x, y, color, direction }: { x: number; y: number; color: string; direction: "left" | "right" | "up" }) => {
  const points = direction === "left"
    ? `${x + 12},${y - 8} ${x - 4},${y} ${x + 12},${y + 8}`
    : direction === "up"
      ? `${x - 8},${y + 12} ${x},${y - 4} ${x + 8},${y + 12}`
      : `${x - 12},${y - 8} ${x + 4},${y} ${x - 12},${y + 8}`;
  return <polygon points={points} fill={color} />;
};

const ZoomControls = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
  const set = (next: number) => onChange(Math.min(2, Math.max(0.5, Math.round(next * 10) / 10)));
  return (
    <div className="zoomControls" aria-label="Масштаб">
      <button type="button" onClick={() => set(value - 0.1)} title="Уменьшить масштаб">−</button>
      <button type="button" onClick={() => set(1)} title="Сбросить масштаб">{Math.round(value * 100)}%</button>
      <button type="button" onClick={() => set(value + 0.1)} title="Увеличить масштаб">+</button>
    </div>
  );
};

const DrawingWorkspace = ({
  drawing,
  zoom,
  onZoomChange,
}: {
  drawing: ReturnType<typeof buildEngineeringDrawing>;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}) => (
  <section>
    <div className="workspaceHeader toolbarHeader">
      <div>
        <p className="eyebrow">Модель чертежного листа</p>
      <h2>Чертёж A3</h2>
        <p>Здесь лист для CAD-оформления: рамка, штамп, план, схема, легенда, DN и предупреждения черновика.</p>
      </div>
      <div className="buttonRow">
        <ZoomControls value={zoom} onChange={onZoomChange} />
      </div>
    </div>
    <div className="drawingViewport">
      <svg
        className="sheetCanvas"
        style={{ width: `${840 * zoom}px`, height: `${594 * zoom}px` }}
        viewBox="0 0 420 297"
        role="img"
        aria-label="Предпросмотр листа A3"
      >
        {drawing.entities.map((entity, index) => {
          if (entity.type === "rect") return <rect key={index} x={entity.x} y={entity.y} width={entity.width} height={entity.height} fill={entity.fill ?? "none"} stroke={stroke(entity.layer)} strokeWidth="0.35" />;
          if (entity.type === "line") return <polyline key={index} points={entity.points.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke={stroke(entity.layer)} strokeWidth="0.5" />;
          if (entity.type === "circle") return <circle key={index} cx={entity.cx} cy={entity.cy} r={entity.r} fill={entity.fill ?? "#fff"} stroke={stroke(entity.layer)} strokeWidth="0.35" />;
          return <text key={index} x={entity.x} y={entity.y} fontSize={entity.height} textAnchor={entity.align ?? "start"} fontWeight={entity.weight ?? "normal"} fill={stroke(entity.layer)}>{entity.value}</text>;
        })}
      </svg>
    </div>
  </section>
);

const ReadinessWorkspace = ({
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

const ExportWorkspace = ({ project, catalog, drawing, readiness, onDownload }: { project: Project; catalog: EquipmentDefinition[]; drawing: ReturnType<typeof buildEngineeringDrawing>; readiness: ProjectReadinessReport; onDownload: (name: string, content: string) => void }) => {
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

const InspectorPanel = ({
  selected,
  selectedPointId,
  onPointSelect,
  onLabel,
  onRotate,
  onDelete,
  onPointPatch,
  onHelp,
}: {
  selected: EquipmentWithPlacement;
  selectedPointId: string;
  onPointSelect: (id: string) => void;
  onLabel: (id: string, label: string) => void;
  onRotate: () => void;
  onDelete: () => void;
  onPointPatch: (field: "localX" | "localY" | "localZ" | "dnMm", value: number | undefined) => void;
  onHelp: (key: HelpKey) => void;
}) => {
  const worldPoints = selected.placement ? resolveWorldConnectionPoints(selected.instance, selected.definition, selected.placement) : [];
  const point = worldPoints.find((entry) => entry.pointId === selectedPointId) ?? worldPoints[0];
  return (
    <aside className="inspector">
      <p className="eyebrow">Инспектор объекта</p>
      <h2>{selected.instance.label}</h2>
      <label>Обозначение<input value={selected.instance.label} onChange={(event) => onLabel(selected.instance.id, event.target.value)} /></label>
      <dl>
        <dt>Тип</dt><dd>{selected.definition.name}</dd>
        <dt>Позиция</dt><dd>{selected.placement?.placed ? `${selected.placement.xMm}, ${selected.placement.yMm}, ${selected.placement.rotationDeg}°` : "не размещено"}</dd>
        <dt>Статус</dt><dd>{translateReview(selected.instance.status)}</dd>
        <dt>Уточнения</dt><dd>{selected.instance.connectionPointOverrides.length}</dd>
      </dl>
      <ConnectionPointPreview item={selected} selectedPointId={point?.pointId ?? ""} onSelect={onPointSelect} compact />
      <h3>Точки подключения экземпляра</h3>
      <div className="cpGrid">
        {worldPoints.map((entry) => (
          <button key={entry.pointId} type="button" className={entry.pointId === point?.pointId ? "cpRow active" : "cpRow"} onClick={() => onPointSelect(entry.pointId)}>
            <strong>{entry.label}</strong>
            <span>{translatePointType(entry.type)} · DN{entry.dnMm ?? "-"} · мир X {Math.round(entry.xMm)}, Y {Math.round(entry.yMm)}</span>
            <small>{entry.overrides.length ? "есть уточнение экземпляра" : "из карточки каталога"} · {translateData(entry.status)}</small>
          </button>
        ))}
      </div>
      {point && (
        <div className="pointEditor" onMouseEnter={() => onHelp("override")}>
          <h4>Уточнение выбранной точки</h4>
          <NumberEdit label="X, мм" value={point.localX} onChange={(value) => onPointPatch("localX", value)} />
          <NumberEdit label="Y, мм" value={point.localY} onChange={(value) => onPointPatch("localY", value)} />
          <NumberEdit label="Z, мм" value={point.localZ} onChange={(value) => onPointPatch("localZ", value)} />
          <NumberEdit label="DN, мм" value={point.dnMm} onChange={(value) => onPointPatch("dnMm", value)} />
        </div>
      )}
      <div className="buttonRow">
        <button type="button" onClick={onRotate}>Повернуть на 90°</button>
        <button type="button" className="dangerButton" onClick={onDelete}>Удалить</button>
      </div>
    </aside>
  );
};

const ConnectionPointPreview = ({ item, selectedPointId, onSelect, compact = false }: { item: EquipmentWithPlacement; selectedPointId: string; onSelect: (id: string) => void; compact?: boolean }) => {
  const width = item.definition.dimensions.widthMm;
  const depth = item.definition.dimensions.depthMm;
  const padding = 220;
  const selectedPoint = item.definition.connectionPoints.find((point) => point.id === selectedPointId) ?? item.definition.connectionPoints[0];
  return (
    <svg className={compact ? "pointPreview compact" : "pointPreview"} viewBox={`${-padding} ${-padding} ${width + padding * 2} ${depth + padding * 2}`} role="img" aria-label="Схема точек подключения">
      <rect x={-item.definition.serviceZones.leftMm} y={-item.definition.serviceZones.rearMm} width={width + item.definition.serviceZones.leftMm + item.definition.serviceZones.rightMm} height={depth + item.definition.serviceZones.frontMm + item.definition.serviceZones.rearMm} fill="#e0f2fe" stroke="#38bdf8" strokeDasharray="40 25" />
      <rect x="0" y="0" width={width} height={depth} fill="#f8fafc" stroke="#0f172a" strokeWidth="18" />
      {!compact && selectedPoint && (
        <text x="0" y={depth + 150} fontSize="80" fontWeight="700">
          {selectedPoint.label} · {translatePointType(selectedPoint.type)} · DN{selectedPoint.dnMm ?? "-"}
        </text>
      )}
      {item.definition.connectionPoints.map((point) => (
        <g key={point.id} className={point.id === selectedPointId ? "previewPoint active" : "previewPoint"} onClick={() => onSelect(point.id)}>
          <circle cx={point.localX} cy={point.localY} r="55" fill={pointColor(point.type)} />
        </g>
      ))}
    </svg>
  );
};

const NumberEdit = ({ label, value, onChange }: { label: string; value?: number; onChange: (value: number | undefined) => void }) => (
  <label>{label}<input type="number" value={value ?? ""} onChange={(event) => onChange(event.target.value === "" ? undefined : Number(event.target.value))} /></label>
);

const ReadinessStrip = ({ readiness }: { readiness: ProjectReadinessReport }) => (
  <div className="readinessStrip">
    <span>Готовность {readiness.score}</span>
    <span>Блокеры {readiness.blockers.length}</span>
    <span>Предупреждения {readiness.warnings.length}</span>
    <span>Нет данных {readiness.missingData.length}</span>
    <span>Ручные CAD-действия {readiness.manualCadActions.length}</span>
  </div>
);

const rotatePlacement = (id: string, project: Project, updatePlacement: (itemId: string, patch: Partial<Placement>) => void) => {
  const placement = project.placements.find((item) => item.itemId === id);
  if (!placement) return;
  const rotations: Placement["rotationDeg"][] = [0, 90, 180, 270];
  updatePlacement(id, { rotationDeg: rotations[(rotations.indexOf(placement.rotationDeg) + 1) % rotations.length] });
};

const categoryLabel = (category: string) => ({
  boiler: "Котлы",
  header: "Коллекторы",
  valve: "Арматура",
  pump: "Насосы",
  filter: "Фильтры",
  sensor: "КИП",
  flue: "Дымоход",
  dev_fixture: "DEV fixture",
}[category] ?? "Другое");

const equipmentMark = (item: EquipmentWithPlacement): string => {
  if (item.instance.role === "primary_boiler") return "К1";
  if (item.instance.role === "supply_header") return "КП1";
  if (item.instance.role === "return_header") return "КО1";
  if (item.instance.role === "supply_shutoff") return "ЗК1";
  if (item.instance.role === "return_shutoff") return "ЗК2";
  if (item.instance.role === "gas_shutoff") return "ЗКГ1";
  return item.instance.label.length <= 8 ? item.instance.label : item.instance.label.slice(0, 8);
};

const shortEquipmentName = (item: EquipmentWithPlacement): string => {
  if (item.definition.category === "boiler") return "котел RGT-100";
  if (item.instance.role === "supply_header") return "коллектор подачи";
  if (item.instance.role === "return_header") return "коллектор обратки";
  if (item.definition.category === "valve") return item.instance.role === "gas_shutoff" ? "кран газ DN25" : "кран DN32";
  return item.definition.name;
};

const translateCategory = (category: string) => ({
  input: "Исходные данные",
  equipment: "Оборудование",
  placement: "Размещение",
  connection: "Соединения",
  routing: "Трассы",
  calculation: "Расчеты",
  drawing: "Чертеж",
  evidence: "Источники",
}[category] ?? category);

const translateReadiness = (value: string) => ({
  draft: "черновик",
  incomplete: "не завершено",
  blocked: "заблокировано",
  readyForDraftDxf: "готово к черновому DXF",
  readyForFinalPackage: "готово к финальному пакету",
}[value] ?? value);

const translateExport = (value: string) => ({ draft_available: "черновик доступен", final_blocked: "финал заблокирован", final_ready: "финал готов" }[value] ?? value);
const translateReview = (value: string) => ({ draft: "черновик", needs_data: "нужны данные", needs_confirmation: "нужно подтвердить", verified: "проверено", resolved: "закрыто", not_applicable: "не применимо", blocked: "блокер", manual_cad_action: "ручное CAD-действие" }[value] ?? value);
const translateConnection = (value: string) => ({ auto_detected: "найдено автоматически", user_confirmed: "подтверждено", user_overridden: "переопределено", blocked: "заблокировано", ambiguous: "неоднозначно" }[value] ?? value);
const translateSeverity = (value: string) => ({ info: "инфо", warning: "предупреждение", error: "ошибка", blocker: "блокер" }[value] ?? value);
const translateData = (value: string) => ({ unknown: "неизвестно", placeholder: "заглушка, требует замены", user_provided: "от пользователя", catalog: "каталог", passport: "паспорт", calculated: "расчет", verified: "проверено", overridden: "уточнено", not_applicable: "не применимо", blocked: "блокер" }[value] ?? value);
const translatePointType = (value: string) => ({ supply: "подача", return: "обратка", gas: "газ", flue: "дымоход", electric: "электрика", signal: "сигнал", drain: "дренаж", "make-up": "подпитка", other: "другое" }[value] ?? value);
const translateDirection = (value?: string) => ({ left: "влево", right: "вправо", top: "вверх на плане", bottom: "вниз на плане", front: "фронт", back: "зад", up: "вверх", down: "вниз" }[value ?? ""] ?? "не задано");
const pointColor = (type: string) => ({ supply: "#dc2626", return: "#2563eb", gas: "#a16207", flue: "#475569", electric: "#7c3aed", signal: "#0891b2" }[type] ?? "#0369a1");
const stroke = (layer: string) => layer === "PIPE_SUPPLY" ? "#b91c1c" : layer === "PIPE_RETURN" ? "#1d4ed8" : layer === "PIPE_GAS" ? "#a16207" : layer === "WARNING" ? "#b45309" : "#111827";
const sourceStatusText = (source: string, confidence: number): string => `Источник: ${source}. Уверенность ${Math.round(confidence * 100)}%.`;
const exportFileLabel = (file: string): string => ({
  "project.draft.json": "JSON проекта",
  "equipment.draft.csv": "CSV состава оборудования",
  "plan.draft.svg": "SVG плана помещения",
  "sheet.draft.svg": "SVG листа A3",
  "drawing.draft.dxf": "DXF черновой",
  "diagnostic-report.draft.md": "Диагностический отчет",
  "cover-letter.draft.md": "Сопроводительное письмо",
}[file] ?? file);
const connectionLabel = (itemId: string, pointId: string): string => {
  const item = {
    inst_boiler_1: "К1",
    inst_supply_header: "КП1",
    inst_return_header: "КО1",
    inst_valve_supply_1: "ЗК1",
    inst_valve_return_1: "ЗК2",
    inst_valve_gas_1: "ЗКГ1",
  }[itemId] ?? itemId;
  const point = {
    supply: "подача",
    return: "обратка",
    gas: "газ",
    flue: "дымоход",
    "supply-main": "вход подачи",
    "return-main": "вход обратки",
    outlet: "выход",
    inlet: "вход",
  }[pointId] ?? pointId;
  return `${item}: ${point}`;
};
