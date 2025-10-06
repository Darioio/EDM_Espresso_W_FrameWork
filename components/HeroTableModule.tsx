import React, { useState, useEffect, useRef } from 'react';
import { HERO_MARGIN_PADDING_DESKTOP, HERO_MARGIN_PADDING_MOBILE } from '../lib/constants';
import { createPortal } from 'react-dom';
import { uniqueImages } from '../lib/imageUtils';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Button from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';

interface HeroTableModuleProps {
  /** Selected hero image URL */
  heroImage: string;
  /** Optional alt text for the hero image */
  heroAlt: string;
  /** Optional link that wraps the hero image */
  heroHref: string;
  /** List of alternate hero images extracted from the carousel */
  heroImages: string[];
  /** Callback to update hero properties. Pass the field name and new value. */
  updateHero: (field: 'image' | 'alt' | 'href', value: string) => void;

  /** Identifier of the selected hero template. Allows the preview
   *  component to adjust margins/padding to more closely match the
   *  selected template. Unknown ids fall back to the default style. */
  templateId?: string;
  /** Callback when the module is interacted with */
  onActivate?: () => void;
  /** Optional padding for wrapper table (top,right,bottom,left in px) */
  wrapperPadding?: { top: number; right: number; bottom: number; left: number };
}

/**
 * HeroTableModule renders a single hero section using the same
 * table-based structure as the email template. The hero
 * consists of a single image wrapped in an anchor. An edit
 * icon overlays the image; clicking it opens a modal overlay
 * listing all available hero images. Selecting a thumbnail
 * updates the heroImage via the parent callback. A close
 * button dismisses the overlay. Inline styles mirror the
 * markup used in the email template so the preview closely
 * matches the final generated HTML.
 */

