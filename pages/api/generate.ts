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
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  let body: GenerateRequestBody;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (error) {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  const urls = Array.isArray(body.urls) ? body.urls : [];
  if (urls.length === 0) {
    res.status(400).json({ error: 'No URLs provided' });
    return;
  }
  const template =
    defaultTemplates.find((t) => t.id === body.templateId) || defaultTemplates[0];

  const products: any[] = [];
  const skipped: { url: string; reason: string }[] = [];
  const htmlFragments: string[] = [];
  for (const url of urls) {
    try {
      const data = await parseProduct(url);
      // Skip URLs that return no meaningful product information to avoid
      // rendering placeholder values like "Product title" or "Price".
      // Only consider fields that represent real product information.
      // Exclude generic fields like url or cta which are always present
      // even when parsing fails.
      const meaningfulKeys = ['pretitle','title','price','description','image','originalPrice','images'];
      const hasInfo = meaningfulKeys.some(key => {
        const value = (data as any)[key];
        return Array.isArray(value) ? value.length > 0 : Boolean(value && String(value).trim());
      });
      const strongTitle = (data.title || '').trim().length > 5;
      if (!hasInfo && !strongTitle) {
        console.warn('Skipping URL with no product data:', url);
        skipped.push({ url, reason: (data as any).__reason || 'no-meaningful-fields' });
        continue;
      }
    // Include a sanitized source URL (strip query params) so the client can map results back
    const sourceUrl = url.split('?')[0];
    products.push({ ...data, _sourceUrl: sourceUrl });
      const fragment = renderTemplate(template, data);
      htmlFragments.push(fragment);
    } catch (err) {
      console.error('Error generating module for url', url, err);
      // If a URL fails outright, skip it and continue with the next one.
      skipped.push({ url, reason: 'exception' });
    }
  }
  const html = htmlFragments.join('\n\n');
  res.status(200).json({ html, products, skipped });
}
