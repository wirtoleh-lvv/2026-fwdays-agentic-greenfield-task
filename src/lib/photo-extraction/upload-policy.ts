export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export const SUPPORTED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export function isSupportedPhotoType(type: string): boolean {
  return SUPPORTED_PHOTO_TYPES.some((supportedType) => supportedType === type);
}
