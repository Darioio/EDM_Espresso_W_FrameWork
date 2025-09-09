import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * API route for extracting a hero image from a website. The client
 * should call this endpoint with a `url` query parameter pointing
 * to the base domain of the site from which to fetch a hero
 * banner. The endpoint loads the homepage and attempts to find
 * an element matching `#carouselExampleIndicators` (a Bootstrap
 * carousel). If found, the first `.carousel-item` is inspected
 * for a `<source>` tag with a media query targeting mobile
 * devices. The `srcset` attribute of this source is returned. If
 * not found, the fallback `<img>` element within the carousel is
 * used. If no image can be determined, the response returns an
 * empty image string.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing url parameter' });
    return;
  }
  try {
    const response = await axios.get(url, { maxRedirects: 5 });
    const html = response.data as string;
    const $ = cheerio.load(html);
    // Collect all hero images from the carousel. We iterate over
    // every .carousel-item inside #carouselExampleIndicators and
    // extract the mobile variant (media="(max-width: 767px)") if
    // present, otherwise fall back to the <img> element. All
    // resulting URLs are normalised to absolute URLs and returned
    // in an array. If no images are found the array will be empty.
    const images: string[] = [];
    const carousel = $('#carouselExampleIndicators');
    if (carousel.length) {
      carousel.find('.carousel-item').each((_, elem) => {
        const item = $(elem);
        let src = '';
        // Prefer <source> with mobile media query
        const source = item.find('source[media="(max-width: 767px)"]').first();
        if (source.length) {
          const srcset = source.attr('srcset') || '';
          // srcset may contain multiple entries; use the first URL before whitespace/comma
          const firstSrc = srcset.split(',')[0].trim().split(' ')[0];
          src = firstSrc;
        }
        if (!src) {
          // Fallback to img element
          const img = item.find('img').first();
          src = img.attr('data-src') || img.attr('src') || '';
        }
        if (src) {
          // Normalise protocol and relative paths
          if (src.startsWith('//')) {
            src = 'https:' + src;
          } else if (src.startsWith('/')) {
            const base = new URL(url).origin;
            src = base + src;
          }
          images.push(src);
        }
      });
    }
    res.status(200).json({ images });
  } catch (err: any) {
    console.error('Failed to fetch hero images', err.message || err);
    res.status(500).json({ error: 'Failed to fetch hero images' });
  }
}