import type { Project } from "../../../domain/project/Project";

export const updateProjectName = (project: Project, name: string): Project => ({
  ...project,
  name,
  updatedAt: new Date().toISOString(),
});

export const updateProjectPower = (project: Project, targetPowerKw: number): Project => ({
  ...project,
  projectInputs: { ...project.projectInputs, targetPowerKw },
  updatedAt: new Date().toISOString(),
});

export const updateProjectTemperatureSchedule = (project: Project, supplyC: number, returnC: number): Project => ({
  ...project,
  projectInputs: { ...project.projectInputs, temperatureSchedule: { supplyC, returnC } },
  updatedAt: new Date().toISOString(),
});

export const updateProjectRoom = (project: Project, patch: Partial<Project["room"]>): Project => ({
  ...project,
  room: { ...project.room, ...patch },
  updatedAt: new Date().toISOString(),
});
