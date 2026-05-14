import type { ManualCadAction } from "../validation/Validation";

export type CoverLetter = {
  projectSummary: string;
  inputDataSummary: string[];
  equipmentSummary: string[];
  acceptedSolutions: string[];
  drawingPackageSummary: string[];
  manualCadActions: ManualCadAction[];
  limitations: string[];
  evidenceSources: string[];
  generatedAt: string;
  version: string;
};
