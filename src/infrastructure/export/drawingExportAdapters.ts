import type { EngineeringDrawing } from "../../domain/drawing/EngineeringDrawing";
import { convertEngineeringDrawingToCad } from "../cad/EngineeringDrawingToCadService";
import { AsciiDxfWriter } from "../dxf/AsciiDxfWriter";
import { exportEngineeringSheetSvg } from "../svg/EngineeringSheetSvgExporter";

export const exportDxfFile = (drawing: EngineeringDrawing): string => new AsciiDxfWriter().write(convertEngineeringDrawingToCad(drawing));

export const exportSheetSvgFile = (drawing: EngineeringDrawing): string => exportEngineeringSheetSvg(drawing);

export const drawingExportAdapters = {
  exportDxf: exportDxfFile,
  exportSheetSvg: exportSheetSvgFile,
};
