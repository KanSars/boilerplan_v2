import type { EngineeringDrawing } from "../../../domain/drawing/EngineeringDrawing";
import type { ValidationIssue } from "../../../domain/validation/Validation";

export const runDrawingValidation = (drawing: EngineeringDrawing): ValidationIssue[] => {
  if (drawing.entities.length === 0) {
    return [{
      id: "drawing_empty",
      severity: "blocker",
      category: "drawing",
      title: "Чертежный лист не построен",
      description: "EngineeringDrawing пустой, DXF формировать нельзя.",
      affectedEntities: [drawing.id],
      source: "validation.drawing",
      suggestedFix: "Проверить сборку drawing application service.",
      navigationTarget: { workspace: "drawing" },
      status: "blocked",
      canBlockFinalExport: true,
    }];
  }
  return [];
};
