/**
 * Normalise an image URL for comparison/deduplication.
 *
 * Strategy:
 *  - Trim whitespace
 *  - Strip query parameters and fragment (e.g. cache busters like ?v=123)
 *  - Remove protocol (http/https)
 *  - Reduce to just the filename (basename) so different hosts/paths collapse
 *  - Decode and lowercase the filename for robust, case-insensitive matching
 *
 * Example: 
 *  http://www.example.com/cdn/shop/files/pic.jpg?v=1 -> pic.jpg
 *  https://cdn.shopify.com/s/files/.../files/pic.jpg?v=1 -> pic.jpg
 */
export function normalizeImage(url: string = ''): string {
  // Trim whitespace
  let s = (url || '').trim();
  // Strip query string and fragment
  const q = s.indexOf('?');
  if (q >= 0) s = s.slice(0, q);
  const h = s.indexOf('#');
  if (h >= 0) s = s.slice(0, h);
  // Remove protocol for comparison (http/https)
  s = s.replace(/^https?:\/\//i, '');
  // Keep only the last path segment (the filename)
  const parts = s.split('/').filter(Boolean);
  let filename = parts.length ? parts[parts.length - 1] : s;
  // Decode and normalise case
  try {
    filename = decodeURIComponent(filename);
  } catch {
    // Ignore decoding errors and fall back to raw filename
  }
  filename = filename.toLowerCase();
  return filename;
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
