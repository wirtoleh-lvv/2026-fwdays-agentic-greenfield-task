import sharp from "sharp";
import {
  isSupportedPhotoType,
  MAX_PHOTO_BYTES,
} from "../../lib/photo-extraction/upload-policy";
import { InvalidProviderOutputError } from "./errors";
import type { BookExtractionProvider } from "./provider";

export function createExtractBooksHandler(
  provider: BookExtractionProvider,
): (request: Request) => Promise<Response> {
  return async function handleExtractBooks(request: Request) {
    let formData: FormData;

    try {
      formData = await request.formData();
    } catch {
      return invalidUploadResponse();
    }

    const photoParts = formData.getAll("photo");
    const fileParts = Array.from(formData.entries()).filter(
      ([, value]) => typeof value !== "string",
    );
    const photo = photoParts[0];

    if (
      photoParts.length !== 1 ||
      fileParts.length !== 1 ||
      photo === undefined ||
      typeof photo === "string" ||
      !isSupportedPhotoType(photo.type) ||
      photo.size > MAX_PHOTO_BYTES
    ) {
      return invalidUploadResponse();
    }

    const bytes = new Uint8Array(await photo.arrayBuffer());

    if (!(await isDecodedImageOfDeclaredType(bytes, photo.type))) {
      return invalidUploadResponse();
    }

    try {
      const candidates = await provider.extractBooks({
        bytes,
        mimeType: photo.type,
      });

      return Response.json(candidates);
    } catch (error) {
      if (error instanceof InvalidProviderOutputError) {
        return Response.json(
          {
            error: {
              code: "invalid_provider_output",
              message:
                "The extracted book information could not be read. Try again.",
            },
          },
          { status: 502 },
        );
      }

      return Response.json(
        {
          error: {
            code: "provider_unavailable",
            message: "Book extraction is temporarily unavailable. Try again.",
          },
        },
        { status: 503 },
      );
    }
  };
}

function invalidUploadResponse(): Response {
  return Response.json(
    {
      error: {
        code: "invalid_upload",
        message: "Choose one supported book-cover photo.",
      },
    },
    { status: 400 },
  );
}

async function isDecodedImageOfDeclaredType(
  bytes: Uint8Array,
  declaredType: string,
): Promise<boolean> {
  try {
    const image = sharp(bytes, { failOn: "error" });
    const metadata = await image.metadata();
    await image.stats();

    return formatToMimeType(metadata.format) === declaredType;
  } catch {
    return false;
  }
}

function formatToMimeType(format: string | undefined): string | null {
  switch (format) {
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    default:
      return null;
  }
}
