import type { Project } from "../../../domain/project/Project";
import type { ProjectInputs } from "../../../domain/project/ProjectInputs";

export const updateProjectInputs = (project: Project, patch: Partial<ProjectInputs>): Project => ({
  ...project,
  projectInputs: { ...project.projectInputs, ...patch },
  updatedAt: new Date().toISOString(),
});
