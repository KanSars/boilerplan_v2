import type { SystemConnection } from "../../../domain/connection/SystemConnection";

export const confirmSystemConnection = (connection: SystemConnection, reason = "Confirmed in schematic workspace"): SystemConnection => ({
  ...connection,
  status: "user_confirmed",
  reviewStatus: "verified",
  source: "user",
  confidence: 1,
  userDecision: { decidedAt: new Date().toISOString(), reason, previousStatus: connection.status },
});
