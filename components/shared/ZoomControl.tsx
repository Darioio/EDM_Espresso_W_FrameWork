import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

export type ZoomControlProps = {
  minZoom?: number; // percentage, e.g., 25
  maxZoom?: number; // percentage, e.g., 200
  step?: number; // percentage delta for +/- and slider, e.g., 10
  defaultZoom?: number; // starting zoom percentage, default 100
  onZoomChange?: (value: number) => void;
};

/**
 * ZoomControl
 *
 * A bottom-aligned control bar for a preview area that applies a CSS transform
 * scale() to the element with id "preview-inner". Uses MUI components and
 * is dark-mode friendly via theme tokens.
 */
const ZoomControl: React.FC<ZoomControlProps> = ({
  minZoom = 20,
  maxZoom = 200,
  step = 20,
  defaultZoom = 100,
  onZoomChange,
}) => {
  const [zoom, setZoom] = useState<number>(defaultZoom);

  const presets = useMemo(() => [20, 40, 60, 80, 100, 120, 140, 160, 180, 200].filter(p => p >= minZoom && p <= maxZoom), [minZoom, maxZoom]);

  const clamp = useCallback((v: number) => Math.min(maxZoom, Math.max(minZoom, v)), [minZoom, maxZoom]);

  const applyZoom = useCallback((value: number) => {
    const el = typeof document !== 'undefined' ? document.getElementById('preview-inner') : null;
    if (!el) return;
    const scale = value / 100;
    el.style.transform = `scale(${scale})`;
    // Anchor scaling to the top so content grows downward and stays visible
    el.style.transformOrigin = 'top center';
  }, []);

  useEffect(() => {
    applyZoom(zoom);
    onZoomChange?.(zoom);
  }, [zoom, applyZoom, onZoomChange]);

  const handleIncrease = () => setZoom((z) => clamp(z + step));
  const handleDecrease = () => setZoom((z) => clamp(z - step));

  return (
    <Box
      sx={{
        position: 'sticky',
        bottom: 0,
        width: '100%',
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        zIndex: (t) => t.zIndex.appBar,
      }}
      role="region"
      aria-label="Preview zoom controls"
    >
      <Toolbar variant="dense" sx={{ gap: 0, minHeight: 54, px: 0 }}>
        <IconButton aria-label="Zoom out" onClick={handleDecrease} disabled={zoom <= minZoom} size="small">
          <ZoomOutIcon fontSize="small" />
        </IconButton>

        <Slider
          aria-label="Zoom slider"
          value={zoom}
          onChange={(_, v) => setZoom(clamp(Array.isArray(v) ? v[0] : v))}
          min={minZoom}
          max={maxZoom}
          step={step}
          sx={{ width: 140, mx: 1 }}
        />

        <IconButton aria-label="Zoom in" onClick={handleIncrease} disabled={zoom >= maxZoom} size="small">
          <ZoomInIcon fontSize="small" />
        </IconButton>

        <TextField
          select
          size="small"
          label=""
          id="zoom-select"
          InputLabelProps={{ id: 'zoom-select-label' }}
          SelectProps={{ labelId: 'zoom-select-label', id: 'zoom-select' }}
          value={presets.includes(zoom) ? zoom : 'custom'}
          onChange={(e) => {
            const val = e.target.value as any;
            if (val === 'custom') return; // ignore selecting the placeholder
            setZoom(clamp(Number(val)));
          }}
          variant="standard"
          sx={{ minWidth: 70, ml: 'auto', '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' } }}
          aria-label="Zoom preset"
        >
          {!presets.includes(zoom) && (
            <MenuItem value="custom" disabled>
            {zoom}%
            </MenuItem>
          )}
          {presets.map((p) => (
            <MenuItem key={p} value={p}>{p}%</MenuItem>
          ))}
        </TextField>

      </Toolbar>
    </Box>
  );
};

export default ZoomControl;
