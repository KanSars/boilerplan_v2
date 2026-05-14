import type { EngineeringDrawing } from "../../../domain/drawing/EngineeringDrawing";
import { convertEngineeringDrawingToCad } from "../../../infrastructure/cad/EngineeringDrawingToCadService";
import { AsciiDxfWriter } from "../../../infrastructure/dxf/AsciiDxfWriter";

export const exportDxf = (drawing: EngineeringDrawing): string => new AsciiDxfWriter().write(convertEngineeringDrawingToCad(drawing));
