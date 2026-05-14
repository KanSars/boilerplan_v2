import { describe, expect, it } from "vitest";
import { applyConnectionPointOverride } from "../application/boiler-room/equipment/applyConnectionPointOverride";
import { resolveConnectionPoints, resolveWorldConnectionPoints } from "../application/boiler-room/equipment/resolveConnectionPoints";
import { resolveEquipmentForProject } from "../application/boiler-room/equipment/resolveEquipmentForProject";
import { createPilotProject } from "../application/boiler-room/project-setup/createProjectFromInputs";
import { buildProjectContext } from "../application/boiler-room/project-setup/buildProjectContext";
import { autoDetectSystemConnections } from "../application/boiler-room/connections/autoDetectSystemConnections";
import { confirmSystemConnection } from "../application/boiler-room/connections/confirmSystemConnection";
import { overrideSystemConnection } from "../application/boiler-room/connections/overrideSystemConnection";
import { buildPreliminaryRoutes } from "../application/boiler-room/routing/buildPreliminaryRoutes";
import { buildProjectReadinessReport } from "../application/boiler-room/validation/buildProjectReadinessReport";
import { applyReadinessDecisions } from "../application/boiler-room/validation/applyReadinessDecisions";
import { removeEquipmentFromProject } from "../application/boiler-room/equipment/removeEquipmentFromProject";
import { runPlacementValidation } from "../application/boiler-room/validation/runPlacementValidation";
import { estimateGasVelocityMs, estimateWaterFlowM3h } from "../application/boiler-room/validation/runCalculationValidation";
import { buildEngineeringDrawing } from "../application/boiler-room/drawing/buildEngineeringDrawing";
import { convertEngineeringDrawingToCad } from "../infrastructure/cad/EngineeringDrawingToCadService";
import { AsciiDxfWriter } from "../infrastructure/dxf/AsciiDxfWriter";
import { pilotEquipmentCatalog } from "../infrastructure/catalog/pilotCatalog";
import { loadEvidenceDataset } from "../application/boiler-room/evidence/loadEvidenceDataset";
import { evaluateCompiledRules } from "../application/boiler-room/evidence/evaluateCompiledRules";
import { exportDraftPackage } from "../application/boiler-room/export/exportDraftPackage";
import { exportFinalPackage } from "../application/boiler-room/export/exportFinalPackage";
import { buildCoverLetter } from "../application/boiler-room/export/buildCoverLetter";

