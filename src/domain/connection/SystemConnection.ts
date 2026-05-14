import type { ReviewStatus } from "../validation/status";

export type ConnectionEndpoint = {
  itemId: string;
  pointId: string;
};

export type SystemConnectionDecision =
  | "auto_detected"
  | "user_confirmed"
  | "user_overridden"
  | "blocked"
  | "ambiguous";

export type SystemConnection = {
  id: string;
  from: ConnectionEndpoint;
  to?: ConnectionEndpoint;
  medium: "water" | "natural_gas" | "flue_gas" | "electricity" | "signal" | "other";
  lineType: "T1" | "T2" | "G" | "FLUE" | "E" | "SIGNAL";
  dnMm?: number;
  status: SystemConnectionDecision;
  reviewStatus: ReviewStatus;
  source: "auto" | "user" | "catalog" | "placeholder";
  confidence: number;
  explanation: string;
  userDecision?: {
    decidedAt: string;
    reason: string;
    previousStatus: SystemConnectionDecision;
  };
};
