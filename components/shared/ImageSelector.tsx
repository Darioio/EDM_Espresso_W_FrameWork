import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ImageList, ImageListItem, Backdrop, Button, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { uniqueImages } from '../../lib/imageUtils';

export interface ImageSelectorProps {
  images: string[];
  selected: string;
  open: boolean;
  onSelect: (img: string) => void;
  onClose: () => void;
  anchorRect?: DOMRect | null;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({ images, selected, open, onSelect, onClose, anchorRect }) => {
  // Track a local rect that updates on panel resize/scroll and window resize.
  const [rect, setRect] = useState<DOMRect | undefined>(anchorRect ?? undefined);

  useEffect(() => {
    if (!open) return;

    const getTarget = (): HTMLElement | null => {
      // Prefer the right preview panel if present; fallback to main wrapper
  const preview = document.getElementById('preview') as HTMLElement | null;
  if (preview) return preview;
  const right = document.querySelector('.right-panel') as HTMLElement | null;
  if (right) return right;
  const main = document.querySelector('main') as HTMLElement | null;
  return main;
    };

    const updateRect = () => {
      const el = getTarget();
      if (el) {
        setRect(el.getBoundingClientRect());
      } else if (anchorRect) {
        setRect(anchorRect);
      }
    };

    // Initial compute
    updateRect();

    // Listen to window resize
    window.addEventListener('resize', updateRect);

    // Listen to scrolling on target and window in case of overlayed scroll containers
    const el = getTarget();
    el?.addEventListener('scroll', updateRect, { passive: true } as any);
    document.addEventListener('scroll', updateRect, { passive: true } as any);

    // Observe size changes on the target element
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
  }, [open, anchorRect]);
  // Deduplicate images using shared normalisation (strip query/fragment, compare by filename)
  const thumbs = uniqueImages(images);
  // For MUI Backdrop positioning
  const style = rect
    ? {
        position: 'fixed' as const,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        right: 'auto',
        bottom: 'auto',
        zIndex: 1200,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }
    : {};
  if (!open) return null;
  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  if (!portalTarget) return null;
  return createPortal(
    <Backdrop open={open} sx={style} onClick={onClose}>
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
          Select Product Image
        </DialogTitle>
        <DialogContent dividers>
          <ImageList cols={6} gap={6} sx={{ m: 0.5 }}>
            {thumbs.map((img) => {
              const isSelected = img === selected;
              return (
                <ImageListItem
                  key={img}
                  sx={{
                    cursor: 'pointer',
                    overflow: 'hidden',
                    borderRadius: 1,
                    border: isSelected ? '2px solid var(--color-primary)' : '2px solid',
                    borderColor: isSelected ? 'var(--color-primary)' : 'divider',
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
                    onClick={() => onSelect(img)}
                  />
                </ImageListItem>
              );
            })}
          </ImageList>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="outlined">Close</Button>
        </DialogActions>
      </div>
    </Backdrop>,
    portalTarget
  );
};
