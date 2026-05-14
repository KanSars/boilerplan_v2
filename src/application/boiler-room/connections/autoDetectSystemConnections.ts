import type { SystemConnection } from "../../../domain/connection/SystemConnection";
import type { EquipmentDefinition } from "../../../domain/equipment/Equipment";
import type { Project } from "../../../domain/project/Project";

const itemByRole = (project: Project, role: string) => project.equipmentItems.find((item) => item.role === role);

export const autoDetectSystemConnections = (project: Project, catalog: EquipmentDefinition[]): SystemConnection[] => {
  const boiler = itemByRole(project, "primary_boiler");
  const supplyHeader = itemByRole(project, "supply_header");
  const returnHeader = itemByRole(project, "return_header");
  const gasValve = itemByRole(project, "gas_shutoff");
  if (!boiler) return [];

  const boilerDef = catalog.find((item) => item.id === boiler.definitionId);
  const boilerSupply = boilerDef?.connectionPoints.find((point) => point.type === "supply");
  const boilerReturn = boilerDef?.connectionPoints.find((point) => point.type === "return");
  const boilerGas = boilerDef?.connectionPoints.find((point) => point.type === "gas");
  const boilerFlue = boilerDef?.connectionPoints.find((point) => point.type === "flue");

  const connections: SystemConnection[] = [];
  if (boilerSupply && supplyHeader) {
    connections.push({
      id: "conn_t1_boiler_to_supply_header",
      from: { itemId: boiler.id, pointId: boilerSupply.id },
      to: { itemId: supplyHeader.id, pointId: "supply-main" },
      medium: "water",
      lineType: "T1",
      dnMm: boilerSupply.dnMm,
      status: "auto_detected",
      reviewStatus: "needs_confirmation",
      source: "auto",
      confidence: 0.82,
      explanation: "Автосвязь по ролям primary_boiler -> supply_header и типу point=supply.",
    });
  }
  if (boilerReturn && returnHeader) {
    connections.push({
      id: "conn_t2_return_header_to_boiler",
      from: { itemId: returnHeader.id, pointId: "return-main" },
      to: { itemId: boiler.id, pointId: boilerReturn.id },
      medium: "water",
      lineType: "T2",
      dnMm: boilerReturn.dnMm,
      status: "auto_detected",
      reviewStatus: "needs_confirmation",
      source: "auto",
      confidence: 0.82,
      explanation: "Автосвязь по ролям return_header -> primary_boiler и типу point=return.",
    });
  }
  if (boilerGas && gasValve) {
    connections.push({
      id: "conn_gas_valve_to_boiler",
      from: { itemId: gasValve.id, pointId: "outlet" },
      to: { itemId: boiler.id, pointId: boilerGas.id },
      medium: "natural_gas",
      lineType: "G",
      dnMm: boilerGas.dnMm,
      status: "auto_detected",
      reviewStatus: "needs_confirmation",
      source: "auto",
      confidence: 0.7,
      explanation: "Газовая связь найдена по роли gas_shutoff и газовому патрубку котла.",
    });
  }
  if (boilerFlue) {
    connections.push({
      id: "conn_flue_boiler_to_stack",
      from: { itemId: boiler.id, pointId: boilerFlue.id },
      medium: "flue_gas",
      lineType: "FLUE",
      dnMm: boilerFlue.dnMm,
      status: "blocked",
      reviewStatus: "manual_cad_action",
      source: "placeholder",
      confidence: 0.4,
      explanation: "Дымоход DN200 известен, но трасса и оголовок требуют ручного CAD-действия в пилоте.",
    });
  }
  return mergeUserOverrides(connections, project.connectionOverrides);
};

const mergeUserOverrides = (auto: SystemConnection[], overrides: SystemConnection[]): SystemConnection[] => {
  const byId = new Map(auto.map((connection) => [connection.id, connection]));
  for (const override of overrides) byId.set(override.id, override);
  return Array.from(byId.values());
};
