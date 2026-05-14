import type { Project } from "../../../domain/project/Project";
import type { ValidationIssue } from "../../../domain/validation/Validation";

export const estimateWaterFlowM3h = (powerKw: number, deltaT: number): number => Math.round((0.86 * powerKw / deltaT) * 100) / 100;
export const estimateGasVelocityMs = (gasFlowM3h: number, dnMm: number): number => {
  const area = Math.PI * (dnMm / 1000 / 2) ** 2;
  return Math.round((gasFlowM3h / 3600 / area) * 100) / 100;
};

export const runCalculationValidation = (project: Project): ValidationIssue[] => {
  const deltaT = project.projectInputs.temperatureSchedule.supplyC - project.projectInputs.temperatureSchedule.returnC;
  if (deltaT <= 0) {
    return [{
      id: "calc_bad_temperature_schedule",
      severity: "blocker",
      category: "calculation",
      title: "Некорректный температурный график",
      description: "Температура подачи должна быть выше температуры обратки.",
      affectedEntities: ["temperatureSchedule"],
      source: "validation.calculation",
      suggestedFix: "Исправить температурный график в исходных данных.",
      navigationTarget: { workspace: "inputs", focus: "temperatureSchedule" },
      status: "blocked",
      canBlockFinalExport: true,
    }];
  }
  return [];
};
