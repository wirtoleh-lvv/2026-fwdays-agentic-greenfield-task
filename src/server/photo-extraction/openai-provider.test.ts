import { describe, expect, it, vi } from "vitest";
import {
  createOpenAIBookExtractionProvider,
  type OpenAIResponsesClient,
} from "./openai-provider";
import { InvalidProviderOutputError } from "./errors";

describe("OpenAI book extraction provider", () => {
  it("FR-EXTRACT-002 NFR-PRIV-002 TC-AI-001 maps a valid structured vision result without storing it", async () => {
    const create = vi.fn().mockResolvedValue({
      output_text: JSON.stringify({
        candidates: [
          {
            title: "The Left Hand of Darkness",
            authors: ["Ursula K. Le Guin"],
          },
        ],
      }),
    });
    const provider = createOpenAIBookExtractionProvider(
      { create } as OpenAIResponsesClient,
      { model: "gpt-5.5" },
    );

    const candidates = await provider.extractBooks({
      bytes: new Uint8Array([1, 2, 3]),
      mimeType: "image/jpeg",
    });

    expect(candidates).toEqual([
      {
        id: "candidate-1",
        title: "The Left Hand of Darkness",
        authors: ["Ursula K. Le Guin"],
      },
    ]);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-5.5",
        store: false,
        max_output_tokens: 1200,
        reasoning: { effort: "low" },
        input: [
          {
            role: "user",
            content: [
              expect.objectContaining({ type: "input_text" }),
              {
                type: "input_image",
                detail: "original",
                image_url: "data:image/jpeg;base64,AQID",
              },
            ],
          },
        ],
        text: {
          format: expect.objectContaining({
            type: "json_schema",
            name: "book_cover_candidates",
            strict: true,
          }),
        },
      }),
    );
  });

  it("FR-EXTRACT-002 FR-FAIL-001 NFR-PRIV-002 rejects malformed output without returning partial candidates", async () => {
    const create = vi.fn().mockResolvedValue({
      output_text: JSON.stringify({
        candidates: [
          { title: "Valid-looking partial", authors: ["Author"] },
          { title: 7, authors: ["Leaked partial"] },
        ],
      }),
    });
    const provider = createOpenAIBookExtractionProvider(
      { create } as OpenAIResponsesClient,
      { model: "gpt-5.5" },
    );

    await expect(
      provider.extractBooks({
        bytes: new Uint8Array([1, 2, 3]),
        mimeType: "image/jpeg",
      }),
    ).rejects.toBeInstanceOf(InvalidProviderOutputError);
  });
});
