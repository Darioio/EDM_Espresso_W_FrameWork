import { updateProductImmutable, updateProductInList } from '../lib/updateProduct';
import { ProductData } from '../lib/types';

describe('updateProductImmutable', () => {
  const base: ProductData = {
    title: 'Tee',
    url: 'https://example.com/p',
    price: '$10',
    description: 'Meta desc',
    metadataDescription: 'Meta desc',
    originalMetadataDescription: 'Meta desc',
    descriptionP: 'Paragraph desc',
    descriptionUl: '<ul><li>One</li></ul>',
    descSource: 'metadata'
  } as any;

  it('switching descSource updates description only for that product', () => {
    const p2 = updateProductImmutable(base, 'descSource', 'p' as any);
    expect(p2.description).toBe(base.descriptionP);
    expect(base.description).toBe('Meta desc');
  });

  it('restores original metadata when switching back from p to metadata even if metadataDescription was changed', () => {
    const editedMeta = { ...base, metadataDescription: 'Edited meta', originalMetadataDescription: 'Original Meta', description: 'Edited meta' } as ProductData;
    const toP = updateProductImmutable(editedMeta, 'descSource', 'p' as any);
    expect(toP.description).toBe(editedMeta.descriptionP);
    const back = updateProductImmutable(toP, 'descSource', 'metadata' as any);
    // Should prefer current metadataDescription if present, else originalMetadataDescription
    expect(back.description).toBe('Edited meta');
  });

  it('uses originalMetadataDescription when metadataDescription missing on return', () => {
    const noCurrentMeta: ProductData = { ...base, metadataDescription: undefined, originalMetadataDescription: 'Orig Only', description: 'Orig Only' } as any;
    const toUl = updateProductImmutable(noCurrentMeta, 'descSource', 'ul' as any);
    expect(toUl.description).toBe(noCurrentMeta.descriptionUl);
    const back = updateProductImmutable(toUl, 'descSource', 'metadata' as any);
    expect(back.description).toBe('Orig Only');
  });

  it('editing descriptionP while descSource=p updates description', () => {
    const withP = { ...base, descSource: 'p', description: base.descriptionP } as ProductData;
    const p2 = updateProductImmutable(withP, 'descriptionP', 'New P' as any);
    expect(p2.description).toBe('New P');
  });
});

describe('updateProductInList', () => {
  const list: ProductData[] = [
    { title: 'A', url: 'u1', price: '$', description: 'D1', metadataDescription: 'D1', descSource: 'metadata' } as any,
    { title: 'B', url: 'u2', price: '$', description: 'D2', metadataDescription: 'D2', descSource: 'metadata' } as any
  ];
  it('only mutates targeted index', () => {
    const updated = updateProductInList(list, 0, 'descSource', 'p' as any);
    expect(updated[0]).not.toBe(list[0]);
    expect(updated[1]).toBe(list[1]);
  });
});
