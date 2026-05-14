export type DataStatus =
  | "unknown"
  | "placeholder"
  | "user_provided"
  | "catalog"
  | "passport"
  | "calculated"
  | "verified"
  | "overridden"
  | "not_applicable"
  | "blocked";

export type ReviewStatus =
  | "draft"
  | "needs_data"
  | "needs_confirmation"
  | "verified"
  | "resolved"
  | "not_applicable"
  | "blocked"
  | "manual_cad_action";

export type ExportReadiness = "draft_available" | "final_blocked" | "final_ready";
