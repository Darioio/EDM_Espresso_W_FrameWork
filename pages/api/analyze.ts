import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { parseProduct } from '../../lib/parser';

type AnalyzeResponse = {
  storeName: string;
  logo?: string; // image URL if available
  logoSvg?: string; // inline SVG markup if available
  heroImages: string[];
  bannerImages: string[];
  // Deprecated: use primaryColor/textColor; keep for backward compat
  colorScheme?: string[]; // [primary]
  primaryColor?: string;
  textColor?: 'black' | 'white';
  colorCandidates?: { source: string; color: string }[];
  fontFamilies: string[];
  announcementCopy?: string;
  product: any; // reuse ProductData shape from lib/types on client
};

function absoluteUrl(base: string, url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return 'https:' + url;
  if (url.startsWith('/')) return new URL(base).origin + url;
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

function rgbToHex(input: string): string | null {
  // supports rgb(a) like rgb(255,0,0) or rgba(255,0,0,1)
  const m = input.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
  if (!m) return null;
  const r = Math.max(0, Math.min(255, parseInt(m[1], 10)));
  const g = Math.max(0, Math.min(255, parseInt(m[2], 10)));
  const b = Math.max(0, Math.min(255, parseInt(m[3], 10)));
  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function normalizeColor(val: string): string | null {
  if (!val) return null;
  const cleaned = val.trim().replace(/!important/i, '').trim();
  if (/^var\(/i.test(cleaned)) return null;
  if (/^transparent$/i.test(cleaned)) return null;
  if (/^currentColor$/i.test(cleaned)) return null;
  // hex
  const hex = cleaned.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[0];
  if (hex) return hex.toUpperCase();
  // rgb/rgba
  const asHex = rgbToHex(cleaned);
  if (asHex) return asHex;
  return null;
}

// Extract color candidates from CSS and inline styles for announcement bars and CTAs
function extractColorCandidates($: cheerio.CheerioAPI, baseCssTexts: string[]): { source: string; color: string }[] {
  const candidates: { source: string; color: string }[] = [];
  const push = (source: string, color?: string | null) => {
    const c = color && normalizeColor(color);
    if (!c) return;
    candidates.push({ source, color: c });
  };
  // From inline styles of announcement elements
  $('[class*="announcement" i], [class*="anouncement" i]').each((_, el) => {
    const style = ($(el).attr('style') || '').toString();
    const mBg = style.match(/background(?:-color)?\s*:\s*([^;]+)/i);
    if (mBg) push('announcement-bg', mBg[1]);
    const mBorder = style.match(/border(?:-color)?\s*:\s*([^;]+)/i);
    if (mBorder) push('announcement-border', mBorder[1]);
  });
  // Utility bar backgrounds
  $('.utility-bar, [class*="utility-bar" i]').each((_, el) => {
    const style = ($(el).attr('style') || '').toString();
    const mBg = style.match(/background(?:-color)?\s*:\s*([^;]+)/i);
    if (mBg) push('utility-bar-bg', mBg[1]);
  });
  // From inline styles of CTA-like elements
  $('[class*="cta" i], [class*="button" i], [class*="btn" i], [class*="add-to-cart" i]').each((_, el) => {
    const style = ($(el).attr('style') || '').toString();
    const mBg = style.match(/background(?:-color)?\s*:\s*([^;]+)/i);
    if (mBg) push('cta-bg', mBg[1]);
    const mBorder = style.match(/border(?:-color)?\s*:\s*([^;]+)/i);
    if (mBorder) push('cta-border', mBorder[1]);
  });
  // Explicit <button> elements
  $('button').each((_, el) => {
    const style = ($(el).attr('style') || '').toString();
    const mBg = style.match(/background(?:-color)?\s*:\s*([^;]+)/i);
    if (mBg) push('button-bg', mBg[1]);
    const mBorder = style.match(/border(?:-color)?\s*:\s*([^;]+)/i);
    if (mBorder) push('button-border', mBorder[1]);
  });
  // Scan style tags for rules targeting announcement/cta classes
  for (const css of baseCssTexts) {
    // announcement backgrounds
    const reAnn = /\.(?:[^\.{\s]*?(announcement|anouncement)[^\s{]*)[^}]*\{[^}]*?(background(?:-color)?):\s*([^;}{]+);/ig;
    let m: RegExpExecArray | null;
    while ((m = reAnn.exec(css))) {
      push('announcement-bg', m[2]);
    }
    // cta backgrounds
    const reCtaBg = /\.(?:[^\.{\s]*?(cta|button|btn)[^\s{]*)[^}]*\{[^}]*?(background(?:-color)?):\s*([^;}{]+);/ig;
    while ((m = reCtaBg.exec(css))) {
      push('cta-bg', m[2]);
    }
    // cta borders
    const reCtaBorder = /\.(?:[^\.{\s]*?(cta|button|btn)[^\s{]*)[^}]*\{[^}]*?(border(?:-color)?):\s*([^;}{]+);/ig;
    while ((m = reCtaBorder.exec(css))) {
      push('cta-border', m[2]);
    }
    // utility bar background
    const reUtil = /\.(?:[^\.\{\s]*?(utility-bar)[^\s{]*)[^}]*\{[^}]*?(background(?:-color)?):\s*([^;}{]+);/ig;
    while ((m = reUtil.exec(css))) {
      push('utility-bar-bg', m[2]);
    }
    // button tag styles
    const reButtonTag = /button\s*\{[^}]*?(background(?:-color)?):\s*([^;}{]+);/ig;
    while ((m = reButtonTag.exec(css))) {
      push('button-bg', m[1] || m[2]);
    }
  }
  // Dedupe by color while preserving first occurrence
  const seen = new Set<string>();
  return candidates.filter(({ color }) => (seen.has(color) ? false : (seen.add(color), true)));
}

// Extract --atlas-primary-color; fall back to meta theme-color
function extractPrimaryAndText($: cheerio.CheerioAPI): { candidates: { source: string; color: string }[]; primary?: string; text?: 'black' | 'white' } {
  const styles: string[] = [];
  $('style').each((_, el) => {
    styles.push($(el).contents().text());
  });
  let primary: string | null = null;
  for (const text of styles) {
    const m = text.match(/--atlas-primary-color\s*:\s*([^;\n\r]+)/i);
    if (m && m[1]) {
      primary = normalizeColor(m[1]);
      if (primary) break;
    }
  }
  const candidates = extractColorCandidates($, styles);
  // theme-color as a low-priority candidate
  const theme = $('meta[name="theme-color"]').attr('content');
  const themeHex = theme ? normalizeColor(theme) : null;
  if (themeHex) candidates.push({ source: 'theme-color', color: themeHex });
  // prefer atlas var, else announcement bg, cta bg, cta border, then theme
  const preferred = primary || (candidates[0]?.color || null);
  // pick text color suggestion
  let text: 'black' | 'white' = 'black';
  const hex = preferred || candidates[0]?.color || themeHex;
  if (hex) {
    // YIQ formula
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    text = yiq >= 128 ? 'black' : 'white';
  }
  return { candidates, primary: preferred || undefined, text };
}

function extractFonts($: cheerio.CheerioAPI): string[] {
  const set = new Set<string>();
  $('link[rel="stylesheet"][href*="fonts.googleapis.com"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const url = new URL(href, 'https://example.com');
    const fam = url.searchParams.get('family');
    if (fam) {
      fam.split('|').forEach((chunk) => set.add(chunk.split(':')[0].replace(/\+/g, ' ')));
    }
  });
  $('style').each((_, el) => {
    const text = $(el).contents().text();
    const matches = text.match(/font-family\s*:\s*([^;\}]+)/gi) || [];
    matches.forEach((m) => {
      const fam = m.split(':')[1]?.trim().replace(/["']/g, '').split(',')[0]?.trim();
      if (fam) set.add(fam);
    });
  });
  const blocked = new Set(['sans-serif','serif','monospace','cursive','fantasy','emoji','math','fangsong','system-ui','inherit','initial','unset']);
  const cleaned = Array.from(set)
    .filter(f => f && !/^var\(/i.test(f) && !/^--/.test(f) && !blocked.has(f.toLowerCase()))
    .slice(0, 5);
  return cleaned;
}

function collectImages($: cheerio.CheerioAPI, base: string, type: 'hero' | 'banner'): string[] {
  const results: string[] = [];
  const regex = type === 'hero' ? /(main|slideshow|hero|header)/i : /(banner)/i;
  $('img').each((_, el) => {
    const $el = $(el);
    const cls = ($el.attr('class') || '') + ' ' + ($el.parent().attr('class') || '');
    const id = ($el.attr('id') || '') + ' ' + ($el.parent().attr('id') || '');
    if (!regex.test(cls + ' ' + id)) return;
    let src = $el.attr('src') || $el.attr('data-src') || '';
    src = absoluteUrl(base, src);
    if (!src) return;
    // width heuristic: attribute width or src hints like _600x
    const wAttr = parseInt($el.attr('width') || '0', 10);
    const okByAttr = !isNaN(wAttr) && wAttr >= 599;
    const okBySrc = /[_-](6\d\d|[7-9]\d\d|\d{4,})x/i.test(src) || /w(=|%3D)(6\d\d|[7-9]\d\d|\d{4,})/i.test(src);
    if (okByAttr || okBySrc) {
      results.push(src);
    }
  });
  // Dedupe preserving order
  return Array.from(new Set(results));
}

function collectMobileBannerImages($: cheerio.CheerioAPI, base: string): string[] {
  const results: string[] = [];
  // direct class on img
  $('img.mobile-banner, img[class*="mobile-banner"]').each((_, el) => {
    let src = $(el).attr('src') || $(el).attr('data-src') || '';
    src = absoluteUrl(base, src);
    if (src) results.push(src);
  });
  // nested within elements with class mobile-banner
  $('.mobile-banner img, [class*="mobile-banner"] img').each((_, el) => {
    let src = $(el).attr('src') || $(el).attr('data-src') || '';
    src = absoluteUrl(base, src);
    if (src) results.push(src);
  });
  return Array.from(new Set(results));
}

function extractStoreName($: cheerio.CheerioAPI, baseUrl: string): string {
  const og = $('meta[property="og:site_name"]').attr('content');
  if (og) return og;
  const title = $('title').first().text().trim();
  if (title) return title;
  try {
    const host = new URL(baseUrl).hostname.replace(/^www\./, '');
    return host.split('.')[0];
  } catch {
    return '';
  }
}

function extractLogo($: cheerio.CheerioAPI, base: string): { url?: string; svg?: string } {
  // search any element whose class includes 'logo'
  const logoContainers = $('[class*="logo" i]').toArray();
  for (const el of logoContainers) {
    const $el = $(el as any);
    // inline svg inside
    const svg = $el.find('svg').first();
    if (svg && svg.length) {
      // grab outer HTML
      const html = $.html(svg);
      if (html) return { svg: html };
    }
    // image tag inside
    const img = $el.find('img').first();
    if (img && img.length) {
      let src = img.attr('src') || img.attr('data-src') || '';
      src = absoluteUrl(base, src);
      if (src) return { url: src };
    }
  }
  // fallback: simple img with alt/class containing logo
  const cand = $('img[alt*="logo" i], img[class*="logo" i]').first();
  const fallback = cand.attr('src') || cand.attr('data-src') || '';
  if (fallback) return { url: absoluteUrl(base, fallback) };
  return {};
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing url parameter' });
    return;
  }
  try {
    const response = await axios.get(url, { maxRedirects: 5, headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = response.data as string;
    const $ = cheerio.load(html);
    // Remove mega-menu content globally before extraction
    try {
      const reMega = /mega[-_ ]?menu/i;
      const toRemove = $('[class]').filter((_, el) => reMega.test(($(el).attr('class') || ''))).toArray();
      if (toRemove.length) $(toRemove).remove();
    } catch (_) {}
    const base = new URL(url).toString();

    const product = await parseProduct(url);
    const storeName = extractStoreName($, url);
    const logoObj = extractLogo($, url);
    const heroImages = collectImages($, base, 'hero');
    // Prefer mobile-banner images on current page; then also try homepage and merge/dedupe
    let bannerImages = collectMobileBannerImages($, base);
    try {
      const origin = new URL(base).origin;
      const homeRes = await axios.get(origin, { headers: { 'User-Agent': 'Mozilla/5.0' }, maxRedirects: 5 });
      const $home = cheerio.load(homeRes.data as string);
      const homeBanners = collectMobileBannerImages($home, origin + '/');
      bannerImages = Array.from(new Set([...bannerImages, ...homeBanners]));
    } catch (_) {
      // ignore homepage fetch errors
    }
    if (bannerImages.length === 0) {
      bannerImages = collectImages($, base, 'banner');
    }
    const { candidates: colorCandidates, primary: primaryColor, text: textColor } = extractPrimaryAndText($);
    // Extract announcement copy text if present
    let announcementCopy = '';
    const ann = $('[class*="announcement" i], [class*="anouncement" i]').first();
    if (ann && ann.length) {
      announcementCopy = (ann.text() || '').replace(/\s+/g,' ').trim();
    }
    const fontFamilies = extractFonts($);

    const payload: AnalyzeResponse = {
      storeName,
      logo: logoObj.url,
      logoSvg: logoObj.svg,
      heroImages,
      bannerImages,
      colorScheme: primaryColor ? [primaryColor] : [],
      primaryColor,
      textColor,
      colorCandidates: colorCandidates,
      fontFamilies,
      announcementCopy,
      product
    };
    res.status(200).json(payload);
  } catch (err: any) {
    console.error('Analyze error', err.message || err);
    res.status(500).json({ error: 'Failed to analyze page' });
  }
}
