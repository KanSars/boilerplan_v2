import { useMemo, useRef, useState } from "react";
import { confirmSystemConnection } from "../../application/boiler-room/connections/confirmSystemConnection";
import { resolveSystemConnections } from "../../application/boiler-room/connections/resolveSystemConnections";
import { buildEngineeringDrawing } from "../../application/boiler-room/drawing/buildEngineeringDrawing";
import { applyConnectionPointOverride } from "../../application/boiler-room/equipment/applyConnectionPointOverride";
import { removeEquipmentFromProject } from "../../application/boiler-room/equipment/removeEquipmentFromProject";
import { resolveEquipmentForProject } from "../../application/boiler-room/equipment/resolveEquipmentForProject";
import { exportDraftPackage } from "../../application/boiler-room/export/exportDraftPackage";
import { moveEquipment } from "../../application/boiler-room/placement/moveEquipment";
import { rotateEquipmentToNextPosition } from "../../application/boiler-room/placement/rotateEquipment";
import { createPilotProject } from "../../application/boiler-room/project-setup/createProjectFromInputs";
import { buildPreliminaryRoutes } from "../../application/boiler-room/routing/buildPreliminaryRoutes";
import { applyReadinessDecisions, type ReadinessDecision, type ReadinessDecisionMap } from "../../application/boiler-room/validation/applyReadinessDecisions";
import { buildProjectReadinessReport } from "../../application/boiler-room/validation/buildProjectReadinessReport";
import type { SystemConnection } from "../../domain/connection/SystemConnection";
import type { EquipmentDefinition } from "../../domain/equipment/Equipment";
import type { ValidationIssue } from "../../domain/validation/Validation";
import { pilotEquipmentCatalog } from "../../infrastructure/catalog/pilotCatalog";
import { drawingExportAdapters } from "../../infrastructure/export/drawingExportAdapters";
import { downloadTextFile, downloadTextFiles, persistProjectSnapshot, readProjectSnapshotFile } from "../../infrastructure/storage/projectSnapshotStorage";
import type { HelpKey, Workspace } from "../../shared/config/workspaces";

export const useBoilerRoomApp = () => {
  const [project, setProject] = useState(() => createPilotProject());
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

  const saveProject = () => {
    const payload = persistProjectSnapshot({ project, catalog, issueDecisions });
    downloadTextFile(`${project.id}.boilerplan.json`, payload);
    setToast("Проект сохранен в браузере и выгружен JSON-файлом.");
  };

  const loadProject = async (file: File) => {
    const snapshot = await readProjectSnapshotFile(file);
    setProject(snapshot.project);
    if (snapshot.catalog.length) setCatalog(snapshot.catalog);
    setIssueDecisions(snapshot.issueDecisions);
    setSelectedId(snapshot.project.equipmentItems[0]?.id ?? "");
    setToast("Проект загружен из файла.");
  };

  return {
    project,
    catalog,
    equipment,
    connections,
    routes,
    readiness,
    drawing,
    selected,
    selectedId,
    setSelectedId,
    workspace,
    setWorkspace,
    helpMode,
    setHelpMode,
    activeHelp,
    setActiveHelp,
    addMenuOpen,
    setAddMenuOpen,
    selectedPointId,
    setSelectedPointId,
    planZoom,
    setPlanZoom,
    schematicZoom,
    setSchematicZoom,
    drawingZoom,
    setDrawingZoom,
    issueDecisions,
    toast,
    setToast,
    fileInputRef,
    setCatalog,
    setProject,
    updateLabel,
    deleteItem,
    addEquipment,
    applyPointPatch,
    updateConnection,
    confirmAllConnections,
    navigateToIssue,
    setIssueDecision,
    saveProject,
    loadProject,
    downloadTextFile,
    downloadTextFiles,
    exportDraftPackage: () => exportDraftPackage(project, catalog, drawing, readiness, drawingExportAdapters),
    moveEquipment,
    rotateEquipmentToNextPosition,
    routePreview,
    setRoutePreview,
  };
};
