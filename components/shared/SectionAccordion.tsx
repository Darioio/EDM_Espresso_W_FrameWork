import React, { useRef, useCallback } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { alpha, useTheme } from '@mui/material/styles';

type SectionAccordionProps = {
  id?: string;
  title: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  startAdornment?: React.ReactNode; // e.g., drag handle
  actions?: React.ReactNode; // trailing actions (delete, edit, etc.)
  children: React.ReactNode;
  sx?: any;
  summarySx?: any;
  detailsSx?: any;
};

export default function SectionAccordion({ id, title, expanded, onToggle, startAdornment, actions, children, sx, summarySx, detailsSx }: SectionAccordionProps) {
  const theme = useTheme();
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const el = summaryRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.2;
    const ripple = document.createElement('span');
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const color = alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.35 : 0.25);
    ripple.style.position = 'absolute';
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.borderRadius = '50%';
    ripple.style.pointerEvents = 'none';
    ripple.style.background = color;
    ripple.style.transform = 'scale(0)';
    ripple.style.opacity = '0.6';
    ripple.style.transition = 'transform 450ms cubic-bezier(0.4,0,0.2,1), opacity 600ms linear';
    el.appendChild(ripple);
    // Force layout then animate
    requestAnimationFrame(() => {
      ripple.style.transform = 'scale(1)';
      ripple.style.opacity = '0';
    });
    // Cleanup
    setTimeout(() => {
      ripple.remove();
    }, 650);
  }, [theme.palette.primary.main, theme.palette.mode]);
  return (
  <Accordion
    expanded={expanded}
    onChange={onToggle}
    disableGutters
    square
    sx={{
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: expanded ? 'primary.main' : 'divider',
      boxShadow: 'none',
      borderRadius: '5px',
      '&:before': { display: 'none' },
      transition: 'background-color .15s ease, border-color .15s ease',
      // Spacing only between siblings (no extra space after last)
      '& + .MuiAccordion-root': { mt: 1 },
      // Hover effect (works in dark & light by using palette tokens)
      '&:hover': {
        borderColor: 'primary.main',
        '& > .MuiAccordionSummary-root': {
          backgroundColor: 'action.hover'
        }
      },
      ...sx
    }}
  >
      <AccordionSummary
        ref={summaryRef as any}
        expandIcon={<ExpandMoreIcon />}
        sx={{
          px: 1.25,
            py: 0.5,
            minHeight: 40,
            '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1, my: 0.5 },
            // Direct hover/focus states for keyboard accessibility
            '&:hover': { backgroundColor: 'action.hover' },
            '&.Mui-focusVisible': { backgroundColor: 'action.focus' },
            position: 'relative',
            overflow: 'hidden',
            ...summarySx
        }}
        aria-controls={id ? `${id}-content` : undefined}
        id={id ? `${id}-header` : undefined}
        onPointerDown={handlePointerDown}
      >
        {startAdornment && <Box sx={{ display: 'flex', alignItems: 'center' }}>{startAdornment}</Box>}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>{title}</Typography>
        {actions && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{actions}</Box>}
      </AccordionSummary>
      {expanded && (
        <AccordionDetails sx={{ pt: 1.5, pb: 2, px: 1.5, ...detailsSx }}>
          {children}
        </AccordionDetails>
      )}
    </Accordion>
  );
}
