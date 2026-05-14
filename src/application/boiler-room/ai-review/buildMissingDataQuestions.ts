import type { ProjectReadinessReport } from "../../../domain/validation/Validation";

export const buildMissingDataQuestions = (readiness: ProjectReadinessReport) =>
  readiness.missingData.map((issue) => ({
    id: `question_${issue.id}`,
    title: issue.title,
    question: issue.suggestedFix,
    navigationTarget: issue.navigationTarget,
  }));
