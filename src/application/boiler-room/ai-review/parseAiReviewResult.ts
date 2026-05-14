export type AiReviewResult = {
  result: "pass" | "fail" | "not_applicable" | "blocked_missing_data" | "needs_ai_interpretation";
  message: string;
  missingFacts: string[];
};

export const parseAiReviewResult = (value: unknown): AiReviewResult => {
  if (typeof value !== "object" || value === null) return { result: "blocked_missing_data", message: "Invalid AI response shape.", missingFacts: ["structured_response"] };
  const candidate = value as Partial<AiReviewResult>;
  return {
    result: candidate.result ?? "blocked_missing_data",
    message: candidate.message ?? "No message.",
    missingFacts: candidate.missingFacts ?? [],
  };
};
