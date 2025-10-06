import axios from 'axios';
import * as cheerio from 'cheerio';
import { ProductData } from './types';

/**
 * Shape of the information we care about from a product page.
 *
 * These fields mirror the placeholders used in templates. Some
 * fields are optional because not every page will expose them.
 */
// ProductData type moved to lib/types.ts

/**
 * Attempt to parse structured JSON-LD data from the page. Many
 * e‑commerce platforms embed an object with the schema.org
 * Product type. This helper extracts it if present.
 */
function parseLdJson($: cheerio.CheerioAPI): Record<string, any> | null {
  const scripts = $('script[type="application/ld+json"]').toArray();
  for (const el of scripts) {
    const contents = $(el).contents().text();
    if (!contents) continue;
    try {
      const json = JSON.parse(contents.trim());
      // Sometimes multiple objects are wrapped in an array.
      const candidates = Array.isArray(json) ? json : [json];
      for (const obj of candidates) {
        if (obj['@type'] === 'Product') {
          return obj;
        }
      }
    } catch (_) {
      // ignore JSON parse errors and continue.
    }
  }
  return null;
}

/**
 * Generic helper to extract a meta tag value. It first tries to
 * match the given property on the `meta[property]` attribute (as used
 * by Open Graph), then falls back to `meta[name]`.
 */
function getMeta($: cheerio.CheerioAPI, prop: string): string | null {
  return (
    $(`meta[property='${prop}']`).attr('content') ||
    $(`meta[name='${prop}']`).attr('content') ||
    null
  );
}

/**
 * Fetch a product page and extract basic fields using heuristics. This
 * function does not attempt to deeply crawl the DOM; instead it relies
 * on Open Graph tags, JSON‑LD and common microdata attributes. If a
 * field cannot be resolved it will be returned as an empty string.
 *
 * If the request fails for whatever reason the resulting object will
 * contain empty strings for all properties except url and cta.
 *
 * @param url Product page URL
 */
