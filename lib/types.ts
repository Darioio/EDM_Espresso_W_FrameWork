export interface ProductData {
  url: string;
  pretitle: string;
  title: string;
  price: string;
  originalPrice?: string;
  description: string;
  // Page metadata description (e.g., og:description / twitter:description / JSON-LD)
  metadataDescription?: string;
  // Immutable capture of the original <meta name="description"> at parse time
  originalMetadataDescription?: string;
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

