import type { EvidenceDataset } from "../../../domain/evidence/Evidence";

export const loadEvidenceDataset = (): EvidenceDataset => ({
  documents: [
    { id: "sp-89-13330-2016", title: "СП 89.13330.2016. Placeholder source", path: "data/evidence/standards/sp-89-13330-2016/source-placeholder.md", placeholder: true, rulesVersion: "0.1.0-dev", compiledAt: "2026-05-14T00:00:00.000Z" },
    { id: "gost-21-704-2011", title: "ГОСТ 21.704-2011. Placeholder source", path: "data/evidence/standards/gost-21-704-2011/source-placeholder.md", placeholder: true, rulesVersion: "0.1.0-dev", compiledAt: "2026-05-14T00:00:00.000Z" },
    { id: "rgt-100-ksva-100", title: "RGT-100 / КСВА-100 passport facts placeholder", path: "data/evidence/equipment/rgt-100-ksva-100/source-placeholder.md", placeholder: true, rulesVersion: "0.1.0-dev", compiledAt: "2026-05-14T00:00:00.000Z" },
  ],
  requirements: [
    {
      id: "req-pilot-minimal-kit",
      sourceDocumentId: "pilot-scope",
      sourceTitle: "Boilerplan AI v2 pilot scope",
      clause: "MVP fixed scope",
      originalText: "Pilot requires boiler, supply/return headers, supply/return/gas shutoff valves and flue.",
      normalizedText: "Minimum equipment composition must be present before final package.",
      appliesWhen: { country: "RU", boilerRoomPlacement: "standalone", boilerRoomType: "gas" },
      requiredFacts: ["equipmentItems", "roles"],
      checkType: "required_presence",
      evaluationMethod: "formal_rule",
      severity: "blocker",
      resultType: "pass_fail",
      citations: [],
      status: "compiled",
    },
  ],
  compiledRules: [
    { id: "rule-pilot-minimal-kit", requirementId: "req-pilot-minimal-kit", version: "0.1.0-dev", description: "Checks fixed pilot equipment roles.", status: "compiled", missingFactsBlockFinal: true },
  ],
});