export async function parseProduct(url: string): Promise<ProductData> {
  const clean = (value: string | null | undefined): string =>
    (value || '').toString().trim();

  // Normalise image URLs (protocol-relative, root-relative, and relative paths)
  const buildNormaliser = (pageUrl: string) => {
    let origin = '';
    let basePath = '';
    try {
      const u = new URL(pageUrl);
      origin = u.origin;
      basePath = pageUrl.endsWith('/') ? pageUrl : pageUrl.substring(0, pageUrl.lastIndexOf('/') + 1);
    } catch (_) {}
    return (raw: string | null | undefined): string => {
      const val = (raw || '').trim();
      if (!val) return '';
      if (/^https?:\/\//i.test(val)) return val;
      if (val.startsWith('//')) return `https:${val}`; // assume https for protocol-relative
      if (val.startsWith('/')) return origin ? origin + val : val; // root-relative
      return basePath ? basePath + val : val; // relative path
    };
  };
  const normalise = buildNormaliser(url);

  let html = '';
  try {
    const response = await axios.get(url, {
      headers: {
        // Set a user agent so that some sites don’t block our request.
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0 Safari/537.36'
      },
      // Follow redirects automatically.
      maxRedirects: 3
    });
    html = response.data;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error instanceof Error ? error.message : error);
    return {
      url,
      pretitle: '',
      title: '',
      price: '',
      description: '',
      image: '',
      images: undefined,
      cta: url,
      ctaLabel: 'SHOP NOW'
    } as ProductData;
  }

  const $ = cheerio.load(html);
  // Remove any mega-menu content to avoid polluting extraction
  try {
    const reMega = /mega[-_ ]?menu/i;
    const toRemove = $('[class]').filter((_, el) => reMega.test(($(el).attr('class') || ''))).toArray();
    if (toRemove.length) $(toRemove).remove();
  } catch (_) {}

  // Attempt to parse JSON‑LD structured data first because it typically
  // provides the richest information. We fall back to meta tags if
  // structured data is not present or incomplete.
  const ld = parseLdJson($) || {};
  const product: ProductData = {
    url,
    pretitle: '',
    title: '',
    price: '',
    originalPrice: undefined,
    description: '',
    metadataDescription: undefined,
    image: '',
    images: undefined,
    cta: url
    ,
    // Default call-to-action label. Users can override this in the
    // preview by editing the CTA text. If not provided, templates
    // will fall back to this value.
    ctaLabel: 'SHOP NOW'
  };

  // Title
  product.title =
    clean(ld.name) ||
    clean(getMeta($, 'og:title')) ||
    clean(getMeta($, 'twitter:title')) ||
    clean($('title').first().text());

  // Description & metadata description
  // We distinguish the page's canonical META description (<meta name="description">)
  // from other potential sources like JSON-LD Product.description or Open Graph / Twitter
  // descriptions. Per requirement: metadataDescription must originate from the meta tag only.
  const metaTagDescription = clean(getMeta($, 'description'));
  const ldDesc = clean(ld.description);
  const ogDesc = clean(getMeta($, 'og:description'));
  const twitterDesc = clean(getMeta($, 'twitter:description'));

  // Assign only the literal <meta name="description"> content to metadataDescription
  product.metadataDescription = metaTagDescription || undefined;
  if (metaTagDescription) {
    (product as any).originalMetadataDescription = metaTagDescription;
  }
  // Default user-facing description prefers the meta tag, then structured data, then OG/Twitter.
  product.description = metaTagDescription || ldDesc || ogDesc || twitterDesc || '';

  // Extract specific description sources from .product__description
  try {
    const descRoot = $('.product__description').first();
    if (descRoot && descRoot.length) {
      const p = descRoot.find('p').first();
      if (p && p.length) {
        product.descriptionP = clean(p.text());
      }
      const ul = descRoot.find('ul').first();
      if (ul && ul.length) {
        // Preserve UL structure as HTML for email preview/template
        product.descriptionUl = $.html(ul);
      }
    }
  } catch (e) {
    // ignore extraction errors
  }

  // Image
  const ldImage: string | undefined = Array.isArray(ld.image)
    ? ld.image[0]
    : typeof ld.image === 'string'
    ? ld.image
    : undefined;
  product.image = normalise(
    clean(ldImage) ||
      clean(getMeta($, 'og:image')) ||
      clean(getMeta($, 'twitter:image')) ||
      clean($('img').first().attr('src'))
  );

  // Price
  const ldOffers = ld.offers;
  let ldPrice: string | undefined;
  if (ldOffers) {
    if (Array.isArray(ldOffers)) {
      ldPrice = ldOffers[0]?.price;
    } else if (typeof ldOffers === 'object') {
      ldPrice = ldOffers.price;
    }
  }
  product.price =
    clean(ldPrice) ||
    clean(getMeta($, 'product:price:amount')) ||
    clean(getMeta($, 'og:price:amount')) ||
    // Try to match microdata on sites like Shopify: [itemprop="price"]
    clean($('[itemprop="price"]').first().text());

  // Original price: attempt to find a compare‑at or strike‑through price. This
  // can appear in JSON‑LD as an "priceSpecification" with
  // "priceCurrency" and "value", or in the DOM as <del> or a span with
  // class containing "compare" or "strike". We attempt several heuristics
  // and take the first numeric value we find. The value returned does
  // not include the currency symbol.
  let original: string | undefined;
  // Check JSON‑LD offers.comparePrice if present
  if (ldOffers) {
    // Some schemas nest compareAtPrice or originalPrice
    const getCompare = (obj: any): string | undefined => {
      if (!obj) return undefined;
      return obj.compareAtPrice || obj.originalPrice || obj.priceSpecification?.price;
    };
    if (Array.isArray(ldOffers)) {
      for (const off of ldOffers) {
        const val = getCompare(off);
        if (val) {
          original = clean(val);
          break;
        }
      }
    } else if (typeof ldOffers === 'object') {
      const val = getCompare(ldOffers);
      if (val) {
        original = clean(val);
      }
    }
  }
  if (!original) {
    // Look for elements containing a price with a line‑through style or a
    // class indicating "compare" or "original". We extract numeric
    // values (digits and decimal separators).
    const priceRegex = /([\d,.]+)\s*(?:[A-Z]{3})?/;
    // helper to parse text
    const parsePriceText = (text: string) => {
      const match = priceRegex.exec(text);
      return match ? match[1] : undefined;
    };
    // Check <del> elements
    $('del, strike').each((_, el) => {
      const text = $(el).text();
      const val = parsePriceText(text);
      if (val) {
        original = clean(val);
        return false; // break the loop
      }
    });
    // Check elements with class containing compare or original
    if (!original) {
      $('[class*="compare"],[class*="original"],[class*="strike"]').each((_, el) => {
        const text = $(el).text();
        const val = parsePriceText(text);
        if (val) {
          original = clean(val);
          return false;
        }
      });
    }
  }
  // Assign originalPrice if found and different from sale price
  if (original && original !== product.price) {
    product.originalPrice = original;
  }

  // Pretitle: not widely available. As a heuristic, if the title
  // contains a hyphen, split the first part as pretitle and the rest
  // as the actual title.
  if (product.title && product.title.includes(' – ')) {
    const parts = product.title.split(/\s+–\s+/);
    if (parts.length > 1) {
      product.pretitle = parts[0];
      product.title = parts.slice(1).join(' – ');
    }
  }

  // Colour capture removed per refactor; no swatch detection

  // Images: collect additional image URLs beyond the primary image. We
  // start with the primary image if it exists. Then search for image
  // elements that are likely part of the product gallery. Heuristics
  // include class names containing "product", "gallery", "thumb", or
  // "image". We also accept JSON‑LD image arrays. Only absolute
  // URLs (http or https) are kept and duplicates removed.
  const imageSet = new Set<string>();
  if (product.image) {
    imageSet.add(product.image);
  }
  // Add any additional images from JSON‑LD
  if (Array.isArray(ld.image)) {
    for (const img of ld.image) {
      if (typeof img === 'string') {
        imageSet.add(normalise(img));
      }
    }
  }
  // DOM extraction: find images with relevant class hints
  $('img').each((_, el) => {
    const src = normalise($(el).attr('src'));
    if (!src) return;
    if (!/\.(jpe?g|png|gif|webp|avif|svg)(?:[?#].*)?$/i.test(src)) return;
    // Accept images if they contain certain keywords in their class or id
    const classes = ($(el).attr('class') || '') + ' ' + ($(el).parent().attr('class') || '');
    const ids = ($(el).attr('id') || '') + ' ' + ($(el).parent().attr('id') || '');
    const hay = classes + ' ' + ids;
    if (/product|gallery|thumb|image|slider|carousel/i.test(hay)) {
      imageSet.add(src);
    }
  });

  // Additional extraction: attempt to fetch the Shopify .js endpoint for
  // richer product data. Many Shopify stores expose a JSON file at
  // <product-url>.js which contains an array of image URLs and the
  // featured image. If the request fails or the response is not JSON,
  // we silently ignore it. We prefix protocol-relative URLs with
  // https: to ensure absolute paths. Any images found here are added
  // to imageSet. This logic mirrors the working implementation from
  // the provided reference package. It avoids slicing the JSON by
  // braces and instead lets JSON.parse handle the string.
  try {
    const jsUrl = url.endsWith('.js') ? url : `${url}.js`;
    const jsResp = await axios.get(jsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0 Safari/537.36'
      },
      maxRedirects: 3
    });
    const jsData = jsResp.data;
    // If response is a string, attempt to parse JSON; if it's already
    // an object we can process it directly. Some platforms escape
    // unicode sequences, but JSON.parse will handle them.
    const parsedData =
      typeof jsData === 'string'
        ? JSON.parse(jsData)
        : typeof jsData === 'object'
        ? jsData
        : null;
    if (parsedData && typeof parsedData === 'object') {
      // Extract images array
      const imgs: unknown = (parsedData as any).images;
      if (Array.isArray(imgs)) {
        for (const p of imgs) {
          if (typeof p === 'string' && p) {
            const imgUrl = normalise(p.startsWith('//') ? `https:${p}` : p);
            if (imgUrl) {
              imageSet.add(imgUrl);
            }
          }
        }
      }
      // Extract featured image
      const feat: unknown = (parsedData as any).featured_image;
      if (typeof feat === 'string' && feat) {
        const full = normalise(feat.startsWith('//') ? `https:${feat}` : feat);
        if (full) {
          imageSet.add(full);
        }
      }
    }
  } catch (err) {
    // Silently ignore errors; the JSON endpoint may not exist or may not
    // return valid JSON. In such cases we simply rely on images
    // extracted from the HTML and JSON-LD.
  }
  // Assign images array if more than one image is found
  const imagesArr = Array.from(imageSet);
  if (imagesArr.length > 0) {
    // Assign the images directly from imageSet. The imageSet itself
    // already deduplicates exact URLs while preserving insertion order.
    // We no longer deduplicate by base path (query parameters) because
    // some stores use the same base for different images. Instead we
    // preserve all unique URLs. We still move the primary image to
    // the front of the array if it exists and is not already first.
    let deduped: string[] = imagesArr;
    if (product.image) {
      const index = deduped.findIndex((i) => i === product.image);
      if (index > 0) {
        const [img] = deduped.splice(index, 1);
        deduped.unshift(img);
      } else if (index === -1) {
        deduped.unshift(product.image);
      }
    }
    product.images = deduped;
  }

  return product;
}
