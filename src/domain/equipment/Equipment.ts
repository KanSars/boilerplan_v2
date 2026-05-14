import type { PointMm, RotationDeg } from "../geometry/types";
import type { DataStatus, ReviewStatus } from "../validation/status";

export type EquipmentCategory =
  | "boiler"
  | "header"
  | "valve"
  | "pump"
  | "filter"
  | "sensor"
  | "safety_group"
  | "expansion_tank"
  | "flue"
  | "gas_input"
  | "water_input"
  | "electric"
  | "building_mep"
  | "pipe_line"
  | "dev_fixture"
  | "placeholder";

export type ConnectionPointType =
  | "supply"
  | "return"
  | "gas"
  | "flue"
  | "electric"
  | "signal"
  | "drain"
  | "make-up"
  | "other";

export type ConnectionDirection = "left" | "right" | "top" | "bottom" | "front" | "back" | "up" | "down";
export type SourceReliability = "placeholder_dev" | "user" | "catalog" | "passport" | "calculated" | "verified";

export type EvidenceLink = {
  sourceDocumentId: string;
  citationId?: string;
  note?: string;
};

export type ServiceZones = {
  frontMm: number;
  rearMm: number;
  leftMm: number;
  rightMm: number;
};

export type ConnectionPoint = {
  id: string;
  type: ConnectionPointType;
  label: string;
  localX: number;
  localY: number;
  localZ?: number;
  dnMm?: number;
  direction?: ConnectionDirection;
  medium: "water" | "natural_gas" | "flue_gas" | "electricity" | "signal" | "drain" | "other";
  source: string;
  confidence: number;
  status: DataStatus;
};

export type ConnectionPointOverride = {
  id: string;
  pointId: string;
  field: keyof ConnectionPoint;
  oldValue: string | number | undefined;
  newValue: string | number | undefined;
  reason: string;
  source: string;
  status: DataStatus;
  confidence: number;
  createdAt: string;
  createdBy: "user" | "import" | "ai_assist";
};

export type ResolvedConnectionPoint = ConnectionPoint & {
  itemId: string;
  pointId: string;
  sourceChain: string[];
  overrides: ConnectionPointOverride[];
};

export type WorldConnectionPoint = ResolvedConnectionPoint & {
  xMm: number;
  yMm: number;
  zMm?: number;
  directionWorld?: ConnectionDirection;
};

export type EquipmentDefinition = {
  id: string;
  category: EquipmentCategory;
  name: string;
  manufacturer?: string;
  model?: string;
  dimensions: { widthMm: number; depthMm: number; heightMm?: number };
  serviceZones: ServiceZones;
  connectionPoints: ConnectionPoint[];
  technicalParameters: Record<string, string | number | boolean>;
  symbols: { plan: string; schematic: string };
  evidenceLinks: EvidenceLink[];
  sourceStatus: SourceReliability;
  confidence: number;
  metadata: Record<string, unknown>;
};

export type EquipmentInstance = {
  id: string;
  definitionId: string;
  label: string;
  role: string;
  quantity: number;
  instanceParameters: Record<string, string | number | boolean>;
  connectionPointOverrides: ConnectionPointOverride[];
  evidenceOverrides: EvidenceLink[];
  status: ReviewStatus;
  metadata: Record<string, unknown>;
};

export type Placement = {
  itemId: string;
  xMm: number;
  yMm: number;
  rotationDeg: RotationDeg;
  placed: boolean;
  locked: boolean;
  metadata: Record<string, unknown>;
};

export type EquipmentWithPlacement = {
  instance: EquipmentInstance;
  definition: EquipmentDefinition;
  placement?: Placement;
  body: { xMm: number; yMm: number; widthMm: number; depthMm: number };
};

export type ConnectionPointOverrideInput = Omit<ConnectionPointOverride, "id" | "createdAt" | "createdBy" | "oldValue"> & {
  createdBy?: ConnectionPointOverride["createdBy"];
};

export const toPoint = (point: ConnectionPoint): PointMm => ({
  xMm: point.localX,
  yMm: point.localY,
  zMm: point.localZ,
});
