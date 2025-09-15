import type { NextApiRequest, NextApiResponse } from 'next';
import { parseProduct } from '../../lib/parser';
import { defaultTemplates, renderTemplate } from '../../data/templates';

interface GenerateRequestBody {
  /**
   * List of product page URLs supplied by the client. Each URL
   * should be a fully qualified absolute URL.
   */
  urls: string[];
  /**
   * Optional id of the template to use. If not provided or not
   * recognised the first template in defaultTemplates will be used.
   */
  templateId?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }

    let body: GenerateRequestBody;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body as any);
    } catch (error) {
      res.status(400).json({ error: 'Invalid JSON body' });
      return;
    }

    const rawUrls = Array.isArray(body?.urls) ? body.urls : [];
    // Validate URLs: ensure absolute http(s) and dedupe
    const urls = Array.from(
      new Set(
        rawUrls
          .map((u) => (typeof u === 'string' ? u.trim() : ''))
          .filter((u) => {
            try {
              const parsed = new URL(u);
              return parsed.protocol === 'http:' || parsed.protocol === 'https:';
            } catch {
              return false;
            }
          })
      )
    );
    if (urls.length === 0) {
      res.status(400).json({ error: 'No valid http(s) URLs provided' });
      return;
    }

    const template =
      defaultTemplates.find((t) => t.id === body.templateId) || defaultTemplates[0];
    if (!template) {
      console.error('No template available; defaultTemplates is empty');
      res.status(500).json({ error: 'Server template configuration missing' });
      return;
    }

    const products = [] as any[];
    const htmlFragments = [] as string[];
    for (const url of urls) {
      try {
        const data = await parseProduct(url);
        const meaningfulKeys = [
          'pretitle',
          'title',
          'price',
          'description',
          'image',
          'originalPrice',
          'images'
        ];
        const hasInfo = meaningfulKeys.some((key) => {
          const value = (data as any)[key];
          return Array.isArray(value) ? value.length > 0 : Boolean(value);
        });
        if (!hasInfo) {
          console.warn('Skipping URL with no product data:', url);
          continue;
        }
        products.push(data);
        const fragment = renderTemplate(template, data);
        htmlFragments.push(fragment);
      } catch (err) {
        console.error('Error generating module for url', url, err);
        // Skip this URL and continue
      }
    }

    const html = htmlFragments.join('\n\n');
    res.status(200).json({ html, products });
  } catch (e: any) {
    console.error('Unhandled error in /api/generate:', e);
    res.status(500).json({ error: e?.message || 'Internal Server Error' });
  }
}
