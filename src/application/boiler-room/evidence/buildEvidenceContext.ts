import type { Project } from "../../../domain/project/Project";
import type { EvidenceDataset } from "../../../domain/evidence/Evidence";

export const buildEvidenceContext = (project: Project, dataset: EvidenceDataset) => ({
  projectFacts: {
    country: project.projectInputs.country,
    placement: project.projectInputs.boilerRoomPlacement,
    type: project.projectInputs.boilerRoomType,
    powerKw: project.projectInputs.targetPowerKw,
    room: project.room,
  },
  documents: dataset.documents,
  requirements: dataset.requirements,
});
