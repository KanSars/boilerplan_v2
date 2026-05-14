import type { DrawingEntity, EngineeringDrawing } from "../../domain/drawing/EngineeringDrawing";

const colors: Record<string, string> = {
  SHEET_FRAME: "#0f172a",
  TITLE_BLOCK: "#0f172a",
  ROOM_OUTLINE: "#334155",
  EQUIPMENT_BODY: "#111827",
  SERVICE_ZONE: "#94a3b8",
  CONNECTION_POINT: "#0369a1",
  PIPE_SUPPLY: "#b91c1c",
  PIPE_RETURN: "#1d4ed8",
  PIPE_GAS: "#a16207",
  PIPE_FLUE: "#475569",
  VALVE: "#111827",
  ANNOTATION: "#111827",
  WARNING: "#b45309",
};

export const exportEngineeringSheetSvg = (drawing: EngineeringDrawing): string => {
  const body = drawing.entities.map(renderEntity).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${drawing.sheet.width}mm" height="${drawing.sheet.height}mm" viewBox="0 0 ${drawing.sheet.width} ${drawing.sheet.height}">${body}</svg>`;
};

const renderEntity = (entity: DrawingEntity): string => {
  const color = colors[entity.layer];
  if (entity.type === "rect") return `<rect x="${entity.x}" y="${entity.y}" width="${entity.width}" height="${entity.height}" fill="${entity.fill ?? "none"}" stroke="${color}" stroke-width="0.35"/>`;
  if (entity.type === "line") return `<polyline points="${entity.points.map((point) => `${point.x},${point.y}`).join(" ")}" fill="none" stroke="${color}" stroke-width="0.5"/>`;
  if (entity.type === "circle") return `<circle cx="${entity.cx}" cy="${entity.cy}" r="${entity.r}" fill="${entity.fill ?? "#fff"}" stroke="${color}" stroke-width="0.35"/>`;
  return `<text x="${entity.x}" y="${entity.y}" font-size="${entity.height}" text-anchor="${entity.align ?? "start"}" font-weight="${entity.weight ?? "normal"}" fill="${color}">${escapeXml(entity.value)}</text>`;
};

const escapeXml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
