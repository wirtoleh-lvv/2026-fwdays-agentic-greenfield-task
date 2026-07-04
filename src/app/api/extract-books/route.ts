import OpenAI from "openai";
import { createExtractBooksHandler } from "../../../server/photo-extraction/route-handler";
import {
  createOpenAIBookExtractionProvider,
  type OpenAIResponsesClient,
} from "../../../server/photo-extraction/openai-provider";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        error: {
          code: "provider_unavailable",
          message: "Book extraction is not configured.",
        },
      },
      { status: 503 },
    );
  }

  const openai = new OpenAI({ apiKey });
  const provider = createOpenAIBookExtractionProvider(
    {
      create: (params) => openai.responses.create(params),
    } satisfies OpenAIResponsesClient,
    {
      model: process.env.OPENAI_VISION_MODEL?.trim() || "gpt-5.5",
    },
  );

  return createExtractBooksHandler(provider)(request);
}
