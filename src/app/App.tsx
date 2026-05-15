import { useBoilerRoomApp } from "./model/useBoilerRoomApp";
import { AppShell } from "../widgets/app-shell/AppShell";
import { DrawingWorkspace } from "../widgets/drawing-workspace/DrawingWorkspace";
import { EquipmentWorkspace } from "../widgets/equipment-workspace/EquipmentWorkspace";
import { ExportWorkspace } from "../widgets/export-workspace/ExportWorkspace";
import { InspectorPanel } from "../widgets/inspector-panel/InspectorPanel";
import { PlanWorkspace } from "../widgets/plan-workspace/PlanWorkspace";
import { ProjectInputsWorkspace } from "../widgets/project-inputs-workspace/ProjectInputsWorkspace";
import { ReadinessWorkspace } from "../widgets/readiness-workspace/ReadinessWorkspace";
import { SchematicWorkspace } from "../widgets/schematic-workspace/SchematicWorkspace";
import "./globals.css";

export const App = () => {
  const app = useBoilerRoomApp();
  const inspector = ["equipment", "plan"].includes(app.workspace) && app.selected ? (
    <InspectorPanel
      selected={app.selected}
      selectedPointId={app.selectedPointId}
      onPointSelect={app.setSelectedPointId}
      onLabel={app.updateLabel}
      onRotate={() => app.setProject((current) => app.rotateEquipmentToNextPosition(current, app.selected.instance.id))}
      onDelete={() => app.deleteItem(app.selected.instance.id)}
      onPointPatch={app.applyPointPatch}
      onHelp={app.setActiveHelp}
    />
  ) : undefined;

  return (
    <AppShell
      project={app.project}
      readiness={app.readiness}
      workspace={app.workspace}
      helpMode={app.helpMode}
      activeHelp={app.activeHelp}
      toast={app.toast}
      fileInputRef={app.fileInputRef}
      inspector={inspector}
      onWorkspace={app.setWorkspace}
      onHelp={app.setActiveHelp}
      onToggleHelp={() => app.setHelpMode((value) => !value)}
      onSave={app.saveProject}
      onLoadFile={(file) => void app.loadProject(file)}
      onCheck={() => app.setWorkspace("readiness")}
      onDraftExport={() => app.downloadTextFiles(app.exportDraftPackage())}
      onDismissToast={() => app.setToast("")}
    >
      {app.workspace === "inputs" && <ProjectInputsWorkspace project={app.project} readiness={app.readiness} onProject={app.setProject} />}
      {app.workspace === "equipment" && <EquipmentWorkspace equipment={app.equipment} catalog={app.catalog} selectedId={app.selected?.instance.id ?? ""} onSelect={app.setSelectedId} onAdd={app.addEquipment} onCatalogUpdate={app.setCatalog} />}
      {app.workspace === "plan" && (
        <PlanWorkspace
          equipment={app.equipment}
          routes={app.routePreview ? app.routes : []}
          selectedId={app.selected?.instance.id ?? ""}
          addMenuOpen={app.addMenuOpen}
          catalog={app.catalog}
          onSelect={app.setSelectedId}
          onMove={(id, xMm, yMm) => app.setProject((current) => app.moveEquipment(current, id, xMm, yMm))}
          onRotate={(id) => app.setProject((current) => app.rotateEquipmentToNextPosition(current, id))}
          onDelete={app.deleteItem}
          onConnect={() => {
            app.setActiveHelp("connect");
            app.setRoutePreview(true);
          }}
          onConfirmConnections={app.confirmAllConnections}
          onAdd={app.addEquipment}
          onToggleAdd={() => app.setAddMenuOpen((value) => !value)}
          onHelp={app.setActiveHelp}
          zoom={app.planZoom}
          onZoomChange={app.setPlanZoom}
        />
      )}
      {app.workspace === "schematic" && <SchematicWorkspace connections={app.connections} onConfirmAll={app.confirmAllConnections} onConnection={app.updateConnection} onHelp={app.setActiveHelp} zoom={app.schematicZoom} onZoomChange={app.setSchematicZoom} />}
      {app.workspace === "drawing" && <DrawingWorkspace drawing={app.drawing} zoom={app.drawingZoom} onZoomChange={app.setDrawingZoom} />}
      {app.workspace === "readiness" && <ReadinessWorkspace readiness={app.readiness} decisions={app.issueDecisions} onNavigate={app.navigateToIssue} onDecision={app.setIssueDecision} />}
      {app.workspace === "export" && <ExportWorkspace project={app.project} catalog={app.catalog} drawing={app.drawing} readiness={app.readiness} onDownload={app.downloadTextFile} />}
    </AppShell>
  );
};
