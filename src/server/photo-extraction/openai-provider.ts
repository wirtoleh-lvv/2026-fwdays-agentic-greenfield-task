import type {
  Response,
  ResponseCreateParamsNonStreaming,
} from "openai/resources/responses/responses";
import type { ExtractedBookCandidate } from "../../lib/photo-extraction/contracts";
import { InvalidProviderOutputError } from "./errors";
import type { BookExtractionProvider } from "./provider";

export type OpenAIResponsesClient = {
  create(
    params: ResponseCreateParamsNonStreaming,
  ): Promise<Pick<Response, "output_text">>;
};

export type OpenAIProviderConfig = {
  model: string;
};

type ProviderCandidate = {
  title: string;
  authors: string[];
};

const candidateSchema = {
  type: "object",
  additionalProperties: false,
  required: ["candidates"],
  properties: {
    candidates: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "authors"],
        properties: {
          title: { type: "string" },
          authors: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    },
  },
} as const;

export function createOpenAIBookExtractionProvider(
  client: OpenAIResponsesClient,
  config: OpenAIProviderConfig,
): BookExtractionProvider {
  return {
    async extractBooks(input) {
      const response = await client.create({
        model: config.model,
        store: false,
        max_output_tokens: 1200,
        reasoning: { effort: "low" },
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: [
                  "Identify up to five front-facing book covers in this photo.",
                  "Return the visible title and authors for each cover.",
                  "Use an empty title or authors array when the value is uncertain.",
                ].join(" "),
              },
              {
                type: "input_image",
                detail: "original",
                image_url: `data:${input.mimeType};base64,${Buffer.from(input.bytes).toString("base64")}`,
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "book_cover_candidates",
            strict: true,
            schema: candidateSchema,
          },
        },
      });

      return parseCandidates(response.output_text);
    },
  };
}

function parseCandidates(outputText: string): ExtractedBookCandidate[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(outputText);
  } catch {
    throw new InvalidProviderOutputError();
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("candidates" in parsed) ||
    !Array.isArray(parsed.candidates) ||
    parsed.candidates.length > 5 ||
    !parsed.candidates.every(isProviderCandidate)
  ) {
    throw new InvalidProviderOutputError();
  }

  return parsed.candidates.map((candidate, index) => ({
    id: `candidate-${index + 1}`,
    title: candidate.title,
    authors: candidate.authors,
  }));
}

function isProviderCandidate(value: unknown): value is ProviderCandidate {
  return (
    typeof value === "object" &&
    value !== null &&
    "title" in value &&
    typeof value.title === "string" &&
    "authors" in value &&
    Array.isArray(value.authors) &&
    value.authors.every((author) => typeof author === "string")
  );
}
