import type { DataStatus } from "../validation/status";

export type Room = {
  widthMm: number;
  lengthMm: number;
  heightMm: number;
  boundaries: "rectangular";
  openings: Array<{ id: string; type: "door" | "window"; xMm: number; yMm: number; widthMm: number }>;
  utilityInputs: Array<{ id: string; medium: "gas" | "water" | "electric"; xMm: number; yMm: number; status: DataStatus }>;
  metadata: Record<string, unknown>;
};
