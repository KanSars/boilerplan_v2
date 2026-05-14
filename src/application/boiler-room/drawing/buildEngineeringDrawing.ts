import type { EngineeringDrawing, DrawingEntity } from "../../../domain/drawing/EngineeringDrawing";
import type { EquipmentDefinition } from "../../../domain/equipment/Equipment";
import type { Project } from "../../../domain/project/Project";
import type { ProjectReadinessReport } from "../../../domain/validation/Validation";
import { buildPreliminaryRoutes } from "../routing/buildPreliminaryRoutes";
import { resolveEquipmentForProject } from "../equipment/resolveEquipmentForProject";
import { resolveSystemConnections } from "../connections/resolveSystemConnections";

export const buildEngineeringDrawing = (
  project: Project,
  catalog: EquipmentDefinition[],
  readiness: ProjectReadinessReport,
): EngineeringDrawing => {
  const entities: DrawingEntity[] = [];
  addSheet(entities, project, readiness);
  addPlan(entities, project, catalog);
  addSchematic(entities, project, catalog);
  addLegend(entities);
  return {
    id: `${project.id}_a3_sheet`,
    sheet: { format: "A3", orientation: "landscape", width: 420, height: 297 },
    views: [
      { id: "plan", x: 15, y: 30, width: 180, height: 135 },
      { id: "schematic", x: 210, y: 30, width: 190, height: 145 },
      { id: "legend", x: 15, y: 185, width: 180, height: 50 },
      { id: "title", x: 260, y: 252, width: 155, height: 40 },
    ],
    symbols: ["boiler", "header", "valve", "connection_point"],
    annotations: ["DN32 T1/T2", "DN25 gas", "DN200 flue"],
    dimensions: ["Room 6000x4500x3000"],
    legend: ["T1 supply", "T2 return", "G gas", "flue DN200"],
    titleBlock: { project: project.name, stage: project.projectInputs.stage, status: readiness.status },
    warnings: readiness.status === "readyForFinalPackage" ? [] : readiness.exportReadiness.reasons,
    entities,
    metadata: {
      title: `${project.name}. Подготовка DXF котельной`,
      status: readiness.status === "readyForFinalPackage" ? "final_candidate" : "draft",
      readinessStatus: readiness.status,
      generatedAt: new Date().toISOString(),
    },
  };
};

export const buildDrawingSheet = buildEngineeringDrawing;
export const validateEngineeringDrawing = (drawing: EngineeringDrawing): boolean => drawing.entities.length > 0;

const addSheet = (entities: DrawingEntity[], project: Project, readiness: ProjectReadinessReport) => {
  entities.push(
    rect(5, 5, 410, 287, "SHEET_FRAME"),
    rect(10, 10, 400, 277, "SHEET_FRAME"),
    rect(260, 252, 155, 40, "TITLE_BLOCK"),
    line([{ x: 260, y: 263 }, { x: 415, y: 263 }], "TITLE_BLOCK"),
    line([{ x: 260, y: 274 }, { x: 415, y: 274 }], "TITLE_BLOCK"),
    line([{ x: 330, y: 252 }, { x: 330, y: 292 }], "TITLE_BLOCK"),
    text(15, 18, "Отдельно стоящая газовая водогрейная котельная. Подготовка DXF", 3.6, "ANNOTATION", "bold"),
    text(15, 24, readiness.status === "readyForFinalPackage" ? "Статус: готово к финальному пакету" : "Статус: черновик, есть незакрытые проверки", 2.6, readiness.status === "readyForFinalPackage" ? "ANNOTATION" : "WARNING"),
    text(264, 260, project.name.slice(0, 34), 2.6, "ANNOTATION", "bold"),
    text(334, 260, "A3", 2.8, "ANNOTATION"),
    text(264, 271, "План + схема", 2.5, "ANNOTATION"),
    text(334, 271, readiness.exportReadiness.final === "final_ready" ? "Финал готов" : "Финал блок.", 2.5, readiness.exportReadiness.final === "final_ready" ? "ANNOTATION" : "WARNING"),
    text(264, 285, "Не является подписанной РД", 2.4, "WARNING"),
  );
};

