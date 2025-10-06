import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface CollectionItem {
  title: string;
  price?: string;
  image?: string;
  url: string;
}

function absoluteUrl(base: string, url: string): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('//')) return 'https:' + url;
  if (url.startsWith('/')) return new URL(base).origin + url;
  try { return new URL(url, base).toString(); } catch { return url; }
}

function clean(t?: string | null) { return (t || '').toString().replace(/\s+/g,' ').trim(); }

function pickFromSrcset(srcset?: string): string | '' {
  if (!srcset) return '';
  // srcset entries: "url w", choose the largest width
  let best: { w: number; url: string } | null = null;
  for (const part of srcset.split(',')) {
    const seg = part.trim();
    const m = seg.match(/^(\S+)\s+(\d+)w$/);
    if (m) {
      const url = m[1];
      const w = parseInt(m[2], 10);
      if (!best || w > best.w) best = { w, url };
    }
  }
  return best?.url || '';
}

function extractImage($: cheerio.CheerioAPI, base: string, scope: cheerio.Cheerio<any>): string {
  // Try <img> first
  const img = scope.find('img').first();
  if (img && img.length) {
    const srcset = clean(img.attr('srcset'));
    const best = pickFromSrcset(srcset);
    let src = best || clean(img.attr('src') || img.attr('data-src'));
    src = absoluteUrl(base, src);
    if (src) return src;
  }
  // Try <picture><source srcset>
  const source = scope.find('picture source').first();
  if (source && source.length) {
    const best = pickFromSrcset(clean(source.attr('srcset')));
    const abs = absoluteUrl(base, best);
    if (abs) return abs;
  }
  // Try background-image inline style
  const bgEl = scope.find('[style*="background-image" i]').first();
  if (bgEl && bgEl.length) {
    const style = clean(bgEl.attr('style'));
    const m = style.match(/background-image\s*:\s*url\(([^)]+)\)/i);
    if (m) {
      let raw = m[1].replace(/['"]/g, '');
      const abs = absoluteUrl(base, raw);
      if (abs) return abs;
    }
  }
  return '';
}

function extractTitle($: cheerio.CheerioAPI, scope: cheerio.Cheerio<any>, anchor: cheerio.Cheerio<any>): string {
  return (
    clean(scope.find('[class*="title" i], [class*="heading" i], .product__title, .card__heading, h2, h3').first().text()) ||
    clean(anchor.attr('aria-label')) ||
    clean(anchor.attr('title')) ||
    clean(anchor.text())
  );
}

function extractPrice($: cheerio.CheerioAPI, scope: cheerio.Cheerio<any>): string {
  // Common Shopify price structures
  const sel = [
    '[class*="price" i]',
    '.price',
    '.price__container',
    '.price__regular',
    '.price__sale',
    '.price-item',
    '[data-price]'
  ].join(',');
  let price = clean(scope.find(sel).first().text());
  if (!price) {
    // Microdata
    price = clean(scope.find('[itemprop="price"]').first().attr('content')) || clean(scope.find('[itemprop="price"]').first().text());
  }
  // Strip excessive whitespace; leave currency symbol if present
  return price;
}

async function enrichFromProductJs(base: string, url: string): Promise<Partial<CollectionItem>> {
  try {
    const jsUrl = url.endsWith('.js') ? url : `${url}.js`;
    const resp = await axios.get(jsUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, maxRedirects: 5 });
    const data = typeof resp.data === 'string' ? JSON.parse(resp.data) : resp.data;
    const title = clean(data?.title);
    let image = '';
    if (Array.isArray(data?.images) && data.images.length) {
      const first = data.images[0];
      image = typeof first === 'string' ? first : '';
    } else if (data?.featured_image) {
      image = data.featured_image;
    }
    if (image && image.startsWith('//')) image = `https:${image}`;
    if (image && !/^https?:\/\//i.test(image)) image = absoluteUrl(base, image);
    // Price: prefer first variant
    let price = '';
    const v0 = Array.isArray(data?.variants) ? data.variants[0] : null;
    if (v0 && (v0.price || v0.compare_at_price)) {
      price = clean(String(v0.price || v0.compare_at_price));
    } else if (data?.price) {
      price = clean(String(data.price));
    }
    return { title, image, price };
  } catch (_) {
    return {};
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing url parameter' });
    return;
  }
  try {
    const base = new URL(url).toString();
    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, maxRedirects: 5 });
    const $ = cheerio.load(response.data as string);
    // Remove mega-menu content to avoid false positives
    try {
      const reMega = /mega[-_ ]?menu/i;
      const toRemove = $('[class]').filter((_, el) => reMega.test(($(el).attr('class') || ''))).toArray();
      if (toRemove.length) $(toRemove).remove();
    } catch (_) {}

    // Collect product anchors and their card containers; dedupe by URL
    const itemMap = new Map<string, CollectionItem>();
    $('a[href*="/products/"]').each((_, a) => {
      const href = $(a).attr('href') || '';
      const abs = absoluteUrl(base, href);
      if (!/\/products\//i.test(abs)) return;
      // Determine a likely product card container by walking up a few levels
      const $a = $(a);
  let container: cheerio.Cheerio<any> = $a;
      for (let i = 0; i < 4; i++) {
        const parent = container.parent();
        if (!parent || !parent.length) break;
        // Stop if parent looks like a grid item/card
        const cls = (parent.attr('class') || '').toLowerCase();
        if (/card|product|grid|item|tile/.test(cls)) { container = parent; break; }
        container = parent;
      }
      const title = extractTitle($, container, $a);
      const price = extractPrice($, container);
      const image = extractImage($, base, container) || extractImage($, base, $a);
      // Keep first occurrence; avoid duplicates caused by multiple anchors per card
      if (!itemMap.has(abs)) {
        itemMap.set(abs, { url: abs, title, price: price || undefined, image: image || undefined });
      } else {
        // Merge if this occurrence has more data
        const prev = itemMap.get(abs)!;
        itemMap.set(abs, {
          url: abs,
          title: prev.title || title,
          price: prev.price || (price || undefined),
          image: prev.image || (image || undefined)
        });
      }
    });

    const items: CollectionItem[] = Array.from(itemMap.values());

    // Backup enrichment for any missing fields using Shopify product .js
    const needEnrich = items.filter(it => !it.title || !it.image || !it.price);
    if (needEnrich.length) {
      await Promise.allSettled(needEnrich.map(async (it) => {
        const patch = await enrichFromProductJs(base, it.url);
        if (!it.title && patch.title) it.title = patch.title;
        if (!it.image && patch.image) it.image = patch.image;
        if (!it.price && patch.price) it.price = patch.price;
      }));
    }

    // Dedupe by URL
    const seen = new Set<string>();
    const deduped = items.filter(it => (seen.has(it.url) ? false : (seen.add(it.url), true)));

  res.status(200).json({ count: deduped.length, items: deduped });
  } catch (err: any) {
    console.error('Collection parse error', err.message || err);
    res.status(500).json({ error: 'Failed to parse collection page' });
  }
}
