import type { EvidenceDataset } from "../../../domain/evidence/Evidence";
import { staticEvidenceDataset } from "./staticEvidenceDataset";

export const loadEvidenceDataset = (): EvidenceDataset => staticEvidenceDataset;
