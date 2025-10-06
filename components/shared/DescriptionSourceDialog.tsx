import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Backdrop, DialogTitle, DialogContent, DialogActions, Button, RadioGroup, FormControlLabel, Radio, Typography, Box } from '@mui/material';

export type DescSource = 'metadata' | 'p' | 'ul';

export interface DescriptionSourceDialogProps {
  open: boolean;
  selected: DescSource;
  onChange: (src: DescSource) => void;
  onApply: () => void;
  onClose: () => void;
  previews: Partial<Record<DescSource, string>>; // html for each source
  anchorRect?: DOMRect | null;
}

export const DescriptionSourceDialog: React.FC<DescriptionSourceDialogProps> = ({ open, selected, onChange, onApply, onClose, previews, anchorRect }) => {
  // Track a local rect to position Backdrop like ImageSelector
  const [rect, setRect] = useState<DOMRect | undefined>(anchorRect ?? undefined);
  // Portal mount element
  const [mountEl, setMountEl] = useState<HTMLElement | null>(null);

  // Ensure a dedicated portal root that will be appended right before </body>
  useEffect(() => {
    if (typeof document === 'undefined') return;
    let el = document.getElementById('desc-src-dialog-root');
    if (!el) {
      el = document.createElement('div');
      el.id = 'desc-src-dialog-root';
      document.body.appendChild(el);
    }
    setMountEl(el);
  }, []);

  useEffect(() => {
    if (!open) return;

    const getTarget = (): HTMLElement | null => {
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

    updateRect();
    window.addEventListener('resize', updateRect);
    const el = getTarget();
    el?.addEventListener('scroll', updateRect, { passive: true } as any);
    document.addEventListener('scroll', updateRect, { passive: true } as any);

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

  const style = rect
    ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height, zIndex: 1200, backgroundColor: 'rgba(0,0,0,0.6)', position: 'fixed' as const }
    : {};

  const hasMeta = !!previews.metadata;
  const hasP = !!previews.p;
  const hasUl = !!previews.ul;

  const currentHtml = previews[selected] || '';

  const dialogContent = (
    <Backdrop open={open} sx={style} onClick={onClose}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          borderRadius: 6,
          minWidth: 360,
          maxWidth: 640,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle sx={{ bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider', borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>Choose Description Source</DialogTitle>
        <DialogContent dividers>
          <RadioGroup value={selected} onChange={(e) => onChange(e.target.value as DescSource)}>
            <FormControlLabel value="metadata" control={<Radio />} label="Page metadata" disabled={!hasMeta} />
            <FormControlLabel value="p" control={<Radio />} label="First paragraph" disabled={!hasP} />
            <FormControlLabel value="ul" control={<Radio />} label="Bullet list" disabled={!hasUl} />
          </RadioGroup>

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: 'text.secondary' }}>Preview</Typography>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5, maxHeight: 220, overflow: 'auto', backgroundColor: 'background.paper' }}>
            {currentHtml ? (
              <div dangerouslySetInnerHTML={{ __html: currentHtml }} />
            ) : (
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>No content available for this source.</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="outlined">Cancel</Button>
          <Button onClick={onApply} variant="contained">Apply</Button>
        </DialogActions>
      </div>
    </Backdrop>
  );

  // Render via portal when possible; otherwise (e.g. during SSR) render null
  if (!mountEl) return null;
  return ReactDOM.createPortal(dialogContent, mountEl);
};

export default DescriptionSourceDialog;
