export interface ProductData {
  url: string;
  pretitle: string;
  title: string;
  price: string;
  originalPrice?: string;
  description: string;
  descriptionP?: string;
  descriptionUl?: string;
  image: string;
  images?: string[];
  cta: string;
  ctaLabel?: string;
  // Optional per-product description source override (used in preview/editor only)
  descSource?: 'metadata' | 'p' | 'ul';
  imageAlt?: string;
}

