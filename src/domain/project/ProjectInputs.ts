import type { DataStatus } from "../validation/status";

export type BoilerRoomPlacement = "standalone" | "inside_building" | "attached" | "roof" | "block_modular";
export type BoilerRoomType = "gas" | "electric" | "liquid_fuel" | "solid_fuel" | "combined";
export type FuelType = "natural_gas" | "electricity" | "diesel" | "solid_fuel" | "combined";
export type HeatCarrier = "water" | "steam" | "glycol";
export type ProjectPurpose = "heating" | "dhw" | "process";
export type ProjectStage = "preliminary" | "dxf_preparation" | "working_documentation_support";

export type SourceStatusByField = Record<string, { status: DataStatus; confidence: number; source: string; note?: string }>;

export type ProjectInputs = {
  country: "RU";
  boilerRoomPlacement: BoilerRoomPlacement;
  boilerRoomType: BoilerRoomType;
  fuelType: FuelType;
  heatCarrier: HeatCarrier;
  purpose: ProjectPurpose[];
  targetPowerKw: number;
  temperatureSchedule: { supplyC: number; returnC: number };
  stage: ProjectStage;
  constraints: string[];
  inputSources: string[];
  sourceStatusByField: SourceStatusByField;
  assumptions: string[];
};
