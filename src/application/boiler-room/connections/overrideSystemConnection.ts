import type { SystemConnection } from "../../../domain/connection/SystemConnection";

export const overrideSystemConnection = (connection: SystemConnection, patch: Partial<SystemConnection>, reason: string): SystemConnection => ({
  ...connection,
  ...patch,
  status: "user_overridden",
  reviewStatus: "resolved",
  source: "user",
  userDecision: { decidedAt: new Date().toISOString(), reason, previousStatus: connection.status },
});
