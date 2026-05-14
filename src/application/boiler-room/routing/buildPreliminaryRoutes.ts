import type { SystemConnection } from "../../../domain/connection/SystemConnection";
import type { EquipmentDefinition, WorldConnectionPoint } from "../../../domain/equipment/Equipment";
import type { Project } from "../../../domain/project/Project";
import type { PipingRoute } from "../../../domain/routing/PipingRoute";
import { resolveWorldConnectionPoints } from "../equipment/resolveConnectionPoints";

export const buildPreliminaryRoutes = (
  project: Project,
  catalog: EquipmentDefinition[],
  connections: SystemConnection[],
): PipingRoute[] => {
  const worldPoints = project.equipmentItems.flatMap((instance) => {
    const definition = catalog.find((item) => item.id === instance.definitionId);
    const placement = project.placements.find((item) => item.itemId === instance.id);
    return definition ? resolveWorldConnectionPoints(instance, definition, placement) : [];
  });

  return connections.flatMap<PipingRoute>((connection) => {
    if (!connection.to) return [{
      id: `route_${connection.id}`,
      connectionId: connection.id,
      points: [],
      medium: connection.medium === "flue_gas" ? "flue_gas" : connection.medium === "natural_gas" ? "natural_gas" : "water",
      dnMm: connection.dnMm,
      status: "manual_cad_action",
      source: "manual_cad_action",
      validationIssues: ["Нет конечной точки трассы. Требуется ручное оформление."],
    }];
    const from = worldPoints.find((point) => point.itemId === connection.from.itemId && point.pointId === connection.from.pointId);
    const to = worldPoints.find((point) => point.itemId === connection.to?.itemId && point.pointId === connection.to.pointId);
    if (!from || !to) return [];
    const valvePoints = findValveRoutePoints(connection.lineType, worldPoints, project, catalog);
    return [{
      id: `route_${connection.id}`,
      connectionId: connection.id,
      points: valvePoints ? routeViaValve(from, to, valvePoints) : routeDirect(from, to),
      medium: connection.medium === "natural_gas" ? "natural_gas" : connection.medium === "flue_gas" ? "flue_gas" : "water",
      dnMm: connection.dnMm,
      status: connection.reviewStatus === "verified" || connection.reviewStatus === "resolved" ? "resolved" : "needs_confirmation",
      source: "auto_preliminary",
      validationIssues: connection.reviewStatus === "needs_confirmation" ? ["Предварительная трасса требует подтверждения связи."] : [],
    }];
  });
};

type ValveRoutePoints = {
  itemId: string;
  inlet: WorldConnectionPoint;
  outlet: WorldConnectionPoint;
};

const routeDirect = (from: WorldConnectionPoint, to: WorldConnectionPoint) => {
  const midX = (from.xMm + to.xMm) / 2;
  return [{ xMm: from.xMm, yMm: from.yMm }, { xMm: midX, yMm: from.yMm }, { xMm: midX, yMm: to.yMm }, { xMm: to.xMm, yMm: to.yMm }];
};

const routeViaValve = (from: WorldConnectionPoint, to: WorldConnectionPoint, valve: ValveRoutePoints) => [
  { xMm: from.xMm, yMm: from.yMm },
  { xMm: from.xMm, yMm: valve.inlet.yMm },
  { xMm: valve.inlet.xMm, yMm: valve.inlet.yMm },
  { xMm: valve.outlet.xMm, yMm: valve.outlet.yMm },
  { xMm: to.xMm, yMm: valve.outlet.yMm },
  { xMm: to.xMm, yMm: to.yMm },
];

const findValveRoutePoints = (
  lineType: SystemConnection["lineType"],
  worldPoints: WorldConnectionPoint[],
  project: Project,
  catalog: EquipmentDefinition[],
): ValveRoutePoints | undefined => {
  const role = lineType === "T1" ? "supply_shutoff" : lineType === "T2" ? "return_shutoff" : lineType === "G" ? "gas_shutoff" : undefined;
  const pointType = lineType === "T1" ? "supply" : lineType === "T2" ? "return" : lineType === "G" ? "gas" : undefined;
  if (!role || !pointType) return undefined;
  const valve = project.equipmentItems.find((item) => item.role === role);
  if (!valve) return undefined;
  const definition = catalog.find((item) => item.id === valve.definitionId);
  if (!definition || definition.category !== "valve") return undefined;
  const candidates = worldPoints.filter((point) => point.itemId === valve.id && point.type === pointType);
  const inlet = candidates.find((point) => point.pointId === "inlet") ?? candidates[0];
  const outlet = candidates.find((point) => point.pointId === "outlet") ?? candidates[1];
  if (!inlet || !outlet) return undefined;
  return { itemId: valve.id, inlet, outlet };
};
