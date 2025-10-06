import type { NextApiRequest, NextApiResponse } from 'next';
import { parseProduct } from '../../lib/parser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing url parameter' });
    return;
  }
  try {
    const product = await parseProduct(url);
    res.status(200).json(product);
  } catch (err: any) {
    console.error('Product parse error', err.message || err);
    res.status(500).json({ error: 'Failed to parse product page' });
  }
}
