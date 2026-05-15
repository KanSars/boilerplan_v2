import type { EquipmentDefinition } from "../../domain/equipment/Equipment";
import type { Project } from "../../domain/project/Project";
import type { ReadinessDecisionMap } from "../../application/boiler-room/validation/applyReadinessDecisions";

const STORAGE_KEY = "boilerplan-ai-v2-project";

export type ProjectSnapshot = {
  project: Project;
  catalog: EquipmentDefinition[];
  issueDecisions: ReadinessDecisionMap;
};

export const serializeProjectSnapshot = (snapshot: ProjectSnapshot): string => JSON.stringify(snapshot, null, 2);

export const persistProjectSnapshot = (snapshot: ProjectSnapshot): string => {
  const payload = serializeProjectSnapshot(snapshot);
  localStorage.setItem(STORAGE_KEY, payload);
  return payload;
};

export const parseProjectSnapshot = (payload: string): ProjectSnapshot => {
  const parsed = JSON.parse(payload) as ProjectSnapshot;
  return {
    project: parsed.project,
    catalog: parsed.catalog ?? [],
    issueDecisions: parsed.issueDecisions ?? {},
  };
};

export const readProjectSnapshotFile = async (file: File): Promise<ProjectSnapshot> => parseProjectSnapshot(await file.text());

export const downloadTextFile = (name: string, content: string) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadTextFiles = (files: Record<string, string>) => {
  Object.entries(files).forEach(([name, content]) => downloadTextFile(name, content));
};
