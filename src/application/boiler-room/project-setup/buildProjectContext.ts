import type { Project } from "../../../domain/project/Project";

export type ProjectContext = {
  country: "RU";
  isPilotScope: boolean;
  fuelType: string;
  powerKw: number;
  placement: string;
  stage: string;
};

export const buildProjectContext = (project: Project): ProjectContext => ({
  country: project.projectInputs.country,
  isPilotScope:
    project.projectInputs.country === "RU" &&
    project.projectInputs.boilerRoomPlacement === "standalone" &&
    project.projectInputs.boilerRoomType === "gas" &&
    project.projectInputs.targetPowerKw <= 100,
  fuelType: project.projectInputs.fuelType,
  powerKw: project.projectInputs.targetPowerKw,
  placement: project.projectInputs.boilerRoomPlacement,
  stage: project.projectInputs.stage,
});
