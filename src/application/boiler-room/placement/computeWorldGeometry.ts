import type { EquipmentDefinition, Placement } from "../../../domain/equipment/Equipment";
import type { RectMm } from "../../../domain/geometry/types";
import type { Room } from "../../../domain/room/Room";
import { rectanglesOverlap } from "../../../domain/geometry/types";

export const computeBodyRect = (definition: EquipmentDefinition, placement?: Placement): RectMm => {
  if (!placement || !placement.placed) return { xMm: 0, yMm: 0, widthMm: 0, depthMm: 0 };
  const rotated = placement.rotationDeg === 90 || placement.rotationDeg === 270;
  return {
    xMm: placement.xMm,
    yMm: placement.yMm,
    widthMm: rotated ? definition.dimensions.depthMm : definition.dimensions.widthMm,
    depthMm: rotated ? definition.dimensions.widthMm : definition.dimensions.depthMm,
  };
};

export const computeServiceZoneRect = (definition: EquipmentDefinition, placement?: Placement): RectMm => {
  const body = computeBodyRect(definition, placement);
  if (!placement || !placement.placed) return body;
  const rotated = placement.rotationDeg === 90 || placement.rotationDeg === 270;
  const left = rotated ? definition.serviceZones.rearMm : definition.serviceZones.leftMm;
  const right = rotated ? definition.serviceZones.frontMm : definition.serviceZones.rightMm;
  const rear = rotated ? definition.serviceZones.leftMm : definition.serviceZones.rearMm;
  const front = rotated ? definition.serviceZones.rightMm : definition.serviceZones.frontMm;
  return {
    xMm: body.xMm - left,
    yMm: body.yMm - rear,
    widthMm: body.widthMm + left + right,
    depthMm: body.depthMm + rear + front,
  };
};

export const rectInsideRoom = (rect: RectMm, room: Room): boolean =>
  rect.xMm >= 0 &&
  rect.yMm >= 0 &&
  rect.xMm + rect.widthMm <= room.widthMm &&
  rect.yMm + rect.depthMm <= room.lengthMm;

export const bodyOverlaps = (a: RectMm, b: RectMm): boolean => rectanglesOverlap(a, b);
