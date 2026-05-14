import type { CadDrawing, CadEntity, CadLayer, CadLayerName } from "../../domain/cad/CadDrawing";
import type { DrawingLayerName, EngineeringDrawing } from "../../domain/drawing/EngineeringDrawing";

const layerMap: Record<DrawingLayerName, CadLayerName> = {
  SHEET_FRAME: "SHEET_FRAME",
  TITLE_BLOCK: "TITLE_BLOCK",
  ROOM_OUTLINE: "AR_ROOM_WALL",
  EQUIPMENT_BODY: "ME_EQ_BODY",
  SERVICE_ZONE: "ME_EQ_CLEARANCE",
  CONNECTION_POINT: "ME_CONN_POINT",
  PIPE_SUPPLY: "ME_PIPE_SUPPLY",
  PIPE_RETURN: "ME_PIPE_RETURN",
  PIPE_GAS: "ME_PIPE_GAS",
  PIPE_FLUE: "ME_PIPE_FLUE",
  VALVE: "ME_VALVE",
  ANNOTATION: "AN_TEXT",
  WARNING: "AN_TEXT",
};

const layerColor: Record<CadLayerName, number> = {
  SHEET_FRAME: 7,
  TITLE_BLOCK: 7,
  AR_ROOM_WALL: 7,
  ME_EQ_BODY: 7,
  ME_EQ_CLEARANCE: 8,
  ME_CONN_POINT: 2,
  ME_PIPE_SUPPLY: 1,
  ME_PIPE_RETURN: 5,
  ME_PIPE_GAS: 30,
  ME_PIPE_FLUE: 8,
  ME_VALVE: 7,
  AN_TEXT: 7,
};

export const convertEngineeringDrawingToCad = (drawing: EngineeringDrawing): CadDrawing => {
  const used = new Set<CadLayerName>();
  const entities: CadEntity[] = drawing.entities.flatMap<CadEntity>((entity) => {
    const layer = layerMap[entity.layer];
    used.add(layer);
    if (entity.type === "rect") {
      return [{
        type: "polyline",
        layer,
        points: [
          { xMm: entity.x, yMm: cadY(drawing, entity.y) },
          { xMm: entity.x + entity.width, yMm: cadY(drawing, entity.y) },
          { xMm: entity.x + entity.width, yMm: cadY(drawing, entity.y + entity.height) },
          { xMm: entity.x, yMm: cadY(drawing, entity.y + entity.height) },
        ],
        closed: true,
      }];
    }
    if (entity.type === "line") {
      if (entity.points.length === 2) {
        return [{ type: "line", layer, start: { xMm: entity.points[0].x, yMm: cadY(drawing, entity.points[0].y) }, end: { xMm: entity.points[1].x, yMm: cadY(drawing, entity.points[1].y) } }];
      }
      return [{ type: "polyline", layer, points: entity.points.map((point) => ({ xMm: point.x, yMm: cadY(drawing, point.y) })), closed: entity.closed }];
    }
    if (entity.type === "circle") {
      return [{ type: "circle", layer, center: { xMm: entity.cx, yMm: cadY(drawing, entity.cy) }, radiusMm: entity.r }];
    }
    return [{ type: "text", layer, insertionPoint: { xMm: entity.x, yMm: cadY(drawing, entity.y) }, heightMm: entity.height, value: entity.value }];
  });
  const layers: CadLayer[] = Array.from(used).map((name) => ({ name, color: layerColor[name], lineType: name === "ME_PIPE_RETURN" ? "DASHED" : "CONTINUOUS" }));
  return {
    version: "AC1015",
    units: "mm",
    layers,
    entities,
    blocks: [],
    textStyles: ["STANDARD"],
    metadata: { title: drawing.metadata.title, status: drawing.metadata.status },
  };
};

const cadY = (drawing: EngineeringDrawing, y: number): number => drawing.sheet.height - y;
