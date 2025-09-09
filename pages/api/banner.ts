import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * API route for extracting a mobile banner image from a website. The client
 * should call this endpoint with a `url` query parameter pointing to the page
 * to inspect. The endpoint loads the page and looks for the first `<img>` with
 * the class `mobile-banner`. The `src` (or `data-src`) attribute of this image
 * is returned. The URL is normalised to an absolute URL when necessary.
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
    const img = $('img.mobile-banner').first();
    let src = img.attr('src') || img.attr('data-src') || '';
    if (src) {
      if (src.startsWith('//')) {
        src = 'https:' + src;
      } else if (src.startsWith('/')) {
        const base = new URL(url).origin;
        src = base + src;
      }
    }
    res.status(200).json({ image: src });
  } catch (err: any) {
    console.error('Failed to fetch banner image', err.message || err);
    res.status(500).json({ error: 'Failed to fetch banner image' });
  }
}
