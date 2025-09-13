import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, ImageList, ImageListItem, Backdrop } from '@mui/material';

export interface ImageSelectorProps {
  images: string[];
  selected: string;
  open: boolean;
  onSelect: (img: string) => void;
  onClose: () => void;
  anchorRect?: DOMRect | null;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({ images, selected, open, onSelect, onClose, anchorRect }) => {
  // Track a local rect that updates on resize
  const [rect, setRect] = useState<DOMRect | undefined>(anchorRect ?? undefined);
  useEffect(() => {
    if (!open) return;
    function updateRect() {
      if (anchorRect) {
        // Try to re-query the main panel for latest rect
        const mainPanel = document.querySelector('main') as HTMLElement;
        setRect(mainPanel?.getBoundingClientRect() || anchorRect);
      }
    }
    window.addEventListener('resize', updateRect);
    // Initial update
    updateRect();
    return () => window.removeEventListener('resize', updateRect);
  }, [open, anchorRect]);
  // Deduplicate images by base path (strip query parameters)
  const uniqueImages = (imgs: string[]) => {
    const seen = new Set<string>();
    return imgs.filter((img) => {
      const base = img.split('?')[0];
      if (seen.has(base)) return false;
      seen.add(base);
      return true;
    });
  };
  const thumbs = uniqueImages(images);
  // For MUI Backdrop positioning
  const style = rect
    ? {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        zIndex: 1200,
        backgroundColor: 'rgba(0,0,0,0.6)',
        position: 'fixed' as const,
      }
    : {};
  return (
    <Backdrop open={open} sx={style} onClick={onClose}>
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
          <ImageList cols={6} gap={6} sx={{ m: 0.5 }}>
            {thumbs.map((img) => {
              const isSelected = img === selected;
              return (
                <ImageListItem key={img} sx={{ cursor: 'pointer' }}>
                  <img
                    src={img}
                    alt=""
                    style={{
                      border: isSelected ? '3px solid var(--color-primary)' : '3px solid transparent',
                      borderRadius: 6,
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
    </Backdrop>
  );
};
