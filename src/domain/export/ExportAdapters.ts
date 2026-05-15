import type { EngineeringDrawing } from "../drawing/EngineeringDrawing";

export type DrawingExportAdapters = {
  exportDxf: (drawing: EngineeringDrawing) => string;
  exportSheetSvg: (drawing: EngineeringDrawing) => string;
};
