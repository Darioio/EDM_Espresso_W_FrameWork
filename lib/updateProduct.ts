import { ProductData } from './types';

export function updateProductImmutable(product: ProductData, field: keyof ProductData, value: any): ProductData {
  const next: ProductData = { ...product };

  // Changing description source only adjusts the displayed description.
  if (field === 'descSource') {
    const v = value as ProductData['descSource'];
    (next as any).descSource = v;
    if (v === 'metadata') {
      // Restore original metadata if current metadataDescription was cleared or edited away
      const md = next.metadataDescription ?? next.originalMetadataDescription ?? '';
      next.description = md;
    } else if (v === 'p') {
      next.description = next.descriptionP || '';
    } else if (v === 'ul') {
      next.description = next.descriptionUl || '';
    }
    return next;
  }

  // Direct field edits
  (next as any)[field] = value;

  // Keep active description synchronized only with the active variant; never mutate originalMetadataDescription.
  const active = next.descSource || 'metadata';
  if (field === 'descriptionP' && active === 'p') {
    next.description = value;
  } else if (field === 'descriptionUl' && active === 'ul') {
    next.description = value;
  } else if ((field === 'metadataDescription' || field === 'description') && active === 'metadata') {
    next.description = value;
  }

  return next;
}

// Update within a products array immutably; returns new array reference
export function updateProductInList(products: ProductData[], index: number, field: keyof ProductData, value: any): ProductData[] {
  return products.map((p, i) => (i === index ? updateProductImmutable(p, field, value) : p));
}
