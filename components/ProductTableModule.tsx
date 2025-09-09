import React, { useState } from 'react';
import { ProductData } from './EditableModule';
import { uniqueImages, normalizeImage } from '../lib/imageUtils';

interface ProductTableModuleProps {
  product: ProductData;
  index: number;
  orientation: 'left-image' | 'right-image';
  updateProduct: (index: number, field: keyof ProductData, value: string) => void;
  /** Optional bottom padding for the outer 600px table */
  paddingBottom?: number;
  /** Callback when the module is interacted with */
  onActivate?: () => void;
  /** Background colour for the CTA button */
  ctaBg: string;
}

const ProductTableModule: React.FC<ProductTableModuleProps> = ({
  product,
  index,
  orientation,
  updateProduct,
  paddingBottom,
  onActivate,
  ctaBg
}) => {
  // Modal state for the image selector
  const [showSelector, setShowSelector] = useState(false);

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

      {/* Description */}
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
        {product.description || 'Description'}
      </p>

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

            {/* Colours (right) */}
            <td align="right" valign="middle" style={{ padding: 0 }}>
              {(() => {
                const rawColours = Array.isArray(product.colors) ? product.colors : [];
                const colours = rawColours
                  .filter((c) => typeof c === 'string' && c.trim() && !/^(#?fff(?:fff)?|#?f7f7f7)$/i.test(c.trim()))
                  .slice(0, 3);
                if (colours.length === 0) return null;

                const cells: JSX.Element[] = [];
                colours.forEach((col, idx) => {
                  cells.push(<td key={idx} width="24" height="24" style={{ background: col as string }} />);
                  if (idx < colours.length - 1) cells.push(<td key={`spacer-${idx}`} width="8" />);
                });
                if (rawColours.length > colours.length) {
                  if (cells.length > 0) cells.push(<td key="spacer-plus" width="8" />);
                  cells.push(
                    <td
                      key="plus"
                      width="24"
                      height="24"
                      style={{
                        background: '#ffffff',
                        textAlign: 'center',
                        lineHeight: '24px',
                        fontFamily: "'Montserrat',Arial,Helvetica,sans-serif",
                        fontSize: '14px',
                        color: '#333333'
                      }}
                    >
                      +
                    </td>
                  );
                }

                return (
                  <table role="presentation" cellPadding={0} cellSpacing={0} border={0} style={{ margin: 0, padding: 0 }}>
                    <tbody>
                      <tr>{cells}</tr>
                    </tbody>
                  </table>
                );
              })()}
            </td>
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
          alt={product.title}
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
        style={{ margin: '0', padding: '0', background: '#F7F7F7' }}
        onClick={onActivate}
      >
        <tbody>
          {/* Main row */}
          <tr>
            <td align="center" style={{ margin: 0, padding: 0, background: '#F7F7F7' }}>
              <table
                role="presentation"
                width="100%"
                cellPadding={0}
                cellSpacing={0}
                border={0}
                style={{ maxWidth: '600px', margin: '0 auto', background: '#FFFFFF', paddingBottom: paddingBottom ? `${paddingBottom}px` : undefined }}
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
      {showSelector && thumbs.length > 1 && (
        <div
          className="image-selector-overlay"
          style={{ width: '100%' }}
          onClick={closeSelector}
        >
          <div className="image-selector" onClick={(e) => e.stopPropagation()}>
            {thumbs.map((img) => {
              const isSelected = normalizeImage(img) === mainImage;
              return (
                <img
                  key={img}
                  src={img}
                  alt=""
                  style={{
                    border: isSelected ? '2px solid #d19aa0' : '2px solid transparent',
                    boxSizing: 'border-box'
                  }}
                  onClick={() => handleSelectImage(img)}
                />
              );
            })}
            <button
              onClick={closeSelector}
              style={{
                marginTop: 0,
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductTableModule;
