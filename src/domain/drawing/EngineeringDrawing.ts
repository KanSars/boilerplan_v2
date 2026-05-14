import type { ProjectReadinessReport } from "../validation/Validation";

export type DrawingLayerName =
  | "SHEET_FRAME"
  | "TITLE_BLOCK"
  | "ROOM_OUTLINE"
  | "EQUIPMENT_BODY"
  | "SERVICE_ZONE"
  | "CONNECTION_POINT"
  | "PIPE_SUPPLY"
  | "PIPE_RETURN"
  | "PIPE_GAS"
  | "PIPE_FLUE"
  | "VALVE"
  | "ANNOTATION"
  | "WARNING";

export type DrawingPoint = { x: number; y: number };
export type DrawingRect = { type: "rect"; layer: DrawingLayerName; x: number; y: number; width: number; height: number; fill?: string };
export type DrawingLine = { type: "line"; layer: DrawingLayerName; points: DrawingPoint[]; closed?: boolean };
export type DrawingCircle = { type: "circle"; layer: DrawingLayerName; cx: number; cy: number; r: number; fill?: string };
export type DrawingText = { type: "text"; layer: DrawingLayerName; x: number; y: number; value: string; height: number; align?: "start" | "middle" | "end"; weight?: "normal" | "bold" };
export type DrawingEntity = DrawingRect | DrawingLine | DrawingCircle | DrawingText;

export type EngineeringDrawing = {
  id: string;
  sheet: { format: "A3"; orientation: "landscape"; width: number; height: number };
  views: Array<{ id: "plan" | "schematic" | "legend" | "title"; x: number; y: number; width: number; height: number }>;
  symbols: string[];
  annotations: string[];
  dimensions: string[];
  legend: string[];
  titleBlock: Record<string, string>;
  warnings: string[];
  entities: DrawingEntity[];
  metadata: {
    title: string;
    status: "draft" | "final_candidate";
    readinessStatus: ProjectReadinessReport["status"];
    generatedAt: string;
  };
};
