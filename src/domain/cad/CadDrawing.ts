export type CadLayerName =
  | "SHEET_FRAME"
  | "TITLE_BLOCK"
  | "AR_ROOM_WALL"
  | "ME_EQ_BODY"
  | "ME_EQ_CLEARANCE"
  | "ME_CONN_POINT"
  | "ME_PIPE_SUPPLY"
  | "ME_PIPE_RETURN"
  | "ME_PIPE_GAS"
  | "ME_PIPE_FLUE"
  | "ME_VALVE"
  | "AN_TEXT";

export type CadLayer = { name: CadLayerName; color: number; lineType?: "CONTINUOUS" | "DASHED" };
export type CadPoint = { xMm: number; yMm: number };
export type CadEntity =
  | { type: "line"; layer: CadLayerName; start: CadPoint; end: CadPoint }
  | { type: "polyline"; layer: CadLayerName; points: CadPoint[]; closed?: boolean }
  | { type: "circle"; layer: CadLayerName; center: CadPoint; radiusMm: number }
  | { type: "text"; layer: CadLayerName; insertionPoint: CadPoint; heightMm: number; value: string; rotationDeg?: number };

export type CadDrawing = {
  version: "AC1015";
  units: "mm";
  layers: CadLayer[];
  entities: CadEntity[];
  blocks: string[];
  textStyles: string[];
  metadata: { title: string; status: "draft" | "final_candidate" };
};