const addPlan = (entities: DrawingEntity[], project: Project, catalog: EquipmentDefinition[]) => {
  const origin = { x: 18, y: 38 };
  const view = { width: 178, height: 124 };
  const scale = Math.min(view.width / project.room.widthMm, view.height / project.room.lengthMm);
  entities.push(
    text(origin.x, 32, "План размещения оборудования М 1:50", 3, "ANNOTATION", "bold"),
    rect(origin.x, origin.y, project.room.widthMm * scale, project.room.lengthMm * scale, "ROOM_OUTLINE", "#ffffff"),
    text(origin.x, origin.y + project.room.lengthMm * scale + 6, `${project.room.widthMm} x ${project.room.lengthMm} мм`, 2.2, "ANNOTATION"),
  );
  const resolved = resolveEquipmentForProject(project, catalog);
  const callouts: string[] = [];
  for (const item of resolved) {
    if (!item.placement?.placed) continue;
    const x = origin.x + item.body.xMm * scale;
    const y = origin.y + item.body.yMm * scale;
    const width = Math.max(4, item.body.widthMm * scale);
    const height = Math.max(4, item.body.depthMm * scale);
    addPlanSymbol(entities, x, y, width, height, item.definition.category);
    entities.push(text(x + width / 2, y + height / 2 + 1, getMark(item.instance.role, item.instance.label), 2.1, "ANNOTATION", "bold", "middle"));
    callouts.push(`${getMark(item.instance.role, item.instance.label)} - ${getShortName(item.instance.role, item.definition.name)}`);
    if (item.definition.category === "boiler") {
      for (const point of item.definition.connectionPoints.filter((point) => ["supply", "return", "gas", "flue"].includes(point.type))) {
        entities.push(circle(origin.x + (item.placement.xMm + point.localX) * scale, origin.y + (item.placement.yMm + point.localY) * scale, 0.85, "CONNECTION_POINT"));
      }
    }
  }
  const routes = buildPreliminaryRoutes(project, catalog, resolveSystemConnections(project, catalog));
  for (const route of routes) {
    if (route.points.length < 2) continue;
    const layer = route.medium === "natural_gas" ? "PIPE_GAS" : route.medium === "flue_gas" ? "PIPE_FLUE" : route.id.includes("t2") ? "PIPE_RETURN" : "PIPE_SUPPLY";
    entities.push(line(route.points.map((point) => ({ x: origin.x + point.xMm * scale, y: origin.y + point.yMm * scale })), layer));
  }
  callouts.slice(0, 7).forEach((value, index) => {
    entities.push(text(18 + (index > 3 ? 86 : 0), 169 + (index % 4) * 4.5, value, 2.1, "ANNOTATION"));
  });
};

const addSchematic = (entities: DrawingEntity[], project: Project, catalog: EquipmentDefinition[]) => {
  const x = 218;
  const y = 40;
  entities.push(text(x, 32, "Технологическая схема", 3, "ANNOTATION", "bold"));
  const boiler = box(entities, x + 8, y + 58, 46, 34, "К1", "EQUIPMENT_BODY");
  const supply = box(entities, x + 115, y + 38, 58, 10, "КП1", "EQUIPMENT_BODY");
  const ret = box(entities, x + 115, y + 96, 58, 10, "КО1", "EQUIPMENT_BODY");
  lineWithLabel(entities, [{ x: boiler.x + boiler.width, y: boiler.y + 10 }, { x: supply.x - 18, y: boiler.y + 10 }, { x: supply.x - 18, y: supply.y + 5 }, { x: supply.x, y: supply.y + 5 }], "PIPE_SUPPLY", "T1 DN32");
  lineWithLabel(entities, [{ x: ret.x, y: ret.y + 5 }, { x: ret.x - 24, y: ret.y + 5 }, { x: ret.x - 24, y: boiler.y + 25 }, { x: boiler.x + boiler.width, y: boiler.y + 25 }], "PIPE_RETURN", "T2 DN32");
  addValveSymbol(entities, supply.x - 18, supply.y + 20, "PIPE_SUPPLY", "ЗК1");
  addValveSymbol(entities, ret.x - 24, ret.y - 12, "PIPE_RETURN", "ЗК2");
  lineWithLabel(entities, [{ x: boiler.x + 22, y: boiler.y + boiler.height }, { x: boiler.x + 22, y: boiler.y + boiler.height + 20 }, { x: boiler.x - 35, y: boiler.y + boiler.height + 20 }], "PIPE_GAS", "Г DN25");
  addValveSymbol(entities, boiler.x - 12, boiler.y + boiler.height + 20, "PIPE_GAS", "ЗКГ1");
  lineWithLabel(entities, [{ x: boiler.x + 24, y: boiler.y }, { x: boiler.x + 24, y: boiler.y - 26 }], "PIPE_FLUE", "ДН DN200");
  const connectionCount = resolveSystemConnections(project, catalog).length;
  entities.push(text(x + 8, y + 134, `Логических связей: ${connectionCount}. Неподтвержденные связи блокируют финал.`, 2.2, "WARNING"));
};

