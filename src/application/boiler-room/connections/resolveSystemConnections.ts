import type { SystemConnection } from "../../../domain/connection/SystemConnection";
import type { EquipmentDefinition } from "../../../domain/equipment/Equipment";
import type { Project } from "../../../domain/project/Project";
import { autoDetectSystemConnections } from "./autoDetectSystemConnections";

export const resolveSystemConnections = (project: Project, catalog: EquipmentDefinition[]): SystemConnection[] =>
  autoDetectSystemConnections(project, catalog);
