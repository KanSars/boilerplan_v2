export type PointMm = {
  xMm: number;
  yMm: number;
  zMm?: number;
};

export type RectMm = {
  xMm: number;
  yMm: number;
  widthMm: number;
  depthMm: number;
};

export type RotationDeg = 0 | 90 | 180 | 270;

export const rectanglesOverlap = (a: RectMm, b: RectMm): boolean =>
  a.xMm < b.xMm + b.widthMm &&
  a.xMm + a.widthMm > b.xMm &&
  a.yMm < b.yMm + b.depthMm &&
  a.yMm + a.depthMm > b.yMm;
