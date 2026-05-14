import type { CoverLetter } from "../../../domain/export/CoverLetter";

export const buildAccompanyingLetterDraft = (letter: CoverLetter) => ({
  promptKind: "strict_cover_letter_draft",
  factsOnly: true,
  sections: letter,
});
