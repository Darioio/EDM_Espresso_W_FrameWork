import React from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// Persist link state per control across remounts
const linkStateStore = new Map<string, { v: boolean; h: boolean }>();

// Persist last focused field and caret position to robustly restore focus after remounts
type FocusInfo = { field: keyof Padding; selStart?: number; selEnd?: number };
const focusStore = new Map<string, FocusInfo>();

interface PaddingControlsProps {
  label?: string;
  value: Padding;
  onChange: (next: Padding) => void;
  /** Stable id to persist link/unlink toggles and last focused field */
  persistKey?: string;
}

/**
 * PaddingControls renders either a compact 2-field (vertical/horizontal)
 * editor or a full 4-field (top/right/bottom/left) editor. It always
 * emits a 4-side Padding object via onChange.
 */
const PaddingControlsComponent: React.FC<PaddingControlsProps> = ({ label = 'Padding', value, onChange, persistKey }) => {
  const initial = React.useMemo(() => (persistKey && linkStateStore.get(persistKey)) || { v: true, h: true }, [persistKey]);
  const [linkVertical, setLinkVertical] = React.useState<boolean>(initial.v);
  const [linkHorizontal, setLinkHorizontal] = React.useState<boolean>(initial.h);

  // Local state for input values - sync immediately but prevent re-renders
  const [localValues, setLocalValues] = React.useState<Padding>(value);

  // Update local values when prop changes (but only if different)
  React.useEffect(() => {
    if (value.top !== localValues.top || value.right !== localValues.right || 
        value.bottom !== localValues.bottom || value.left !== localValues.left) {
      setLocalValues(value);
    }
  }, [value.top, value.right, value.bottom, value.left]);

  const updateAndSync = (field: keyof Padding, n: number) => {
    const next = { ...localValues, [field]: n };
    
    // Apply linking rules immediately
    if (field === 'top' && linkVertical) next.bottom = n;
    if (field === 'bottom' && linkVertical) next.top = n;
    if (field === 'left' && linkHorizontal) next.right = n;
    if (field === 'right' && linkHorizontal) next.left = n;
    
    // Update local state immediately
    setLocalValues(next);
    
    // Sync to parent immediately for live preview
    onChange(next);
  };

  // Refs to inputs for robust focus restore
  const topRef = React.useRef<HTMLInputElement | null>(null);
  const bottomRef = React.useRef<HTMLInputElement | null>(null);
  const leftRef = React.useRef<HTMLInputElement | null>(null);
  const rightRef = React.useRef<HTMLInputElement | null>(null);

  // On mount, restore focus/caret if we have it for this persistKey
  React.useLayoutEffect(() => {
    if (!persistKey) return;
    const info = focusStore.get(persistKey);
    if (!info) return;
    const refMap: Record<keyof Padding, React.RefObject<HTMLInputElement>> = {
      top: topRef,
      bottom: bottomRef,
      left: leftRef,
      right: rightRef
    };
    const ref = refMap[info.field];
    const el = ref.current;
    if (el) {
      // Defer a tick to ensure the element is mounted and visible
      requestAnimationFrame(() => {
        try {
          el.focus({ preventScroll: true });
          if (typeof info.selStart === 'number' && typeof info.selEnd === 'number') {
            el.setSelectionRange(info.selStart, info.selEnd);
          } else {
            // Put caret at end by default
            const len = el.value?.length ?? 0;
            el.setSelectionRange(len, len);
          }
        } catch {}
      });
    }
  }, [persistKey]);

  const handleFocusRecord = (field: keyof Padding) => (e: React.FocusEvent<HTMLInputElement>) => {
    if (!persistKey) return;
    const target = e.currentTarget;
    try {
      focusStore.set(persistKey, { field, selStart: target.selectionStart ?? undefined, selEnd: target.selectionEnd ?? undefined });
    } catch {
      focusStore.set(persistKey, { field });
    }
  };

  const handleSelectRecord = (field: keyof Padding) => (e: React.SyntheticEvent<HTMLInputElement>) => {
    if (!persistKey) return;
    const target = e.currentTarget as HTMLInputElement;
    focusStore.set(persistKey, { field, selStart: target.selectionStart ?? undefined, selEnd: target.selectionEnd ?? undefined });
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
      </div>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="nowrap">
        {/* Top / Bottom with link in between */}
        <TextField
          style={{ marginLeft: 0, marginRight: 0 }}
          label="Top"
          type="number"
          size="small"
          sx={{ width: 100 }}
          value={localValues.top ?? 0}
          onChange={(e) => updateAndSync('top', Number(e.target.value))}
          inputProps={{ min: 0 }}
          inputRef={topRef}
          onFocus={handleFocusRecord('top')}
          onSelect={handleSelectRecord('top')}
        />
        <IconButton
          style={{ marginLeft: 0, marginRight: 0 }}
          aria-label={linkVertical ? 'Unlink top/bottom' : 'Link top/bottom'}
          onClick={() => {
            const willLink = !linkVertical;
            setLinkVertical(willLink);
            if (persistKey) linkStateStore.set(persistKey, { v: willLink, h: linkHorizontal });
            if (willLink) {
              // When linking, normalise bottom to top immediately
              const next = { ...localValues, bottom: localValues.top };
              setLocalValues(next);
              onChange(next);
            }
          }}
          size="small"
        >
          {linkVertical ? <LinkIcon fontSize="small" /> : <LinkOffIcon fontSize="small" />}
        </IconButton>
        <TextField
          style={{ marginLeft: 0, marginRight: 0 }}
          label="Bottom"
          type="number"
          size="small"
          sx={{ width: 100 }}
          value={localValues.bottom ?? 0}
          onChange={(e) => updateAndSync('bottom', Number(e.target.value))}
          inputProps={{ min: 0 }}
          inputRef={bottomRef}
          onFocus={handleFocusRecord('bottom')}
          onSelect={handleSelectRecord('bottom')}
        />

        {/* Spacer */}
        <div style={{ width: 12 }} />

        {/* Left / Right with link in between */}
        <TextField
          style={{ marginLeft: 0, marginRight: 0 }}
          label="Left"
          type="number"
          size="small"
          sx={{ width: 100 }}
          value={localValues.left ?? 0}
          onChange={(e) => updateAndSync('left', Number(e.target.value))}
          inputProps={{ min: 0 }}
          inputRef={leftRef}
          onFocus={handleFocusRecord('left')}
          onSelect={handleSelectRecord('left')}
        />
        <IconButton
        style={{ marginLeft: 0, marginRight: 0 }}
          aria-label={linkHorizontal ? 'Unlink left/right' : 'Link left/right'}
          onClick={() => {
            const willLink = !linkHorizontal;
            setLinkHorizontal(willLink);
            if (persistKey) linkStateStore.set(persistKey, { v: linkVertical, h: willLink });
            if (willLink) {
              // When linking, normalise right to left immediately
              const next = { ...localValues, right: localValues.left };
              setLocalValues(next);
              onChange(next);
            }
          }}
          size="small"          
        >
          {linkHorizontal ? <LinkIcon fontSize="small" /> : <LinkOffIcon fontSize="small" />}
        </IconButton>
        <TextField
          style={{ marginLeft: 0, marginRight: 0 }}
          label="Right"
          type="number"
          size="small"
          sx={{ width: 100 }}
          value={localValues.right ?? 0}
          onChange={(e) => updateAndSync('right', Number(e.target.value))}
          inputProps={{ min: 0 }}
          inputRef={rightRef}
          onFocus={handleFocusRecord('right')}
          onSelect={handleSelectRecord('right')}
        />
      </Stack>
    </div>
  );
};

const areEqual = (prev: PaddingControlsProps, next: PaddingControlsProps) => {
  // Only re-render if label or persistKey change
  // Don't re-render on value changes since we have local state
  return (
    prev.label === next.label &&
    prev.persistKey === next.persistKey &&
    prev.onChange === next.onChange
  );
};

const PaddingControls = React.memo(PaddingControlsComponent, areEqual);
export default PaddingControls;
