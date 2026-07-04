import type { ExtractedBookCandidate } from "../../lib/photo-extraction/contracts";

export type ExtractionInput = {
  bytes: Uint8Array;
  mimeType: string;
};

export interface BookExtractionProvider {
  extractBooks(input: ExtractionInput): Promise<ExtractedBookCandidate[]>;
}
