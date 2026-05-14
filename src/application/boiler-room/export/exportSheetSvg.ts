import type { EngineeringDrawing } from "../../../domain/drawing/EngineeringDrawing";
import { exportEngineeringSheetSvg } from "../../../infrastructure/svg/EngineeringSheetSvgExporter";

export const exportSheetSvg = (drawing: EngineeringDrawing): string => exportEngineeringSheetSvg(drawing);
