import type { PointMm } from "../geometry/types";
import type { ReviewStatus } from "../validation/status";

export type PipingRoute = {
  id: string;
  connectionId: string;
  points: PointMm[];
  medium: "water" | "natural_gas" | "flue_gas" | "other";
  dnMm?: number;
  status: ReviewStatus;
  source: "auto_preliminary" | "user_override" | "manual_cad_action";
  validationIssues: string[];
};
