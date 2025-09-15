// Minimal email-safe HTML sanitizer for client-side usage.
// Whitelists a small tag/attribute set and normalizes anchor hrefs.

export type SanitizeOptions = {
  allowedTags?: string[];
  allowedAttrs?: Record<string, string[]>; // per-tag allowed attributes
};

const DEFAULT_ALLOWED_TAGS = [
  'strong',
  'em',
  'ul',
  'ol',
  'li',
  'a',
  'p',
  'br'
];

const DEFAULT_ALLOWED_ATTRS: Record<string, string[]> = {
  a: ['href', 'title']
};

function isSafeHref(href: string): boolean {
  try {
    const trimmed = (href || '').trim();
    if (!trimmed) return false;
    // Allow http(s), mailto, tel. Disallow javascript:, data:, vbscript:, etc.
    const lower = trimmed.toLowerCase();
    if (lower.startsWith('http://') || lower.startsWith('https://')) return true;
    if (lower.startsWith('mailto:')) return true;
    if (lower.startsWith('tel:')) return true;
    return false;
  } catch {
    return false;
  }
}

export function sanitizeEmailHtml(html: string, opts?: SanitizeOptions): string {
  if (!html) return '';
  // Only run in the browser where DOM is available; otherwise return as-is
  if (typeof window === 'undefined' || typeof document === 'undefined') return html;

  const allowedTags = (opts?.allowedTags && opts.allowedTags.length > 0)
    ? opts.allowedTags.map(t => t.toLowerCase())
    : DEFAULT_ALLOWED_TAGS;
  const allowedAttrs = opts?.allowedAttrs ?? DEFAULT_ALLOWED_ATTRS;

  const container = document.createElement('div');
  container.innerHTML = html;

  const walk = (node: Node) => {
    // Work on a snapshot of childNodes because we may mutate the DOM
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        const tag = el.tagName.toLowerCase();
        if (!allowedTags.includes(tag)) {
          // unwrap: move children up and remove the element
          const grandChildren = Array.from(el.childNodes);
          for (const gc of grandChildren) {
            node.insertBefore(gc, el);
          }
          node.removeChild(el);
          // Continue walking siblings (grandChildren already moved)
          continue;
        }
        // Clean attributes
        const keep = new Set((allowedAttrs[tag] || []).map(a => a.toLowerCase()));
        // Copy current attributes to remove while iterating
        const attrs = Array.from(el.attributes);
        for (const attr of attrs) {
          const name = attr.name.toLowerCase();
          if (!keep.has(name)) {
            el.removeAttribute(attr.name);
          }
        }
        if (tag === 'a') {
          const href = el.getAttribute('href') || '';
          if (!isSafeHref(href)) {
            el.removeAttribute('href');
          } else {
            // Normalize rel for safety in web/preview and general good practice
            el.setAttribute('rel', 'noopener noreferrer nofollow');
          }
        }
        // Recurse into allowed element
        walk(el);
      } else if (child.nodeType === Node.COMMENT_NODE) {
        // Strip comments
        node.removeChild(child);
      } // Text nodes are kept as-is
    }
  };

  walk(container);
  return container.innerHTML.trim();
}

// Sanitize for inline contexts (e.g., title inside <h2>): allow only inline tags
export function sanitizeInlineHtml(html: string): string {
  return sanitizeEmailHtml(html, {
    allowedTags: ['strong', 'em', 'a', 'br'],
    allowedAttrs: { a: ['href', 'title'] }
  });
}
