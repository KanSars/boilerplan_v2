import type { ConnectionPointOverrideInput, EquipmentDefinition, EquipmentInstance } from "../../../domain/equipment/Equipment";

export const applyConnectionPointOverride = (
  instance: EquipmentInstance,
  definition: EquipmentDefinition,
  input: ConnectionPointOverrideInput,
): EquipmentInstance => {
  const base = definition.connectionPoints.find((point) => point.id === input.pointId);
  const oldValue = base ? base[input.field] : undefined;
  const override = {
    ...input,
    id: `cp_override_${instance.id}_${input.pointId}_${String(input.field)}_${Date.now()}`,
    oldValue: typeof oldValue === "number" || typeof oldValue === "string" ? oldValue : undefined,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy ?? "user",
  };

  return {
    ...instance,
    connectionPointOverrides: [...instance.connectionPointOverrides, override],
    status: "needs_confirmation",
  };
};
