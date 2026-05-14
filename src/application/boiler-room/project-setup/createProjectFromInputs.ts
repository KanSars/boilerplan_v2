import type { Project } from "../../../domain/project/Project";
import type { ProjectInputs } from "../../../domain/project/ProjectInputs";

const now = () => new Date().toISOString();

export const createPilotProject = (): Project => {
  const createdAt = now();
  const sourceStatusByField: ProjectInputs["sourceStatusByField"] = {
    country: { status: "verified", confidence: 1, source: "pilot scope" },
    boilerRoomPlacement: { status: "verified", confidence: 1, source: "pilot scope" },
    boilerRoomType: { status: "verified", confidence: 1, source: "pilot scope" },
    targetPowerKw: { status: "passport", confidence: 0.65, source: "RGT-100 pilot passport facts" },
    temperatureSchedule: { status: "user_provided", confidence: 0.8, source: "pilot default" },
    room: { status: "user_provided", confidence: 0.8, source: "pilot default" },
  };

  return {
    id: "project_boilerplan_v2_pilot",
    name: "Boilerplan AI v2 pilot: RGT-100",
    version: "0.1.0",
    createdAt,
    updatedAt: createdAt,
    projectInputs: {
      country: "RU",
      boilerRoomPlacement: "standalone",
      boilerRoomType: "gas",
      fuelType: "natural_gas",
      heatCarrier: "water",
      purpose: ["heating"],
      targetPowerKw: 99,
      temperatureSchedule: { supplyC: 80, returnC: 60 },
      stage: "dxf_preparation",
      constraints: ["Узкая область пилота: отдельно стоящая газовая водогрейная котельная РФ."],
      inputSources: ["pilot-scope", "rgt-100-ksva-100", "stout-sdg-0016-005002", "ball-valves"],
      sourceStatusByField,
      assumptions: ["Расстановка стартовая и может быть изменена пользователем.", "Финальный пакет блокируется placeholder-данными."],
    },
    room: {
      widthMm: 6000,
      lengthMm: 4500,
      heightMm: 3000,
      boundaries: "rectangular",
      openings: [{ id: "door-1", type: "door", xMm: 250, yMm: 4500, widthMm: 900 }],
      utilityInputs: [{ id: "gas-input-1", medium: "gas", xMm: 900, yMm: 4500, status: "user_provided" }],
      metadata: { units: "mm" },
    },
    equipmentItems: [
      { id: "inst_boiler_1", definitionId: "rgt-100-ksva-100", label: "К1", role: "primary_boiler", quantity: 1, instanceParameters: {}, connectionPointOverrides: [], evidenceOverrides: [], status: "needs_confirmation", metadata: {} },
      { id: "inst_supply_header", definitionId: "supply-header", label: "Коллектор подачи", role: "supply_header", quantity: 1, instanceParameters: {}, connectionPointOverrides: [], evidenceOverrides: [], status: "needs_confirmation", metadata: {} },
      { id: "inst_return_header", definitionId: "return-header", label: "Коллектор обратки", role: "return_header", quantity: 1, instanceParameters: {}, connectionPointOverrides: [], evidenceOverrides: [], status: "needs_confirmation", metadata: {} },
      { id: "inst_valve_supply_1", definitionId: "ball-valve-dn32-supply", label: "Кран T1 DN32", role: "supply_shutoff", quantity: 1, instanceParameters: {}, connectionPointOverrides: [], evidenceOverrides: [], status: "needs_confirmation", metadata: {} },
      { id: "inst_valve_return_1", definitionId: "ball-valve-dn32-return", label: "Кран T2 DN32", role: "return_shutoff", quantity: 1, instanceParameters: {}, connectionPointOverrides: [], evidenceOverrides: [], status: "needs_confirmation", metadata: {} },
      { id: "inst_valve_gas_1", definitionId: "ball-valve-dn25-gas", label: "Кран Г DN25", role: "gas_shutoff", quantity: 1, instanceParameters: {}, connectionPointOverrides: [], evidenceOverrides: [], status: "needs_confirmation", metadata: {} },
    ],
    placements: [
      { itemId: "inst_boiler_1", xMm: 1550, yMm: 2850, rotationDeg: 0, placed: true, locked: false, metadata: {} },
      { itemId: "inst_supply_header", xMm: 900, yMm: 700, rotationDeg: 0, placed: true, locked: false, metadata: {} },
      { itemId: "inst_return_header", xMm: 900, yMm: 1250, rotationDeg: 0, placed: true, locked: false, metadata: {} },
      { itemId: "inst_valve_supply_1", xMm: 1860, yMm: 2500, rotationDeg: 0, placed: true, locked: false, metadata: {} },
      { itemId: "inst_valve_return_1", xMm: 1680, yMm: 2600, rotationDeg: 0, placed: true, locked: false, metadata: {} },
      { itemId: "inst_valve_gas_1", xMm: 1450, yMm: 3700, rotationDeg: 0, placed: true, locked: false, metadata: {} },
    ],
    connectionOverrides: [],
    routeOverrides: [],
    drawingSettings: { format: "A3", scale: 50, draftWarnings: true },
    evidenceSnapshotRefs: ["data/evidence/standards", "data/evidence/equipment"],
    metadata: { pilotScope: "RU standalone gas hot-water boiler room, RGT-100" },
  };
};

export const createProjectFromInputs = (inputs: ProjectInputs): Project => ({
  ...createPilotProject(),
  projectInputs: inputs,
  updatedAt: now(),
});