const addLegend = (entities: DrawingEntity[]) => {
  entities.push(text(18, 190, "Условные обозначения", 3, "ANNOTATION", "bold"));
  lineWithLabel(entities, [{ x: 18, y: 203 }, { x: 48, y: 203 }], "PIPE_SUPPLY", "T1 подача");
  lineWithLabel(entities, [{ x: 18, y: 214 }, { x: 48, y: 214 }], "PIPE_RETURN", "T2 обратка");
  lineWithLabel(entities, [{ x: 18, y: 225 }, { x: 48, y: 225 }], "PIPE_GAS", "Г газ");
  addValveSymbol(entities, 118, 203, "PIPE_SUPPLY", "ЗК");
  text(128, 204, "запорная арматура", 2.2, "ANNOTATION");
};

const box = (entities: DrawingEntity[], x: number, y: number, width: number, height: number, label: string, layer: DrawingEntity["layer"]) => {
  entities.push(rect(x, y, width, height, layer), text(x + width / 2, y + height / 2 + 1, label, 3, "ANNOTATION", "bold", "middle"));
  return { x, y, width, height };
};
const lineWithLabel = (entities: DrawingEntity[], points: Array<{ x: number; y: number }>, layer: DrawingEntity["layer"], label: string) => {
  entities.push(line(points, layer), text(points[Math.max(0, Math.floor(points.length / 2) - 1)].x + 3, points[Math.max(0, Math.floor(points.length / 2) - 1)].y - 3, label, 2.2, "ANNOTATION"));
};
const addPlanSymbol = (entities: DrawingEntity[], x: number, y: number, width: number, height: number, category: string) => {
  if (category === "valve") {
    const cx = x + width / 2;
    const cy = y + height / 2;
    entities.push(line([{ x, y: cy }, { x: x + width, y: cy }], "VALVE"));
    entities.push(line([{ x: cx - 2.8, y: cy - 2.8 }, { x: cx, y: cy }, { x: cx - 2.8, y: cy + 2.8 }], "VALVE"));
    entities.push(line([{ x: cx + 2.8, y: cy - 2.8 }, { x: cx, y: cy }, { x: cx + 2.8, y: cy + 2.8 }], "VALVE"));
    return;
  }
  entities.push(rect(x, y, width, height, "EQUIPMENT_BODY", "#f8fafc"));
  if (category === "header") {
    entities.push(line([{ x: x + 1.5, y: y + height / 2 }, { x: x + width - 1.5, y: y + height / 2 }], "EQUIPMENT_BODY"));
    return;
  }
  entities.push(circle(x + width / 2, y + height * 0.28, Math.min(width, height) * 0.11, "EQUIPMENT_BODY"));
};
const addValveSymbol = (entities: DrawingEntity[], x: number, y: number, layer: DrawingEntity["layer"], label: string) => {
  entities.push(
    line([{ x: x - 8, y }, { x: x + 8, y }], layer),
    line([{ x: x - 4, y: y - 4 }, { x, y }, { x: x - 4, y: y + 4 }], "VALVE"),
    line([{ x: x + 4, y: y - 4 }, { x, y }, { x: x + 4, y: y + 4 }], "VALVE"),
    text(x, y - 6, label, 2, "ANNOTATION", "bold", "middle"),
  );
};
const getMark = (role: string, fallback: string) => ({
  primary_boiler: "К1",
  supply_header: "КП1",
  return_header: "КО1",
  supply_shutoff: "ЗК1",
  return_shutoff: "ЗК2",
  gas_shutoff: "ЗКГ1",
}[role] ?? fallback.slice(0, 6));
const getShortName = (role: string, name: string) => ({
  primary_boiler: "котел RGT-100",
  supply_header: "коллектор подачи",
  return_header: "коллектор обратки",
  supply_shutoff: "кран T1 DN32",
  return_shutoff: "кран T2 DN32",
  gas_shutoff: "кран газ DN25",
}[role] ?? name.slice(0, 28));
const rect = (x: number, y: number, width: number, height: number, layer: DrawingEntity["layer"], fill?: string): DrawingEntity => ({ type: "rect", layer, x, y, width, height, fill });
const line = (points: Array<{ x: number; y: number }>, layer: DrawingEntity["layer"]): DrawingEntity => ({ type: "line", layer, points });
const circle = (cx: number, cy: number, r: number, layer: DrawingEntity["layer"]): DrawingEntity => ({ type: "circle", layer, cx, cy, r, fill: "#fff" });
const text = (x: number, y: number, value: string, height: number, layer: DrawingEntity["layer"], weight: "normal" | "bold" = "normal", align?: "start" | "middle" | "end"): DrawingEntity => ({ type: "text", layer, x, y, value, height, weight, align });
