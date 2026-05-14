import type {
  ConnectionDirection,
  ConnectionPoint,
  EquipmentDefinition,
  EquipmentInstance,
  Placement,
  ResolvedConnectionPoint,
  WorldConnectionPoint,
} from "../../../domain/equipment/Equipment";

export const resolveConnectionPoints = (
  instance: EquipmentInstance,
  definition: EquipmentDefinition,
): ResolvedConnectionPoint[] =>
  definition.connectionPoints.map((point) => {
    const overrides = instance.connectionPointOverrides.filter((override) => override.pointId === point.id);
    const resolved = overrides.reduce<ConnectionPoint>(
      (current, override) => ({ ...current, [override.field]: override.newValue }),
      point,
    );

    return {
      ...resolved,
      itemId: instance.id,
      pointId: point.id,
      sourceChain: [point.source, ...overrides.map((override) => override.source)],
      overrides,
    };
  });

export const rotateDirection = (direction: ConnectionDirection | undefined, rotationDeg: Placement["rotationDeg"]): ConnectionDirection | undefined => {
  if (!direction || ["up", "down", "front", "back"].includes(direction)) return direction;
  const order: ConnectionDirection[] = ["top", "right", "bottom", "left"];
  const index = order.indexOf(direction);
  return order[(index + rotationDeg / 90) % order.length];
};

export const toWorldConnectionPoint = (
  point: ResolvedConnectionPoint,
  definition: EquipmentDefinition,
  placement: Placement,
): WorldConnectionPoint => {
  const { widthMm, depthMm } = definition.dimensions;
  const local = { x: point.localX, y: point.localY };
  const rotated =
    placement.rotationDeg === 90
      ? { x: depthMm - local.y, y: local.x }
      : placement.rotationDeg === 180
        ? { x: widthMm - local.x, y: depthMm - local.y }
        : placement.rotationDeg === 270
          ? { x: local.y, y: widthMm - local.x }
          : local;

  return {
    ...point,
    xMm: placement.xMm + rotated.x,
    yMm: placement.yMm + rotated.y,
    zMm: point.localZ,
    directionWorld: rotateDirection(point.direction, placement.rotationDeg),
  };
};

export const resolveWorldConnectionPoints = (
  instance: EquipmentInstance,
  definition: EquipmentDefinition,
  placement?: Placement,
): WorldConnectionPoint[] => {
  if (!placement || !placement.placed) return [];
  return resolveConnectionPoints(instance, definition).map((point) => toWorldConnectionPoint(point, definition, placement));
};