describe("pilot project domain", () => {
  it("creates a RU standalone gas-water pilot context", () => {
    const project = createPilotProject();
    const context = buildProjectContext(project);
    expect(project.room.widthMm).toBe(6000);
    expect(context.isPilotScope).toBe(true);
  });

  it("loads pilot catalog and treats valves as normal equipment", () => {
    const valves = pilotEquipmentCatalog.filter((item) => item.category === "valve");
    expect(valves).toHaveLength(3);
    expect(valves[0].connectionPoints.length).toBeGreaterThan(0);
  });

  it("resolves equipment composition with placements", () => {
    const project = createPilotProject();
    const equipment = resolveEquipmentForProject(project, pilotEquipmentCatalog);
    expect(equipment).toHaveLength(6);
    expect(equipment.every((item) => item.placement?.placed)).toBe(true);
  });

  it("resolves connection point overrides without changing catalog definition", () => {
    const project = createPilotProject();
    const instance = project.equipmentItems[0];
    const definition = pilotEquipmentCatalog.find((item) => item.id === instance.definitionId);
    expect(definition).toBeDefined();
    const updated = applyConnectionPointOverride(instance, definition!, {
      pointId: "gas",
      field: "localX",
      newValue: 360,
      reason: " уточнение по экземпляру",
      source: "user measurement",
      status: "overridden",
      confidence: 0.9,
    });
    const resolved = resolveConnectionPoints(updated, definition!).find((point) => point.pointId === "gas");
    expect(resolved?.localX).toBe(360);
    expect(definition!.connectionPoints.find((point) => point.id === "gas")?.localX).toBe(345);
  });

  it("computes world connection point for rotated equipment", () => {
    const project = createPilotProject();
    const instance = project.equipmentItems[0];
    const definition = pilotEquipmentCatalog[0];
    const placement = { itemId: instance.id, xMm: 1000, yMm: 1000, rotationDeg: 90 as const, placed: true, locked: false, metadata: {} };
    const point = resolveWorldConnectionPoints(instance, definition, placement).find((entry) => entry.pointId === "supply");
    expect(point?.xMm).toBe(1600);
    expect(point?.yMm).toBe(1560);
  });

  it("validates placement inside room and service zones", () => {
    const project = createPilotProject();
    const issues = runPlacementValidation(project, pilotEquipmentCatalog);
    expect(issues.some((issue) => issue.id.startsWith("outside_"))).toBe(false);
    expect(issues.some((issue) => issue.id.startsWith("service_collision_"))).toBe(true);
  });

  it("detects system connections and supports user confirmation/override", () => {
    const project = createPilotProject();
    const connections = autoDetectSystemConnections(project, pilotEquipmentCatalog);
    expect(connections.map((connection) => connection.lineType)).toEqual(expect.arrayContaining(["T1", "T2", "G", "FLUE"]));
    const confirmed = confirmSystemConnection(connections[0]);
    expect(confirmed.reviewStatus).toBe("verified");
    const overridden = overrideSystemConnection(connections[1], { dnMm: 40 }, "manual engineering decision");
    expect(overridden.status).toBe("user_overridden");
  });

  it("builds preliminary routes and basic calculations", () => {
    const project = createPilotProject();
    const connections = autoDetectSystemConnections(project, pilotEquipmentCatalog);
    const routes = buildPreliminaryRoutes(project, pilotEquipmentCatalog, connections);
    expect(routes.length).toBeGreaterThanOrEqual(3);
    const supplyRoute = routes.find((route) => route.connectionId === "conn_t1_boiler_to_supply_header");
    const supplyValve = project.placements.find((placement) => placement.itemId === "inst_valve_supply_1");
    expect(supplyValve).toBeDefined();
    expect(supplyRoute?.points.some((point) => point.xMm === supplyValve!.xMm || point.yMm === supplyValve!.yMm + 39)).toBe(true);
    expect(estimateWaterFlowM3h(99, 20)).toBe(4.26);
    expect(estimateGasVelocityMs(12, 25)).toBeGreaterThan(6);
  });

  it("generates drawing model, CAD model and DXF", () => {
    const project = createPilotProject();
    const readiness = buildProjectReadinessReport(project, pilotEquipmentCatalog);
    const drawing = buildEngineeringDrawing(project, pilotEquipmentCatalog, readiness);
    const cad = convertEngineeringDrawingToCad(drawing);
    const dxf = new AsciiDxfWriter().write(cad);
    expect(drawing.entities.length).toBeGreaterThan(10);
    expect(cad.entities.length).toBeGreaterThan(10);
    expect(dxf).toContain("SECTION");
    expect(dxf).toContain("LAYER");
    expect(dxf).toContain("ME_PIPE_SUPPLY");
    expect(dxf).not.toMatch(/NaN|undefined/);
    expect(dxf).toContain("\\U+041E");
  });

  it("loads evidence dataset and evaluates compiled rule", () => {
    const project = createPilotProject();
    const dataset = loadEvidenceDataset();
    const result = evaluateCompiledRules(project, dataset)[0];
    expect(dataset.documents.some((document) => document.placeholder)).toBe(true);
    expect(result.result).toBe("pass");
  });

  it("allows draft exports and blocks final package while issues are unresolved", () => {
    const project = createPilotProject();
    const readiness = buildProjectReadinessReport(project, pilotEquipmentCatalog);
    const drawing = buildEngineeringDrawing(project, pilotEquipmentCatalog, readiness);
    const draft = exportDraftPackage(project, pilotEquipmentCatalog, drawing, readiness);
    expect(Object.keys(draft)).toContain("drawing.draft.dxf");
    expect(Object.keys(draft)).toContain("plan.draft.svg");
    expect(draft["diagnostic-report.draft.md"]).toContain("Проверки по категориям");
    expect(() => exportFinalPackage(project, pilotEquipmentCatalog, drawing, readiness)).toThrow("Final package blocked");
  });

  it("applies readiness decisions and can produce final evidence snapshot", () => {
    const project = createPilotProject();
    const readiness = buildProjectReadinessReport(project, pilotEquipmentCatalog);
    const decisions = Object.fromEntries(Object.values(readiness.checks).flatMap((issues) => issues).filter((issue) => issue.canBlockFinalExport).map((issue) => [issue.id, "resolved" as const]));
    const resolved = applyReadinessDecisions(readiness, decisions);
    const drawing = buildEngineeringDrawing(project, pilotEquipmentCatalog, resolved);
    const final = exportFinalPackage(project, pilotEquipmentCatalog, drawing, resolved);
    expect(resolved.exportReadiness.final).toBe("final_ready");
    expect(Object.keys(final)).toContain("evidence-snapshot.final.json");
  });

  it("removes equipment together with dependent placements and connection overrides", () => {
    const project = createPilotProject();
    const connection = confirmSystemConnection(autoDetectSystemConnections(project, pilotEquipmentCatalog)[0]);
    const withOverride = { ...project, connectionOverrides: [connection] };
    const updated = removeEquipmentFromProject(withOverride, "inst_boiler_1");
    expect(updated.equipmentItems.some((item) => item.id === "inst_boiler_1")).toBe(false);
    expect(updated.placements.some((placement) => placement.itemId === "inst_boiler_1")).toBe(false);
    expect(updated.connectionOverrides).toHaveLength(0);
  });

  it("generates a cover letter model", () => {
    const project = createPilotProject();
    const readiness = buildProjectReadinessReport(project, pilotEquipmentCatalog);
    const letter = buildCoverLetter(project, pilotEquipmentCatalog, readiness);
    expect(letter.equipmentSummary.length).toBe(6);
    expect(letter.limitations.join(" ")).toContain("не является подписанной");
  });
});
