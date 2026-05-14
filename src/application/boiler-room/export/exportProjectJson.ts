import type { Project } from "../../../domain/project/Project";

export const exportProjectJson = (project: Project): string => JSON.stringify(project, null, 2);
