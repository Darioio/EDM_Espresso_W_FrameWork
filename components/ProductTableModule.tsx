import React from 'react';
// Use MUI's internal TouchRipple for material ripple feedback on click
// Note: This is an internal import path provided by MUI
// Types are avoided to prevent coupling to internal typings
// eslint-disable-next-line import/no-extraneous-dependencies
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';
import DescriptionSourceDialog, { DescSource } from './shared/DescriptionSourceDialog';
import { ImageSelector } from './shared/ImageSelector';
import { useLiveEditable } from '../lib/useLiveEditable';
import { sanitizeInlineHtml, sanitizeEmailHtml } from '../lib/sanitize';

function ProductTableModule(props: any) {

  // Render logic restored
  const {
  product,
  index,
  total, // total number of products in this section
  featureTemplate, // boolean: using feature template (image/copy variants)
    orientation,
    updateProduct,
    ctaBg,
    brandName,
    descSource,
    onChangeDescSource,
    onActivate,
    onProductFieldClick,
    ...rest
  } = props;

  // Title ref and live-edit binding (copy-only)
  const titleRef = React.useRef<HTMLHeadingElement | null>(null);
  useLiveEditable(
    () => titleRef.current,
    sanitizeInlineHtml((product?.title as string) || ''),
    (html) => {
      const cleaned = sanitizeInlineHtml(html || '');
      updateProduct(index, 'title', cleaned);
    },
    { debounceMs: 60, attributes: { contenteditable: 'true', spellcheck: 'false' } }
  );

  // Price ref and live-edit binding (copy-only; store without currency symbol)
  const priceRef = React.useRef<HTMLSpanElement | null>(null);
  useLiveEditable(
    () => priceRef.current,
    // Display with a leading $ if present
    sanitizeInlineHtml((product?.price ? `$${product.price}` : '') as string),
    (html) => {
      // Extract plain text and strip dollar signs
      let text = '';
      try {
        const div = document.createElement('div');
        div.innerHTML = html || '';
        text = (div.textContent || div.innerText || '').trim();
      } catch {
        text = (html || '').replace(/<[^>]*>/g, '').trim();
      }
      const value = text.replace(/\$/g, '').trim();
      updateProduct(index, 'price', value);
    },
    { debounceMs: 60, attributes: { contenteditable: 'true', spellcheck: 'false' } }
  );

  // Description ref and live-edit binding (copy-only), same pattern as Title but allow block tags (ul/ol/p)
  const descRef = React.useRef<HTMLDivElement | null>(null);
  useLiveEditable(
    () => descRef.current,
    sanitizeEmailHtml((product?.description as string) || ''),
    (html) => {
      // Store sanitized block HTML (preserve p/ul/ol/li and inline spans)
      const stored = sanitizeEmailHtml(html || '');
      updateProduct(index, 'description' as any, stored);
      // Also mirror to the variant fields so the right panel (which may be viewing a chosen source)
      // reflects immediately without needing descSource switching.
      try { updateProduct(index, 'metadataDescription' as any, stored); } catch {}
      try { updateProduct(index, 'descriptionP' as any, stored); } catch {}
      try { updateProduct(index, 'descriptionUl' as any, stored); } catch {}
    },
    { debounceMs: 60, attributes: { contenteditable: 'true', spellcheck: 'false' } }
  );

  // CTA label ref and live-edit binding (inline copy-only)
  const ctaRef = React.useRef<HTMLAnchorElement | null>(null);
  useLiveEditable(
    () => ctaRef.current,
    sanitizeInlineHtml(((product?.ctaLabel as string) || 'SHOP NOW') as string),
    (html) => {
      // Store cleaned inline HTML for label
      const cleaned = sanitizeInlineHtml(html || 'SHOP NOW');
      updateProduct(index, 'ctaLabel' as any, cleaned);
    },
    { debounceMs: 60, attributes: { contenteditable: 'true', spellcheck: 'false' } }
  );

  // Ripple overlay ref and handlers
  const rippleRef = React.useRef<any>(null);
  const handleRippleMouseDown = (e: React.MouseEvent) => {
    try { rippleRef.current?.start(e); } catch {}
  };
  const handleRippleMouseUp = (e: React.MouseEvent) => {
    try { rippleRef.current?.stop(e); } catch {}
  };
  const handleRippleMouseLeave = (e: React.MouseEvent) => {
    try { rippleRef.current?.stop(e); } catch {}
  };

  // Helper to sanitize and render HTML
  function renderSanitizedHtml(html: string, inline = false, fallback = ''): { __html: string } {
    if (!html) return { __html: fallback };
    const safe = inline ? sanitizeInlineHtml(html) : sanitizeEmailHtml(html);
    return { __html: safe };
  }

  // Helpers now imported from lib/htmlUtils

  // Helper to compute mirrored column padding
  const getColPadding = (position: 'left' | 'right') => position === 'left' ? '0px 12px 0px 0px' : '0px 0px 0px 12px';

  // Copy column (padding mirrors based on whether it sits left or right)
  const renderCopy = (position: 'left' | 'right') => (
    <td
      className="stack-cols"
      width="50%"
      valign="top"
      style={{ padding: getColPadding(position) }}
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
          whiteSpace: 'pre-wrap',
          transition: 'opacity 0.2s ease-in-out'
        }}
        ref={titleRef}
        contentEditable
        tabIndex={0}
        suppressContentEditableWarning
        onFocus={() => { try { onActivate && onActivate(); } catch {} }}
        onInput={() => { try { onActivate && onActivate(); } catch {} }}
        onClick={() => { try { onActivate && onActivate(); } catch {} try { onProductFieldClick && onProductFieldClick(); } catch {} }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.5';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
      />

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
          tabIndex={0}
          suppressContentEditableWarning
          style={{
            transition: 'opacity 0.2s ease-in-out'
          }}
          onFocus={() => { try { onActivate && onActivate(); } catch {} }}
          onInput={() => { try { onActivate && onActivate(); } catch {} }}
          onClick={() => { try { onActivate && onActivate(); } catch {} try { onProductFieldClick && onProductFieldClick(); } catch {} }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          ref={priceRef}
        />
      </p>

      {/* Description with per-product source selector (edit icon + dialog) */}
      <div
        style={{ position: 'relative', overflow: 'hidden' }}
        onMouseEnter={(e) => {
          const container = e.currentTarget as HTMLElement;
          const icon = container.querySelector('.edit-desc-icon') as HTMLElement | null;
          container.style.opacity = '0.5';
          if (icon) icon.style.transform = 'translateY(-38px)';
        }}
        onMouseLeave={(e) => {
          const container = e.currentTarget as HTMLElement;
          const icon = container.querySelector('.edit-desc-icon') as HTMLElement | null;
          container.style.opacity = '1';
          if (icon) icon.style.transform = 'translateY(0)';
        }}
      >
        {(() => {
          const descHtml = (product.description || '') as string;
          const isList = /<\s*(ul|ol)(\s|>)/i.test(descHtml);
          const whiteSpaceStyle: React.CSSProperties["whiteSpace"] = isList ? 'normal' : 'pre-wrap';
          return (
            <div
              style={{
                margin: '0 0 16px 0',
                fontFamily: "'Montserrat',Arial,Helvetica,sans-serif",
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#333333',
                whiteSpace: whiteSpaceStyle,
                transition: 'opacity 0.2s ease-in-out'
              }}
              contentEditable
              tabIndex={0}
              suppressContentEditableWarning
              onFocus={() => { try { onActivate && onActivate(); } catch {} }}
              onInput={() => { try { onActivate && onActivate(); } catch {} }}
              onClick={() => { try { onActivate && onActivate(); } catch {} try { onProductFieldClick && onProductFieldClick(); } catch {} }}
              ref={descRef}
            />
          );
        })()}
        {/* Edit description overlay icon */}
        <div
          className="edit-desc-icon"
          onClick={(e) => { e.stopPropagation(); setLocalDescSource((descSource as DescSource) || 'metadata'); setShowDescDialog(true); }}
          style={{
            position: 'absolute',
            bottom: -30,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: '#ffffff',
            borderRadius: '50%',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transform: 'translateY(0)',
            transition: 'transform 0.3s ease-in-out'
          }}
          aria-label="Change description source"
          title="Change description source"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
          </svg>
        </div>
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
                          textDecoration: 'none',
                          transition: 'opacity 0.2s ease-in-out'
                        }}
                        contentEditable
                        className="cta-label"
                        tabIndex={0}
                        suppressContentEditableWarning
                        onFocus={() => { try { onActivate && onActivate(); } catch {} }}
                        onInput={() => { try { onActivate && onActivate(); } catch {} }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); try { onActivate && onActivate(); } catch {} try { onProductFieldClick && onProductFieldClick(); } catch {} }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                        ref={ctaRef}
                      />
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

  // Image column
  const [showImageSelector, setShowImageSelector] = React.useState(false);
  const canSelectImage = Array.isArray(product?.images) && (product.images?.length || 0) > 0;
  const openImageSelector = () => {
    if (canSelectImage) setShowImageSelector(true);
  };
  const handleSelectImage = (img: string) => {
    updateProduct(index, 'image', img);
    setShowImageSelector(false);
  };

  const renderImage = (position: 'left' | 'right') => (
    <td
      className="stack-cols"
      width="50%"
      valign="top"
      style={{ padding: getColPadding(position) }}
    >
      <div
        className={`product-image-wrapper${canSelectImage ? ' selectable' : ''}`}
        style={{ position: 'relative', cursor: canSelectImage ? 'pointer' : 'default', overflow: 'hidden' }}
        onClick={openImageSelector}
        onMouseEnter={(e) => {
          const img = e.currentTarget.querySelector('img') as HTMLImageElement | null;
          const editIcon = e.currentTarget.querySelector('.edit-icon') as HTMLDivElement | null;
          if (img) img.style.opacity = '0.7';
          if (editIcon) editIcon.style.transform = 'translateY(-38px)';
        }}
        onMouseLeave={(e) => {
          const img = e.currentTarget.querySelector('img') as HTMLImageElement | null;
          const editIcon = e.currentTarget.querySelector('.edit-icon') as HTMLDivElement | null;
          if (img) img.style.opacity = '1';
          if (editIcon) editIcon.style.transform = 'translateY(0)';
        }}
      >
        <img
          src={product.image}
          alt={product.title || brandName || ''}
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            outline: 0,
            textDecoration: 'none',
            transition: 'opacity 0.2s ease-in-out'
          }}
        />
        {canSelectImage && (
          <div
            className="edit-icon"
            onClick={(e) => { e.stopPropagation(); openImageSelector(); }}
            style={{
              position: 'absolute',
              bottom: -30,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#ffffff',
              borderRadius: '50%',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transform: 'translateY(0)',
              transition: 'transform 0.3s ease-in-out'
            }}
            aria-label="Select product image"
            title="Select product image"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M14.69 3.1l6.2 6.2c.27.27.27.7 0 .97l-8.2 8.2c-.17.17-.39.26-.62.26H6.5c-.55 0-1-.45-1-1v-5.57c0-.23.09-.45.26-.62l8.2-8.2c.27-.27.7-.27.97 0zM5 20h14v2H5v-2z" />
            </svg>
          </div>
        )}
      </div>
    </td>
  );

  // Description source dialog state
  const [showDescDialog, setShowDescDialog] = React.useState(false);
  const [localDescSource, setLocalDescSource] = React.useState<DescSource>(descSource || 'metadata');
  // Sync the dialog selection with the product's current descSource whenever it opens
  React.useEffect(() => {
    if (showDescDialog) {
      setLocalDescSource((descSource as DescSource) || 'metadata');
    }
  }, [showDescDialog, descSource]);
  const previews = React.useMemo(() => ({
    metadata: (product as any).metadataDescription || (product as any).description || '',
    p: (product as any).descriptionP || '',
    ul: (product as any).descriptionUl || ''
  }), [product]);
  const handleApplyDescSource = () => {
    onChangeDescSource && onChangeDescSource(localDescSource);
    setShowDescDialog(false);
  };

  return (
    <>
      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} align="center" style={{ margin:0, padding:0 }} onClick={() => { try { onActivate && onActivate(); } catch {} }}>
        <tbody>
          <tr>
            <td align="center" style={{ margin:0, padding:0 }}>
              <div
                onMouseDown={handleRippleMouseDown}
                onMouseUp={handleRippleMouseUp}
                onMouseLeave={handleRippleMouseLeave}
                style={{ maxWidth:'600px', margin:'0 auto', position:'relative', overflow:'hidden', background:'#FFFFFF', color:'var(--color-accent)' }}
              >
                <TouchRipple ref={rippleRef} center={false} />
                <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ margin:0, padding:0 }}>
                  <tbody>
                    <tr>
                      <td style={{ margin:0, padding:0 }}>
                        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} className="module-pad" style={{ width:'100%', margin:0, padding: `${(featureTemplate && total > 1 && index > 0) ? '0 25px 25px 25px' : '25px'}` }}>
                          <tbody>
                            <tr>
                              {orientation === 'left-image' ? (
                                <>
                                  {renderImage('left')}
                                  {renderCopy('right')}
                                </>
                              ) : (
                                <>
                                  {renderCopy('left')}
                                  {renderImage('right')}
                                </>
                              )}
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      {/* Description source selector dialog with consistent styling and preview */}
      <DescriptionSourceDialog
        open={showDescDialog}
        selected={localDescSource}
        onChange={(s) => setLocalDescSource(s)}
        onApply={handleApplyDescSource}
        onClose={() => setShowDescDialog(false)}
        previews={previews}
      />
      {/* Image selector dialog overlay (positioned over preview panel) */}
      <ImageSelector
        images={product.images || []}
        selected={product.image}
        open={showImageSelector}
        onSelect={handleSelectImage}
        onClose={() => setShowImageSelector(false)}
      />
    </>
  );
}

export default ProductTableModule;


