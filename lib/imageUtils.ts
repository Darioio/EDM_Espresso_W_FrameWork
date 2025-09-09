/**
 * Normalise an image URL by removing query parameters and trimming whitespace.
 * This allows consistent comparison of image strings that may include varying
 * cache‑busting tokens.
 */
export function normalizeImage(url: string = ''): string {
  return url.split('?')[0]?.trim() || '';
}

/**
 * Return a list of images with duplicate base URLs removed. The first
 * occurrence of each unique image is preserved.
 */
export function uniqueImages(images: string[] = []): string[] {
  const byBase = new Map<string, string>();
  images.forEach((img) => {
    const base = normalizeImage(img);
    if (base && !byBase.has(base)) {
      byBase.set(base, img);
    }
  });
  return Array.from(byBase.values());
}
