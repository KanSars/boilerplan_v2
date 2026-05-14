import type { EquipmentDefinition } from "../../../domain/equipment/Equipment";
import type { Project } from "../../../domain/project/Project";
import { resolveEquipmentForProject } from "../equipment/resolveEquipmentForProject";

export const exportPlanSvg = (project: Project, catalog: EquipmentDefinition[]): string => {
  const scale = 0.05;
  const bodies = resolveEquipmentForProject(project, catalog).map((item) => {
    if (!item.placement?.placed) return "";
    return `<rect x="${item.body.xMm * scale}" y="${item.body.yMm * scale}" width="${item.body.widthMm * scale}" height="${item.body.depthMm * scale}" fill="#f8fafc" stroke="#111827"/><text x="${(item.body.xMm + item.body.widthMm / 2) * scale}" y="${(item.body.yMm + item.body.depthMm / 2) * scale}" font-size="10" text-anchor="middle">${item.instance.label}</text>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${project.room.widthMm * scale} ${project.room.lengthMm * scale}"><rect width="${project.room.widthMm * scale}" height="${project.room.lengthMm * scale}" fill="#fff" stroke="#111827"/>${bodies}</svg>`;
};