const HeroTableModule: React.FC<HeroTableModuleProps> = ({
  heroImage,
  heroAlt,
  heroHref,
  heroImages,
  updateHero,
  templateId,
  onActivate,
  wrapperPadding
}) => {
  const [showSelector, setShowSelector] = useState(false);
  const [mainRect, setMainRect] = useState<DOMRect | null>(null);
  const availableImages = uniqueImages(heroImages);

  useEffect(() => {
    if (!showSelector) return;

    const getTarget = (): HTMLElement | null => {
      const preview = document.getElementById('preview') as HTMLElement | null;
      if (preview) return preview;
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

    // Scroll listeners
    const el = getTarget();
    el?.addEventListener('scroll', updateRect, { passive: true } as any);
    document.addEventListener('scroll', updateRect, { passive: true } as any);

    // Observe the target element for size changes
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
  }, [showSelector]);

  const openSelector = () => {
    if (availableImages.length > 0) {
      setShowSelector(true);
    }
  };
  const closeSelector = () => {
    setShowSelector(false);
  };
  const handleSelect = (img: string) => {
    updateHero('image', img);
    setShowSelector(false);
  };

  // Determine default template padding. The 'hero-margins' template adds:
  //  - Outer table padding: 25px on all sides
  //  - Inner wrapper horizontal padding: 25px (top/bottom 0)
  // User-provided wrapperPadding (heroPadding) should override ONLY if any side is non‑zero.
  const isHeroMargins = templateId === 'hero-margins';
  // Track whether layout is "compact" (preview area narrower than 600px)
  const [isCompact, setIsCompact] = useState(false);
  const tableRef = useRef<HTMLTableElement | null>(null);

  useEffect(() => {
    if (!isHeroMargins) return; // Only matters for hero-margins template
    const observeEl = () => tableRef.current?.parentElement || tableRef.current;

    const measure = () => {
      const el = observeEl();
      if (!el) return;
      const width = el.clientWidth;
      // Compact threshold: strictly less than 600px (matching email wrapper max)
      setIsCompact(width < 600);
    };
    measure();
    window.addEventListener('resize', measure);
    let ro: ResizeObserver | undefined;
    const target = observeEl();
    if (target && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => measure());
      ro.observe(target);
    }
    return () => {
      window.removeEventListener('resize', measure);
      ro?.disconnect();
    };
  }, [isHeroMargins]);
  const hasCustomWrapperPadding = !!wrapperPadding && (
    wrapperPadding.top !== 0 ||
    wrapperPadding.right !== 0 ||
    wrapperPadding.bottom !== 0 ||
    wrapperPadding.left !== 0
  );
  // Base padding value for hero-margins template (uniform on all sides). Shrinks in compact mode.
  const basePad = isHeroMargins ? (isCompact ? HERO_MARGIN_PADDING_MOBILE : HERO_MARGIN_PADDING_DESKTOP) : 0;
  // If user provided any non-zero custom wrapper padding, respect that fully; otherwise apply uniform padding for hero-margins.
  const innerPadding = hasCustomWrapperPadding
    ? `${wrapperPadding!.top}px ${wrapperPadding!.right}px ${wrapperPadding!.bottom}px ${wrapperPadding!.left}px`
    : (isHeroMargins ? `${basePad}px` : '0');

  return (
    <>
      <table
        role="presentation"
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        border={0}
        align="center"
        ref={tableRef}
        // Outer table mirrors template defaults (adds padding when hero-margins; shrinks on narrow width)
        onClick={onActivate}
      >
        <tbody>
          <tr>
            <td align="center" style={{ margin: 0, padding: 0 }}>
              {/* Wrapper */}
              <table
                role="presentation"
                width="100%"
                cellPadding={0}
                cellSpacing={0}
                border={0}
                style={{
                  maxWidth: '600px',
                  margin: '0 auto',
                  padding: innerPadding,
                  background: '#FFFFFF'
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ padding: 0 }}>
                      <div
                        className={`hero-image-wrapper${availableImages.length > 0 ? ' selectable' : ''}`}
                        style={{ 
                          position: 'relative', 
                          cursor: availableImages.length > 0 ? 'pointer' : 'default',
                          overflow: 'hidden'
                        }}
                        onClick={() => {
                          if (availableImages.length > 0) {
                            openSelector();
                          }
                        }}
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
                          src={heroImage || ''}
                          alt={heroAlt || ''}
                          style={{ 
                            display: 'block', 
                            width: '100%', 
                            height: 'auto', 
                            border: 0, 
                            outline: 0, 
                            textDecoration: 'none',
                            transition: 'opacity 0.2s ease-in-out'
                          }}
                        />
                        {heroImages && heroImages.length > 0 && (
                          <div
                            className="edit-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onActivate?.();
                              openSelector();
                            }}
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
                            aria-label="Select hero image"
                            title="Select hero image"
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                              <path d="M14.69 3.1l6.2 6.2c.27.27.27.7 0 .97l-8.2 8.2c-.17.17-.39.26-.62.26H6.5c-.55 0-1-.45-1-1v-5.57c0-.23.09-.45.26-.62l8.2-8.2c.27-.27.7-.27.97 0zM5 20h14v2H5v-2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      {/* Backdrop and Dialog only inside <main> panel */}
      {showSelector && mainRect && typeof document !== 'undefined' && createPortal(
        <Backdrop
          open={showSelector}
          sx={{
            position: 'fixed',
            left: mainRect.left,
            top: mainRect.top,
            width: mainRect.width,
            height: mainRect.height,
            right: 'auto',
            bottom: 'auto',
            zIndex: 1200,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={closeSelector}
        >
          <div
            style={{
              position: 'relative',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              borderRadius: 6,
              minWidth: 320,
              maxWidth: 580,
              width: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <DialogTitle sx={{ bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider', borderTopLeftRadius: 4, borderTopRightRadius: 4}}>
              Select Hero Image
            </DialogTitle>
            <DialogContent dividers>
              <ImageList cols={4} gap={6} sx={{ mb: 0.5 }}>
                {availableImages.map((img) => (
                  <ImageListItem
                    key={img}
                    sx={{
                      cursor: 'pointer',
                      overflow: 'hidden',
                      borderRadius: 1,
                      border: '2px solid',
                      borderColor: img === heroImage ? 'var(--color-primary)' : 'divider',
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
                      onClick={() => handleSelect(img)}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeSelector} variant="outlined">Close</Button>
            </DialogActions>
          </div>
        </Backdrop>,
        document.body
      )}
    </>
  );
};

export default React.memo(HeroTableModule);
