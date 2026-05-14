import type { EvidenceDataset } from "../../../domain/evidence/Evidence";
import type { Project } from "../../../domain/project/Project";

export const buildStrictAiQuestion = (project: Project, dataset: EvidenceDataset, requirementId: string) => ({
  task: "Evaluate one explicit requirement against supplied project facts only.",
  requirementId,
  projectFacts: {
    country: project.projectInputs.country,
    boilerRoomPlacement: project.projectInputs.boilerRoomPlacement,
    boilerRoomType: project.projectInputs.boilerRoomType,
    fuelType: project.projectInputs.fuelType,
    targetPowerKw: project.projectInputs.targetPowerKw,
    room: project.room,
  },
  sourcePolicy: "Do not use external sources. Return blocked_missing_data if facts are insufficient.",
  allowedResults: ["pass", "fail", "not_applicable", "blocked_missing_data", "needs_ai_interpretation"],
  requirement: dataset.requirements.find((item) => item.id === requirementId),
});
