import type { EngineeringDrawing } from "../../../domain/drawing/EngineeringDrawing";

export const validateEngineeringDrawing = (drawing: EngineeringDrawing): boolean => {
  const hasSheet = drawing.sheet.width > 0 && drawing.sheet.height > 0;
  const hasFrame = drawing.entities.some((entity) => entity.layer === "SHEET_FRAME");
  const hasTitleBlock = drawing.entities.some((entity) => entity.layer === "TITLE_BLOCK");
  const hasGeometry = drawing.entities.some((entity) => ["rect", "line", "circle"].includes(entity.type));
  return hasSheet && hasFrame && hasTitleBlock && hasGeometry;
};
