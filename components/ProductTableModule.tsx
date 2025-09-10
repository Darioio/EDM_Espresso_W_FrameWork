import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { ProductData } from '../lib/types';
import { uniqueImages, normalizeImage } from '../lib/imageUtils';

interface ProductTableModuleProps {
  product: ProductData;
  index: number;
  orientation: 'left-image' | 'right-image';
  updateProduct: (index: number, field: keyof ProductData, value: string) => void;
  /** Callback when the module is interacted with */
  onActivate?: () => void;
  /** Background colour for the CTA button */
  ctaBg: string;
  /** Ref to right-panel container to bound fixed overlay */
  overlayContainerRef?: React.RefObject<HTMLElement>;
  /** Per-product description source override */
  descSource?: 'metadata' | 'p' | 'ul';
  onChangeDescSource?: (source: 'metadata' | 'p' | 'ul') => void;
  /** Brand name for fallback alt text */
  brandName?: string;
}

const ProductTableModule: React.FC<ProductTableModuleProps> = ({
  product,
  index,
  orientation,
  updateProduct,
  onActivate,
  ctaBg,
  overlayContainerRef,
  descSource,
  onChangeDescSource,
  brandName
}) => {
  // Modal state for the image selector
  const [showSelector, setShowSelector] = useState(false);
  const [descDialogOpen, setDescDialogOpen] = useState(false);

  /**
   * Build the list of selectable thumbnails without mutating or duplicating
   * the underlying images array. All product images remain available in their
   * original order, and the current main image is included only if it does not
   * already exist in the list. URLs are normalised and de‑duplicated while
   * preserving the first occurrence of each entry.
   */
  const allImages = product.images ? [...product.images] : [];
  if (product.image && !allImages.includes(product.image)) {
    allImages.unshift(product.image);
  }
  const thumbs = uniqueImages(allImages);
  const mainImage = normalizeImage(product.image || '');
  const openSelector = () => {
    if (thumbs.length > 1) setShowSelector(true);
  };
  const closeSelector = () => setShowSelector(false);

  const handleSelectImage = (src: string) => {
    updateProduct(index, 'image', src);
    setShowSelector(false);
  };

  const renderCopy = () => (
    <td
      className="stack-cols"
      width="50%"
      valign="top"
      style={{ padding: '0 8px' }}
    >
      {/* Title */}
      <h2
        style={{
          margin: '0 0 10px 0',
          fontFamily: "'Montserrat',Arial,Helvetica,sans-serif",
          fontSize: '26px',
          lineHeight: '1.2',
          color: '#111111',
          fontWeight: 300,
          whiteSpace: 'pre-wrap'
        }}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          const text = e.currentTarget.innerText.replace(/\n$/, '');
          updateProduct(index, 'title', text);
        }}
      >
        {product.title || 'Product title'}
      </h2>

      {/* Price (original crossed + sale/current editable) */}
      <p
        style={{
          margin: '0 0 10px 0',
          fontFamily: "'Montserrat',Arial,Helvetica,sans-serif",
          fontSize: '16px',
          lineHeight: '1',
          color: '#111111',
          fontWeight: 600
        }}
      >
        {product.originalPrice && (
          <span style={{ textDecoration: 'line-through', marginRight: '8px', fontWeight: 400 }}>
            ${product.originalPrice}
          </span>
        )}
        <span
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            const value = e.currentTarget.innerText.replace(/\$/g, '').trim();
            updateProduct(index, 'price', value);
          }}
        >
          {product.price ? `$${product.price}` : 'Price'}
        </span>
      </p>

      {/* Description with per-product source selector */}
      <div style={{ position: 'relative' }}>
        {(descSource || 'metadata') === 'ul' && (product as any).descriptionUl ? (
          <div
            style={{
              margin: '0 0 16px 0',
              fontFamily: "'Montserrat',Arial,Helvetica,sans-serif",
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#333333'
            }}
            dangerouslySetInnerHTML={{ __html: (product as any).descriptionUl as any }}
          />
        ) : (
          <p
            style={{
              margin: '0 0 16px 0',
              fontFamily: "'Montserrat',Arial,Helvetica,sans-serif",
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#333333',
              whiteSpace: 'pre-wrap'
            }}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              const text = e.currentTarget.innerText.replace(/\n$/, '');
              updateProduct(index, 'description', text);
            }}
          >
            {((descSource || 'metadata') === 'p' && (product as any).descriptionP) ? (product as any).descriptionP : (product.description || 'Description')}
          </p>
        )}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setDescDialogOpen(true);
          }}
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: '#ffffff',
            borderRadius: '50%',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title="Change description source"
          aria-label="Change description source"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M14.69 3.1l6.2 6.2c.27.27.27.7 0 .97l-8.2 8.2c-.17.17-.39.26-.62.26H6.5c-.55 0-1-.45-1-1v-5.57c0-.23.09-.45.26-.62l8.2-8.2c.27-.27.7-.27.97 0zM5 20h14v2H5v-2z" />
          </svg>
        </div>
        <Dialog open={descDialogOpen} onClose={() => setDescDialogOpen(false)} onClick={(e) => e.stopPropagation()}>
          <DialogTitle>Select description source</DialogTitle>
          <List sx={{ pt: 0 }}>
            {(['metadata','p','ul'] as const).map((opt) => (
              <ListItemButton
                key={opt}
                onClick={() => { onChangeDescSource?.(opt); setDescDialogOpen(false); }}
              >
                <ListItemText
                  primary={opt === 'metadata' ? 'Metadata' : opt === 'p' ? 'Description' : 'Bullet List'}
                />
              </ListItemButton>
            ))}
          </List>
        </Dialog>
      </div>

      {/* CTA + Colours row */}
      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ margin: 0, padding: 0 }}>
        <tbody>
          <tr>
            {/* CTA (left) */}
            <td align="left" valign="middle" style={{ padding: 0, whiteSpace: 'nowrap' }}>
              <table role="presentation" cellPadding={0} cellSpacing={0} border={0} style={{ margin: 0, padding: 0 }}>
                <tbody>
                  <tr>
                    <td align="center" style={{ background: ctaBg }}>
                      <a
                        href={product.cta || product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block',
                          padding: '12px 22px',
                          fontFamily: "'Montserrat',Arial,Helvetica,sans-serif",
                          fontSize: '14px',
                          lineHeight: '14px',
                          color: '#ffffff',
                          textDecoration: 'none'
                        }}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          updateProduct(index, 'ctaLabel', e.currentTarget.innerText.trim() || 'SHOP NOW')
                        }
                      >
                        {product.ctaLabel || 'SHOP NOW'}
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>

            {/* Spacer */}
            <td width="12" style={{ fontSize: 0, lineHeight: 0 }}>&nbsp;</td>

            {/* Colour swatches removed per requirements */}
          </tr>
        </tbody>
      </table>
    </td>
  );

  const renderImage = () => (
    <td className="stack-cols" width="50%" valign="top" style={{ padding: '0 8px' }}>
      <div
        style={{ position: 'relative', cursor: thumbs.length > 1 ? 'pointer' : 'default' }}
        onClick={openSelector}
      >
        <img
          src={product.image}
          alt={(product as any).imageAlt || product.title || brandName || ''}
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            border: 0,
            outline: 0,
            textDecoration: 'none'
          }}
        />
        {/* Edit icon overlay; only show if there are additional images. */}
        {thumbs.length > 1 && (
          <div
            className="edit-icon"
            onClick={(e) => {
              e.stopPropagation();
              onActivate?.();
              openSelector();
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M14.69 3.1l6.2 6.2c.27.27.27.7 0 .97l-8.2 8.2c-.17.17-.39.26-.62.26H6.5c-.55 0-1-.45-1-1v-5.57c0-.23.09-.45.26-.62l8.2-8.2c.27-.27.7-.27.97 0zM5 20h14v2H5v-2z" />
            </svg>
          </div>
        )}
      </div>
    </td>
  );

  return (
    <>
      <table
        role="presentation"
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        border={0}
        align="center"
        style={{ margin: '0', padding: '0' }}
        onClick={onActivate}
      >
        <tbody>
          {/* Main row */}
          <tr>
            <td align="center" style={{ margin: 0, padding: 0 }}>
              <table
                role="presentation"
                width="100%"
                cellPadding={0}
                cellSpacing={0}
                border={0}
                style={{ maxWidth: '600px', margin: '0 auto', background: '#FFFFFF' }}
              >
                <tbody>
                  <tr>
                    <td style={{ padding: '24px 16px' }}>
                      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ width: '100%', margin: 0, padding: 0 }}>
                        <tbody>
                          <tr>
                            {/* Orientation determines order */}
                            {orientation === 'left-image' ? (
                              <>
                                {renderImage()}
                                {renderCopy()}
                              </>
                            ) : (
                              <>
                                {renderCopy()}
                                {renderImage()}
                              </>
                            )}
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      {/* Right-panel overlay selector */}
      {showSelector && thumbs.length > 1 && (() => {
        const rect = overlayContainerRef?.current?.getBoundingClientRect();
        const overlayStyle: React.CSSProperties = rect ? {
          position: 'fixed', left: rect.left, top: 0, width: rect.width, height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        } : { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
        return (
          <div onClick={closeSelector} style={overlayStyle}>
            <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: 8, maxWidth: '90%', maxHeight: '80%', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-2)', justifyContent: 'center' }}>
              {thumbs.map((img) => {
                const isSelected = normalizeImage(img) === mainImage;
                return (
                  <img key={img} src={img} alt="" style={{ border: isSelected ? '2px solid #d19aa0' : '2px solid transparent', boxSizing: 'border-box', width: 120, height: 120, objectFit: 'cover', borderRadius: 6 }} onClick={() => handleSelectImage(img)} />
                );
              })}
              <button onClick={closeSelector} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        );
      })()}
    </>
  );
};

export default React.memo(ProductTableModule);
