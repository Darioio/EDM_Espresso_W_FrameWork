import React, { useState, useEffect } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Stack from '@mui/material/Stack';
import Backdrop from '@mui/material/Backdrop';
import FormControl from '@mui/material/FormControl';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
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
  /** Optional padding for wrapper table (top,right,bottom,left in px) */
  wrapperPadding?: { top: number; right: number; bottom: number; left: number };
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
  brandName,
  wrapperPadding
}) => {
  // Modal state for the image selector
  const [showSelector, setShowSelector] = useState(false);
  const [descDialogOpen, setDescDialogOpen] = useState(false);
  const [mainRect, setMainRect] = useState<DOMRect | null>(null);
  const [selectedDesc, setSelectedDesc] = useState<'metadata' | 'p' | 'ul'>(descSource || 'metadata');
  const [overDescArea, setOverDescArea] = useState(false);
  const [overDescIcon, setOverDescIcon] = useState(false);

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

  // Responsive Backdrop logic for both selectors: track right panel or main element.
  useEffect(() => {
    if (!(showSelector || descDialogOpen)) return;

    const getTarget = (): HTMLElement | null => {
      const right = document.querySelector('.right-panel') as HTMLElement | null;
      if (right) return right;
      const main = document.querySelector('main') as HTMLElement | null;
      return main;
    };

    const updateRect = () => {
      const el = getTarget();
      if (el) setMainRect(el.getBoundingClientRect());
    };

    // Initial compute
    updateRect();

    // Window resize
    window.addEventListener('resize', updateRect);

    // Scroll listeners (in case of scrollable containers)
    const el = getTarget();
    el?.addEventListener('scroll', updateRect, { passive: true } as any);
    document.addEventListener('scroll', updateRect, { passive: true } as any);

    // Observe target element size changes
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => updateRect());
      const target = getTarget();
      if (target) ro.observe(target);
    }

    return () => {
      window.removeEventListener('resize', updateRect);
      el?.removeEventListener('scroll', updateRect as any);
      document.removeEventListener('scroll', updateRect as any);
      ro?.disconnect();
    };
  }, [showSelector, descDialogOpen]);

  useEffect(() => {
    // keep dialog selection in sync with current prop when dialog opens
    if (descDialogOpen) setSelectedDesc(descSource || 'metadata');
  }, [descDialogOpen, descSource]);

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
          whiteSpace: 'pre-wrap',
          transition: 'opacity 0.2s ease-in-out'
        }}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          const text = e.currentTarget.innerText.replace(/\n$/, '');
          updateProduct(index, 'title', text);
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.5';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
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
          style={{
            transition: 'opacity 0.2s ease-in-out'
          }}
          onBlur={(e) => {
            const value = e.currentTarget.innerText.replace(/\$/g, '').trim();
            updateProduct(index, 'price', value);
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          {product.price ? `$${product.price}` : 'Price'}
        </span>
      </p>

      {/* Description with per-product source selector (edit icon + dialog) */}
      <div
        style={{ position: 'relative', overflow: 'hidden' }}
        onMouseEnter={() => setOverDescArea(true)}
        onMouseLeave={() => setOverDescArea(false)}
      >
        {((descSource || 'metadata') === 'ul' && (product as any).descriptionUl) ? (
          <ul
            style={{
              margin: '0 0 16px 0',
              fontFamily: "'Montserrat',Arial,Helvetica,sans-serif",
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#333333',
              paddingLeft: 24,
              transition: 'opacity 0.2s ease-in-out'
            }}
          >
            {(() => {
              // Parse HTML to extract bullets
              const html = (product as any).descriptionUl as string;
              const tmp = typeof window !== 'undefined' ? document.createElement('div') : null;
              if (tmp) {
                tmp.innerHTML = html;
                const bullets = Array.from(tmp.querySelectorAll('li'));
                return bullets.length > 0 ? bullets.map((li, i) => (
                  <li
                    key={i}
                    contentEditable
                    suppressContentEditableWarning
                    style={{ outline: 'none' }}
                    onBlur={e => {
                      // Collect all li text and update as HTML
                      const ul = e.currentTarget.parentElement;
                      if (ul) {
                        const items = Array.from(ul.children).map(child => `<li>${(child as HTMLElement).innerText}</li>`).join('');
                        updateProduct(index, 'descriptionUl', `<ul>${items}</ul>`);
                      }
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.5'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  >
                    {li.textContent}
                  </li>
                )) : <li contentEditable suppressContentEditableWarning>Bullet</li>;
              }
              return null;
            })()}
          </ul>
        ) : (
          <p
            style={{
              margin: '0 0 16px 0',
              fontFamily: "'Montserrat',Arial,Helvetica,sans-serif",
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#333333',
              whiteSpace: 'pre-wrap',
              transition: 'opacity 0.2s ease-in-out'
            }}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              const text = e.currentTarget.innerText.replace(/\n$/, '');
              updateProduct(index, 'description', text);
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.5'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            {((descSource || 'metadata') === 'p' && (product as any).descriptionP) ? (product as any).descriptionP : (product.description || 'Description')}
          </p>
        )}
        {/* Floating edit icon for description source (moved after p/ul in DOM) */}
        <div
          className="edit-copy-icon"
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
            zIndex: 2,
            transform: (overDescArea || overDescIcon || descDialogOpen) ? 'translateY(-38px)' : 'translateY(0)',
            transition: 'transform 0.3s ease-in-out'
          }}
          onMouseEnter={() => setOverDescIcon(true)}
          onMouseLeave={() => setOverDescIcon(false)}
          onClick={(e) => {
            e.stopPropagation();
            setDescDialogOpen(true);
          }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M14.69 3.1l6.2 6.2c.27.27.27.7 0 .97l-8.2 8.2c-.17.17-.39.26-.62.26H6.5c-.55 0-1-.45-1-1v-5.57c0-.23.09-.45.26-.62l8.2-8.2c.27-.27.7-.27.97 0zM5 20h14v2H5v-2z" />
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
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          updateProduct(index, 'ctaLabel', e.currentTarget.innerText.trim() || 'SHOP NOW')
                        }
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
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
        style={{ 
          position: 'relative', 
          cursor: thumbs.length > 1 ? 'pointer' : 'default',
          overflow: 'hidden'
        }}
        onClick={openSelector}
        onMouseEnter={(e) => {
          const img = e.currentTarget.querySelector('img');
          const editIcon = e.currentTarget.querySelector('.edit-icon') as HTMLDivElement;
          if (img) img.style.opacity = '0.7';
          if (editIcon) editIcon.style.transform = 'translateY(-38px)';
        }}
        onMouseLeave={(e) => {
          const img = e.currentTarget.querySelector('img');
          const editIcon = e.currentTarget.querySelector('.edit-icon') as HTMLDivElement;
          if (img) img.style.opacity = '1';
          if (editIcon) editIcon.style.transform = 'translateY(0)';
        }}
      >
        <img
          src={product.image}
          alt={(product as any).imageAlt || product.title || brandName || ''}
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            outline: 0,
            textDecoration: 'none',
            transition: 'opacity 0.2s ease-in-out',
            border: '1px solid rgba(0, 0, 0, 0.2)'
          }}
        />
        {/* Edit icon overlay; only show if there are additional images. */}
        {thumbs.length > 1 && (
          <div
            className="edit-icon"
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
                style={{ 
                  maxWidth: '600px', 
                  margin: '0 auto', 
                  background: '#FFFFFF',
                  padding: wrapperPadding ? `${wrapperPadding.top}px ${wrapperPadding.right}px ${wrapperPadding.bottom}px ${wrapperPadding.left}px` : undefined
                }}
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
      {/* MUI Dialog for image selection, centered in right panel */}
      {showSelector && thumbs.length > 1 && mainRect && (
        <Backdrop
          open={showSelector}
          sx={{
            left: mainRect.left,
            top: mainRect.top,
            width: mainRect.width,
            height: mainRect.height,
            zIndex: 1200,
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
          onClick={closeSelector}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#fff',
              borderRadius: 6,
              minWidth: 320,
              maxWidth: 580,
              width: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <DialogTitle sx={{ bgcolor: '#F9FAFB', borderRadius: 1}}>
              Select Product Image
            </DialogTitle>
            <DialogContent dividers>
              <ImageList cols={5} gap={6} sx={{ m: 0.5 }}>
                {thumbs.map((img) => {
                  const isSelected = normalizeImage(img) === mainImage;
                  return (
                    <ImageListItem
                      key={img}
                      sx={{
                        cursor: 'pointer',
                        overflow: 'hidden',
                        borderRadius: 1,
                        border: isSelected ? '2px solid var(--color-primary)' : '2px solid #e0e0e0',
                        transition: 'opacity .15s ease, border-color .15s ease, box-shadow .15s ease',
                        '& img': { transition: 'transform .4s ease' },
                        '&:hover': { opacity: 1, borderColor: 'var(--color-primary)', boxShadow: '0 0 0 1px rgba(0,0,0,0.02)' },
                        '&:hover img': { transform: 'scale(1.075)' }
                      }}
                    >
                      <img
                        src={img}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onClick={() => handleSelectImage(img)}
                      />
                    </ImageListItem>
                  );
                })}
              </ImageList>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeSelector} variant="outlined">Close</Button>
            </DialogActions>
          </div>
        </Backdrop>
      )}
      {/* Dialog for choosing description source */}
      {descDialogOpen && mainRect && (
        <Backdrop
          open={descDialogOpen}
          sx={{
            left: mainRect.left,
            top: mainRect.top,
            width: mainRect.width,
            height: mainRect.height,
            zIndex: 1200,
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
          onClick={() => setDescDialogOpen(false)}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#fff',
              borderRadius: 6,
              minWidth: 360,
              maxWidth: 640,
              width: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <DialogTitle sx={{ bgcolor: '#F9FAFB', borderRadius: 1 }}>
              Choose Description
            </DialogTitle>
            <DialogContent dividers>
              <FormControl>
                <RadioGroup
                  value={selectedDesc}
                  onChange={(e) => setSelectedDesc(e.target.value as 'metadata' | 'p' | 'ul')}
                >
                  <FormControlLabel value="metadata" control={<Radio />} label="Page metadata" />
                  <FormControlLabel value="p" control={<Radio />} disabled={!((product as any).descriptionP)} label="First paragraph" />
                  <FormControlLabel value="ul" control={<Radio />} disabled={!((product as any).descriptionUl)} label="Bullet list" />
                </RadioGroup>
              </FormControl>
              <div style={{ marginTop: 12, borderTop: '1px solid #eee', paddingTop: 12 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Preview</div>
                {selectedDesc === 'ul' && (product as any).descriptionUl ? (
                  <div dangerouslySetInnerHTML={{ __html: (product as any).descriptionUl }} />
                ) : (
                  <p style={{ margin: 0 }}>
                    {selectedDesc === 'p' && (product as any).descriptionP ? (product as any).descriptionP : (product.description || '')}
                  </p>
                )}
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDescDialogOpen(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={() => {
                  onChangeDescSource?.(selectedDesc);
                  setDescDialogOpen(false);
                }}
              >
                Use this
              </Button>
            </DialogActions>
          </div>
        </Backdrop>
      )}
    </>
  );
};

export default React.memo(ProductTableModule);
