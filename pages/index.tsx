  // ...existing code...

// ...existing code...
// ...existing code...

  // ...existing code...
  // Place this after bodySections and generateSection are defined
import React, { useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { useLiveEditable } from '../lib/useLiveEditable';
import Head from 'next/head';
import SectionAccordion from '../components/shared/SectionAccordion';
import AppLayout from '../components/AppLayout';
import LabeledSelect from '../components/shared/LabeledSelect';
import Skeleton from '@mui/material/Skeleton';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Snackbar from '@mui/material/Snackbar';
// MUI components for Brand Customisation panel
// import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// Removed modal-based wizard, these imports are no longer used
// import FormControl from '@mui/material/FormControl';
// import Dialog from '@mui/material/Dialog';
// import DialogTitle from '@mui/material/DialogTitle';
// import DialogContent from '@mui/material/DialogContent';
// import DialogActions from '@mui/material/DialogActions';
import Collapse from '@mui/material/Collapse';
// Grid removed; using Box with CSS grid for layout
// import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
// import CardMedia from '@mui/material/CardMedia';
// import Checkbox from '@mui/material/Checkbox';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import InputLabel from '@mui/material/InputLabel';
// import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
// Padding toggles removed
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
// import CloseIcon from '@mui/icons-material/Close';
import { MuiColorInput } from 'mui-color-input';
import InputAdornment from '@mui/material/InputAdornment';
// Removed padding controls
import SvgIcon from '@mui/material/SvgIcon';
import { styled } from '@mui/material/styles';
// import Backdrop from '@mui/material/Backdrop';
// import ImageList from '@mui/material/ImageList';
// import ImageListItem from '@mui/material/ImageListItem';
// import ToggleButton from '@mui/material/ToggleButton';
// import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {
  defaultTemplates as defaultBodyTemplates,
  Template as BodyTemplate,
  renderTemplate
} from '../data/templates';
// chunkGrid no longer needed directly here; grid helpers centralised in gridUtils
import { gridRowChunks, buildGridRowsHtml } from '@lib/gridUtils';
import {
  defaultHeaderTemplates,
  HeaderTemplate
} from '../data/headerTemplates';
import {
  defaultFooterTemplates,
  FooterTemplate
} from '../data/footerTemplates';
import {
  defaultHeroTemplates,
  HeroTemplate
} from '../data/heroTemplates';
import { PRODUCT_SECTION_PADDING_DESKTOP, PRODUCT_SECTION_PADDING_MOBILE } from '../lib/constants';
import {
  defaultBannerTemplates,
  BannerTemplate
} from '../data/bannerTemplates';
import { ProductData } from '../lib/types';
// Import interactive modules for preview. ProductTableModule renders
// each product module with inline editing and image selection. The
// HeroTableModule renders the hero section with image selection.
import ProductTableModule from '../components/ProductTableModule';
import { ImageSelector } from '../components/shared/ImageSelector';
import RichTextField from '../components/shared/RichTextField';
import HeroTableModule from '../components/HeroTableModule';
import PaddingControls, { Padding as PaddingValue } from '../components/shared/PaddingControls';
import { uniqueImages, normalizeImage } from '../lib/imageUtils';
import { sanitizeEmailHtml, sanitizeInlineHtml, normalizeListHtml, normalizeFontColorHtml } from '../lib/sanitize';
import { inlineHtmlToParagraphHtml } from '../lib/htmlUtils';
// ProductTableModule was used for an interactive preview in earlier versions. When
// rendering via Option A the preview uses the compiled HTML directly so we
// no longer import or use ProductTableModule here.

// MUI Icons
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CodeIcon from '@mui/icons-material/Code';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon2 from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
// import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
// SpeedDial
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DownloadIcon from '@mui/icons-material/Download';
// Floating formatting icons removed for preview copy-only behavior
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import HtmlThumbnail from '../components/shared/HtmlThumbnail';
// Use MUI's internal ripple component to provide visual feedback in preview
// eslint-disable-next-line import/no-extraneous-dependencies
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';
// PrismJS is loaded dynamically on the client. We avoid importing it at
// the top level because that can cause issues with server‑side
// rendering in Next.js. Instead we load it in a useEffect hook and
// store the reference in a ref. See the highlight() helper below.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// (Prism is intentionally not imported here)

// FontAwesome icons for the copy button. The icons are only
// imported when used which keeps the bundle size small. If the
// import fails gracefully the application will still function.

interface GenerateResponse {
  html: string;
  products: any[];
  skipped?: { url: string; reason: string }[];
}
// nested component remounts from capturing local versions
const sanitizeUrl = (url: string) => (url || '').split('?')[0];
const isHttpUrl = (url: string) => {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

// Stable, module-scope sortable URL row to avoid remounting on each parent render
type SortableUrlRowProps = {
  rowId: string;
  sectionId: number;
  index: number;
  value: string;
  isLast: boolean;
  canRemove: boolean;
  onChange: (index: number, value: string) => void;
  onFocusIndex: (index: number) => void;
  onBlurIndex: (index: number) => void;
  onRemoveIndex: (index: number) => void;
  onAddAfterIndex: (index: number) => void;
  onSyncToParent: (index: number, rawValue?: string) => void;
  caretRef: React.MutableRefObject<{ index: number; start: number; end: number } | null>;
};

const SortableUrlRow: React.FC<SortableUrlRowProps> = ({
  rowId,
  sectionId,
  index,
  value,
  isLast,
  canRemove,
  onChange,
  onFocusIndex,
  onBlurIndex,
  onRemoveIndex,
  onAddAfterIndex,
  onSyncToParent,
  caretRef
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: rowId });
  const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;
  return (
    <Box ref={setNodeRef} style={style} sx={{ mb: 2, position: 'relative', width: '100%', overflow: 'visible' }}>
      <TextField
        id={`url-${sectionId}-${index}`}
        type="url"
        label={`Product URL ${index + 1}`}
        value={value}
        fullWidth
        onChange={(e) => onChange(index, e.target.value)}
        onFocus={() => onFocusIndex(index)}
        onBlur={() => onBlurIndex(index)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Tooltip title="Reorder">
                <IconButton size="small" {...attributes} {...listeners} edge="start" tabIndex={-1} sx={{ cursor: 'grab' }} aria-label="Reorder product URL" aria-describedby={undefined as any}>
                  <DragIndicatorIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
          endAdornment: canRemove ? (
            <InputAdornment position="end">
              <IconButton onClick={() => onRemoveIndex(index)} title="Remove URL" edge="end">
                <CloseIcon2 fontSize="medium" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
        inputProps={{
          onClick: (e: React.MouseEvent<HTMLInputElement>) => {
            const t = e.currentTarget;
            caretRef.current = { index, start: t.selectionStart ?? t.value.length, end: t.selectionEnd ?? t.value.length };
          },
          onKeyUp: (e: React.KeyboardEvent<HTMLInputElement>) => {
            const t = e.currentTarget;
            caretRef.current = { index, start: t.selectionStart ?? t.value.length, end: t.selectionEnd ?? t.value.length };
          },
          onSelect: (e: any) => {
            const t = e.currentTarget as HTMLInputElement;
            caretRef.current = { index, start: t.selectionStart ?? t.value.length, end: t.selectionEnd ?? t.value.length };
          },
          onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
            const curr = e.currentTarget as HTMLInputElement;
            const val = curr.value.trim();
            if (e.key === 'Enter') {
              e.preventDefault();
              onSyncToParent(index, curr.value);
              if (val && isLast) {
                onAddAfterIndex(index);
                setTimeout(() => {
                  const next = document.getElementById(`url-${sectionId}-${index + 1}`) as HTMLInputElement | null;
                  next?.focus();
                }, 0);
              }
              curr.blur();
              if (isLast) {
                try {
                  const cleaned = sanitizeUrl(curr.value.trim());
                  if (isHttpUrl(cleaned)) {
                    const btn = document.getElementById(`update-button-${sectionId}`) as HTMLButtonElement | null;
                    btn?.click();
                  }
                } catch {}
              }
            } else if (e.key === 'Tab' && !e.shiftKey && isLast) {
              e.preventDefault();
              onSyncToParent(index, curr.value);
              onAddAfterIndex(index);
              setTimeout(() => {
                const next = document.getElementById(`url-${sectionId}-${index + 1}`) as HTMLInputElement | null;
                next?.focus();
              }, 0);
              curr.blur();
              try {
                const cleaned = sanitizeUrl(curr.value.trim());
                if (isHttpUrl(cleaned)) {
                  const btn = document.getElementById(`update-button-${sectionId}`) as HTMLButtonElement | null;
                  btn?.click();
                }
              } catch {}
            }
          }
        }}
        variant="standard"
        sx={{ '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' } }}
      />
      {/* Per-row inline plus removed; add button moved next to the Update button */}
    </Box>
  );
};

// Dedicated, memoized component for the Product URL fields. Kept at module scope
// to preserve identity across parent re-renders and avoid focus loss. Uses local
// state while typing and only syncs upstream on blur/explicit actions.
type ProductUrlFieldsProps = {
  sectionId: number;
  urls: string[];
  onUrlChange: (sectionId: number, index: number, value: string) => void;
  onAddField: (sectionId: number, index: number) => void;
  onRemoveField: (sectionId: number, index: number) => void;
  addNotification: (msg: React.ReactNode) => void;
  onReorder: (sectionId: number, oldIndex: number, newIndex: number) => void;
};
const ProductUrlFieldsImpl: React.FC<ProductUrlFieldsProps> = ({ sectionId, urls, onUrlChange, onAddField, onRemoveField, addNotification, onReorder }) => {
  const [localValues, setLocalValues] = useState<string[]>(() => (urls.length > 0 ? urls : ['']));
  const prevUrlsRef = useRef<string[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const caretRef = useRef<{ index: number; start: number; end: number } | null>(null);

  useEffect(() => {
    const urlsChanged = urls.length !== prevUrlsRef.current.length || urls.some((url, i) => url !== prevUrlsRef.current[i]);
    if (urlsChanged && focusedIndex === null) {
      setLocalValues(urls.length > 0 ? urls : ['']);
      prevUrlsRef.current = [...urls];
    }
  }, [urls, focusedIndex]);

  React.useLayoutEffect(() => {
    if (focusedIndex === null) return;
    const el = document.getElementById(`url-${sectionId}-${focusedIndex}`) as HTMLInputElement | null;
    if (el) {
      try {
        el.focus();
        const c = caretRef.current;
        if (c && c.index === focusedIndex && typeof el.setSelectionRange === 'function') {
          el.setSelectionRange(c.start, c.end);
        }
      } catch {}
    }
  }, [focusedIndex, localValues.length, sectionId]);

  const updateLocalValue = (index: number, value: string) => {
    setLocalValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const syncToParent = (index: number, rawValue?: string) => {
    const source = rawValue !== undefined ? rawValue : localValues[index] || '';
    const cleaned = sanitizeUrl(source);
    if (cleaned && !isHttpUrl(cleaned)) {
      addNotification(
        <span>
          Invalid product URL: <span style={{ fontWeight: 'bold' }}>{cleaned}</span>&nbsp;|&nbsp;Please enter a valid http(s) link.
        </span>
      );
    }
    setLocalValues((prev) => {
      const next = [...prev];
      next[index] = cleaned;
      return next;
    });
    onUrlChange(sectionId, index, cleaned);
  };

  const sensors = useSensors(useSensor(PointerSensor));

  // Row component moved to module scope as SortableUrlRow

  // Maintain stable row ids for DnD items
  const [rowIds, setRowIds] = useState<string[]>(() => localValues.map((_, i) => `url-${sectionId}-${i}-init`));
  useEffect(() => {
    setRowIds((prev) => {
      const next = [...prev];
      if (localValues.length > next.length) {
        for (let i = next.length; i < localValues.length; i++) {
          next.push(`url-${sectionId}-${i}-${i}`);
        }
      } else if (localValues.length < next.length) {
        next.length = localValues.length;
      }
      return next;
    });
  }, [localValues.length, sectionId]);

  return (
    <div style={{ width: '100%', paddingRight: '0px' }}>
      <Typography variant="subtitle1" sx={{ mb: 1, mt: 1, fontWeight: '600' }}>Product URLs</Typography>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over || active.id === over.id) return;
          const oldIndex = rowIds.indexOf(String(active.id));
          const newIndex = rowIds.indexOf(String(over.id));
          if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
          setRowIds((prev) => arrayMove(prev, oldIndex, newIndex));
          setLocalValues((prev) => arrayMove(prev, oldIndex, newIndex));
          onReorder(sectionId, oldIndex, newIndex);
        }}
      >
        <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
          {rowIds.map((rowId, index) => (
            <SortableUrlRow
              key={rowId}
              rowId={rowId}
              sectionId={sectionId}
              index={index}
              value={localValues[index] ?? ''}
              isLast={index === localValues.length - 1}
              canRemove={localValues.length > 1}
              onChange={updateLocalValue}
              onFocusIndex={(i) => setFocusedIndex(i)}
              onBlurIndex={(i) => {
                syncToParent(i);
                setFocusedIndex((curr) => (curr === i ? null : curr));
              }}
              onRemoveIndex={(i) => onRemoveField(sectionId, i)}
              onAddAfterIndex={(i) => {
                onAddField(sectionId, i + 1);
                setFocusedIndex(i + 1);
              }}
              onSyncToParent={syncToParent}
              caretRef={caretRef}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

const areProductUrlFieldsEqual = (prev: ProductUrlFieldsProps, next: ProductUrlFieldsProps) => {
  // Only re-render if the section changes or the urls reference changes.
  // Ignore function prop identity to avoid unnecessary renders while typing.
  return prev.sectionId === next.sectionId && prev.urls === next.urls;
};

const ProductUrlFields = React.memo(ProductUrlFieldsImpl, areProductUrlFieldsEqual);
ProductUrlFields.displayName = 'ProductUrlFields';

/**
 * Map a body template to its alternating variant. When rendering
 * multiple products from the same template, every other product
 * alternates orientation to provide visual variety. Keys correspond
 * to template IDs defined in data/templates.ts. This constant is
 * defined here to avoid ReferenceError when referenced before its
 * declaration. See code sections where alternateMap is used.
 */
const alternateMap: Record<string, string> = {
  'product-image-left-copy-right': 'product-copy-left-image-right',
  'product-copy-left-image-right': 'product-image-left-copy-right'
};


// Bottom padding functionality removed

/**
 * Each body section contains its own list of product URLs, parsed
 * product data and selected template. Sections are rendered in the
 * order defined in the array. When duplicating a body, a new
 * section entry is added with its own state. The loading flag is
 * used to disable the generate button while the backend call is
 * in progress.
 */
interface BodySection {
  id: number;
  name: string;
  urls: string[]; // committed URLs used for generation
  products: ProductData[];
  selectedBodyId: string;
  loading: boolean;
  /** Source of description to use for products in this section */
  // (legacy descriptionSource removed; per-product descSource now canonical)
  /** Per-section wrapper padding (px) applied to the 600px wrapper table */
  padding?: PaddingValue;
  /** Whether to alternate image/copy orientation across products (feature templates) */
  alternate?: boolean; // undefined => true (backwards compatible)
}

export default function Home() {
  const VisuallyHiddenInput = styled('input')`
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    bottom: 0;
    left: 0;
    white-space: nowrap;
    width: 1px;
  `;
  // Prevent repeated auto-generation loops; only attempt once after initial URL
  const autoGenTriedRef = useRef(false);
  const landingInputRef = useRef<HTMLInputElement>(null);
  const [platformVisible, setPlatformVisible] = useState(false);
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState<Record<string, boolean>>({});
  // Universal image selector state: which section and product index is open
  const [imageSelector, setImageSelector] = useState<{ sectionId: number; productIdx: number } | null>(null);
  /**
   * Currently selected module section. Users can switch between
   * editing the header, body or footer. Default to the body
   * section as it contains the main product modules.
   */
  // Accordion open section state. Only one section (header, body or
  // footer) can be expanded at a time. Defaults to body because the
  // body contains the product list and is the primary focus.
  // Track which accordion panel is open. Keys include 'header', 'hero',
  // 'footer' and dynamic body identifiers like 'body-1', 'body-2', etc.
  const [openSection, setOpenSection] = useState<string>('body-1');

  // Toggle email-safe sanitization for rich text fields (announcement, titles, descriptions)
  const [emailSafe, setEmailSafe] = useState<boolean>(true);

  /**
   * Toggle an accordion panel open or closed. When the given
   * identifier matches the current openSection, the panel is
   * collapsed. Otherwise it becomes the new open panel. This helper
   * prevents additional logic from being duplicated on click
   * handlers throughout the UI.
   */
  const handleAccordionToggle = (id: string) => {
    setOpenSection((prev) => (prev === id ? '' : id));
  };

  const handleAdvancedToggle = useCallback((key: string) => {
    setAdvancedSettingsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const isAdvancedOpen = useCallback((key: string) => Boolean(advancedSettingsOpen[key]), [advancedSettingsOpen]);

  /**
   * View mode within a module. Users can toggle between a live
   * preview of the selected module or the generated HTML code. This
   * toggle is scoped to the preview/edit area and not the module
   * tabs themselves. Default to preview.
   */
  // View mode toggles between a full email preview and the generated HTML
  // code for the body modules. This applies to the entire message
  // (header + body modules + footer) and not individual sections. Default
  // to preview.
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  /**
   * Body sections. Each section has its own list of URLs, parsed
   * products and selected template. Sections are rendered in order and
   * can be independently generated. A loading flag is stored per
   * section.
   */
  const [bodySections, setBodySections] = useState<BodySection[]>([]);

  // Draft URLs per section id; keeps typing local without re-rendering main compose
  const [draftUrls, setDraftUrls] = useState<Record<number, string[]>>({});

  // Selected product context for collection pages and per-section selection
  const [selectedProductCtx, setSelectedProductCtx] = useState<{ sectionId: number; index: number } | null>(null);
  

  const getDraftUrls = useCallback(
    (sectionId: number): string[] => {
      const existing = draftUrls[sectionId];
      if (existing) return existing;
      const section = bodySections.find((s) => s.id === sectionId);
      return section ? section.urls : [];
    },
    [draftUrls, bodySections]
  );

  // Visibility toggles for optional sections
  const [showHeaderSection, setShowHeaderSection] = useState(true);
  const [showHeroSection, setShowHeroSection] = useState(true);
  const [showBannerSection, setShowBannerSection] = useState(true);
  const [showFooterSection, setShowFooterSection] = useState(true);
  // Order of draggable sections including header/footer
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    'hero',
    ...bodySections.map((s) => `body-${s.id}`),
    'banner'
  ]);

  useEffect(() => {
    setSectionOrder((prev) => {
      const filtered = prev.filter((id) => {
        if (id === 'hero' && !showHeroSection) return false;
        if (id === 'banner' && !showBannerSection) return false;
        if (id.startsWith('body-')) {
          return bodySections.some((s) => `body-${s.id}` === id);
        }
        return true;
      });
      const desired = [
        ...(showHeroSection ? ['hero'] : []),
        ...bodySections.map((s) => `body-${s.id}`),
        ...(showBannerSection ? ['banner'] : [])
      ];
      desired.forEach((id) => {
        if (!filtered.includes(id)) {
          if (id.startsWith('body-') && filtered.includes('banner')) {
            filtered.splice(filtered.indexOf('banner'), 0, id);
          } else {
            filtered.push(id);
          }
        }
      });
      return filtered;
    });
  }, [bodySections, showHeroSection, showBannerSection]);

  // Drag-and-drop sensors and handler for reordering sections
  const sensors = useSensors(useSensor(PointerSensor));

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSectionOrder((prev) => {
      const oldIndex = prev.indexOf(active.id as string);
      const newIndex = prev.indexOf(over.id as string);
      return arrayMove(prev, oldIndex, newIndex);
    });
    if (
      String(active.id).startsWith('body-') &&
      String(over.id).startsWith('body-')
    ) {
      // Sections are rendered based on sectionOrder; bodySections data order can remain unchanged.
      return;
    }
  };
  // Snackbar state for lightweight notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState<ReactNode>('');

  const addNotification = useCallback((message: ReactNode) => {
    setSnackbarMsg(message);
    setSnackbarOpen(true);
  }, []);

  // Helper to move an item within sectionOrder and mirror bodySections order when applicable
  const moveSectionUp = useCallback((key: string) => {
    setSectionOrder(prev => {
      const i = prev.indexOf(key);
      if (i <= 0) return prev;
      const next = arrayMove(prev, i, i - 1);
      if (key.startsWith('body-')) {
        // Rebuild bodySections to match the order of body-* keys
        setBodySections(sections => {
          const byId = new Map(sections.map(s => [s.id, s] as const));
          const orderedIds = next.filter(k => k.startsWith('body-')).map(k => Number(k.replace('body-', '')));
          return orderedIds.map(id => byId.get(id)!).filter(Boolean);
        });
      }
      return next;
    });
  }, []);

  const moveSectionDown = useCallback((key: string) => {
    setSectionOrder(prev => {
      const i = prev.indexOf(key);
      if (i === -1 || i >= prev.length - 1) return prev;
      const next = arrayMove(prev, i, i + 1);
      if (key.startsWith('body-')) {
        setBodySections(sections => {
          const byId = new Map(sections.map(s => [s.id, s] as const));
          const orderedIds = next.filter(k => k.startsWith('body-')).map(k => Number(k.replace('body-', '')));
          return orderedIds.map(id => byId.get(id)!).filter(Boolean);
        });
      }
      return next;
    });
  }, []);

  // Deep-clone a body section: products, urls (draft), padding, and insert after source
  const cloneBodySection = useCallback((sectionId: number) => {
    const src = bodySections.find(s => s.id === sectionId);
    if (!src) return;
    const newId = (bodySections.reduce((m, s) => Math.max(m, s.id), 0) || 0) + 1;
    const urlsClone = (draftUrls[sectionId] ?? src.urls ?? []).map(u => u);
    const productsClone = (src.products ?? []).map(p => ({ ...p }));
    const cloned: BodySection = { id: newId, name: src.name, urls: urlsClone, products: productsClone as any, selectedBodyId: src.selectedBodyId, loading: false } as BodySection;
    setBodySections(prev => {
      const i = prev.findIndex(s => s.id === sectionId);
      const next = [...prev];
      next.splice(i + 1, 0, cloned);
      return next;
    });
    setDraftUrls(prev => ({ ...prev, [newId]: urlsClone }));
    setBodySectionPaddings(prev => {
      const next = new Map(prev);
      const pad = next.get(sectionId);
      if (pad) next.set(newId, { ...pad });
      return next;
    });
    setSectionOrder(prev => {
      const key = `body-${sectionId}`;
      const pos = prev.indexOf(key);
      if (pos === -1) return prev;
      const next = [...prev];
      next.splice(pos + 1, 0, `body-${newId}`);
      return next;
    });
    setOpenSection(`body-${newId}`);
    if (selectedProductCtx && selectedProductCtx.sectionId === sectionId) {
      const idx = Math.min(selectedProductCtx.index, Math.max(0, productsClone.length - 1));
      setSelectedProductCtx({ sectionId: newId, index: idx });
    }
    addNotification('Section cloned');
  }, [bodySections, draftUrls, selectedProductCtx, addNotification]);

  // Reusable "more actions" button with MUI Menu
  const MoreActions: React.FC<{ size?: 'small' | 'medium'; items: Array<{ label: string; onClick?: () => void; disabled?: boolean; icon?: React.ReactNode; }>; title?: string }>
    = ({ size = 'medium', items, title = 'More actions' }) => {
      const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
      const open = Boolean(anchorEl);
      return (
        <>
          <IconButton component="span" size={size} onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }} title={title}>
            <MoreVertIcon fontSize={size} />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)} onClick={(e) => e.stopPropagation()}>
            {items.map((it, idx) => (
              <MenuItem key={idx} disabled={!!it.disabled} onClick={() => { setAnchorEl(null); it.onClick?.(); }}>
                {it.icon && <ListItemIcon>{it.icon}</ListItemIcon>}
                <ListItemText>{it.label}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </>
      );
    };

  // ProductUrlFields moved to module scope above

  const SortableBodySection: React.FC<{ section: BodySection; isOpen: boolean }> = ({ section, isOpen }) => {
    // Include isDragging to apply visual affordances (shadow, opacity) consistent with hero/banner sections
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `body-${section.id}` });
    const { ['aria-describedby']: _ariaDescribedBy, ...sortableAttributes } = attributes as any;
    const translate = CSS.Transform.toString(transform);
    const style: React.CSSProperties = {
      transform: translate ? `${translate} translateZ(0)` : undefined,
      transition,
      borderRadius: 5,
      willChange: 'transform',
      position: 'relative',
      background: 'var(--panel-bg, #fff)',
      boxShadow: isDragging ? '0 6px 18px rgba(0,0,0,0.18)' : undefined,
      zIndex: isDragging ? 1200 : undefined,
      opacity: isDragging ? 0.97 : 1,
      pointerEvents: isDragging ? 'none' : 'auto'
    };

    // Stable handler so PaddingControls.onChange identity doesn't change across renders
    const handlePaddingChange = useCallback((p: PaddingValue) => setBodySectionPadding(section.id, p), [section.id, setBodySectionPadding]);
    return (
  <div ref={setNodeRef} style={style}>
        <SectionAccordion
          id={`left-body-${section.id}`}
          title={renamingId===`body-${section.id}` ? (
            <Box sx={{ display:'flex', alignItems:'center', gap:1, width:'100%' }} onClick={(e)=>e.stopPropagation()}>
              <TextField size="small" autoFocus value={renameDraft} onChange={(e)=>setRenameDraft(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ commitRename(); } else if(e.key==='Escape'){ cancelRename(); } }} variant="standard" placeholder={section.name || 'Body Section'} sx={{ flex:1 }} />
              <IconButton size="small" onClick={(e)=>{ e.stopPropagation(); commitRename(); }}><SaveIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={(e)=>{ e.stopPropagation(); cancelRename(); }}><CloseIcon2 fontSize="small" /></IconButton>
            </Box>
          ) : (sectionTitles[`body-${section.id}`] || section.name)}
          expanded={isOpen}
          onToggle={() => handleAccordionToggle(`body-${section.id}`)}
          startAdornment={
            <IconButton
              component="span"
              size="medium"
              {...sortableAttributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
              title="Reorder section"
            >
              <DragIndicatorIcon fontSize="medium" />
            </IconButton>
          }
          actions={
            <MoreActions
              size="medium"
              items={(() => {
                const key = `body-${section.id}`;
                const idx = sectionOrder.indexOf(key);
                return [
                  { label: 'Move up', icon: <ArrowUpwardIcon fontSize="small" />, disabled: idx <= 0, onClick: () => moveSectionUp(key) },
                  { label: 'Move down', icon: <ArrowDownwardIcon fontSize="small" />, disabled: idx === -1 || idx >= sectionOrder.length - 1, onClick: () => moveSectionDown(key) },
                  { label: 'Clone', icon: <ContentCopyIcon fontSize="small" />, onClick: () => cloneBodySection(section.id) },
                  { label: 'Rename', icon: <EditIcon fontSize="small" />, onClick: () => beginRename(`body-${section.id}`, sectionTitles[`body-${section.id}`] || section.name) },
                  { label: 'Delete', icon: <DeleteIcon fontSize="small" />, onClick: () => removeBodySection(section.id) },
                ];
              })()}
            />
          }
          detailsSx={{ pt: 1.25 }}
        >
            {/* Move Template + Description Source controls above URLs */}
            <div className="template-row" style={{ display: 'flex', gap: 'var(--gap-2)', alignItems: 'center', marginTop: '0.5rem'  }}>
              <LabeledSelect
                idBase={`body-template-${section.id}`}
                label="Template"
                value={section.selectedBodyId}
                onChange={(e) => setSectionTemplate(section.id, e.target.value as string)}
              >
                {bodyTemplates.map((tpl) => (
                  <MenuItem key={tpl.id} value={tpl.id}>{tpl.name}</MenuItem>
                ))}
              </LabeledSelect>
              <IconButton onClick={() => setBodyEditMode((v) => !v)} title={bodyEditMode ? 'Close editor' : 'Edit template'}>
                <EditIcon fontSize="medium" />
              </IconButton>
              <IconButton onClick={() => setShowNewBody((v) => !v)} title={showNewBody ? 'Cancel new template' : 'Add new template'}>
                <AddIcon fontSize="medium" />
              </IconButton>
            </div>
            {bodyEditMode && (
              <div>
                <TextField id={`body-draft-html-${section.id}`} label="Template HTML" value={draftBodyHtml} onChange={(e) => setDraftBodyHtml(e.target.value)} rows={8} fullWidth multiline variant="standard" sx={{ fontFamily: 'monospace', '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}} />
                <div className="new-template-actions" style={{ display: 'flex', gap: 'var(--gap-2)', marginTop: '0.5rem' }}>
                  <IconButton onClick={() => setBodyEditMode(false)} title="Cancel edit">
                    <CloseIcon2 fontSize="medium" />
                  </IconButton>
                  <IconButton onClick={() => { saveBodyEdits(); setBodyEditMode(false); }} title="Save edits">
                    <SaveIcon fontSize="medium" />
                  </IconButton>
                </div>
              </div>
            )}
            {showNewBody && (
              <div className="new-template-form">
                <TextField id={`body-new-name-${section.id}`} label="Template name" type="text" value={newBodyName} onChange={(e) => setNewBodyName(e.target.value)} fullWidth variant="standard" sx={{ mb: 1, '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}} />
                <TextField id={`body-new-html-${section.id}`} label="Template HTML" value={newBodyHtml} onChange={(e) => setNewBodyHtml(e.target.value)} rows={6} fullWidth multiline variant="standard" sx={{ fontFamily: 'monospace', '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}} />
                <div className="new-template-actions" style={{ display: 'flex', gap: 'var(--gap-2)', marginTop: '0.5rem' }}>
                  <IconButton onClick={() => { setShowNewBody(false); setNewBodyName(''); setNewBodyHtml(''); }} title="Cancel new template">
                    <CloseIcon2 fontSize="medium" />
                  </IconButton>
                  <IconButton onClick={() => { addNewBodyTemplate(); setShowNewBody(false); }} title="Save new template">
                    <SaveIcon fontSize="medium" />
                  </IconButton>
                </div>
              </div>
            )}
            <ProductUrlFields
              sectionId={section.id}
              urls={getDraftUrls(section.id)}
              onUrlChange={handleUrlChange}
              onAddField={addUrlField}
              onRemoveField={removeUrlField}
              addNotification={addNotification}
              onReorder={(sectionId, oldIndex, newIndex) => {
                // Reorder draftUrls immediately for UI continuity
                setDraftUrls(prev => {
                  const current = prev[sectionId] ?? getDraftUrls(sectionId);
                  const next = arrayMove(current, oldIndex, newIndex);
                  return { ...prev, [sectionId]: next };
                });
                // Reorder section.urls and products to reflect in preview
                setBodySections(prev => prev.map(s => {
                  if (s.id !== sectionId) return s;
                  const urls = arrayMove(s.urls, oldIndex, newIndex);
                  const products = arrayMove(s.products, oldIndex, newIndex);
                  return { ...s, urls, products };
                }));
              }}
            />
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: 'var(--gap-2)' }}>
              <Button
                id={`update-button-${section.id}`}
                onClick={() => {
                  // Blur any focused element to trigger onBlur syncs
                  if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                  }
                  // Commit the latest values from all URL inputs of this section into draftUrls
                  try {
                    const nodeList = Array.from(document.querySelectorAll(`input[id^="url-${section.id}-"]`)) as HTMLInputElement[];
                    // Sort by index extracted from id `url-sectionId-index`
                    const sorted = nodeList
                      .map((el) => {
                        const m = el.id.match(new RegExp(`^url-${section.id}-(\\d+)$`));
                        const idx = m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
                        return { idx, el };
                      })
                      .sort((a, b) => a.idx - b.idx);
                    const valuesRaw = sorted.map(({ el }) => el.value ?? '');
                    // Normalize and sanitize (strip query params) to match server mapping keys
                    const values = valuesRaw.map(v => sanitizeUrl((v || '').trim())).filter(v => v.length > 0 || valuesRaw.includes(v));
                    setDraftUrls((prev) => ({ ...prev, [section.id]: values }));
                    // Trigger generation using explicit values to avoid stale state
                    setTimeout(() => generateSection(section.id, values), 0);
                  } catch (err) {
                    // Non-fatal; fall back to existing draftUrls/section.urls
                    console.warn('Failed to collect URL inputs before update', err);
                    // Fallback: still call generate using current state
                    setTimeout(() => generateSection(section.id), 0);
                  }
                }}
                disabled={section.loading}
              >
                {section.loading ? 'Generating…' : 'Update'}
              </Button>
              <IconButton
                onClick={() => {
                  // Add a new URL row at the end and focus it
                  const nextIndex = (getDraftUrls(section.id)?.length ?? 0);
                  addUrlField(section.id, nextIndex);
                }}
                title="Add product URL"
                aria-label="Add product URL"
                sx={{
                  ml: 'auto',
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  width: 40,
                  height: 40,
                  padding: 0,
                  '& svg path': { fill: '#fff' },
                  '&:hover': {
                    backgroundColor: 'var(--color-primary-dark)',
                    color: '#fff',
                    '& svg path': { fill: '#fff' }
                  }
                }}
              >
                <AddIcon sx={{ fontSize: 28, width: 28, height: 28 }} />
              </IconButton>
            </div>
            {/* Confirm reset dialog moved to root */}
            <Button
              variant="text"
              size="small"
              onClick={() => handleAdvancedToggle(`body-${section.id}`)}
              endIcon={
                <ExpandMoreIcon
                  sx={{
                    transform: isAdvancedOpen(`body-${section.id}`) ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}
                />
              }
              sx={{
                alignSelf: 'flex-start',
                mt: 2,
                color: 'text.secondary',
                backgroundColor: 'transparent',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              Advanced settings
            </Button>
            <Collapse in={isAdvancedOpen(`body-${section.id}`)} timeout="auto" unmountOnExit>
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <PaddingControls
                  label="Section padding (px)"
                  value={getBodySectionPadding(section.id)}
                  onChange={handlePaddingChange}
                  persistKey={`body:${section.id}:padding`}
                />
                {(() => {
                  const pad = getBodySectionPadding(section.id);
                  const allZero = pad.top===0&&pad.right===0&&pad.bottom===0&&pad.left===0;
                  if (!allZero) return null;
                  return (
                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}>
                      Using default padding (25px desktop / 15px mobile)
                    </Typography>
                  );
                })()}
                {(section.selectedBodyId === 'product-image-left-copy-right' || section.selectedBodyId === 'product-copy-left-image-right') && (
                  <>
                    <FormControlLabel
                      sx={{ mt: 2, ml: 0 }}
                      control={
                        <Switch
                          size="small"
                          checked={section.alternate !== false}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setBodySections(prev => prev.map(s => s.id === section.id ? { ...s, alternate: checked } : s));
                          }}
                        />
                      }
                      label={<Typography variant="body2">Alternate image/copy orientation</Typography>}
                    />
                    {section.alternate === false && (
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', ml: 0 }}>
                        Alternation disabled — all products use base orientation.
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            </Collapse>
            {/* CTA background customization removed */}
        </SectionAccordion>
      </div>
    );
  };

  // Avoid re-rendering body sections when only unrelated state (like padding map) changes.
  const MemoizedSortableBodySection = React.memo(
    SortableBodySection,
    (prev, next) => prev.section === next.section && prev.isOpen === next.isOpen
  );

  const SortableHeroSection: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: 'hero' });
    const { ['aria-describedby']: _ariaDescribedBy, ...sortableAttributes } = attributes as any;
    const translate = CSS.Transform.toString(transform);
    const style: React.CSSProperties = {
      transform: translate ? `${translate} translateZ(0)` : undefined,
      transition,
      borderRadius:5,
      willChange:'transform',
      position:'relative',
      background:'var(--panel-bg, #fff)',
      boxShadow: isDragging ? '0 6px 18px rgba(0,0,0,0.18)' : undefined,
      zIndex: isDragging ? 1200 : undefined,
      opacity: isDragging ? 0.97 : 1,
      pointerEvents: isDragging ? 'none' : 'auto'
    };
    return (
  <div ref={setNodeRef} style={style}>
        <SectionAccordion
          id={'left-hero'}
          title={renamingId==='hero' ? (
            <Box sx={{ display:'flex', alignItems:'center', gap:1, width:'100%' }} onClick={(e)=>e.stopPropagation()}>
              <TextField size="small" autoFocus value={renameDraft} onChange={(e)=>setRenameDraft(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ commitRename(); } else if(e.key==='Escape'){ cancelRename(); } }} variant="standard" placeholder="Hero" sx={{ flex:1 }} />
              <IconButton size="small" onClick={(e)=>{ e.stopPropagation(); commitRename(); }}><SaveIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={(e)=>{ e.stopPropagation(); cancelRename(); }}><CloseIcon2 fontSize="small" /></IconButton>
            </Box>
          ) : resolveTitle('hero')}
          expanded={isOpen}
          onToggle={() => handleAccordionToggle('hero')}
          startAdornment={
            <IconButton
              component="span"
              size="medium"
              {...sortableAttributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
              title="Reorder section"
            >
              <DragIndicatorIcon fontSize="medium" />
            </IconButton>
          }
          actions={
            <MoreActions
              size="medium"
              items={(() => {
                const idx = sectionOrder.indexOf('hero');
                return [
                  { label: 'Move up', icon: <ArrowUpwardIcon fontSize="small" />, disabled: idx <= 0, onClick: () => moveSectionUp('hero') },
                  { label: 'Move down', icon: <ArrowDownwardIcon fontSize="small" />, disabled: idx === -1 || idx >= sectionOrder.length - 1, onClick: () => moveSectionDown('hero') },
                  { label: 'Clone', icon: <ContentCopyIcon fontSize="small" />, onClick: () => cloneHeroSection() },
                  { label: 'Rename', icon: <EditIcon fontSize="small" />, onClick: () => beginRename('hero', resolveTitle('hero')) },
                  { label: 'Delete', icon: <DeleteIcon fontSize="small" />, onClick: () => removeHeroSection() },
                ];
              })()}
            />
          }
          detailsSx={{ pt: 1.25 }}
        >
            {heroImage ? (
              <div style={{ marginBottom: '0.5rem' }}>
                <img src={heroImage} alt={heroAlt || ''} style={{ width: '100%', height: 'auto', border: '1px solid rgba(0, 0, 0, 0.2)', borderRadius: '6px', overflow: 'hidden'  }} />
              </div>
            ) : (
              <p>No hero image selected.</p>
            )}
            <div className="template-row" style={{ display: 'flex', gap: 'var(--gap-2)', alignItems: 'center', marginTop: '1.5rem'  }}>
              <LabeledSelect idBase="hero-template" label="Template" value={selectedHeroId} onChange={(e) => setSelectedHeroId(String(e.target.value))}>
                {heroTemplates.map((tpl) => (
                  <MenuItem key={tpl.id} value={tpl.id}>{tpl.name}</MenuItem>
                ))}
              </LabeledSelect>
              <IconButton onClick={() => setHeroEditMode((v) => !v)} title={heroEditMode ? 'Close editor' : 'Edit template'}>
                <EditIcon fontSize="medium" />
              </IconButton>
              <IconButton onClick={() => setShowNewHero((v) => !v)} title={showNewHero ? 'Cancel new template' : 'Add new template'}>
                <AddIcon fontSize="medium" />
              </IconButton>
            </div>
            {heroEditMode && (
              <div>
                <TextField id="hero-draft-html" label="Template HTML" value={draftHeroHtml} onChange={(e) => setDraftHeroHtml(e.target.value)} rows={6} fullWidth multiline variant="standard" sx={{ fontFamily: 'monospace', '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}} />
                <div className="new-template-actions" style={{ display: 'flex', gap: 'var(--gap-2)', marginTop: '0.5rem' }}>
                  <IconButton onClick={() => setHeroEditMode(false)} title="Cancel edit">
                    <CloseIcon2 fontSize="medium" />
                  </IconButton>
                  <IconButton onClick={() => { saveHeroEdits(); setHeroEditMode(false); }} title="Save edits">
                    <SaveIcon fontSize="medium" />
                  </IconButton>
                </div>
              </div>
            )}
            <TextField
              id="hero-href"
              name="hero-href"
              label="Hero Link URL"
              defaultValue={heroHref}
              onBlur={(e) => setHeroHref(sanitizeUrl(e.currentTarget.value))}
              fullWidth
              variant="standard"
              sx={{ mt: 2, '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}}
              inputProps={{
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    (e.currentTarget as HTMLInputElement).blur();
                  }
                }
              }}
            />
            <TextField
              id="hero-alt"
              name="hero-alt"
              label="Hero Alt Text"
              defaultValue={heroAlt}
              onBlur={(e) => setHeroAlt(e.currentTarget.value)}
              fullWidth
              variant="standard"
              sx={{ mt: 2, '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}}
              inputProps={{
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    (e.currentTarget as HTMLInputElement).blur();
                  }
                }
              }}
            />
            {showNewHero && (
              <div className="new-template-form">
                <TextField id="hero-new-name" label="Template name" type="text" value={newHeroName} onChange={(e) => setNewHeroName(e.target.value)} fullWidth variant="standard" sx={{ mb: 1, '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}} />
                <TextField id="hero-new-html" label="Template HTML" value={newHeroHtml} onChange={(e) => setNewHeroHtml(e.target.value)} rows={6} fullWidth multiline variant="standard" sx={{ fontFamily: 'monospace', '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}} />
                <div className="new-template-actions" style={{ display: 'flex', gap: 'var(--gap-2)', marginTop: '0.5rem' }}>
                  <IconButton onClick={() => { setShowNewHero(false); setNewHeroName(''); setNewHeroHtml(''); }} title="Cancel new template">
                    <CloseIcon2 fontSize="medium" />
                  </IconButton>
                  <IconButton onClick={() => { addNewHeroTemplate(); setShowNewHero(false); }} title="Save new template">
                    <SaveIcon fontSize="medium" />
                  </IconButton>
                </div>
              </div>
            )}
            <Button
              variant="text"
              size="small"
              onClick={() => handleAdvancedToggle('hero')}
              endIcon={
                <ExpandMoreIcon
                  sx={{
                    transform: isAdvancedOpen('hero') ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}
                />
              }
              sx={{
                alignSelf: 'flex-start',
                mt: 2,
                color: 'rgba(0, 0, 0, 0.6)',
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)'
                }
              }}
            >
              Advanced settings
            </Button>
            <Collapse in={isAdvancedOpen('hero')} timeout="auto" unmountOnExit>
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <PaddingControls label="Section padding (px)" value={heroPadding} onChange={onHeroPaddingChange} persistKey="hero:padding" />
              </Box>
            </Collapse>
        </SectionAccordion>
      </div>
    );
  };

  const SortableBannerSection: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: 'banner' });
    const { ['aria-describedby']: _ariaDescribedBy, ...sortableAttributes } = attributes as any;
    const translate = CSS.Transform.toString(transform);
    const style: React.CSSProperties = {
      transform: translate ? `${translate} translateZ(0)` : undefined,
      transition,
      borderRadius:5,
      willChange:'transform',
      position:'relative',
      background:'var(--panel-bg, #fff)',
      boxShadow: isDragging ? '0 6px 18px rgba(0,0,0,0.18)' : undefined,
      zIndex: isDragging ? 1200 : undefined,
      opacity: isDragging ? 0.97 : 1,
      pointerEvents: isDragging ? 'none' : 'auto'
    };
    return (
  <div ref={setNodeRef} style={style}>
        <SectionAccordion
          id={'left-banner'}
          title={renamingId==='banner' ? (
            <Box sx={{ display:'flex', alignItems:'center', gap:1, width:'100%' }} onClick={(e)=>e.stopPropagation()}>
              <TextField size="small" autoFocus value={renameDraft} onChange={(e)=>setRenameDraft(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ commitRename(); } else if(e.key==='Escape'){ cancelRename(); } }} variant="standard" placeholder="Banner" sx={{ flex:1 }} />
              <IconButton size="small" onClick={(e)=>{ e.stopPropagation(); commitRename(); }}><SaveIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={(e)=>{ e.stopPropagation(); cancelRename(); }}><CloseIcon2 fontSize="small" /></IconButton>
            </Box>
          ) : resolveTitle('banner')}
          expanded={isOpen}
          onToggle={() => handleAccordionToggle('banner')}
          startAdornment={
            <IconButton
              component="span"
              size="medium"
              {...sortableAttributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
              title="Reorder section"
            >
              <DragIndicatorIcon fontSize="medium" />
            </IconButton>
          }
          actions={
            <MoreActions
              size="medium"
              items={(() => {
                const idx = sectionOrder.indexOf('banner');
                return [
                  { label: 'Move up', icon: <ArrowUpwardIcon fontSize="small" />, disabled: idx <= 0, onClick: () => moveSectionUp('banner') },
                  { label: 'Move down', icon: <ArrowDownwardIcon fontSize="small" />, disabled: idx === -1 || idx >= sectionOrder.length - 1, onClick: () => moveSectionDown('banner') },
                  { label: 'Clone', icon: <ContentCopyIcon fontSize="small" />, onClick: () => cloneBannerSection() },
                  { label: 'Rename', icon: <EditIcon fontSize="small" />, onClick: () => beginRename('banner', resolveTitle('banner')) },
                  { label: 'Delete', icon: <DeleteIcon fontSize="small" />, onClick: () => removeBannerSection() },
                ];
              })()}
            />
          }
          detailsSx={{ pt: 1.25 }}
        >
            {bannerImage ? (
              <div style={{ marginBottom: '0.5rem' }}>
                <img src={bannerImage} alt={bannerAlt || ''} style={{ width: '100%', height: 'auto', border: '1px solid rgba(0, 0, 0, 0.2)', borderRadius: '6px', overflow: 'hidden' }} />
              </div>
            ) : (
              <p>No hero image selected.</p>
            )}
              <div className="template-row" style={{ display: 'flex', gap: 'var(--gap-2)', alignItems: 'center', marginTop: '1.5rem'  }}>
              <LabeledSelect idBase="banner-template" label="Template" value={selectedBannerId} onChange={(e) => setSelectedBannerId(String(e.target.value))}>
                {bannerTemplates.map((tpl) => (
                  <MenuItem key={tpl.id} value={tpl.id}>{tpl.name}</MenuItem>
                ))}
              </LabeledSelect>
              <IconButton onClick={() => setBannerEditMode((v) => !v)} title={bannerEditMode ? 'Close editor' : 'Edit template'}>
                <EditIcon fontSize="medium" />
              </IconButton>
              <IconButton onClick={() => setShowNewBanner((v) => !v)} title={showNewBanner ? 'Cancel new template' : 'Add new template'}>
                <AddIcon fontSize="medium" />
              </IconButton>
            </div>
            {bannerEditMode && (
              <div>
                <TextField id="banner-draft-html" label="Template HTML" value={draftBannerHtml} onChange={(e) => setDraftBannerHtml(e.target.value)} rows={8} fullWidth multiline variant="standard" sx={{ fontFamily: 'monospace', '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}} />
                <div className="new-template-actions" style={{ display: 'flex', gap: 'var(--gap-2)', marginTop: '0.5rem' }}>
                  <IconButton onClick={() => setBannerEditMode(false)} title="Cancel edit">
                    <CloseIcon2 fontSize="medium" />
                  </IconButton>
                  <IconButton onClick={() => { saveBannerEdits(); setBannerEditMode(false); }} title="Save edits">
                    <SaveIcon fontSize="medium" />
                  </IconButton>
                </div>
              </div>
            )}
            {showNewBanner && (
              <div className="new-template-form">
                <TextField id="banner-new-name" label="Template name" type="text" value={newBannerName} onChange={(e) => setNewBannerName(e.target.value)} fullWidth variant="standard" sx={{ mb: 1, '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}} />
                <TextField id="banner-new-html" label="Template HTML" value={newBannerHtml} onChange={(e) => setNewBannerHtml(e.target.value)} rows={6} fullWidth multiline variant="standard" sx={{ fontFamily: 'monospace', '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}} />
                <div className="new-template-actions" style={{ display: 'flex', gap: 'var(--gap-2)', marginTop: '0.5rem' }}>
                  <IconButton onClick={() => { setShowNewBanner(false); setNewBannerName(''); setNewBannerHtml(''); }} title="Cancel new template">
                    <CloseIcon2 fontSize="medium" />
                  </IconButton>
                  <IconButton onClick={() => { addNewBannerTemplate(); setShowNewBanner(false); }} title="Save new template">
                    <SaveIcon fontSize="medium" />
                  </IconButton>
                </div>
              </div>
            )}
            <TextField
              id="banner-href"
              label="Banner Link URL"
              defaultValue={bannerHref}
              onBlur={(e) => setBannerHref(sanitizeUrl(e.currentTarget.value))}
              fullWidth
              variant="standard"
              sx={{ mt: 2, '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}}
              inputProps={{
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    (e.currentTarget as HTMLInputElement).blur();
                  }
                }
              }}
            />
            <TextField
              id="banner-alt"
              label="Banner Alt Text"
              defaultValue={bannerAlt}
              onBlur={(e) => setBannerAlt(e.currentTarget.value)}
              fullWidth
              variant="standard"
              sx={{ mt: 2, '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}}
              inputProps={{
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    (e.currentTarget as HTMLInputElement).blur();
                  }
                }
              }}
            />
            <Button
              variant="text"
              size="small"
              onClick={() => handleAdvancedToggle('banner')}
              endIcon={
                <ExpandMoreIcon
                  sx={{
                    transform: isAdvancedOpen('banner') ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}
                />
              }
              sx={{
                alignSelf: 'flex-start',
                mt: 2,
                color: 'rgba(0, 0, 0, 0.6)',
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)'
                }
              }}
            >
              Advanced settings
            </Button>
            <Collapse in={isAdvancedOpen('banner')} timeout="auto" unmountOnExit>
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <PaddingControls label="Section padding (px)" value={bannerPadding} onChange={onBannerPaddingChange} persistKey="banner:padding" />
              </Box>
            </Collapse>
        </SectionAccordion>
      </div>
    );
  };

  const MemoizedSortableHeroSection = React.memo(SortableHeroSection);
  const MemoizedSortableBannerSection = React.memo(SortableBannerSection);
  const SortableHeroCloneSection: React.FC<{ clone: HeroClone; isOpen: boolean }> = ({ clone, isOpen }) => {
    const id = `hero-clone-${clone.id}`;
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const { ['aria-describedby']: _ariaDescribedBy, ...sortableAttributes } = attributes as any;
    const translate = CSS.Transform.toString(transform);
    const style: React.CSSProperties = {
      transform: translate ? `${translate} translateZ(0)` : undefined,
      transition,
      borderRadius:5,
      willChange:'transform',
      position:'relative',
      background:'var(--panel-bg, #fff)',
      boxShadow: isDragging ? '0 6px 18px rgba(0,0,0,0.18)' : undefined,
      zIndex: isDragging ? 1200 : undefined,
      opacity: isDragging ? 0.97 : 1,
      pointerEvents: isDragging ? 'none' : 'auto'
    };
    return (
      <div ref={setNodeRef} style={style}>
        <SectionAccordion
          id={`left-${id}`}
          title={renamingId===id ? (
            <Box sx={{ display:'flex', alignItems:'center', gap:1, width:'100%' }} onClick={(e)=>e.stopPropagation()}>
              <TextField size="small" autoFocus value={renameDraft} onChange={(e)=>setRenameDraft(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ commitRename(); } else if(e.key==='Escape'){ cancelRename(); } }} variant="standard" placeholder={`${resolveTitle(id)} ${clone.id}`} sx={{ flex:1 }} />
              <IconButton size="small" onClick={(e)=>{ e.stopPropagation(); commitRename(); }}><SaveIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={(e)=>{ e.stopPropagation(); cancelRename(); }}><CloseIcon2 fontSize="small" /></IconButton>
            </Box>
          ) : (sectionTitles[id] ? sectionTitles[id] : `${resolveTitle(id)} ${clone.id}`)}
          expanded={isOpen}
          onToggle={() => handleAccordionToggle(id)}
          startAdornment={
            <IconButton component="span" size="small" {...sortableAttributes} {...listeners} onClick={(e)=>e.stopPropagation()} title="Reorder clone"><DragIndicatorIcon fontSize="small" /></IconButton>
          }
          actions={<MoreActions size="medium" items={(()=>{ const idx = sectionOrder.indexOf(id); return [
            { label:'Move up', icon:<ArrowUpwardIcon fontSize='small' />, disabled: idx <= 0, onClick:()=> moveSectionUp(id) },
            { label:'Move down', icon:<ArrowDownwardIcon fontSize='small' />, disabled: idx === -1 || idx >= sectionOrder.length -1, onClick:()=> moveSectionDown(id) },
            { label:'Clone', icon:<ContentCopyIcon fontSize='small' />, onClick:()=> cloneHeroSection() },
            { label:'Rename', icon:<EditIcon fontSize='small' />, onClick:()=> beginRename(id, sectionTitles[id] || `${resolveTitle(id)} ${clone.id}`) },
            { label:'Delete', icon:<DeleteIcon fontSize='small' />, onClick:() => removeHeroClone(clone.id) }
          ]; })()} />}
          detailsSx={{ pt:1 }}
        >
          <Box sx={{ display:'flex', flexDirection:'column', gap:1.25 }}>
            {/* Image preview */}
            {clone.image ? (
              <div style={{ marginBottom:'0.5rem' }}>
                <img src={clone.image} alt={clone.alt || ''} style={{ width:'100%', height:'auto', border:'1px solid rgba(0,0,0,0.2)', borderRadius:6, overflow:'hidden' }} />
              </div>
            ) : (
              <Typography variant="caption" sx={{ color:'text.secondary' }}>No hero image selected.</Typography>
            )}
            {/* Template row */}
            <div style={{ display:'flex', gap:'var(--gap-2)', alignItems:'center', marginTop:'0.25rem' }}>
              <LabeledSelect idBase={`hero-clone-template-${clone.id}`} label="Template" value={clone.templateId} onChange={(e)=>updateHeroCloneField(clone.id,'templateId', String(e.target.value))}>
                {heroTemplates.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </LabeledSelect>
            </div>
            {/* Hero Link URL */}
            <TextField
              size="small"
              label="Hero Link URL"
              value={clone.href}
              onChange={(e)=>updateHeroCloneField(clone.id,'href', sanitizeUrl(e.target.value))}
              fullWidth
              variant="standard"
              sx={{ mt:1, '& .MuiInput-underline:before': { borderBottomColor:'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor:'var(--color-primary)' } }}
            />
            {/* Hero Alt Text */}
            <TextField
              size="small"
              label="Hero Alt Text"
              value={clone.alt}
              onChange={(e)=>updateHeroCloneField(clone.id,'alt', e.target.value)}
              fullWidth
              variant="standard"
              sx={{ mt:1, '& .MuiInput-underline:before': { borderBottomColor:'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor:'var(--color-primary)' } }}
            />
            {/* Advanced settings (shared padding note) */}
            <Button
              variant="text"
              size="small"
              onClick={() => handleAdvancedToggle(id)}
              endIcon={<ExpandMoreIcon sx={{ transform: isAdvancedOpen(id) ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform 0.2s ease' }} />}
              sx={{ alignSelf:'flex-start', mt:1, color:'rgba(0,0,0,0.6)', backgroundColor:'transparent', '&:hover': { backgroundColor:'rgba(0,0,0,0.05)' } }}
            >
              Advanced settings
            </Button>
            <Collapse in={isAdvancedOpen(id)} timeout="auto" unmountOnExit>
              <Box sx={{ mt:1 }}>
                <Divider sx={{ mb:1 }} />
                <PaddingControls
                  label="Section padding (px)"
                  value={heroClonePaddings.get(clone.id) || heroPadding}
                  onChange={(pad) => setHeroClonePaddings(p => { const m = new Map(p); m.set(clone.id, pad); return m; })}
                  persistKey={`hero-clone:${clone.id}:padding`}
                />
              </Box>
            </Collapse>
            {/* Inline delete button removed per request */}
          </Box>
        </SectionAccordion>
      </div>
    );
  };
  const SortableBannerCloneSection: React.FC<{ clone: BannerClone; isOpen: boolean }> = ({ clone, isOpen }) => {
    const id = `banner-clone-${clone.id}`;
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const { ['aria-describedby']: _ariaDescribedBy, ...sortableAttributes } = attributes as any;
    const translate = CSS.Transform.toString(transform);
    const style: React.CSSProperties = {
      transform: translate ? `${translate} translateZ(0)` : undefined,
      transition,
      borderRadius:5,
      willChange:'transform',
      position:'relative',
      background:'var(--panel-bg, #fff)',
      boxShadow: isDragging ? '0 6px 18px rgba(0,0,0,0.18)' : undefined,
      zIndex: isDragging ? 1200 : undefined,
      opacity: isDragging ? 0.97 : 1,
      pointerEvents: isDragging ? 'none' : 'auto'
    };
    return (
      <div ref={setNodeRef} style={style}>
        <SectionAccordion
          id={`left-${id}`}
          title={renamingId===id ? (
            <Box sx={{ display:'flex', alignItems:'center', gap:1, width:'100%' }} onClick={(e)=>e.stopPropagation()}>
              <TextField size="small" autoFocus value={renameDraft} onChange={(e)=>setRenameDraft(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ commitRename(); } else if(e.key==='Escape'){ cancelRename(); } }} variant="standard" placeholder={`${resolveTitle(id)} ${clone.id}`} sx={{ flex:1 }} />
              <IconButton size="small" onClick={(e)=>{ e.stopPropagation(); commitRename(); }}><SaveIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={(e)=>{ e.stopPropagation(); cancelRename(); }}><CloseIcon2 fontSize="small" /></IconButton>
            </Box>
          ) : (sectionTitles[id] ? sectionTitles[id] : `${resolveTitle(id)} ${clone.id}`)}
          expanded={isOpen}
          onToggle={() => handleAccordionToggle(id)}
          startAdornment={
            <IconButton component="span" size="small" {...sortableAttributes} {...listeners} onClick={(e)=>e.stopPropagation()} title="Reorder clone"><DragIndicatorIcon fontSize="small" /></IconButton>
          }
          actions={<MoreActions size="medium" items={(()=>{ const idx = sectionOrder.indexOf(id); return [
            { label:'Move up', icon:<ArrowUpwardIcon fontSize='small' />, disabled: idx <= 0, onClick:()=> moveSectionUp(id) },
            { label:'Move down', icon:<ArrowDownwardIcon fontSize='small' />, disabled: idx === -1 || idx >= sectionOrder.length -1, onClick:()=> moveSectionDown(id) },
            { label:'Clone', icon:<ContentCopyIcon fontSize='small' />, onClick:()=> cloneBannerSection() },
            { label:'Rename', icon:<EditIcon fontSize='small' />, onClick:()=> beginRename(id, sectionTitles[id] || `${resolveTitle(id)} ${clone.id}`) },
            { label:'Delete', icon:<DeleteIcon fontSize='small' />, onClick:() => removeBannerClone(clone.id) }
          ]; })()} />}
          detailsSx={{ pt:1 }}
        >
          <Box sx={{ display:'flex', flexDirection:'column', gap:1.25 }}>
            {clone.image ? (
              <div style={{ marginBottom:'0.5rem' }}>
                <img src={clone.image} alt={clone.alt || ''} style={{ width:'100%', height:'auto', border:'1px solid rgba(0,0,0,0.2)', borderRadius:6, overflow:'hidden' }} />
              </div>
            ) : (
              <Typography variant="caption" sx={{ color:'text.secondary' }}>No banner image selected.</Typography>
            )}
            <div style={{ display:'flex', gap:'var(--gap-2)', alignItems:'center', marginTop:'0.25rem' }}>
              <LabeledSelect idBase={`banner-clone-template-${clone.id}`} label="Template" value={clone.templateId} onChange={(e)=>updateBannerCloneField(clone.id,'templateId', String(e.target.value))}>
                {bannerTemplates.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </LabeledSelect>
            </div>
            <TextField
              size="small"
              label="Banner Link URL"
              value={clone.href}
              onChange={(e)=>updateBannerCloneField(clone.id,'href', sanitizeUrl(e.target.value))}
              fullWidth
              variant="standard"
              sx={{ mt:1, '& .MuiInput-underline:before': { borderBottomColor:'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor:'var(--color-primary)' } }}
            />
            <TextField
              size="small"
              label="Banner Alt Text"
              value={clone.alt}
              onChange={(e)=>updateBannerCloneField(clone.id,'alt', e.target.value)}
              fullWidth
              variant="standard"
              sx={{ mt:1, '& .MuiInput-underline:before': { borderBottomColor:'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor:'var(--color-primary)' } }}
            />
            <Button
              variant="text"
              size="small"
              onClick={() => handleAdvancedToggle(id)}
              endIcon={<ExpandMoreIcon sx={{ transform: isAdvancedOpen(id) ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform 0.2s ease' }} />}
              sx={{ alignSelf:'flex-start', mt:1, color:'rgba(0,0,0,0.6)', backgroundColor:'transparent', '&:hover': { backgroundColor:'rgba(0,0,0,0.05)' } }}
            >
              Advanced settings
            </Button>
            <Collapse in={isAdvancedOpen(id)} timeout="auto" unmountOnExit>
              <Box sx={{ mt:1 }}>
                <Divider sx={{ mb:1 }} />
                <PaddingControls
                  label="Section padding (px)"
                  value={bannerClonePaddings.get(clone.id) || bannerPadding}
                  onChange={(pad) => setBannerClonePaddings(p => { const m = new Map(p); m.set(clone.id, pad); return m; })}
                  persistKey={`banner-clone:${clone.id}:padding`}
                />
              </Box>
            </Collapse>
            {/* Inline delete button removed per request */}
          </Box>
        </SectionAccordion>
      </div>
    );
  };
  const MemoizedSortableHeroCloneSection = React.memo(SortableHeroCloneSection);
  const MemoizedSortableBannerCloneSection = React.memo(SortableBannerCloneSection);

  /**
   * Body templates and selection state. Body templates define
   * modules for each product. They support alternating layout via
   * alternateMap. Users can select a template, edit it, and add
   * new ones which are persisted in localStorage.
   */
  const [bodyTemplates, setBodyTemplates] = useState<BodyTemplate[]>(defaultBodyTemplates);
  const [selectedBodyId, setSelectedBodyId] = useState<string>(defaultBodyTemplates[0].id);
  const [bodyEditMode, setBodyEditMode] = useState(false);
  const [draftBodyHtml, setDraftBodyHtml] = useState('');
  const [newBodyName, setNewBodyName] = useState('');
  const [newBodyHtml, setNewBodyHtml] = useState('');

  /**
   * Header templates and selection state. Headers render at the top
   * of the final email. They are static by default but can be
   * customised through editing and additional templates.
   */
  const [headerTemplates, setHeaderTemplates] = useState<HeaderTemplate[]>(defaultHeaderTemplates);
  const [selectedHeaderId, setSelectedHeaderId] = useState<string>(defaultHeaderTemplates[0].id);
  const [headerEditMode, setHeaderEditMode] = useState(false);
  const [draftHeaderHtml, setDraftHeaderHtml] = useState('');
  const [newHeaderName, setNewHeaderName] = useState('');
  const [newHeaderHtml, setNewHeaderHtml] = useState('');

  /**
   * Footer templates and selection state. Footers render at the
   * bottom of the final email. Like headers they can be edited and
   * extended by the user.
   */
  const [footerTemplates, setFooterTemplates] = useState<FooterTemplate[]>(defaultFooterTemplates);
  const [selectedFooterId, setSelectedFooterId] = useState<string>(defaultFooterTemplates[0].id);
  const [footerEditMode, setFooterEditMode] = useState(false);
  const [draftFooterHtml, setDraftFooterHtml] = useState('');
  const [newFooterName, setNewFooterName] = useState('');
  const [newFooterHtml, setNewFooterHtml] = useState('');

  /**
   * Visibility flags for new template forms. When true, the form
   * fields for adding a custom template are displayed in the
   * accordion content. When false, the form is hidden and only the
   * add icon is visible. Separate flags are used for header, body
   * and footer sections.
   */
  const [showNewHeader, setShowNewHeader] = useState(false);
  const [showNewBody, setShowNewBody] = useState(false);
  const [showNewFooter, setShowNewFooter] = useState(false);
  // Summary drawer tab state
  const [summaryTab, setSummaryTab] = useState(0); // 0: Product, 1: Assets, 2: Brand
  // Collection listing state (populated when a collection URL is detected)
  const [collectionItems, setCollectionItems] = useState<Array<{ id: string; title: string; price?: string; image?: string; url: string }>>([]);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [collectionSelection, setCollectionSelection] = useState<string[]>([]);
  const lastCollectionSelectionRef = useRef<string[]>([]);
  const [collectionQuery, setCollectionQuery] = useState('');
  // Indicates we are enriching selected collection rows by fetching product pages
  const [collectionEnriching, setCollectionEnriching] = useState(false);
  // Selected product context is declared earlier so helpers can reference it
  // Track most recently added product (for auto scroll + fade-in highlight)
  const [recentlyAdded, setRecentlyAdded] = useState<{ sectionId: number; index: number; ts: number } | null>(null);
  // Track product field updates (non-add changes) for brief highlight
  const [recentlyUpdated, setRecentlyUpdated] = useState<{ sectionId: number; index: number; field: string; ts: number } | null>(null);
  // Fallback: if a collection section gains its first product and no selection is set yet, select index 0
  useEffect(() => {
    if (!selectedProductCtx) {
      const collection = bodySections.find(s => s.name === 'Collection');
      if (collection && collection.products.length > 0) {
        setSelectedProductCtx({ sectionId: collection.id, index: 0 });
      }
    }
  }, [bodySections, selectedProductCtx]);

  // If multiple products shrink down to exactly one (after removals), auto-focus that remaining one
  useEffect(() => {
    const collection = bodySections.find(s => s.name === 'Collection');
    if (!collection) return;
    if (collection.products.length === 1) {
      const onlyIndex = 0;
      if (!selectedProductCtx || selectedProductCtx.sectionId !== collection.id || selectedProductCtx.index !== onlyIndex) {
        setSelectedProductCtx({ sectionId: collection.id, index: onlyIndex });
      }
    }
  }, [bodySections, selectedProductCtx]);

  // Scroll newly added product into view & fade highlight
  useEffect(() => {
    if (!recentlyAdded) return;
    const { sectionId, index } = recentlyAdded;
    let cancelled = false;
    let attempts = 0;

    const tryLocate = () => {
      if (cancelled) return;
      const el = document.querySelector(`[data-product-cell="${sectionId}-${index}"]`) as HTMLElement | null;
      if (!el) {
        attempts++;
        if (attempts < 15) setTimeout(tryLocate, 80);
        return;
      }
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const fullyVisible = rect.top >= 0 && rect.bottom <= vh;

      if (fullyVisible) {
        // Animate immediately even if already visible
        el.classList.add('recently-added');
        setTimeout(() => el.classList.remove('recently-added'), 1000);
      } else {
        const observer = new IntersectionObserver((entries) => {
          const entry = entries[0];
            if (entry.isIntersecting) {
              el.classList.add('recently-added');
              setTimeout(() => el.classList.remove('recently-added'), 1000);
              observer.disconnect();
            }
        }, { threshold: 0.4 });
        observer.observe(el);
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    tryLocate();
    return () => { cancelled = true; };
  }, [recentlyAdded]);

  // Animate updated (non-add) product cell
  useEffect(() => {
    if (!recentlyUpdated) return;
    const { sectionId, index } = recentlyUpdated;
    const el = document.querySelector(`[data-product-cell="${sectionId}-${index}"]`) as HTMLElement | null;
    if (el) {
      el.classList.add('recently-updated');
      const timer = setTimeout(() => el.classList.remove('recently-updated'), 900);
      return () => clearTimeout(timer);
    }
  }, [recentlyUpdated]);

  // Debounce timer for selection changes
  const collectionDebounceRef = useRef<NodeJS.Timeout | null>(null);
  // Cache for fetched product details keyed by URL to avoid refetching
  const productCacheRef = useRef<Map<string, ProductData>>(new Map());
  // Track selection operations to avoid applying stale results
  const selectionVersionRef = useRef(0);
  // Abort controller for in-flight selection fetches
  const selectionAbortRef = useRef<AbortController | null>(null);

  // Format collection price values into a consistent currency string
  const formatCollectionPrice = useCallback((val: unknown): string => {
    if (val == null) return '';
    const raw = String(val).trim();
    if (!raw) return '';
    // Attempt to infer currency code from symbol or code hints
    let code: string | undefined;
    if (/CA\$/.test(raw)) code = 'CAD';
    else if (/A\$/.test(raw)) code = 'AUD';
    else if (/NZ\$/.test(raw)) code = 'NZD';
    else if (/C\$/.test(raw)) code = 'CAD';
    else if (/US\$|USD/i.test(raw)) code = 'USD';
    else if (/EUR|€/.test(raw)) code = 'EUR';
    else if (/GBP|£/.test(raw)) code = 'GBP';
    else if (/JPY|¥/.test(raw)) code = 'JPY';
    else if (raw.includes('$')) code = 'USD';

    // Normalize numeric part
    const rawNumeric = raw.replace(/[^0-9.,-]/g, '');
    let digits = rawNumeric;
    if (!digits) return raw;
    const hadDot = digits.includes('.');
    const hadComma = digits.includes(',');
    if (hadComma && hadDot) {
      // Decide decimal separator by last occurrence
      if (digits.lastIndexOf('.') > digits.lastIndexOf(',')) {
        digits = digits.replace(/,/g, '');
      } else {
        digits = digits.replace(/\./g, '').replace(',', '.');
      }
    } else if (hadComma && !hadDot) {
      // Treat comma as decimal
      digits = digits.replace(',', '.');
    } else {
      // Strip thousands commas if any
      digits = digits.replace(/,/g, '');
    }
    let amount = parseFloat(digits);
    if (!isFinite(amount)) return raw;
    // Heuristic: if original numeric had no decimal separators and looks like cents (e.g., 16995),
    // assume cents and divide by 100 to get 169.95.
    if (!hadDot && !hadComma && /^\d{4,}$/.test(rawNumeric)) {
      amount = amount / 100;
    }
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: code || 'USD' }).format(amount);
    } catch {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }
  }, []);

  /**
   * Final generated HTML pieces. headerHtml/bodyHtml/footerHtml
   * contain the markup for each section. finalHtml concatenates
   * them for convenience but is not displayed directly. The code
   * view uses the individual pieces so that users can copy each
   * section separately.
   */
const [headerHtml, setHeaderHtml] = useState('');
const [bodyHtml, setBodyHtml] = useState('');
const [footerHtml, setFooterHtml] = useState('');
const [finalHtml, setFinalHtml] = useState('');
  // Bottom padding controls removed
  const [showAddSectionMenu, setShowAddSectionMenu] = useState(false);
  const addSectionRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [confirmNewOpen, setConfirmNewOpen] = useState(false);
  // Control SpeedDial manually (open on click only)
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  // Preview viewport mode: desktop|mobile
  type PreviewMode = 'desktop' | 'mobile';
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  // Apply persisted mode on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('previewMode');
      if (saved === 'desktop' || saved === 'mobile') setPreviewMode(saved);
    } catch {}
  }, []);
  // Persist when changed
  useEffect(() => {
    try { localStorage.setItem('previewMode', previewMode); } catch {}
  }, [previewMode]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addSectionRef.current && !addSectionRef.current.contains(e.target as Node)) {
        setShowAddSectionMenu(false);
      }
    };
    if (showAddSectionMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddSectionMenu]);

  /** Brand customisation panel visibility. When true a sliding
   * panel appears allowing the user to customise the default font,
   * primary/secondary colours, website URL and upload a logo. Settings
   * are not persisted or applied in this version, but the UI is prepared
   * for future extension.
   */
  // Open brand / right panel by default on initial load per request
  const [showBrandPanel, setShowBrandPanel] = useState(true);
  // Shimmer always enabled (toggle removed)
  const skelAnim: any = 'wave';
  const [brandName, setBrandName] = useState('');
  // Top loading bar (buffer variant)
  const [progress, setProgress] = useState<number>(-1);
  const [buffer, setBuffer] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(false);
  // Debounced loading to avoid flicker for very fast loads
  const [debouncedLoading, setDebouncedLoading] = useState(false);
  useEffect(() => {
    if (loading) {
      const t = setTimeout(() => setDebouncedLoading(true), 120);
      return () => clearTimeout(t);
    } else {
      setDebouncedLoading(false);
    }
  }, [loading]);
  const [brandPrimary, setBrandPrimary] = useState('#d19aa0');
  const [brandSecondary, setBrandSecondary] = useState('#F0C3C7');
  const [brandWebsite, setBrandWebsite] = useState('');
  // Track last detected page type
  const [detectedPageType, setDetectedPageType] = useState<'product'|'collection'|'home'|'blog'|'article'|'unknown'>('unknown');
  // Auto-switch to Product tab is handled on click handlers only, to avoid locking the tab.
  // Section paddings (px)
  const [headerPadding, setHeaderPadding] = useState<PaddingValue>({ top: 0, right: 0, bottom: 0, left: 0 });
  const [heroPadding, setHeroPadding] = useState<PaddingValue>({ top: 0, right: 0, bottom: 0, left: 0 });
  const [bannerPadding, setBannerPadding] = useState<PaddingValue>({ top: 0, right: 0, bottom: 0, left: 0 });
  const [footerPadding, setFooterPadding] = useState<PaddingValue>({ top: 0, right: 0, bottom: 0, left: 0 });
  const [bodySectionPaddings, setBodySectionPaddings] = useState<Map<number, PaddingValue>>(new Map());
  // Independent clone paddings
  const [heroClonePaddings, setHeroClonePaddings] = useState<Map<number, PaddingValue>>(new Map());
  const [bannerClonePaddings, setBannerClonePaddings] = useState<Map<number, PaddingValue>>(new Map());
  // Editable section titles
  const [sectionTitles, setSectionTitles] = useState<Record<string,string>>({});
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  // Active section id currently being dragged (for DragOverlay rendering)
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const beginRename = (id: string, current: string) => { setRenamingId(id); setRenameDraft(current); };
  const commitRename = () => {
    if (renamingId) {
      setSectionTitles(prev => ({ ...prev, [renamingId]: renameDraft.trim() || prev[renamingId] || defaultTitleFor(renamingId) }));
      setRenamingId(null); setRenameDraft('');
    }
  };
  const cancelRename = () => { setRenamingId(null); setRenameDraft(''); };
  // Load persisted titles & clone paddings
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const savedTitles = localStorage.getItem('edm:sectionTitles');
      if (savedTitles) setSectionTitles(JSON.parse(savedTitles));
      const savedHeroPads = localStorage.getItem('edm:heroClonePaddings');
      if (savedHeroPads) {
        const obj = JSON.parse(savedHeroPads) as Record<string,PaddingValue>;
        setHeroClonePaddings(new Map(Object.entries(obj).map(([k,v]) => [Number(k), v])));
      }
      const savedBannerPads = localStorage.getItem('edm:bannerClonePaddings');
      if (savedBannerPads) {
        const obj = JSON.parse(savedBannerPads) as Record<string,PaddingValue>;
        setBannerClonePaddings(new Map(Object.entries(obj).map(([k,v]) => [Number(k), v])));
      }
    } catch {}
  }, []);
  // Persist titles
  useEffect(() => {
    try { if (typeof window !== 'undefined') localStorage.setItem('edm:sectionTitles', JSON.stringify(sectionTitles)); } catch {}
  }, [sectionTitles]);
  // Persist hero clone paddings
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const obj: Record<number,PaddingValue> = {} as any;
      heroClonePaddings.forEach((v,k)=>{ obj[k]=v; });
      localStorage.setItem('edm:heroClonePaddings', JSON.stringify(obj));
    } catch {}
  }, [heroClonePaddings]);
  // Persist banner clone paddings
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const obj: Record<number,PaddingValue> = {} as any;
      bannerClonePaddings.forEach((v,k)=>{ obj[k]=v; });
      localStorage.setItem('edm:bannerClonePaddings', JSON.stringify(obj));
    } catch {}
  }, [bannerClonePaddings]);
  // ESC key closes active clone selector
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setActiveBannerCloneSelector(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  const defaultTitleFor = (id: string) => {
    if (id === 'hero') return 'Hero';
    if (id === 'banner') return 'Banner';
    if (id === 'header') return 'Header';
    if (id === 'footer') return 'Footer';
    if (id.startsWith('body-')) return 'Body Section';
    if (id.startsWith('hero-clone-')) return 'Hero Clone';
    if (id.startsWith('banner-clone-')) return 'Banner Clone';
    return 'Section';
  };
  const resolveTitle = (id: string, suffix?: string) => {
    const base = sectionTitles[id] || defaultTitleFor(id);
    return suffix ? `${base} ${suffix}` : base;
  };
  // Cloneable hero & banner sections
  type HeroClone = { id: number; image: string; alt: string; href: string; templateId: string };
  type BannerClone = { id: number; image: string; alt: string; href: string; templateId: string };
  const [heroClones, setHeroClones] = useState<HeroClone[]>([]);
  const [bannerClones, setBannerClones] = useState<BannerClone[]>([]);

  const onHeroPaddingChange = useCallback((p: PaddingValue) => setHeroPadding(p), []);
  const onBannerPaddingChange = useCallback((p: PaddingValue) => setBannerPadding(p), []);

  // Helper functions for body section paddings
  const getBodySectionPadding = (sectionId: number): PaddingValue => {
    return bodySectionPaddings.get(sectionId) || { top: 0, right: 0, bottom: 0, left: 0 };
  };

  const setBodySectionPadding = useCallback((sectionId: number, padding: PaddingValue) => {
    setBodySectionPaddings(prev => new Map(prev).set(sectionId, padding));
  }, []);

  // Show a dialog to prompt for a product URL on first load
  const [showBrandUrlDialog, setShowBrandUrlDialog] = useState(true);
  const [brandUrlInput, setBrandUrlInput] = useState('');
  // When the user submits a URL, only auto-initialize a body section for PRODUCT pages (not collections)
  // moved below after analyzeData declaration

  // Helper to extract base domain from a product URL
  function extractBaseDomain(url: string): string {
    try {
      const u = new URL(url);
      return u.origin;
    } catch {
      return '';
    }
  }

  // Helper to extract a readable brand name from a domain
  function extractBrandName(url: string): string {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, '');
      const parts = host.split('.');
      return parts.length > 1 ? parts[0].replace(/-/g, ' ') : host;
    } catch {
      return '';
    }
  }
  
  // Scalable page type detection for Summary header
  type PageType = 'product' | 'collection' | 'home' | 'blog' | 'article' | 'unknown';
  type PageDetection = {
    type: PageType;
    title: string;
    subline?: string;
    name?: string; // parsed entity name if available (product/collection/blog/article)
  };
  const detectPageInfo = useCallback((url: string, data: typeof analyzeData): PageDetection => {
    if (!url) return { type: 'unknown', title: 'Summary' };
    let u: URL | null = null;
    try { u = new URL(url); } catch { /* ignore */ }
    const path = (u?.pathname || url).toLowerCase();

    // Define registry of detectors for scalability
    const detectors: Array<() => PageDetection | null> = [
      // Product pages
      () => {
        if (/\/product(s)?\//.test(path)) {
          const name = data?.product?.title || '';
          return { type: 'product', title: 'Product Page Detected', subline: name ? `Product: ${name}` : undefined, name };
        }
        return null;
      },
      // Collection pages
      () => {
        if (/\/collection(s)?\//.test(path)) {
          return { type: 'collection', title: 'Collection Page Detected' };
        }
        return null;
      },
      // Blog index pages
      () => {
        if (/\/blog(s)?\//.test(path) && !/\/article(s)?\//.test(path)) {
          return { type: 'blog', title: 'Blog Page Detected' };
        }
        return null;
      },
      // Article pages
      () => {
        if (/\/article(s)?\//.test(path)) {
          return { type: 'article', title: 'Article Page Detected' };
        }
        return null;
      },
      // Home page
      () => {
        if (path === '/' || path === '') return { type: 'home', title: 'Homepage Detected' };
        return null;
      }
    ];

    for (const fn of detectors) {
      const res = fn();
      if (res) return res;
    }
    return { type: 'unknown', title: 'Summary' };
  }, []);
  const [brandLogo, setBrandLogo] = useState<File | null>(null);
  // Wizard modal removed; analysis results feed the persistent right panel
  const [analyzeData, setAnalyzeData] = useState<{
    storeName: string;
    logo?: string;
    logoSvg?: string;
    heroImages: string[];
    bannerImages: string[];
    colorScheme?: string[];
    primaryColor?: string;
    textColor?: 'black' | 'white';
    colorCandidates?: { source: string; color: string }[];
    fontFamilies: string[];
    announcementCopy?: string;
    product: ProductData;
  } | null>(null);

  // Freeze the summary header (e.g., "Product Page Detected" and the initial
  // "Product: <name>") so it doesn't change while editing. We capture the first
  // meaningful detection for product pages and reuse it for display.
  const [initialSummary, setInitialSummary] = useState<{
    title: string;
    subline?: string;
  } | null>(null);

  // Removed previous modal-based wizard selection state; selections apply directly in-panel
  // Optional announcement bar content to inject into header template
  const [brandAnnouncement, setBrandAnnouncement] = useState<string>('');
  // Selected text color for contrast on CTA/announcement (black or white)
  const [brandTextColor, setBrandTextColor] = useState<'black' | 'white'>('black');

  // When URL changes or analyzeData updates, update detected page type and fetch collection items if relevant
  useEffect(() => {
    const info = detectPageInfo(brandUrlInput, analyzeData);
    setDetectedPageType(info.type);
    if (info.type === 'collection' && brandUrlInput) {
      setCollectionLoading(true);
      (async () => {
        try {
          const res = await fetch(`/api/collection?url=${encodeURIComponent(brandUrlInput)}`);
          if (!res.ok) throw new Error(`collection fetch failed: ${res.status}`);
          const json = await res.json();
          const rows = (json.items as any[]).map((it, idx) => ({ id: it.url || String(idx), title: it.title || '', price: it.price || '', image: it.image || '', url: it.url }));
          setCollectionItems(rows);
        } catch (e) {
          console.warn(e);
          setCollectionItems([]);
        } finally {
          setCollectionLoading(false);
        }
      })();
    } else {
      setCollectionItems([]);
      setCollectionSelection([]);
    }
  }, [brandUrlInput, analyzeData]);

  // Capture the initial product summary so it stays fixed.
  // - Set it once when product page is detected
  // - If the subline wasn't available immediately, fill it in exactly once
  //   when it first becomes available (e.g., after analysis finishes).
  useEffect(() => {
    const info = detectPageInfo(brandUrlInput, analyzeData);
    if (info.type !== 'product') return;

    // If nothing captured yet, capture title and (if present) subline
    if (!initialSummary) {
      if (info.title || info.subline) {
        setInitialSummary({ title: info.title, subline: info.subline });
      }
      return;
    }

    // If we already captured, but subline was missing and now exists, set it once
    if (!initialSummary.subline && info.subline) {
      setInitialSummary({ title: initialSummary.title, subline: info.subline });
    }
  }, [brandUrlInput, analyzeData, detectPageInfo, initialSummary]);

  // When a collection page is detected, make the Collection tab the default (index 0 when present)
  // When leaving collection context, remap indices so Product stays selected if it was selected
  useEffect(() => {
    if (detectedPageType === 'collection') {
      setSummaryTab(0); // Collection is at index 0 when present
    } else {
      // Map: 1->0 (Product), 2->1 (Assets), 3->2 (Brand). Leave 0 as 0 (already Product without Collection)
      setSummaryTab((prev) => (prev === 1 ? 0 : prev >= 2 ? prev - 1 : prev));
    }
  }, [detectedPageType]);

  // When the user submits a URL, only auto-initialize a body section for PRODUCT pages (not collections)
  useEffect(() => {
    const info = detectPageInfo(brandUrlInput, analyzeData);
    if (brandWebsite && bodySections.length === 0 && brandUrlInput && info.type === 'product') {
      setBodySections([
        {
          id: 1,
          name: 'Products',
          urls: [brandUrlInput],
          products: [],
          selectedBodyId: defaultBodyTemplates[0].id,
          loading: false
        }
      ]);
    }
  }, [brandWebsite, brandUrlInput, analyzeData, bodySections.length]);

  // Cleanup timers and abort controllers on unmount
  useEffect(() => {
    return () => {
      if (collectionDebounceRef.current) clearTimeout(collectionDebounceRef.current);
      if (selectionAbortRef.current) {
        try { selectionAbortRef.current.abort(); } catch {}
      }
    };
  }, []);

  /**
   * Track which code blocks are expanded in the right‑panel accordion. Keys
   * correspond to the blocks: 'header', 'hero', 'footer' and each
   * body/product block like 'body-<section>-prod-<index>'. A value
   * of true means the block is open; false collapses it. Defaults
   * empty, which is treated as open when first rendered.
   */
  const [openCodeSections, setOpenCodeSections] = useState<{ [key: string]: boolean }>({});

  /**
   * Toggle a code block open or closed. When a key is not present
   * in the state it is treated as open by default. Calling this
   * toggles the current value.
   */
const toggleCodeSection = (key: string) => {
  setOpenCodeSections((prev) => {
    const isOpen = prev[key] !== false; // default open if not false
    return { ...prev, [key]: !isOpen };
  });
};

  /**
   * Add a notification message. The notification will persist for a
   * few seconds then automatically disappear. Use this helper after
   * actions like copying code or generating sections to provide
   * feedback to the user.
   */
  

  /**
   * Compute a data URI for the uploaded brand logo. When a file is
   * selected the FileReader API is used to convert it into a base64
   * string. If no file is selected the data URI is reset to empty.
   */

  // On first load, if no brandWebsite, show dialog
  useEffect(() => {
    if (!brandWebsite) {
      setShowBrandUrlDialog(true);
    }
  }, [brandWebsite]);

  // When user submits a URL, set brandWebsite and brandName
  const handleBrandUrlSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const base = extractBaseDomain(brandUrlInput);
    if (base) {
      setBrandWebsite(base);
      setBrandName(extractBrandName(brandUrlInput));
      // Analyze product page and show Summary in right drawer
      (async () => {
        try {
          const res = await fetch(`/api/analyze?url=${encodeURIComponent(brandUrlInput)}`);
          if (!res.ok) throw new Error(`Analyze failed: ${res.status}`);
          const data = await res.json();
          setAnalyzeData(data);
          // Open the right summary panel
          setShowBrandPanel(true);
        } catch (err) {
          console.error(err);
          addNotification('Failed to analyze page. You can continue manually.');
        } finally {
          setShowBrandUrlDialog(false);
        }
      })();
    }
  };

  useEffect(() => {
    if (brandLogo) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBrandLogoDataUrl(e.target?.result as string);
      };
      reader.readAsDataURL(brandLogo);
    } else {
      setBrandLogoDataUrl('');
    }
  }, [brandLogo]);

  useEffect(() => {
    // Intercept all navigation attempts on anchors within the preview area
    const containsInPreview = (node: Node | null) => !!(previewRef.current && node && previewRef.current.contains(node));

    const showLinkNotification = (evt: Event, anchor: Element) => {
      const href = (anchor as HTMLAnchorElement).getAttribute('href');
      if (!href) return;
      (evt as any)._linkNotified = true;
      addNotification(
        <span>
          External link: <a href={href} target="_blank" rel="noopener noreferrer">{href}</a>
        </span>
      );
      const sectionEl = (anchor as HTMLElement).closest('[data-section]');
      const sectionId = sectionEl?.getAttribute('data-section');
      if (sectionId) {
        setOpenSection(sectionId);
      }
    };

    const onClickCapture = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || !containsInPreview(target)) return;
      const anchor = target.closest('a');
      if (!anchor) return;
      e.preventDefault();
      e.stopPropagation();
      // If an editor is focused, blur it so any editor popovers/menus close
      if (document.activeElement instanceof HTMLElement) {
        try { document.activeElement.blur(); } catch {}
      }
      // Ensure no other handlers run
      if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }
      showLinkNotification(e, anchor);
    };

    // Prevent middle-click (auxclick) opening new tab
    const onAuxClickCapture = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || !containsInPreview(target)) return;
      const anchor = target.closest('a');
      if (!anchor) return;
      e.preventDefault();
      e.stopPropagation();
      if (document.activeElement instanceof HTMLElement) {
        try { document.activeElement.blur(); } catch {}
      }
      if (typeof (e as any).stopImmediatePropagation === 'function') {
        (e as any).stopImmediatePropagation();
      }
      showLinkNotification(e, anchor);
    };

    // Prevent keyboard-initiated navigation (Enter on focused link)
    const onKeyDownCapture = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || !containsInPreview(target)) return;
      if (e.key !== 'Enter') return;
      const anchor = target.tagName.toLowerCase() === 'a' ? target : target.closest('a');
      if (!anchor) return;
      e.preventDefault();
      e.stopPropagation();
      if (document.activeElement instanceof HTMLElement) {
        try { document.activeElement.blur(); } catch {}
      }
      if (typeof (e as any).stopImmediatePropagation === 'function') {
        (e as any).stopImmediatePropagation();
      }
      showLinkNotification(e, anchor);
    };

    // Attach at document level in capture phase to reliably preempt default navigation
    document.addEventListener('click', onClickCapture, true);
    document.addEventListener('auxclick', onAuxClickCapture as any, true);
    document.addEventListener('keydown', onKeyDownCapture, true);
    return () => {
      document.removeEventListener('click', onClickCapture, true);
      document.removeEventListener('auxclick', onAuxClickCapture as any, true);
      document.removeEventListener('keydown', onKeyDownCapture, true);
    };
  }, [viewMode, addNotification, setOpenSection]);

  /**
   * Apply the brand primary and secondary colours and font to a block
   * of HTML. Occurrences of the default accent colours (#d19aa0 and
   * #F0C3C7) are replaced with the chosen primary and secondary
   * colours. The default font stack 'Montserrat', Arial, Helvetica,
   * sans-serif is replaced with the selected font if provided.
   */
  const applyBrandColoursAndFont = (html: string): string => {
    let out = html;
    if (brandPrimary) {
      const regex = new RegExp('#d19aa0', 'gi');
      out = out.replace(regex, brandPrimary);
    }
    if (brandSecondary) {
      const regex = new RegExp('#F0C3C7', 'gi');
      out = out.replace(regex, brandSecondary);
    }
    return out;
  };

  /**
   * Inject the brand logo into the header. The first <img> tag found
   * in the header HTML is replaced with one that uses the
   * brandLogoDataUrl if it is defined. If no logo has been
   * uploaded the HTML is returned unchanged.
   */
  const applyBrandLogo = (html: string): string => {
    if (!html) return html;
    // Replace first img src with uploaded logo (if any)
    let out = html;
    if (brandLogoDataUrl) {
      out = out.replace(/<img([^>]+)src="[^">]*"/, `<img$1src="${brandLogoDataUrl}"`);
    }
    // Derive alt text preference order: analyzeData.storeName -> brandName -> existing alt
    let desiredAlt = (analyzeData?.storeName || brandName || '').trim();
    if (!desiredAlt) {
      try {
        const host = new URL(brandUrlInput || brandWebsite || '').hostname.replace(/^www\./,'');
        desiredAlt = host.split('.')[0];
      } catch {}
    }
    if (desiredAlt) {
      out = out.replace(/<img([^>]*?)alt="[^"]*"([^>]*)>/, (m, pre, post) => `<img${pre}alt="${desiredAlt}"${post}>`)
               .replace(/<img((?:(?!alt=)[^>])*)>/, (m, rest) => `<img${rest} alt="${desiredAlt}">`); // if no alt present
    }
    // Ensure the enclosing anchor (if logo wrapped in <a>) points to brandWebsite or base of current URL
    const siteHref = brandWebsite || (() => {
      try { return new URL(brandUrlInput).origin; } catch { return ''; }
    })();
    if (siteHref) {
      // Update first anchor that contains the (possibly replaced) img
      out = out.replace(/<a([^>]*?)href="[^"]*"([^>]*>)\s*<img/i, `<a$1href="${siteHref}"$2<img`);
    }
    return out;
  };

  // Inject announcement copy (if available) into the header template.
  // This targets the Default Header template using the "<!-- Announcement Bar -->" marker.
  const applyAnnouncementCopy = (html: string): string => {
    if (!brandAnnouncement || !html) return html;
    const marker = '<!-- Announcement Bar -->';
    const idx = html.indexOf(marker);
    if (idx === -1) return html;
    const after = html.slice(idx + marker.length);
    const tdStart = after.indexOf('<td');
    if (tdStart === -1) return html;
    const tdOpenEnd = after.indexOf('>', tdStart);
    if (tdOpenEnd === -1) return html;
    const tdClose = after.indexOf('</td>', tdOpenEnd + 1);
    if (tdClose === -1) return html;
    // Extract the td opening tag and adjust its text color according to brandTextColor
    const tdOpenTag = after.slice(tdStart, tdOpenEnd + 1);
    const desiredHex = brandTextColor === 'white' ? '#FFFFFF' : '#000000';
    let newTdOpen = tdOpenTag;
    const hasStyle = /style="([^"]*)"/i.test(newTdOpen);
    if (hasStyle) {
      // Replace existing color:... if present, else append color:...
      if (/color\s*:\s*[^;"']+/.test(newTdOpen)) {
        newTdOpen = newTdOpen.replace(/color\s*:\s*[^;"']+/i, `color:${desiredHex}`);
      } else {
        newTdOpen = newTdOpen.replace(/style="([^"]*)"/i, (m, s) => {
          const sep = s && s.trim().length > 0 && !s.trim().endsWith(';') ? ';' : '';
          return `style="${s}${sep}color:${desiredHex};"`;
        });
      }
    } else {
      // No style attribute – add one with the color
      newTdOpen = newTdOpen.replace('<td', `<td style="color:${desiredHex};"`);
    }
    // Add a stable hook to find and make this area editable in the preview
    if (!/data-announcement=/.test(newTdOpen)) {
      newTdOpen = newTdOpen.replace('<td', '<td data-announcement="true"');
    }
    const beforeHead = html.slice(0, idx + marker.length);
    const beforeTd = after.slice(0, tdStart);
    const afterPart = after.slice(tdClose);
    const annHtml = emailSafe ? sanitizeEmailHtml(brandAnnouncement) : brandAnnouncement;
    return beforeHead + beforeTd + newTdOpen + annHtml + afterPart;
  };

  // Floating toolbar removed: announcement is copy-only in preview like titles/descriptions

  // Inject padding into the wrapper table (the one with max-width:600px)
  const applyWrapperPadding = (html: string, padding?: PaddingValue): string => {
    if (!padding) return html;
    const allZero = padding.top === 0 && padding.right === 0 && padding.bottom === 0 && padding.left === 0;
    // If all zeros, treat as "no override" so template default padding (if any) remains.
    if (allZero) return html;
    const pr = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
    const regex = /(<table\b[^>]*style=")(.*?max-width\s*:\s*600px[^\"]*)(")[^>]*>/i;
    return html.replace(regex, (_m, p1: string, styleStr: string, p3: string) => {
      let newStyle = styleStr.replace(/padding\s*:\s*[^;\"]*;?/gi, '');
      if (newStyle.length > 0 && !newStyle.trim().endsWith(';')) newStyle += ';';
      newStyle += `padding:${pr};`;
      return `${p1}${newStyle}${p3}`;
    });
  };

  // Wrap a full body section's combined modules inside a single 600px wrapper table
  const wrapSectionWithWrapper = (innerHtml: string, padding?: PaddingValue): string => {
    // Detect if this is a product section via a marker comment we can embed or presence of product module signatures.
    const isProductSection = /data-product-cell=/.test(innerHtml) || /product-module-wrapper/.test(innerHtml);
    const allZero = !padding || (padding.top === 0 && padding.right === 0 && padding.bottom === 0 && padding.left === 0);
    const effectivePadding = (isProductSection && allZero)
      ? { top: 25, right: 25, bottom: 25, left: 25 }
      : (padding || { top: 0, right: 0, bottom: 0, left: 0 });
    const pr = `${effectivePadding.top}px ${effectivePadding.right}px ${effectivePadding.bottom}px ${effectivePadding.left}px`;
    const cls = isProductSection ? 'product-wrapper' : '';
    return `\n<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0;padding:0;">\n  <tr>\n    <td align="center" style="margin:0;padding:0;">\n      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="${cls}" style="max-width:600px;margin:0 auto;background:#FFFFFF;padding:${pr};">\n        <tr>\n          <td style="padding:0;">\n            ${innerHtml}\n          </td>\n        </tr>\n      </table>\n    </td>\n  </tr>\n</table>`;
  };

  // Remove a module's own 600px wrapper table and return its inner content.
  // This prevents per-item padding and keeps a single outer wrapper per section.
  const stripModuleWrapper = (html: string): string => {
    const re = /<table\b[^>]*style=\"[^\"]*max-width\s*:\s*600px[^\"]*\"[^>]*>\s*<tr>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>\s*<\/table>/i;
    const m = html.match(re);
    if (m && m[1]) return html.replace(re, m[1]);
    return html;
  };

  /**
   * Hero section state. A hero consists of a single banner image and
   * optional link/alt text. The hero template can be selected from
   * defaultHeroTemplates or user‑defined templates. When heroImage is
   * empty no hero section will be rendered. heroHtml holds the
   * compiled markup and is updated whenever heroImage or templates
   * change.
   */
  const [heroTemplates, setHeroTemplates] = useState<HeroTemplate[]>(defaultHeroTemplates);
  const [selectedHeroId, setSelectedHeroId] = useState<string>(defaultHeroTemplates[0].id);
  const [heroImage, setHeroImage] = useState<string>('');
  // Pre-fill hero alt with brand name (or a sensible default)
  const [heroAlt, setHeroAlt] = useState<string>(brandName || 'Brand');
  const [heroHref, setHeroHref] = useState<string>('');
  const [heroHtml, setHeroHtml] = useState<string>('');
  const [heroEditMode, setHeroEditMode] = useState<boolean>(false);
  const [draftHeroHtml, setDraftHeroHtml] = useState<string>('');
  const [newHeroName, setNewHeroName] = useState<string>('');
  const [newHeroHtml, setNewHeroHtml] = useState<string>('');
  const [showNewHero, setShowNewHero] = useState<boolean>(false);

  /**
   * List of alternate hero images extracted from the site. When the
   * hero image is fetched via the API the endpoint returns an array
   * of image URLs. The first image is used as the default heroImage
   * and the rest are available for selection in the interactive
   * preview. When the list is empty no alternative images are
   * available. heroImages is not persisted across sessions.
  */
  const [heroImages, setHeroImages] = useState<string[]>([]);

  /**
   * Banner section state. The banner is a single image module that appears
   * above the footer. It reuses the templating/editing behaviour of the
   * header section but renders with its own template and image. The image
   * is fetched from the configured brand website by looking for an element
   * with the class `mobile-banner`.
   */
  const [bannerTemplates, setBannerTemplates] = useState<BannerTemplate[]>(defaultBannerTemplates);
  const [selectedBannerId, setSelectedBannerId] = useState<string>(defaultBannerTemplates[0].id);
  const [bannerImage, setBannerImage] = useState<string>('');
  // Pre-fill banner alt with brand name (or a sensible default)
  const [bannerAlt, setBannerAlt] = useState<string>(brandName || 'Brand');
  const [bannerHref, setBannerHref] = useState<string>('');
  // Banner image selector overlay state (main preview)
  const [showBannerSelector, setShowBannerSelector] = useState<boolean>(false);
  // Active banner clone id currently showing the alternative image selector overlay
  const [activeBannerCloneSelector, setActiveBannerCloneSelector] = useState<number | null>(null);
  const [bannerHtml, setBannerHtml] = useState<string>('');
  const [bannerEditMode, setBannerEditMode] = useState<boolean>(false);
  const [draftBannerHtml, setDraftBannerHtml] = useState<string>('');
  const [newBannerName, setNewBannerName] = useState<string>('');
  const [newBannerHtml, setNewBannerHtml] = useState<string>('');
  const [showNewBanner, setShowNewBanner] = useState<boolean>(false);

  const fetchHeroForBrand = useCallback(async () => {
    if (!brandWebsite) return;
    try {
      const heroRes = await fetch(`/api/hero?url=${encodeURIComponent(brandWebsite)}`);
      if (heroRes.ok) {
        const heroData = await heroRes.json();
        if (heroData.images && Array.isArray(heroData.images) && heroData.images.length > 0) {
          setHeroImages(heroData.images);
          setHeroImage(heroData.images[0]);
          setHeroHref(brandWebsite);
          // Prefill alt with brand name so input is not empty/placeholder
          setHeroAlt(analyzeData?.storeName || brandName || 'Brand');
        }
      }
    } catch (err) {
      console.warn('Failed to fetch hero images', err);
    }
  }, [brandWebsite, brandName]);

  const fetchBannerForBrand = useCallback(async () => {
    if (!brandWebsite) return;
    try {
      const res = await fetch(`/api/banner?url=${encodeURIComponent(brandWebsite)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.image) {
          setBannerImage(data.image);
          setBannerHref(brandWebsite);
          // Prefill alt with brand name so input is not empty/placeholder
          setBannerAlt(analyzeData?.storeName || brandName || 'Brand');
        }
      }
    } catch (err) {
      console.warn('Failed to fetch banner image', err);
    }
  }, [brandWebsite, brandName]);

  /**
   * Fetch hero images for the configured brand website. This runs on
   * initial load, whenever the website URL changes, or when the hero
   * section is added. The first image returned becomes the default
   * hero image and link target.
   */
  useEffect(() => {
    if (showHeroSection) {
      fetchHeroForBrand();
    }
  }, [fetchHeroForBrand, showHeroSection]);

  // Fetch banner image for the configured brand website. On success the
  // first image with the class `mobile-banner` is used as the banner
  // image. Images are fetched on initial load, when the website URL
  // changes, or when the banner section is added.
  useEffect(() => {
    if (showBannerSection) {
      fetchBannerForBrand();
    }
  }, [fetchBannerForBrand, showBannerSection]);

  /**
   * Update a hero property. This callback is passed to the
   * HeroTableModule so edits in the preview propagate to the
   * underlying state. Supported fields are 'image', 'alt' and
   * 'href'. The heroHtml string will be recomputed in the
   * useEffect below when these values change.
   */
  const updateHero = (field: 'image' | 'alt' | 'href', value: string) => {
    if (field === 'image') setHeroImage(value);
    else if (field === 'alt') setHeroAlt(value);
    else if (field === 'href') setHeroHref(value);
  };

  /**
   * Brand logo data URI. When a user uploads a logo file the file
   * contents are converted into a data URI that can be embedded
   * directly into the HTML. brandLogoDataUrl is empty if no logo
   * has been selected.
   */
  const [brandLogoDataUrl, setBrandLogoDataUrl] = useState('');

  // When analyzeData arrives, initialize announcement if not set
  useEffect(() => {
    if (!analyzeData) return;
    // Prefill announcement content with fetched copy if our field is empty
    if ((!brandAnnouncement || !brandAnnouncement.trim()) && analyzeData.announcementCopy) {
      setBrandAnnouncement(analyzeData.announcementCopy);
    }
    // If we have a logo URL and no uploaded file override, use it for preview in the field adornment
    if (!brandLogoDataUrl && analyzeData.logo) {
      setBrandLogoDataUrl(analyzeData.logo);
    }
  }, [analyzeData]);

  // Make the announcement bar editable directly in the preview
  // Make the announcement bar editable directly in the preview with live sync
  useLiveEditable(
    () => previewRef.current?.querySelector('[data-announcement="true"]') as HTMLElement | null,
    brandAnnouncement,
    (html) => {
      // Copy-only: strip formatting and store as <p> with <br>
      const stored = inlineHtmlToParagraphHtml(html || '');
      setBrandAnnouncement(normalizeFontColorHtml(stored));
    },
    { debounceMs: 60, attributes: { contenteditable: 'true', spellcheck: 'false' } }
  );

  // Track when the announcement element has focus to avoid re-rendering headerHtml mid-typing
  const annEditingRef = useRef(false);
  useEffect(() => {
    const el = previewRef.current?.querySelector('[data-announcement="true"]') as HTMLElement | null;
    if (!el) return;
    const onFocusIn = () => { annEditingRef.current = true; };
    const onFocusOut = () => { annEditingRef.current = false; };
    el.addEventListener('focusin', onFocusIn);
    el.addEventListener('focusout', onFocusOut);
    return () => {
      el.removeEventListener('focusin', onFocusIn);
      el.removeEventListener('focusout', onFocusOut);
    };
  }, [headerHtml, previewRef]);

  // Ripple overlay for announcement bar interactions
  const annRippleRef = useRef<any>(null);
  const startAnnRipple = (event?: MouseEvent | React.MouseEvent) => {
    try { annRippleRef.current?.start(event as any); } catch {}
  };
  const stopAnnRipple = () => {
    try { annRippleRef.current?.stop({}) } catch {}
  };

  // Ripple overlay for footer interactions (confined to 600px table)
  const footerRippleRef = useRef<any>(null);
  const handleFooterRippleMouseDown = (e: React.MouseEvent) => {
    try { footerRippleRef.current?.start(e as any); } catch {}
  };
  const handleFooterRippleMouseUp = (e: React.MouseEvent) => {
    try { footerRippleRef.current?.stop(e as any); } catch {}
  };
  const handleFooterRippleMouseLeave = (e: React.MouseEvent) => {
    try { footerRippleRef.current?.stop(e as any); } catch {}
  };

  // Attach pointer events to announcement bar to trigger ripple
  useEffect(() => {
    const el = previewRef.current?.querySelector('[data-announcement="true"]') as HTMLElement | null;
    if (!el) return;
    const onDown = (e: MouseEvent) => startAnnRipple(e);
    const onUp = () => stopAnnRipple();
    const onLeave = () => stopAnnRipple();
    const onClick = (e: MouseEvent) => {
      // Prevent any anchor inside announcement from stealing focus/navigation during editing
      const target = e.target as HTMLElement;
      if (target && target.closest('a')) {
        e.preventDefault();
        e.stopPropagation();
        const a = target.closest('a') as HTMLAnchorElement | null;
        const href = a?.getAttribute('href') || '';
        if (href && !(e as any)._linkNotified) {
          addNotification(
            <span>
              External link: <a href={href} target="_blank" rel="noopener noreferrer">{href}</a>
            </span>
          );
        }
      }
      // When the announcement bar is clicked, open the right panel and highlight the Brand tab
      setShowBrandPanel(true);
      setSummaryTab(detectedPageType === 'collection' ? 3 : 2);
    };
    el.addEventListener('mousedown', onDown);
    el.addEventListener('mouseup', onUp);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('click', onClick);
    return () => {
      el.removeEventListener('mousedown', onDown);
      el.removeEventListener('mouseup', onUp);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('click', onClick);
    };
  }, [headerHtml, previewRef, detectedPageType, addNotification]);

  // Subtle hover affordance (visual only)
  useEffect(() => {
    const el = previewRef.current?.querySelector('[data-announcement="true"]') as HTMLElement | null;
    if (!el) return;
    const onEnter = () => { el.style.opacity = '0.6'; };
    const onLeave = () => { el.style.opacity = '1'; };
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [headerHtml, previewRef]);

  // If hero image not set yet, preselect the first detected hero image
  useEffect(() => {
    if (!heroImage && (analyzeData?.heroImages?.length || 0) > 0) {
      const first = analyzeData!.heroImages[0];
      setHeroImage(first);
      setHeroHref(brandWebsite || '');
  setHeroAlt(analyzeData?.storeName || brandName || 'Brand');
    }
  }, [analyzeData, heroImage, brandWebsite, brandName]);

  // If banner image not set yet, preselect the first detected banner image
  useEffect(() => {
    if (!bannerImage && (analyzeData?.bannerImages?.length || 0) > 0) {
      const first = analyzeData!.bannerImages[0];
      setBannerImage(first);
      setBannerHref(brandWebsite || '');
  setBannerAlt(analyzeData?.storeName || brandName || 'Brand');
    }
  }, [analyzeData, bannerImage, brandWebsite, brandName]);

  /**
   * Helper to add a new body section. When invoked, this creates a
   * new entry in the bodySections array with its own blank URL list,
   * empty products and default template selection. The new section
   * name is auto‑incremented (Body 2, Body 3, etc.). After
   * creation, the newly added section is opened automatically so
   * users can start editing it.
   */
  const addBodySection = () => {
    // Determine a unique next id based on existing sections
    const nextId = bodySections.length ? Math.max(...bodySections.map((s) => s.id)) + 1 : 1;
    const newSection: BodySection = {
      id: nextId,
      name: `Body ${nextId}`,
      urls: [''],
      products: [],
      selectedBodyId: defaultBodyTemplates[0].id,
      loading: false,
      alternate: true
    };
    setBodySections((prev) => [...prev, newSection]);
    setSectionOrder((prev) => {
      const arr = [...prev];
      const newKey = `body-${nextId}`;
      const bannerIdx = arr.indexOf('banner');
      if (bannerIdx >= 0) arr.splice(bannerIdx, 0, newKey);
      else arr.push(newKey);
      return arr;
    });
    setOpenSection(`body-${nextId}`);
  };

  const removeHeaderSection = () => {
    setShowHeaderSection(false);
    setHeaderHtml('');
    setOpenSection((prev) => (prev === 'header' ? '' : prev));
  };

  const removeHeroSection = () => {
    setShowHeroSection(false);
    setHeroImage('');
    setHeroAlt('');
    setHeroHref('');
    setHeroHtml('');
    setSectionOrder((prev) => prev.filter((id) => id !== 'hero'));
    setOpenSection((prev) => (prev === 'hero' ? '' : prev));
  };

  const removeBannerSection = () => {
    setShowBannerSection(false);
    setBannerImage('');
    setBannerAlt('');
    setBannerHref('');
    setBannerHtml('');
    setSectionOrder((prev) => prev.filter((id) => id !== 'banner'));
    setOpenSection((prev) => (prev === 'banner' ? '' : prev));
  };

  const removeFooterSection = () => {
    setShowFooterSection(false);
    setFooterHtml('');
    setOpenSection((prev) => (prev === 'footer' ? '' : prev));
  };

  /**
   * Remove a body section entirely. When invoked, this deletes the
   * section from the bodySections array. If the removed section is
   * currently open, the accordion is collapsed. This helper is
   * triggered by the trash icon in each body section header.
   */
  const removeBodySection = (sectionId: number) => {
    // Capture the section being removed to decide follow-up actions
    const removedSection = bodySections.find((s) => s.id === sectionId);
    setBodySections((prev) => prev.filter((section) => section.id !== sectionId));
    setSectionOrder((prev) => prev.filter((id) => id !== `body-${sectionId}`));
    setOpenSection((prev) => (prev === `body-${sectionId}` ? '' : prev));

    // If the removed section is the Collection module, reset selection and right-panel Product tab state
    if (removedSection?.name === 'Collection') {
      // Deselect all rows in the DataGrid
      setCollectionSelection([]);
      // Cancel any pending debounce and in-flight enrichment
      if (collectionDebounceRef.current) clearTimeout(collectionDebounceRef.current);
      if (selectionAbortRef.current) { try { selectionAbortRef.current.abort(); } catch {} }
      setCollectionEnriching(false);
      // Reset the selected product context so Product tab goes blank on collection pages
      setSelectedProductCtx(null);
    }
    // If the currently selected product belonged to the removed section, clear it
    if (selectedProductCtx?.sectionId === sectionId) {
      setSelectedProductCtx(null);
    }
  };

  const addSectionByType = (type: string) => {
    switch (type) {
      case 'header':
        setShowHeaderSection(true);
        setOpenSection('header');
        break;
      case 'hero':
        setShowHeroSection(true);
        setSectionOrder((prev) => (prev.includes('hero') ? prev : ['hero', ...prev]));
        setOpenSection('hero');
        break;
      case 'banner':
        setShowBannerSection(true);
        setSectionOrder((prev) => (prev.includes('banner') ? prev : [...prev, 'banner']));
        setOpenSection('banner');
        break;
      case 'footer':
        setShowFooterSection(true);
        setOpenSection('footer');
        break;
      case 'body':
      default:
        addBodySection();
        break;
    }
    setShowAddSectionMenu(false);
  };

  /**
   * Update the selected template for a specific body section. This
   * updates the section’s selectedBodyId and also updates the
   * global selectedBodyId so that the edit form displays the
   * correct template source when editing. Without this the edit
   * textarea would show the wrong HTML if switching between
   * sections with different templates.
   */
  const setSectionTemplate = (sectionId: number, templateId: string) => {
    setBodySections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, selectedBodyId: templateId } : section
      )
    );
    setSelectedBodyId(templateId);
  };

  /**
   * Save edits to the currently selected hero template. The hero
   * template’s HTML is replaced with the contents of draftHeroHtml.
   * If the template is user‑defined it is persisted back to
   * localStorage under 'customHeroTemplates'.
   */
  const saveHeroEdits = () => {
    setHeroTemplates((prev) =>
      prev.map((tpl) => (tpl.id === selectedHeroId ? { ...tpl, html: draftHeroHtml } : tpl))
    );
    setHeroEditMode(false);
    // Persist edits for custom templates
    try {
      if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem('customHeroTemplates');
        const list: HeroTemplate[] = stored ? JSON.parse(stored) : [];
        const updated = list.map((tpl) =>
          tpl.id === selectedHeroId ? { ...tpl, html: draftHeroHtml } : tpl
        );
        window.localStorage.setItem('customHeroTemplates', JSON.stringify(updated));
      }
    } catch (err) {
      console.warn('Failed to persist hero template edits', err);
    }
  };

  /**
   * Add a new hero template. The name and HTML are taken from the
   * newHeroName and newHeroHtml fields. A unique id is generated
   * based on the name and timestamp. The new template is stored
   * alongside existing templates and persisted into localStorage.
   */
  const addNewHeroTemplate = () => {
    const name = newHeroName.trim();
    const html = newHeroHtml.trim();
    if (!name || !html) return;
    const id = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const newTpl: HeroTemplate = { id, name, html };
    setHeroTemplates((prev) => [...prev, newTpl]);
    try {
      if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem('customHeroTemplates');
        const list: HeroTemplate[] = stored ? JSON.parse(stored) : [];
        list.push(newTpl);
        window.localStorage.setItem('customHeroTemplates', JSON.stringify(list));
      }
    } catch (err) {
      console.warn('Failed to save custom hero template', err);
    }
    setNewHeroName('');
    setNewHeroHtml('');
  };

  /**
   * Load any custom hero templates from localStorage. This mirrors
   * the behaviour for body/header/footer templates. Custom hero
   * templates are stored under the key 'customHeroTemplates'.
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedHero = window.localStorage.getItem('customHeroTemplates');
        if (storedHero) {
          const parsed: HeroTemplate[] = JSON.parse(storedHero);
          if (Array.isArray(parsed) && parsed.length) {
            setHeroTemplates((prev) => [...prev, ...parsed]);
          }
        }
      } catch (err) {
        console.warn('Failed to load custom hero templates', err);
      }
    }
  }, []);

  /**
   * Compose the full email whenever any part of the data changes. This
   * includes header/footer/hero template selection, body sections,
   * products, hero image and brand customisations. The composed
   * HTML uses Option A semantics: the same HTML string is used for
   * both preview and code output. Brand colours, fonts and logos
   * are applied uniformly across all sections.
   */
  useEffect(() => {
    // Compose header
    let headerStr = headerHtml;
    const isAnnFocused = annEditingRef.current === true;
    if (!isAnnFocused) {
      if (showHeaderSection) {
        const headerTemplate = headerTemplates.find((t) => t.id === selectedHeaderId);
        headerStr = headerTemplate ? headerTemplate.html : '';
        headerStr = applyBrandColoursAndFont(headerStr);
        headerStr = applyBrandLogo(headerStr);
        headerStr = applyAnnouncementCopy(headerStr);
        headerStr = applyWrapperPadding(headerStr, headerPadding);
      } else {
        headerStr = '';
      }
    }
    // Compose hero if an image has been set
    let heroStr = '';
    const heroTemplate = heroTemplates.find((t) => t.id === selectedHeroId);
    if (showHeroSection && heroTemplate && heroImage) {
      const heroData: any = {
        heroImage,
        heroAlt: heroAlt || '',
        heroHref: heroHref || ''
      };
      if (!heroData.heroAlt && brandName) heroData.heroAlt = brandName;
      // Render hero using the full template object. Passing the raw
      // HTML string causes renderTemplate to receive undefined for
      // template.html and results in runtime errors. See data/templates.ts.
  heroStr = renderTemplate(heroTemplate as any, heroData);
  heroStr = applyBrandColoursAndFont(heroStr);
  heroStr = applyWrapperPadding(heroStr, heroPadding);
    }
    // Compose body across all sections
    const bodyHtmlMap: Record<string, string> = {};
    bodySections.forEach((section) => {
      let sectionHtml = '';
      // Special handling for grid: build a single multi-row table with up to 3 images per row,
      // 12px spacing between tiles (6px horizontal inset on each side, 12px vertical gap between rows).
      if (section.selectedBodyId === 'grid') {
        const images = section.products.map(p => (p as any).image).filter(Boolean) as string[];
        if (images.length) {
          // Use shared helper to build independent row tables with spacing
          const rowsHtml = buildGridRowsHtml(images, { gap: 12, cellPad: 6, perRow: 3 });
          // Apply desktop padding (25px default) and mobile override (12px via media query) using the same wrapper semantics as other body sections.
          const pad = getBodySectionPadding(section.id);
          // If no explicit padding set (all zeros), default to 25 on all sides like product sections.
          const effectivePad = (!pad || (pad.top===0 && pad.right===0 && pad.bottom===0 && pad.left===0))
            ? { top:25,right:25,bottom:25,left:25 }
            : pad;
          const pr = `${effectivePad.top}px ${effectivePad.right}px ${effectivePad.bottom}px ${effectivePad.left}px`;
          const gridInner = `<!-- Dynamic Grid (max 3 per row, each row independent) -->\n<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" align=\"center\" style=\"margin:0;padding:0;\">\n  <tr>\n    <td align=\"center\" style=\"margin:0;padding:0;\">\n      <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" class=\"product-wrapper\" style=\"max-width:600px;margin:0 auto;background:#FFFFFF;padding:${pr};\">\n        <tr>\n          <td style=\"padding:0;\">\n            ${rowsHtml}\n          </td>\n        </tr>\n      </table>\n    </td>\n  </tr>\n</table>`;
          sectionHtml += applyBrandColoursAndFont(gridInner);
        }
        // Directly assign without an extra wrap (gridInner already includes wrapper semantics)
        bodyHtmlMap[`body-${section.id}`] = sectionHtml;
        return; // Skip per-product processing for grid
      }
      section.products.forEach((prod, idx) => {
        // Determine orientation based on index and alternate map
        let templateIdToUse = section.selectedBodyId;
        if (idx % 2 === 1 && alternateMap[section.selectedBodyId]) {
          templateIdToUse = alternateMap[section.selectedBodyId];
        }
        const tpl = bodyTemplates.find((t) => t.id === templateIdToUse);
        if (!tpl) return;
        // Colour swatches removed per refactor
        // Build price HTML: include a strike‑through original price if
        // provided and different from the sale price. We leave the
        // currency as provided by the parser. If no original price is
        // present, show the sale price only. When both values are
        // empty the priceHtml will be empty as well.
        const rawSale = (prod as any).price || '';
        const rawOriginal = (prod as any).originalPrice;
        // Helper to ensure a leading $ unless another currency symbol already exists
        const withDollar = (val: string | undefined): string => {
          if (!val) return '';
            return /^[\$£€]/.test(val.trim()) ? val : `$${val.trim()}`;
        };
        const salePrice = withDollar(rawSale);
        const originalPrice = rawOriginal && rawOriginal !== rawSale ? withDollar(rawOriginal) : undefined;
        let priceHtml = '';
        if (originalPrice && originalPrice !== salePrice) {
          priceHtml = `<span style="text-decoration:line-through;color:#888888;margin-right:8px;font-weight:400;">${originalPrice}</span> ${salePrice}`;
        } else {
          priceHtml = salePrice;
        }
        // Choose description per product based on its own descSource (fallback metadata)
  const prodDescSource = (prod as any).descSource || 'metadata';
        let chosenDescription = (prod as any).description || '';
        if (prodDescSource === 'p' && (prod as any).descriptionP) {
          chosenDescription = (prod as any).descriptionP;
        } else if (prodDescSource === 'ul' && (prod as any).descriptionUl) {
          chosenDescription = (prod as any).descriptionUl;
        } else if (prodDescSource === 'metadata') {
          const meta = (prod as any).metadataDescription || (prod as any).originalMetadataDescription || '';
          if (meta) chosenDescription = meta;
        }
        // Safety: if chosenDescription is still empty but metadata exists, prefer it
        if (!chosenDescription) {
          const meta = (prod as any).metadataDescription || (prod as any).originalMetadataDescription || '';
          if (meta) chosenDescription = meta;
        }
        const ds = prodDescSource;
        // For UL in code view, use a marker to later swap the paragraph with UL markup
        const descForTemplate = ds === 'ul' && (prod as any).descriptionUl ? '[[DESC_MARKER]]' : chosenDescription;
        const productData: any = {
          ...prod,
          // Sanitize title/description if enabled
          title: emailSafe ? sanitizeInlineHtml((prod as any).title || '') : (prod as any).title,
          description: emailSafe ? sanitizeEmailHtml(descForTemplate) : descForTemplate,
          ctaLabel: (prod as any).ctaLabel || 'SHOP NOW',
          priceHtml,
          ctaBg: brandPrimary,
          ctaText: brandTextColor === 'white' ? '#FFFFFF' : '#000000'
        };
        // Render module using the full template. For feature templates, alternate orientation by swapping template ids per index.
        let effectiveTpl = tpl;
        if (section.alternate !== false && (section.selectedBodyId === 'product-image-left-copy-right' || section.selectedBodyId === 'product-copy-left-image-right')) {
          const isBaseLeft = section.selectedBodyId === 'product-image-left-copy-right';
          const altId = isBaseLeft ? 'product-copy-left-image-right' : 'product-image-left-copy-right';
          // Even indices use the base template orientation; odd indices use the alternate.
          if (idx % 2 === 1) {
            const altTpl = bodyTemplates.find(t => t.id === altId);
            if (altTpl) effectiveTpl = altTpl as any;
          }
        }
        // Render module HTML, then adjust top padding for subsequent feature modules using a placeholder.
        let moduleHtmlRaw = renderTemplate(effectiveTpl as any, productData);
        if (section.selectedBodyId === 'product-image-left-copy-right' || section.selectedBodyId === 'product-copy-left-image-right') {
          // Transform only the first canonical padding:25px; occurrence on the module-pad table into a tokenized form if not already transformed.
          // This avoids multiple regex passes and fragile replacements later.
          moduleHtmlRaw = moduleHtmlRaw.replace(
            /padding:25px;(?=(?:[^<]|<(?!table))*class=\"module-pad\")?/,
            'padding:{{MODULE_TOP_PADDING}} 25px 25px 25px;'
          );
          const topPad = (section.products.length > 1 && idx > 0) ? '0' : '25px';
          moduleHtmlRaw = moduleHtmlRaw.replace(/\{\{MODULE_TOP_PADDING\}\}/g, topPad);
        }
        let moduleHtml = moduleHtmlRaw;
        if (ds === 'ul' && (prod as any).descriptionUl) {
          const rawUl = (prod as any).descriptionUl as string;
          const processedUl = emailSafe ? sanitizeEmailHtml(rawUl) : rawUl;
          const ulHtml = normalizeListHtml(processedUl);
          moduleHtml = moduleHtml.replace(/<p[^>]*>\s*\[\[DESC_MARKER\]\]\s*<\/p>/i, ulHtml);
        }
  moduleHtml = stripModuleWrapper(moduleHtml);
  moduleHtml = applyBrandColoursAndFont(moduleHtml);
        sectionHtml += moduleHtml;
      });
      // Apply padding once to a single outer wrapper around the whole section
      bodyHtmlMap[`body-${section.id}`] = wrapSectionWithWrapper(sectionHtml, getBodySectionPadding(section.id));
    });
    // Compose banner (primary)
    let bannerStr = '';
    const bannerTemplate = bannerTemplates.find((t) => t.id === selectedBannerId);
    if (showBannerSection && bannerTemplate && bannerImage) {
      const data: any = { bannerImage, bannerAlt: bannerAlt || '', bannerHref: bannerHref || '' };
      if (!data.bannerAlt && brandName) data.bannerAlt = brandName;
      bannerStr = renderTemplate(bannerTemplate as any, data);
      bannerStr = applyBrandColoursAndFont(bannerStr);
      bannerStr = applyWrapperPadding(bannerStr, bannerPadding);
    }
    // Compose banner clones
    const bannerCloneHtml: Record<string,string> = {};
    bannerClones.forEach(clone => {
      const tpl = bannerTemplates.find(t => t.id === clone.templateId) || bannerTemplate;
      if (!tpl) return;
      if (!clone.image) return; // skip empty clones
      const data: any = { bannerImage: clone.image, bannerAlt: clone.alt || brandName || '', bannerHref: clone.href || '' };
      let html = renderTemplate(tpl as any, data);
      html = applyBrandColoursAndFont(html);
      const pad = bannerClonePaddings.get(clone.id) || bannerPadding;
      html = applyWrapperPadding(html, pad);
      bannerCloneHtml[`banner-clone-${clone.id}`] = html;
    });
    // Compose footer
    let footerStr = '';
    if (showFooterSection) {
      const footerTemplate = footerTemplates.find((t) => t.id === selectedFooterId);
      footerStr = footerTemplate ? footerTemplate.html : '';
    footerStr = applyBrandColoursAndFont(footerStr);
    footerStr = applyWrapperPadding(footerStr, footerPadding);
    }
    // Compose hero clones
    const heroCloneHtml: Record<string,string> = {};
    heroClones.forEach(clone => {
      const tpl = heroTemplates.find(t => t.id === clone.templateId) || heroTemplate;
      if (!tpl) return;
      if (!clone.image) return; // skip empty
      const data: any = { heroImage: clone.image, heroAlt: clone.alt || brandName || '', heroHref: clone.href || '' };
      let html = renderTemplate(tpl as any, data);
      html = applyBrandColoursAndFont(html);
      const pad = heroClonePaddings.get(clone.id) || heroPadding;
      html = applyWrapperPadding(html, pad);
      heroCloneHtml[`hero-clone-${clone.id}`] = html;
    });
    let orderedHtml = '';
    sectionOrder.forEach((id) => {
      if (id === 'hero') orderedHtml += heroStr;
      else if (id === 'banner') orderedHtml += bannerStr;
      else if (id.startsWith('body-')) orderedHtml += bodyHtmlMap[id] || '';
      else if (id.startsWith('hero-clone-')) orderedHtml += heroCloneHtml[id] || '';
      else if (id.startsWith('banner-clone-')) orderedHtml += bannerCloneHtml[id] || '';
    });

  setHeaderHtml(headerStr);
    setHeroHtml(heroStr);
    setBodyHtml(sectionOrder.filter((id) => id.startsWith('body-')).map((id) => bodyHtmlMap[id]).join(''));
    setBannerHtml(bannerStr);
    setFooterHtml(footerStr);
    let combined = `${headerStr}${orderedHtml}${footerStr}`;
    if (!/product-wrapper-mobile-style/.test(combined)) {
      combined += `\n<style id="product-wrapper-mobile-style">@media only screen and (max-width:600px){.product-wrapper{padding:15px !important;}}</style>`;
    }
    setFinalHtml(combined);
  }, [
    bodySections,
    selectedBodyId,
    selectedHeaderId,
    selectedFooterId,
    selectedBannerId,
    bodyTemplates,
    headerTemplates,
    footerTemplates,
    bannerTemplates,
    brandPrimary,
  brandSecondary,
    brandLogoDataUrl,
    brandAnnouncement,
    heroImage,
    heroAlt,
    heroHref,
  bannerImage,
    bannerAlt,
    bannerHref,
  heroClones,
  bannerClones,
    selectedHeroId,
    heroTemplates,
    showHeaderSection,
    showHeroSection,
    showBannerSection,
    showFooterSection,
    sectionOrder,
    // Ensure wrapper padding changes trigger recomposition
    headerPadding,
    heroPadding,
    bannerPadding,
    heroClonePaddings,
    bannerClonePaddings,
    footerPadding
  ]);

  /**
   * PrismJS reference and load state. We load Prism only on the client. We also load the markup
   * language component. Once loaded, we update the state to trigger
   * re-render so syntax highlighting applies. The eslint comment
   * suppresses warnings about asynchronous functions inside useEffect.
   */
  const prismRef = useRef<any>(null);
  const [prismLoaded, setPrismLoaded] = useState(false);

  // Load PrismJS dynamically on the client. We also load the markup
  // language component. Once loaded, we update the state to trigger
  // re-render so syntax highlighting applies. The eslint comment
  // suppresses warnings about asynchronous functions inside useEffect.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (async () => {
        try {
          const PrismModule = await import('prismjs');
          await import('prismjs/components/prism-markup');
          prismRef.current = PrismModule.default;
          setPrismLoaded(true);
        } catch (err) {
          console.warn('Failed to load PrismJS', err);
        }
      })();
    }
  }, []);

  /**
   * Compose a list of code sections for the right‑panel accordion. Each
   * item contains a unique key, a human‑readable title and the
   * corresponding HTML string. The structure mirrors the left side
  * panels: header, hero, each body section (containing all associated
  * products) and footer. Colours and prices are computed inline for
  * each product to match the final output. This list is
   * recomputed on every render because the dependent data (body
   * sections, templates, brand customisations, etc.) may change. If
   * performance becomes an issue use React.useMemo.
   */
  const codeSections: { key: string; title: string; code: string }[] = [];
  // Header section
  if (headerHtml) {
    codeSections.push({ key: 'header', title: 'Header', code: headerHtml });
  }
  sectionOrder.forEach((id) => {
    if (id === 'hero' && heroHtml) {
      codeSections.push({ key: 'hero', title: 'Hero', code: heroHtml });
      return;
    }
    if (id === 'banner' && bannerHtml) {
      codeSections.push({ key: 'banner', title: 'Banner', code: bannerHtml });
      return;
    }
    if (id.startsWith('body-')) {
      const section = bodySections.find((s) => `body-${s.id}` === id);
      if (!section) return;
      let combinedHtml = '';
      section.products.forEach((prod, idx) => {
      // Determine which template to use: alternate every other product
      let templateIdToUse = section.selectedBodyId;
      if (idx % 2 === 1 && alternateMap[section.selectedBodyId]) {
        templateIdToUse = alternateMap[section.selectedBodyId];
      }
      const tpl = bodyTemplates.find((t) => t.id === templateIdToUse);
      if (!tpl) return;
      // Colour swatches removed in refactor
      // Build price HTML: include original price if different
      const rawSale = (prod as any).price || '';
      const rawOriginal = (prod as any).originalPrice;
      const withDollar = (val: string | undefined): string => {
        if (!val) return '';
        return /^[\$£€]/.test(val.trim()) ? val : `$${val.trim()}`;
      };
      const salePrice = withDollar(rawSale);
      const originalPrice = rawOriginal && rawOriginal !== rawSale ? withDollar(rawOriginal) : undefined;
      let priceHtml = '';
      if (originalPrice && originalPrice !== salePrice) {
        priceHtml = `<span style="text-decoration:line-through;color:#888888;margin-right:8px;font-weight:400;">${originalPrice}</span> ${salePrice}`;
      } else {
        priceHtml = salePrice;
      }
      // Compose data object for templating
        // Choose description for code view as well
  const prodDescSource2 = (prod as any).descSource || 'metadata';
        let chosenDesc2 = (prod as any).description || '';
        if (prodDescSource2 === 'p' && (prod as any).descriptionP) {
          chosenDesc2 = (prod as any).descriptionP as string;
        } else if (prodDescSource2 === 'ul' && (prod as any).descriptionUl) {
          chosenDesc2 = (prod as any).descriptionUl as string;
        } else if (prodDescSource2 === 'metadata') {
          const meta2 = (prod as any).metadataDescription || (prod as any).originalMetadataDescription || '';
          if (meta2) chosenDesc2 = meta2 as string;
        }
        if (!chosenDesc2) {
          const meta2 = (prod as any).metadataDescription || (prod as any).originalMetadataDescription || '';
          if (meta2) chosenDesc2 = meta2 as string;
        }
        const data: any = {
          ...prod,
          title: emailSafe ? sanitizeInlineHtml((prod as any).title || '') : (prod as any).title,
          description: emailSafe ? sanitizeEmailHtml(chosenDesc2) : chosenDesc2,
          ctaLabel: (prod as any).ctaLabel || 'SHOP NOW',
          priceHtml,
          ctaBg: brandPrimary,
          ctaText: brandTextColor === 'white' ? '#FFFFFF' : '#000000'
      };
      // Render HTML and apply brand customisations (no per-item wrapper padding)
      let html = renderTemplate(tpl as any, data);
      // If the chosen description source is UL, mirror the preview replacement in code view
      if (prodDescSource2 === 'ul' && (prod as any).descriptionUl) {
        const rawUl = (prod as any).descriptionUl as string;
        const processedUl = emailSafe ? sanitizeEmailHtml(rawUl) : rawUl;
        const ulHtml = normalizeListHtml(processedUl);
        html = html.replace(/<p[^>]*>\s*\{\{\s*description\s*\}\}\s*<\/p>/i, ulHtml);
      }
      html = stripModuleWrapper(html);
      html = applyBrandColoursAndFont(html);
      combinedHtml += html;
    });
      if (combinedHtml) {
        // Wrap entire section in a single 600px wrapper so padding applies once per section
        codeSections.push({ key: id, title: section.name, code: wrapSectionWithWrapper(combinedHtml, getBodySectionPadding(section.id)) });
      }
    }
  });
  // Footer section
  if (footerHtml) {
    codeSections.push({ key: 'footer', title: 'Footer', code: footerHtml });
  }

  // alternateMap is now defined at the top of the file. Duplicate definitions
  // here have been removed to prevent ReferenceError when used earlier.

  /**
   * Load custom templates for body, header and footer from
   * localStorage. Each collection is stored under its own key. The
   * try/catch guards against JSON parsing errors and localStorage
   * access errors (e.g. in server‑side rendering).
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Body templates
        const storedBody = window.localStorage.getItem('customTemplates');
        if (storedBody) {
          const parsedBody: BodyTemplate[] = JSON.parse(storedBody);
          if (Array.isArray(parsedBody) && parsedBody.length) {
            setBodyTemplates((prev) => [...prev, ...parsedBody]);
          }
        }
        // Header templates
        const storedHeader = window.localStorage.getItem('customHeaderTemplates');
        if (storedHeader) {
          const parsedHeader: HeaderTemplate[] = JSON.parse(storedHeader);
          if (Array.isArray(parsedHeader) && parsedHeader.length) {
            setHeaderTemplates((prev) => [...prev, ...parsedHeader]);
          }
        }
        // Footer templates
        const storedFooter = window.localStorage.getItem('customFooterTemplates');
        if (storedFooter) {
          const parsedFooter: FooterTemplate[] = JSON.parse(storedFooter);
          if (Array.isArray(parsedFooter) && parsedFooter.length) {
            setFooterTemplates((prev) => {
              const all = [...prev, ...parsedFooter];
              const seen = new Set();
              return all.filter(tpl => {
                if (seen.has(tpl.id)) return false;
                seen.add(tpl.id);
                return true;
              });
            });
          }
        }
        // Banner templates
        const storedBanner = window.localStorage.getItem('customBannerTemplates');
        if (storedBanner) {
          const parsedBanner: BannerTemplate[] = JSON.parse(storedBanner);
          if (Array.isArray(parsedBanner) && parsedBanner.length) {
            setBannerTemplates((prev) => [...prev, ...parsedBanner]);
          }
        }
      } catch (err) {
        console.warn('Failed to load custom templates from localStorage', err);
      }
    }
  }, []);

  /**
   * Synchronise the draft HTML when the selected template for each
   * section changes. This allows the editing textareas to display
   * the current template. We deliberately keep the drafts separate
   * so that editing one section doesn’t override the others.
   */
  useEffect(() => {
    const currentBody = bodyTemplates.find((t) => t.id === selectedBodyId);
    if (currentBody) {
      setDraftBodyHtml(currentBody.html);
    }
  }, [selectedBodyId, bodyTemplates]);
  useEffect(() => {
    const currentHeader = headerTemplates.find((t) => t.id === selectedHeaderId);
    if (currentHeader) {
      setDraftHeaderHtml(currentHeader.html);
    }
  }, [selectedHeaderId, headerTemplates]);
  useEffect(() => {
    const currentBanner = bannerTemplates.find((t) => t.id === selectedBannerId);
    if (currentBanner) {
      setDraftBannerHtml(currentBanner.html);
    }
  }, [selectedBannerId, bannerTemplates]);
  useEffect(() => {
    const currentFooter = footerTemplates.find((t) => t.id === selectedFooterId);
    if (currentFooter) {
      setDraftFooterHtml(currentFooter.html);
    }
  }, [selectedFooterId, footerTemplates]);

  // Synchronise draft hero HTML when the selected hero template changes
  useEffect(() => {
    const currentHero = heroTemplates.find((t) => t.id === selectedHeroId);
    if (currentHero) {
      setDraftHeroHtml(currentHero.html);
    }
  }, [selectedHeroId, heroTemplates]);

  /**
   * Strip any query parameters from a URL, returning the base URL
   * before the '?' character.
   */
  // Use module-scope sanitizeUrl and isHttpUrl helpers

  /**
   * Update a URL within a body section. Called whenever the user
   * edits one of the URL inputs. Accepts the section id, the
   * index of the URL within that section and the new value. State
   * is updated immutably to ensure React re-renders appropriately.
   */
  const handleUrlChange = (sectionId: number, index: number, value: string) => {
    // Update draftUrls (input model)
    setDraftUrls((prev) => {
      const current = prev[sectionId] ?? getDraftUrls(sectionId);
      const next = [...current];
      next[index] = value;
      return { ...prev, [sectionId]: next };
    });
  };
  // Add a new blank URL input to a section. Optionally focus the newly
  // created field by passing its index.
  const addUrlField = (sectionId: number, focusIndex?: number) => {
    setDraftUrls((prev) => {
      const current = prev[sectionId] ?? getDraftUrls(sectionId);
      return { ...prev, [sectionId]: [...current, ''] };
    });
    if (focusIndex !== undefined) {
      setTimeout(() => {
        const el = document.getElementById(`url-${sectionId}-${focusIndex}`) as HTMLInputElement | null;
        el?.focus();
      }, 0);
    }
  };
  // Remove a URL input from a section at index.
  const removeUrlField = (sectionId: number, index: number) => {
    // Update draft inputs
    setDraftUrls((prev) => {
      const current = prev[sectionId] ?? getDraftUrls(sectionId);
      return { ...prev, [sectionId]: current.filter((_, i) => i !== index) };
    });
    // Mirror removal into the canonical bodySections data so the preview & composed HTML update instantly
    setBodySections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const urls = s.urls.filter((_, i) => i !== index);
      const products = s.products.filter((_, i) => i !== index);
      return { ...s, urls, products };
    }));
    // Optionally notify (commented out for noise reduction)
    // addNotification('Removed product URL');
  };

  // --- Hero / Banner cloning helpers ---
  const nextCloneId = (items: { id: number }[]) => (items.length ? Math.max(...items.map(i => i.id)) + 1 : 1);

  const cloneHeroSection = () => {
    setHeroClones(prev => {
      const id = nextCloneId(prev);
      const templateId = selectedHeroId || (heroTemplates[0]?.id ?? '');
      const newClone: HeroClone = { id, image: heroImage, alt: heroAlt, href: heroHref, templateId };
      // Initialize padding for this clone based on current heroPadding
      setHeroClonePaddings(p => new Map(p).set(id, { ...heroPadding }));
      setSectionOrder(o => {
        const existing = [...o];
        const heroIndex = existing.indexOf('hero');
        if (heroIndex !== -1) {
          existing.splice(heroIndex + 1, 0, `hero-clone-${id}`);
        } else {
          existing.unshift(`hero-clone-${id}`);
        }
        return existing;
      });
      return [...prev, newClone];
    });
  };

  const removeHeroClone = (id: number) => {
    setHeroClones(prev => prev.filter(c => c.id !== id));
    setSectionOrder(o => o.filter(s => s !== `hero-clone-${id}`));
  };

  const cloneBannerSection = () => {
    setBannerClones(prev => {
      const id = nextCloneId(prev);
      const templateId = selectedBannerId || (bannerTemplates[0]?.id ?? '');
      const newClone: BannerClone = { id, image: bannerImage, alt: bannerAlt, href: bannerHref, templateId };
      setBannerClonePaddings(p => new Map(p).set(id, { ...bannerPadding }));
      setSectionOrder(o => {
        const existing = [...o];
        const bannerIndex = existing.indexOf('banner');
        if (bannerIndex !== -1) {
          existing.splice(bannerIndex + 1, 0, `banner-clone-${id}`);
        } else {
          existing.unshift(`banner-clone-${id}`);
        }
        return existing;
      });
      return [...prev, newClone];
    });
  };

  const removeBannerClone = (id: number) => {
    setBannerClones(prev => prev.filter(c => c.id !== id));
    setSectionOrder(o => o.filter(s => s !== `banner-clone-${id}`));
  };

  const updateHeroCloneField = (id: number, field: keyof Omit<HeroClone,'id'>, value: string) => {
    setHeroClones(prev => prev.map(c => c.id === id ? { ...c, [field]: value } as HeroClone : c));
  };
  const updateBannerCloneField = (id: number, field: keyof Omit<BannerClone,'id'>, value: string) => {
    setBannerClones(prev => prev.map(c => c.id === id ? { ...c, [field]: value } as BannerClone : c));
  };

  /**
   * Toggle edit mode for a given section. When in edit mode a
   * textarea is displayed allowing the user to modify the raw HTML
   * template. Saving will update the template collection and exit
   * edit mode.
   */
  // Legacy toggle handlers removed. Editing modes are now toggled directly via inline callbacks.

  /**
   * Save template edits for each section. The modified HTML is
   * stored back into the appropriate templates array. Edits are
   * persisted into localStorage if the template is user‑created (i.e.
   * not part of the defaults). We do not differentiate here but
   * simply update the selected template in place.
   */
  const saveBodyEdits = () => {
    setBodyTemplates((prev) =>
      prev.map((t) => (t.id === selectedBodyId ? { ...t, html: draftBodyHtml } : t))
    );
    setBodyEditMode(false);
  };
  const saveHeaderEdits = () => {
    setHeaderTemplates((prev) =>
      prev.map((t) => (t.id === selectedHeaderId ? { ...t, html: draftHeaderHtml } : t))
    );
    setHeaderEditMode(false);
  };
  const saveBannerEdits = () => {
    setBannerTemplates((prev) =>
      prev.map((t) => (t.id === selectedBannerId ? { ...t, html: draftBannerHtml } : t))
    );
    setBannerEditMode(false);
  };
  const saveFooterEdits = () => {
    setFooterTemplates((prev) =>
      prev.map((t) => (t.id === selectedFooterId ? { ...t, html: draftFooterHtml } : t))
    );
    setFooterEditMode(false);
  };

  /**
   * Add a new custom template to a section. Each template must
   * provide a unique id. We generate one by slugifying the name
   * and appending a timestamp. New templates are persisted in
   * localStorage so they survive page reloads.
   */
  const addNewBodyTemplate = () => {
    const name = newBodyName.trim();
    const html = newBodyHtml.trim();
    if (!name || !html) return;
    const id = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const newTemplate: BodyTemplate = { id, name, html };
    setBodyTemplates((prev) => [...prev, newTemplate]);
    try {
      if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem('customTemplates');
        const list: BodyTemplate[] = stored ? JSON.parse(stored) : [];
        list.push(newTemplate);
        window.localStorage.setItem('customTemplates', JSON.stringify(list));
      }
    } catch (err) {
      console.warn('Failed to save custom body template', err);
    }
    setNewBodyName('');
    setNewBodyHtml('');
  };
  const addNewHeaderTemplate = () => {
    const name = newHeaderName.trim();
    const html = newHeaderHtml.trim();
    if (!name || !html) return;
    const id = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const newTemplate: HeaderTemplate = { id, name, html };
    setHeaderTemplates((prev) => [...prev, newTemplate]);
    try {
      if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem('customHeaderTemplates');
        const list: HeaderTemplate[] = stored ? JSON.parse(stored) : [];
        list.push(newTemplate);
        window.localStorage.setItem('customHeaderTemplates', JSON.stringify(list));
      }
    } catch (err) {
      console.warn('Failed to save custom header template', err);
    }
    setNewHeaderName('');
    setNewHeaderHtml('');
  };
  const addNewBannerTemplate = () => {
    const name = newBannerName.trim();
    const html = newBannerHtml.trim();
    if (!name || !html) return;
    const id = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const newTemplate: BannerTemplate = { id, name, html };
    setBannerTemplates((prev) => [...prev, newTemplate]);
    try {
      if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem('customBannerTemplates');
        const list: BannerTemplate[] = stored ? JSON.parse(stored) : [];
        list.push(newTemplate);
        window.localStorage.setItem('customBannerTemplates', JSON.stringify(list));
      }
    } catch (err) {
      console.warn('Failed to save custom banner template', err);
    }
    setNewBannerName('');
    setNewBannerHtml('');
  };
  const addNewFooterTemplate = () => {
    const name = newFooterName.trim();
    const html = newFooterHtml.trim();
    if (!name || !html) return;
    const id = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const newTemplate: FooterTemplate = { id, name, html };
    setFooterTemplates((prev) => [...prev, newTemplate]);
    try {
      if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem('customFooterTemplates');
        const list: FooterTemplate[] = stored ? JSON.parse(stored) : [];
        list.push(newTemplate);
        window.localStorage.setItem('customFooterTemplates', JSON.stringify(list));
      }
    } catch (err) {
      console.warn('Failed to save custom footer template', err);
    }
    setNewFooterName('');
    setNewFooterHtml('');
  };

  /**
   * Generate EDM: sends the list of product URLs to the API route
   * which fetches and parses the product details. Returns the raw
   * HTML (unused here) and a list of product objects. We ignore
   * the returned HTML and build our own using templates. If the
   * server responds with an error we alert the user.
   */
  /**
   * Generate a single body section. Sends the section's product URLs to
   * the API route which fetches and parses the product details. The
   * parsed products are stored on the section and the loading flag
   * cleared. If no URLs are provided an alert is shown. After the
   * first successful generation the hero image is automatically
   * fetched based on the origin of the first product URL if no hero
   * image has been set yet.
   */
  const generateSection = async (sectionId: number, urlsOverride?: string[]) => {
    const section = bodySections.find((s) => s.id === sectionId);
    if (!section) return;
    // Always use the latest draftUrls for this section
    const sourceUrls = urlsOverride ?? (draftUrls[sectionId] ?? section.urls);
    const filtered = sourceUrls.map((u) => (u || '').trim()).filter((u) => u);
    if (filtered.length === 0) {
      alert('Please provide at least one product URL.');
      return;
    }
    // Validate that all URLs are http(s)
    const invalid = filtered.filter((u) => !isHttpUrl(u));
    if (invalid.length > 0) {
      alert(`Invalid URL(s):\n${invalid.join('\n')}\n\nPlease enter full http(s) links.`);
      return;
    }
    // Save the latest URLs to the section immediately so preview updates on first click
    setBodySections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, urls: [...filtered], loading: true, products: [] } : s
      )
    );
    try {
      // Start loading bar immediately
      setLoading(true);
      setProgress(0);
      setBuffer(15);
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: filtered, templateId: section.selectedBodyId })
      });
      if (!res.ok) {
        let details = '';
        try {
          details = await res.text();
        } catch {}
        throw new Error(`Request failed with status ${res.status}${details ? `: ${details}` : ''}`);
      }
      // Response received
      setProgress(20);
      setBuffer(40);
      const data = (await res.json()) as GenerateResponse;
      // Parsed JSON
      setProgress(30);
      setBuffer(50);
      // Map returned products by url for lookup
  const productMap = new Map<string, ProductData>();
      data.products.forEach((p: any) => {
        const hasInfo = Object.keys(p || {}).some((key) => key !== 'url' && p[key]);
        if (!hasInfo) {
          const badUrl = p.url || 'Unknown URL';
          addNotification(`Error on fetching data from the url ${badUrl}`);
          return;
        }
        // Prefer mapping by original requested URL to avoid collisions when parser normalizes URLs
        const key = (p as any)._sourceUrl || p.url;
        // Build base product
        let primaryImage = p.image || '';
        const allImages = Array.isArray(p.images) ? p.images.filter((x: string) => !!x) : undefined;
        if (!primaryImage && allImages && allImages.length) {
          primaryImage = allImages[0]; // auto-select first image if none chosen
        }
        productMap.set(key, {
          url: p.url,
          pretitle: p.pretitle || '',
          title: p.title || '',
          price: p.price || '',
          originalPrice: p.originalPrice || undefined,
          description: p.description || '',
          metadataDescription: (p.metadataDescription ?? p.description ?? ''),
          originalMetadataDescription: (p.originalMetadataDescription ?? p.metadataDescription ?? p.description ?? ''),
          descriptionP: p.descriptionP || '',
          descriptionUl: p.descriptionUl || '',
          image: primaryImage,
          images: allImages,
          cta: p.cta || p.url,
          ctaLabel: (p as any).ctaLabel || 'SHOP NOW'
        });
      });
      // Build product list in input order, but do not drop user-entered URLs.
      // Keep all filtered URLs in the UI, and only render products for URLs that parsed successfully.
      const processed: ProductData[] = filtered
        .map((urlRaw) => {
          const url = sanitizeUrl(urlRaw);
          return productMap.get(url) || productMap.get(urlRaw);
        })
        .filter((p): p is ProductData => Boolean(p));
      const missingUrls = filtered.filter((urlRaw) => {
        const url = sanitizeUrl(urlRaw);
        return !productMap.has(url) && !productMap.has(urlRaw);
      });
      // Update section with processed products and clear loading flag
      // Force re-render by cloning each product object (in case references reused)
      setBodySections(prev => prev.map(s => {
        if (s.id !== sectionId) return s;
        return { ...s, products: processed.map(p => ({ ...p })), loading: false };
      }));
      // Surface any missing URLs as notifications (non-blocking)
      if (missingUrls.length) {
        // If API supplied skip reasons, map them
        const skipMap = new Map<string, string>();
        data.skipped?.forEach(s => skipMap.set(s.url.split('?')[0], s.reason));
        missingUrls.forEach(m => {
          const reason = skipMap.get(m) || 'no-data';
          const msg = reason === 'blocked' ? 'Blocked / rate limited' : reason === 'fetch-failed' ? 'Fetch failed' : reason === 'no-meaningful-fields' ? 'No meaningful fields' : reason;
          addNotification(`No data for URL: ${m} (${msg})`);
        });
      }
      // Hide after a short delay to avoid flicker, then reset
      setTimeout(() => {
        setLoading(false);
        setProgress(-1);
        setBuffer(-1);
      }, 200);
    } catch (error: any) {
      console.error('Generation failed', error);
      console.log(`Failed to generate products: ${error.message}`);
      setBodySections((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, loading: false } : s))
      );
      // Ensure the loading bar hides on error
      setLoading(false);
      setProgress(-1);
      setBuffer(-1);
    }
  };
  // Automatically generate the first body section when it is created (after user submits product URL)
  useEffect(() => {
    if (
      !autoGenTriedRef.current &&
      bodySections.length === 1 &&
      bodySections[0].products.length === 0 &&
      bodySections[0].urls[0] &&
      !bodySections[0].loading
    ) {
      // Mark as tried before calling to avoid re-entry if the call fails
      autoGenTriedRef.current = true;
      generateSection(bodySections[0].id);
    }
  }, [bodySections]);

  // Helper to fully reset state for a new EDM (exposed to confirm dialog)
  const resetAllState = useCallback(() => {
    setBodySections([]);
    setDraftUrls({});
    setSectionOrder(['hero','banner']);
    setHeroClones([]);
    setBannerClones([]);
  setHeroClonePaddings(new Map());
  setBannerClonePaddings(new Map());
    setOpenSection('');
    setShowHeaderSection(true);
    setShowHeroSection(true);
    setShowBannerSection(true);
    setShowFooterSection(true);
    setBodySectionPaddings(new Map());
    setHeaderHtml('');
    setBodyHtml('');
    setFooterHtml('');
    setFinalHtml('');
  setBrandName('');
    setBrandPrimary('#d19aa0');
    setBrandSecondary('#F0C3C7');
    setBrandWebsite('');
    setBrandUrlInput('');
    setBrandAnnouncement('');
    setBrandTextColor('black');
    setBrandLogo(null);
    setBrandLogoDataUrl('');
    setInitialSummary(undefined as any);
    // Banner reset
    setSelectedBannerId(defaultBannerTemplates[0].id);
    setBannerImage('');
    setBannerAlt('');
    setBannerHref('');
    setBannerHtml('');
    setBannerEditMode(false);
    setNewBannerName('');
    setNewBannerHtml('');
    setShowNewBanner(false);
    setBannerPadding({ top:0,right:0,bottom:0,left:0 });
    // Hero reset
    setSelectedHeroId(defaultHeroTemplates[0].id);
    setHeroImage('');
    setHeroAlt('Brand');
    setHeroHref('');
    setHeroHtml('');
    setHeroEditMode(false);
    setDraftHeroHtml('');
    setNewHeroName('');
    setNewHeroHtml('');
    setShowNewHero(false);
    setHeroImages([]);
    // Editing states
    setBodyEditMode(false);
    setHeaderEditMode(false);
    setFooterEditMode(false);
    setShowNewBody(false);
    setShowNewHeader(false);
    setShowNewFooter(false);
    setDraftBodyHtml('');
    setDraftHeaderHtml('');
    setDraftFooterHtml('');
    setNewBodyName('');
    setNewBodyHtml('');
    setNewHeaderName('');
    setNewHeaderHtml('');
    setNewFooterName('');
    setNewFooterHtml('');
    setShowAddSectionMenu(false);
    setEmailSafe(true);
    setSummaryTab(0);
    setSelectedProductCtx(null);
    autoGenTriedRef.current = false;
    setShowBrandUrlDialog(true);
    setViewMode('preview');
    addNotification('Started a new EDM');
  }, [addNotification]);

  // Removed unconditional generate on mount to prevent duplicate calls and loops

  /**
   * Generate all sections in the EDM. Iterates through each body section
   * sequentially and triggers its generation. This is invoked by the
   * universal "Generate EDM" button and updates the preview and
   * code for every module.
   */
  const generateAllSections = async () => {
    // Delegate progress updates to each section's generation to avoid conflicting values
    for (const section of bodySections) {
      await generateSection(section.id);
    }
  };

  /**
   * Update a product field in response to edits made in the preview.
   * This ensures two‑way binding between the editable preview and
   * the underlying data model. Updating the state triggers the
   * effect below which recomputes the HTML.
   */
  /**
   * Update a field within a product inside a specific body section. Edits
   * made in the preview update the underlying product array which
   * triggers a re‑render of the composed HTML.
   */
  const updateProductInSection = (sectionId: number, index: number, field: keyof ProductData, value: string) => {
    // Sanitize inline HTML for title updates to prevent unwanted <p> tags
    let nextValue = value;
    try {
      const { sanitizeInlineHtml } = require('../lib/sanitize');
      if (field === 'title' && typeof sanitizeInlineHtml === 'function') {
        nextValue = sanitizeInlineHtml(value);
      }
    } catch {}
    setBodySections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;
        const newProducts = [...section.products];
        const prod = { ...newProducts[index] } as any;
        if (field === 'descSource') {
          const v = value as any as 'metadata'|'p'|'ul';
          prod.descSource = v;
          // Update displayed description field based on chosen source but only for this product
          if (v === 'metadata') prod.description = (prod.metadataDescription as string) || (prod.originalMetadataDescription as string) || '';
          if (v === 'p') prod.description = (prod.descriptionP as string) || '';
          if (v === 'ul') prod.description = (prod.descriptionUl as string) || '';
        } else {
          (prod as any)[field] = nextValue;
          // Keep base description in sync when editing the active variant
          if (field === 'descriptionP' && (prod.descSource || 'metadata') === 'p') {
            prod.description = nextValue;
          }
            if (field === 'descriptionUl' && (prod.descSource || 'metadata') === 'ul') {
            prod.description = nextValue;
          }
          if ((field === 'metadataDescription' || field === 'description') && (prod.descSource || 'metadata') === 'metadata') {
            prod.description = nextValue;
          }
        }
        newProducts[index] = prod;
        return { ...section, products: newProducts };
      })
    );
    // Ensure the right panel is bound to this product when editing in preview (collection mode)
    if (detectedPageType === 'collection') {
      setSelectedProductCtx({ sectionId, index });
    }
    // If we're not on a collection page, also reflect key fields into analyzeData.product
    // so the right side RichTextField (which reads from analyzeData) stays in sync.
    if (detectedPageType !== 'collection') {
      if (field === 'title') {
        setAnalyzeData((d) => (d ? ({ ...d, product: { ...d.product, title: nextValue } }) : d));
      } else if (field === 'price') {
        setAnalyzeData((d) => (d ? ({ ...d, product: { ...d.product, price: nextValue } }) : d));
      } else if (field === 'ctaLabel') {
        setAnalyzeData((d) => (d ? ({ ...d, product: { ...d.product, ctaLabel: nextValue } }) : d));
      } else if (field === 'description' || field === 'metadataDescription' || field === 'descriptionP' || field === 'descriptionUl') {
        // Mirror description updates to all variants for live sync
        setAnalyzeData((d) => {
          if (!d) return d;
          const prod: any = { ...d.product };
          const v = nextValue;
          prod.description = v;
          prod.metadataDescription = v;
          prod.descriptionP = v;
          prod.descriptionUl = v;
          return { ...d, product: prod };
        });
      } else if (field === 'descSource') {
        setAnalyzeData((d) => {
          if (!d) return d;
          const prod: any = { ...d.product, descSource: value as any };
          if (prod.descSource === 'metadata') prod.description = prod.metadataDescription || prod.originalMetadataDescription || '';
          if (prod.descSource === 'p') prod.description = prod.descriptionP || '';
          if (prod.descSource === 'ul') prod.description = prod.descriptionUl || '';
          return { ...d, product: prod };
        });
      }
      // Additional fields can be mirrored here if needed in the future
    }
    // Trigger update pulse animation (throttling could be added later if needed)
    setRecentlyUpdated({ sectionId, index, field: field as string, ts: Date.now() });
  };

  // Normalization effect: migrate any legacy descChoice field to descSource once
  React.useEffect(() => {
    setBodySections(prev => prev.map(section => {
      let changed = false;
      const products = section.products.map(p => {
        if ((p as any).descChoice && !(p as any).descSource) {
          const np: any = { ...p, descSource: (p as any).descChoice };
          delete np.descChoice; // optional cleanup
          changed = true;
          return np as ProductData;
        }
        return p;
      });
      return changed ? { ...section, products } : section;
    }));
    setAnalyzeData(d => {
      if (!d) return d;
      const prod: any = d.product as any;
      if (prod && prod.descChoice && !prod.descSource) {
        const np = { ...prod, descSource: prod.descChoice };
        delete np.descChoice;
        return { ...d, product: np } as any;
      }
      return d;
    });
  }, []);

  /**
   * Compute the HTML for header, body and footer whenever the data
   * or selected templates change. Colours are limited to three and
   * a +n indicator is added if additional colours are available.
   */
//
// The body, header and footer HTML is now computed in a single
// useEffect defined earlier (see Option A implementation). The
// following legacy effect has been removed to prevent duplicate
// updates and inconsistent output.

  /**
   * Copy a given string to the clipboard. Feedback could be added
   * later (e.g. toast notifications) but is omitted for brevity.
   */
  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => {
          addNotification('Code copied!');
        })
        .catch((err) => {
          console.warn('Failed to copy to clipboard', err);
        });
    }
  };

  // Download a given string as a file with the provided filename
  const downloadAsFile = (filename: string, content: string, type = 'text/html;charset=utf-8') => {
    try {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('Failed to download file', err);
    }
  };

  /**
   * Helper to highlight HTML for code display. Prism returns an
   * HTML string containing <span> elements with classes for each
   * token. We set the language to markup since our templates are
   * HTML.
   */
  const highlight = (code: string) => {
    const Prism = prismRef.current;
    // If Prism has not loaded yet, return the raw code. This avoids
    // runtime errors during initial render or server‑side rendering.
    if (!Prism) return code;
    return Prism.highlight(code, Prism.languages.markup, 'markup');
  };

  const availableSectionTypes = [
    ...(!showHeaderSection ? [{ key: 'header', label: 'Header' }] : []),
    ...(!showHeroSection ? [{ key: 'hero', label: 'Hero' }] : []),
    { key: 'body', label: 'Body' },
    ...(!showBannerSection ? [{ key: 'banner', label: 'Banner' }] : []),
    ...(!showFooterSection ? [{ key: 'footer', label: 'Footer' }] : []),
  ];

  // Top heading moved into AppBar via AppLayout

  useEffect(() => {
    if (!brandWebsite) {
      landingInputRef.current?.focus();
    }
  }, [brandWebsite]);

  useEffect(() => {
    if (!brandWebsite) {
      setPlatformVisible(false);
      return;
    }

    const frame = requestAnimationFrame(() => setPlatformVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [brandWebsite]);

  if (!brandWebsite) {
    // Show a simple dialog to prompt for a product URL
    return (
      <div className="landing-shell">
        <form onSubmit={handleBrandUrlSubmit} className="landing-form" aria-label="Get started">
          <div className="landing-copy">
            <h1 className="landing-title">EDMs Made Effortless.</h1>
            <p className="landing-subtitle">Paste a Shopify product or catalogue URL. We do the rest.</p>
          </div>
          <Stack spacing={3} className="landing-input-stack">
            <TextField
              inputRef={landingInputRef}
              value={brandUrlInput}
              onChange={(e) => setBrandUrlInput(e.target.value)}
              placeholder="https://yourstore.com/products/example"
              variant="standard"
              className="landing-textfield"
              fullWidth
              required
              autoComplete="url"
            />
            <Button type="submit" className="landing-ctal" size="large" sx={{ alignSelf: 'center' }}>
              Generate Now
            </Button>
          </Stack>
        </form>
        {/* Wizard Dialog removed: content moved to persistent right summary panel */}
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>EDM Expresso</title>
        <meta name="description" content="Build modular EDMs from product pages" />
      </Head>
      <div className={`platform-shell${platformVisible ? ' platform-shell--visible' : ''}`}>
        <AppLayout
          title="EDM Espresso"
        left={<div
          className={`accordion-list${openSection ? ' has-open' : ''}`}
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            rowGap: '5px'
          }}
        >
            {debouncedLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ border: '1px solid var(--mui-palette-divider, #e0e0e0)', borderRadius: 5, padding: '10px 12px', background: 'var(--mui-palette-background-paper, #fff)' }}>
                    <Skeleton variant="text" animation={skelAnim} width={i % 2 === 0 ? '60%' : '40%'} height={20} />
                    <Skeleton variant="text" animation={skelAnim} width="80%" height={14} />
                  </div>
                ))}
                <div style={{ marginTop: 12 }}>
                  <Skeleton variant="rounded" animation={skelAnim} width="60%" height={36} />
                </div>
              </div>
            )}
            {!debouncedLoading ? (
              <>
            {/* Button to add another body section */}
            {/* The Add Body Section button has been relocated to the bottom row
               next to the Generate EDM button. The original container
               has been removed to avoid duplicate controls. */}
            {/* Header section */}
            {showHeaderSection && (
              <SectionAccordion
                id="left-header"
                title="Header"
                expanded={openSection === 'header'}
                onToggle={() => handleAccordionToggle('header')}
                actions={
                  <MoreActions
                    items={[
                      { label: 'Move up', icon: <ArrowUpwardIcon fontSize="small" />, disabled: true },
                      { label: 'Move down', icon: <ArrowDownwardIcon fontSize="small" />, disabled: true },
                      { label: 'Clone', icon: <ContentCopyIcon fontSize="small" />, disabled: true },
                      { label: 'Delete', icon: <DeleteIcon fontSize="small" />, onClick: () => removeHeaderSection() },
                    ]}
                  />
                }
                detailsSx={{ pt: 1.25 }}
              >
                    {/* Render only the active header template thumbnail */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', borderRadius: '6px', overflow: 'hidden' }}>
                      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, width: '100%' }}>
                      {(() => {
                        const activeTpl = headerTemplates.find(tpl => tpl.id === selectedHeaderId);
                        if (!activeTpl) return null;
                        return (
                          <div key={activeTpl.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <HtmlThumbnail html={activeTpl.html} width={600} forceAutoHeight />
                          </div>
                        );
                      })()}
                      </Box>
                    </div>
                    {/* Template selector row - moved below thumbnails */}
                    <div className="template-row" style={{ display: 'flex', gap: 'var(--gap-2)', alignItems: 'center', marginTop: '1.5rem' }}>
                      <TextField
                        select
                        fullWidth
                        label="Template"
                        id="header-template-select"
                        InputLabelProps={{ id: 'header-template-label' }}
                        SelectProps={{ labelId: 'header-template-label', id: 'header-template-select' }}
                        name="header-template"
                        value={selectedHeaderId}
                        onChange={(e) => setSelectedHeaderId(e.target.value)}
                        variant="standard"
                        sx={{ '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' } }}
                      >
                        {headerTemplates.map((tpl) => (
                          <MenuItem key={tpl.id} value={tpl.id}>{tpl.name}</MenuItem>
                        ))}
                      </TextField>
                      <IconButton onClick={() => setHeaderEditMode((v) => !v)} title={headerEditMode ? 'Close editor' : 'Edit template'}>
                        <EditIcon fontSize="medium" />
                      </IconButton>
                      <IconButton onClick={() => setShowNewHeader((v) => !v)} title={showNewHeader ? 'Cancel new template' : 'Add new template'}>
                        <AddIcon fontSize="medium" />
                      </IconButton>
                    </div>
                    {headerEditMode && (
                      <div>
                        <TextField id="header-draft-html" label="Template HTML" value={draftHeaderHtml} onChange={(e) => setDraftHeaderHtml(e.target.value)} rows={8} fullWidth multiline variant="standard" sx={{ fontFamily: 'monospace', '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}} />
                        <div className="new-template-actions" style={{ display: 'flex', gap: 'var(--gap-2)', marginTop: '0.5rem' }}>
                          <IconButton onClick={() => setHeaderEditMode(false)} title="Cancel edit">
                            <CloseIcon2 fontSize="medium" />
                          </IconButton>
                          <IconButton onClick={() => { saveHeaderEdits(); setHeaderEditMode(false); }} title="Save edits">
                            <SaveIcon fontSize="medium" />
                          </IconButton>
                        </div>
                      </div>
                    )}
                    {showNewHeader && (
                      <div className="new-template-form">
                        <TextField id="header-new-name" label="Template name" type="text" value={newHeaderName} onChange={(e) => setNewHeaderName(e.target.value)} fullWidth variant="standard" sx={{ mb: 1, '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}} />
                        <TextField id="header-new-html" label="Template HTML" value={newHeaderHtml} onChange={(e) => setNewHeaderHtml(e.target.value)} rows={6} fullWidth multiline variant="standard" sx={{ fontFamily: 'monospace', '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}} />
                        <div className="new-template-actions" style={{ display: 'flex', gap: 'var(--gap-2)', marginTop: '0.5rem' }}>
                          <IconButton onClick={() => { setShowNewHeader(false); setNewHeaderName(''); setNewHeaderHtml(''); }} title="Cancel new template">
                            <CloseIcon2 fontSize="medium" />
                          </IconButton>
                          <IconButton onClick={() => { addNewHeaderTemplate(); setShowNewHeader(false); }} title="Save new template">
                            <SaveIcon fontSize="medium" />
                          </IconButton>
                        </div>
                      </div>
                    )}
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => handleAdvancedToggle('header')}
                      endIcon={
                        <ExpandMoreIcon
                          sx={{
                            transform: isAdvancedOpen('header') ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease'
                          }}
                        />
                      }
                      sx={{
                        alignSelf: 'flex-start',
                        mt: 2,
                        color: 'text.secondary',
                        backgroundColor: 'transparent',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      Advanced settings
                    </Button>
                    <Collapse in={isAdvancedOpen('header')} timeout="auto" unmountOnExit>
                      <Box sx={{ mt: 2 }}>
                        <Divider sx={{ mb: 2 }} />
                        <PaddingControls label="Section padding (px)" value={headerPadding} onChange={setHeaderPadding} persistKey="header:padding" />
                      </Box>
                    </Collapse>
              </SectionAccordion>
              )}
            {/* Draggable sections (hero, body, banner) */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragStart={({active})=> setActiveDragId(String(active.id))}
              onDragEnd={(evt)=>{ handleSectionDragEnd(evt); setActiveDragId(null); }}
              onDragCancel={()=> setActiveDragId(null)}
            >
              <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
                {sectionOrder.map((id) => {
                  if (id === 'hero' && showHeroSection) {
                    const isOpen = openSection === 'hero';
                    return <MemoizedSortableHeroSection key="hero" isOpen={isOpen} />;
                  }
                  if (id === 'banner' && showBannerSection) {
                    const isOpen = openSection === 'banner';
                    return <MemoizedSortableBannerSection key="banner" isOpen={isOpen} />;
                  }
                  if (id.startsWith('hero-clone-')) {
                    const cloneId = Number(id.replace('hero-clone-',''));
                    const clone = heroClones.find(c => c.id === cloneId);
                    if (!clone) return null;
                    return <MemoizedSortableHeroCloneSection key={id} clone={clone} isOpen={openSection === id} />;
                  }
                  if (id.startsWith('banner-clone-')) {
                    const cloneId = Number(id.replace('banner-clone-',''));
                    const clone = bannerClones.find(c => c.id === cloneId);
                    if (!clone) return null;
                    return <MemoizedSortableBannerCloneSection key={id} clone={clone} isOpen={openSection === id} />;
                  }
                  if (id.startsWith('body-')) {
                    const section = bodySections.find((s) => `body-${s.id}` === id);
                    if (!section) return null;
                    const isOpen = openSection === id;
                    return <MemoizedSortableBodySection key={`body-${section.id}`} section={section} isOpen={isOpen} />;
                  }
                  return null;
                })}
              </SortableContext>
              <DragOverlay dropAnimation={{ duration:180, easing:'cubic-bezier(.2,.8,.2,1)' }}>
                {activeDragId ? (() => {
                  const id = activeDragId;
                  const baseStyle: React.CSSProperties = { boxSizing:'border-box', width:'100%', maxWidth:640, background:'#fff', borderRadius:6, boxShadow:'0 8px 24px rgba(0,0,0,0.25)', padding:'8px 12px', opacity:0.98, fontFamily:'inherit' };
                  
                  return null;
                })() : null}
              </DragOverlay>
            </DndContext>

            {/* Footer section */}
            {showFooterSection && (
              <SectionAccordion
                id="left-footer"
                title={renamingId==='footer' ? (
                  <Box sx={{ display:'flex', alignItems:'center', gap:1, width:'100%' }} onClick={(e)=>e.stopPropagation()}>
                    <TextField size="small" autoFocus value={renameDraft} onChange={(e)=>setRenameDraft(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ commitRename(); } else if(e.key==='Escape'){ cancelRename(); } }} variant="standard" placeholder="Footer" sx={{ flex:1 }} />
                    <IconButton size="small" onClick={(e)=>{ e.stopPropagation(); commitRename(); }}><SaveIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={(e)=>{ e.stopPropagation(); cancelRename(); }}><CloseIcon2 fontSize="small" /></IconButton>
                  </Box>
                ) : resolveTitle('footer')}
                expanded={openSection === 'footer'}
                onToggle={() => handleAccordionToggle('footer')}
                actions={
                  <MoreActions
                    items={[
                      { label: 'Move up', icon: <ArrowUpwardIcon fontSize="small" />, disabled: true },
                      { label: 'Move down', icon: <ArrowDownwardIcon fontSize="small" />, disabled: true },
                      { label: 'Rename', icon: <EditIcon fontSize="small" />, onClick: () => beginRename('footer', resolveTitle('footer')) },
                      { label: 'Clone', icon: <ContentCopyIcon fontSize="small" />, disabled: true },
                      { label: 'Delete', icon: <DeleteIcon fontSize="small" />, onClick: () => removeFooterSection() },
                    ]}
                  />
                }
                detailsSx={{ pt: 1.25 }}
              >
                  {/* Render only the active footer template thumbnail */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', borderRadius: '6px', overflow: 'hidden' }}>
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, width: '100%' }}>
                    {(() => {
                      const activeTpl = footerTemplates.find(tpl => tpl.id === selectedFooterId);
                      if (!activeTpl) return null;
                      return (
                        <div key={activeTpl.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                          <HtmlThumbnail html={activeTpl.html} width={600} forceAutoHeight />
                        </div>
                      );
                    })()}
                    </Box>
                  </div>
                  {/* Template selector row - moved below thumbnails */}
                  <div className="template-row" style={{ display: 'flex', gap: 'var(--gap-2)', alignItems: 'center', marginTop: '1.5rem' }}>
                    <TextField
                      select
                      fullWidth
                      label="Template"
                      id="footer-template-select"
                      InputLabelProps={{ id: 'footer-template-label' }}
                      SelectProps={{ labelId: 'footer-template-label', id: 'footer-template-select' }}
                      name="footer-template"
                      value={selectedFooterId}
                      onChange={(e) => setSelectedFooterId(e.target.value)}
                      variant="standard"
                      sx={{ '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' } }}
                    >
                      {footerTemplates.map((tpl) => (
                        <MenuItem key={tpl.id} value={tpl.id}>{tpl.name}</MenuItem>
                      ))}
                    </TextField>
                    <IconButton onClick={() => setFooterEditMode((v) => !v)} title={footerEditMode ? 'Close editor' : 'Edit template'}>
                      <EditIcon fontSize="medium" />
                    </IconButton>
                    <IconButton onClick={() => setShowNewFooter((v) => !v)} title={showNewFooter ? 'Cancel new template' : 'Add new template'}>
                      <AddIcon fontSize="medium" />
                    </IconButton>
                  </div>
                  {footerEditMode && (
                    <div>
                        <TextField id="footer-draft-html" label="Template HTML" value={draftFooterHtml} onChange={(e) => setDraftFooterHtml(e.target.value)} rows={8} fullWidth multiline variant="standard" sx={{ fontFamily: 'monospace', '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}} />
                      <div className="new-template-actions" style={{ display: 'flex', gap: 'var(--gap-2)', marginTop: '0.5rem' }}>
                        <IconButton onClick={() => setFooterEditMode(false)} title="Cancel edit">
                          <CloseIcon2 fontSize="medium" />
                        </IconButton>
                        <IconButton onClick={() => { saveFooterEdits(); setFooterEditMode(false); }} title="Save edits">
                          <SaveIcon fontSize="medium" />
                        </IconButton>
                      </div>
                    </div>
                  )}
                  {showNewFooter && (
                    <div className="new-template-form">
                      <TextField id="footer-new-name" label="Template name" type="text" value={newFooterName} onChange={(e) => setNewFooterName(e.target.value)} fullWidth variant="standard" sx={{ mb: 1, '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}} />
                      <TextField id="footer-new-html" label="Template HTML" value={newFooterHtml} onChange={(e) => setNewFooterHtml(e.target.value)} rows={6} fullWidth multiline variant="standard" sx={{ fontFamily: 'monospace', '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}} />
                      <div className="new-template-actions" style={{ display: 'flex', gap: 'var(--gap-2)', marginTop: '0.5rem' }}>
                        <IconButton onClick={() => { setShowNewFooter(false); setNewFooterName(''); setNewFooterHtml(''); }} title="Cancel new template">
                          <CloseIcon2 fontSize="medium" />
                        </IconButton>
                        <IconButton onClick={() => { addNewFooterTemplate(); setShowNewFooter(false); }} title="Save new template">
                          <SaveIcon fontSize="medium" />
                        </IconButton>
                      </div>
                    </div>
                  )}
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleAdvancedToggle('footer')}
                    endIcon={
                      <ExpandMoreIcon
                        sx={{
                          transform: isAdvancedOpen('footer') ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }}
                      />
                    }
                    sx={{
                      alignSelf: 'flex-start',
                      mt: 2,
                      color: 'text.secondary',
                      backgroundColor: 'transparent',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    Advanced settings
                  </Button>
                  <Collapse in={isAdvancedOpen('footer')} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 2 }}>
                      <Divider sx={{ mb: 2 }} />
                      <PaddingControls label="Section padding (px)" value={footerPadding} onChange={setFooterPadding} persistKey="footer:padding" />
                    </Box>
                  </Collapse>
              </SectionAccordion>
            )}

            {/* Universal Generate EDM button and Add Section button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 'var(--gap-2)', marginTop: '1rem' }}>
              <Button onClick={generateAllSections}>Generate EDM</Button>
              <div ref={addSectionRef} style={{ position: 'relative', marginLeft: '1rem' }}>
              <Button onClick={() => setShowAddSectionMenu((v) => !v)} title="Add section">
                  Add Section {showAddSectionMenu ? <ExpandLessIcon sx={{ ml: 0.5 }} /> : <ExpandMoreIcon sx={{ ml: 0.5 }} />}
                </Button>
                {showAddSectionMenu && (
                  <Paper elevation={3} sx={{ position: 'absolute', top: '100%', left: 0, mt: 0.5, zIndex: 10, minWidth: '12rem', maxHeight: '12rem', overflowY: 'auto' }}>
                    <Stack>
                      {availableSectionTypes.map((opt) => (
                        <Button key={opt.key} onClick={() => addSectionByType(opt.key)} sx={{ justifyContent: 'flex-start', px: 2 }}>
                          {opt.label}
                        </Button>
                      ))}
                    </Stack>
                  </Paper>
                )}
              </div>
            </div>
              </>
            ) : null}
    </div>}
        rightOpen={showBrandPanel}
        onRightClose={() => setShowBrandPanel(false)}
        onRightToggle={() => setShowBrandPanel((v)=>!v)}
        progress={progress}
        buffer={buffer}
        loading={loading}
        right={
          <Box className="summary-container">
            <Box sx={{ p: 0 }}>
              {debouncedLoading ? (
                <>
                  <Skeleton variant="text" animation={skelAnim} width="70%" height={32} />
                  <Skeleton variant="text" animation={skelAnim} width="50%" height={20} />
                </>
              ) : (
                (() => {
                  const info = detectPageInfo(brandUrlInput, analyzeData);
                  const title = initialSummary?.title ?? info.title;
                  const subline = initialSummary?.subline ?? info.subline;
                  return (
                    <>
                      <Typography variant="h6" component="h2">{title}</Typography>
                      {subline && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{subline}</Typography>
                      )}
                    </>
                  );
                })()
              )}
            </Box>
            <Divider sx={{ my: 2 }} />
            {/* Tabs header for Summary sections with optional Collection tab */}
            {debouncedLoading ? (
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Skeleton variant="rounded" animation={skelAnim} width={80} height={36} />
                <Skeleton variant="rounded" animation={skelAnim} width={80} height={36} />
                <Skeleton variant="rounded" animation={skelAnim} width={80} height={36} />
                <Skeleton variant="rounded" animation={skelAnim} width={80} height={36} />
              </Box>
            ) : (
              <Tabs value={summaryTab} onChange={(_, v) => setSummaryTab(v)} aria-label="summary tabs" sx={{ mb: 2 }}>
                {detectedPageType === 'collection' && <Tab label="Collection" sx={{ minWidth: 80, padding: '12px 12px' }} />}
                <Tab label="Product" sx={{ minWidth: 80, padding: '12px 12px' }} />
                <Tab label="Assets" sx={{ minWidth: 80, padding: '12px 12px' }} />
                <Tab label="Brand" sx={{ minWidth: 80, padding: '12px 12px' }} />
              </Tabs>
            )}

            {/* Collection Tab Panel */}
            {loading && detectedPageType === 'collection' && summaryTab === 0 && (
              <Stack spacing={1} sx={{ mb:2 }}>
                <Skeleton variant="text" animation={skelAnim} width="40%" height={24} />
                <Skeleton variant="rounded" animation={skelAnim} width="100%" height={38} />
                <Skeleton variant="rounded" animation={skelAnim} width="100%" height={220} />
              </Stack>
            )}
            {!debouncedLoading && detectedPageType === 'collection' && summaryTab === 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>Collection products</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    id="collection-search"
                    name="collection-search"
                    placeholder="Search products..."
                    value={collectionQuery}
                    onChange={(e) => setCollectionQuery(e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      // Clear selection and in-flight work
                      setCollectionSelection([]);
                      if (collectionDebounceRef.current) clearTimeout(collectionDebounceRef.current);
                      if (selectionAbortRef.current) {
                        try { selectionAbortRef.current.abort(); } catch {}
                      }
                      setCollectionEnriching(false);
                      // Empty the Collection section if present
                      setBodySections(prev => {
                        const next = [...prev];
                        const section = next.find(s => s.name === 'Collection');
                        if (section) { section.urls = []; section.products = []; }
                        return next;
                      });
                    }}
                  >
                    Clear
                  </Button>
                </Box>
                <div style={{ width: '100%', height: '100%' }}>
                  <DataGrid
                  rowHeight={64}

                    sx={{
                      '& .MuiDataGrid-cell:focus,& .MuiDataGrid-cell:focus-within': {
                        outline: 'none',
                      },
                      '& .MuiDataGrid-row.Mui-selected, & .MuiDataGrid-row.Mui-selected:hover': {
                        outline: 'none',
                      },
                      '& .MuiDataGrid-cell.Mui-selected': {
                        outline: 'none',
                      },
                      '& .MuiDataGrid-row:focus, & .MuiDataGrid-row:focus-within': {
                        outline: 'none',
                      }
                    }}
                    rows={collectionItems.filter(r => !collectionQuery || r.title.toLowerCase().includes(collectionQuery.toLowerCase()))}
                    columns={([
                      { field: 'image', headerName: 'Image', width: 88, sortable: false, renderCell: (params) => params.value ? (
                        <Box sx={{ p: 0.5 }}>
                          <Box component="img" src={params.value as string} alt="thumb" sx={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 1, display: 'block' }} />
                        </Box>
                      ) : null } as GridColDef,
                      { field: 'title', headerName: 'Title', flex: 1, minWidth: 160 },
                      { 
                        field: 'price', 
                        headerName: 'Price', 
                        renderCell: (params) => {
                          const raw = (params.value ?? '') as string;
                          const formatted = formatCollectionPrice(raw);
                          const display = formatted || (raw || '');
                          return <span style={{ whiteSpace: 'nowrap' }}>{display}</span>;
                        }
                      },
                      { field: 'url', headerName: 'URL', flex: 1, minWidth: 200 }
                    ])}
                    checkboxSelection
                    slotProps={{ baseCheckbox: { color: 'primary', size: 'small' } }}
                    disableRowSelectionOnClick
                    loading={collectionLoading}
                    onRowSelectionModelChange={(model) => {
                      const sel = (model as Array<string | number>).map(String);
                      const prevSel = lastCollectionSelectionRef.current;
                      // Identify newly added ids (first pick scenario => all are new, use last for stability)
                      const newlyAdded = sel.filter(id => !prevSel.includes(id));
                      const removed = prevSel.filter(id => !sel.includes(id));
                      setCollectionSelection(sel);
                      lastCollectionSelectionRef.current = sel;
                      // Debounce enrichment to avoid bursts on rapid selection changes
                      if (collectionDebounceRef.current) clearTimeout(collectionDebounceRef.current);
                      collectionDebounceRef.current = setTimeout(async () => {
                        // Increment version and cancel any in-flight fetches
                        const version = ++selectionVersionRef.current;
                        if (selectionAbortRef.current) {
                          try { selectionAbortRef.current.abort(); } catch {}
                        }
                        const ac = new AbortController();
                        selectionAbortRef.current = ac;

                        const selected = collectionItems.filter(r => sel.includes(r.id));
                        setCollectionEnriching(true);
                        try {
                          // Build promises for selected items, using cache where available
                          const promises = selected.map(async (row) => {
                            const cached = productCacheRef.current.get(row.url);
                            if (cached) return { ok: true as const, url: row.url, data: cached };
                            const resp = await fetch(`/api/product?url=${encodeURIComponent(row.url)}`, { signal: ac.signal });
                            if (!resp.ok) throw new Error(`product fetch failed: ${resp.status}`);
                            const pd = await resp.json();
                            const data = pd as ProductData;
                            // Ensure metadataDescription is present; if missing but description exists, copy it
                            if (!('metadataDescription' in data) || typeof (data as any).metadataDescription === 'undefined') {
                              (data as any).metadataDescription = (data as any).description || '';
                            }
                            productCacheRef.current.set(row.url, data);
                            return { ok: true as const, url: row.url, data };
                          });
                          const results = await Promise.allSettled(promises);
                          // If a newer selection started, drop results
                          if (version !== selectionVersionRef.current) return;
                          const prods: ProductData[] = [];
                          const urls: string[] = [];
                          results.forEach((res, i) => {
                            if (res.status === 'fulfilled' && res.value.ok) {
                              prods.push(res.value.data);
                              urls.push(selected[i].url);
                            } else {
                              console.warn('Selection product fetch failed for', selected[i]?.url, res);
                            }
                          });
                          let newCollectionSectionId: number | null = null;
                          setBodySections(prev => {
                            const next = [...prev];
                            let section = next.find(s => s.name === 'Collection');
                            if (!section) {
                              if (prods.length === 0) return next; // nothing to display yet
                              const id = (next[next.length - 1]?.id || 0) + 1;
                              section = { id, name: 'Collection', urls, products: prods, selectedBodyId: 'product-image-left-copy-right', loading: false, alternate: true } as BodySection;
                              next.push(section);
                              newCollectionSectionId = id;
                            } else {
                              section.urls = urls;
                              section.products = prods;
                              newCollectionSectionId = section.id;
                            }
                            return next;
                          });
                          // Immediately compute selection using newCollectionSectionId and prods
                          if (prods.length === 0) {
                            if (selectedProductCtx) setSelectedProductCtx(null);
                          } else if (newCollectionSectionId != null) {
                            let nextIndex = prods.length - 1; // default to last
                            if (newlyAdded.length > 0) {
                              // Choose the last newly added id; map to its URL -> index
                              const targetId = newlyAdded[newlyAdded.length - 1];
                              const targetRow = selected.find(r => r.id === targetId);
                              if (targetRow) {
                                const idx = urls.indexOf(targetRow.url);
                                if (idx >= 0) nextIndex = idx;
                              }
                              // Mark this product for scroll/highlight (stay on Collection tab until user clicks a product)
                              setRecentlyAdded({ sectionId: newCollectionSectionId, index: nextIndex, ts: Date.now() });
                            } else if (removed.length > 0 && selectedProductCtx && selectedProductCtx.sectionId === newCollectionSectionId) {
                              // If items were removed, ensure selection still valid; if not, move to last
                              if (selectedProductCtx.index >= prods.length) {
                                nextIndex = prods.length - 1;
                                setRecentlyAdded({ sectionId: newCollectionSectionId, index: nextIndex, ts: Date.now() });
                              } else {
                                nextIndex = selectedProductCtx.index;
                              }
                            } else if (selectedProductCtx && selectedProductCtx.sectionId === newCollectionSectionId) {
                              // Preserve previous selection if still valid when no addition
                              const prevIdx = selectedProductCtx.index;
                              if (prevIdx >= 0 && prevIdx < prods.length) {
                                nextIndex = prevIdx;
                              }
                            }
                            const changed = !selectedProductCtx || selectedProductCtx.sectionId !== newCollectionSectionId || selectedProductCtx.index !== nextIndex;
                            setSelectedProductCtx({ sectionId: newCollectionSectionId, index: nextIndex });
                            if (changed) addNotification('Product details updated');
                            setOpenSection(`body-${newCollectionSectionId}`);
                          }
                        } catch (e: any) {
                          if (e?.name === 'AbortError') {
                            // Swallow abort, a newer selection is in-flight
                            return;
                          }
                          console.error(e);
                          addNotification('Failed to fetch one or more selected products.');
                        } finally {
                          if (version === selectionVersionRef.current) setCollectionEnriching(false);
                        }
                      }, 200);
                    }}
                    rowSelectionModel={collectionSelection}
                  />
                </div>
              </Box>
            )}

            {/* Product Tab Panel */}
            {/* Product Tab Panel */}
            {loading && summaryTab === (detectedPageType === 'collection' ? 1 : 0) && (
              <Stack spacing={1}>
                <Skeleton variant="text" animation={skelAnim} width="55%" height={30} />
                <Skeleton variant="rounded" animation={skelAnim} width="100%" height={50} />
                <Skeleton variant="rounded" animation={skelAnim} width="100%" height={50} />
                <Skeleton variant="rounded" animation={skelAnim} width="100%" height={160} />
                <Skeleton variant="rounded" animation={skelAnim} width="100%" height={50} />
                <Skeleton variant="text" animation={skelAnim} width="35%" height={24} />
              </Stack>
            )}
            {!debouncedLoading && summaryTab === (detectedPageType === 'collection' ? 1 : 0) && (
              <Stack spacing={2}>
                {(detectedPageType === 'collection' ? !!selectedProductCtx : !!analyzeData?.product) && (
                  <>
                    {/* Title (Rich text) */}
                    <Box sx={{ mb: 2 }} id={detectedPageType === 'collection' && selectedProductCtx ? `product-title-${selectedProductCtx.sectionId}-${selectedProductCtx.index}` : 'product-title'}>
                      <RichTextField
                        label="Title"
                        className="customField"
                        value={(detectedPageType === 'collection'
                          ? (selectedProductCtx ? ((bodySections.find(s => s.id === selectedProductCtx.sectionId)?.products?.[selectedProductCtx.index]?.title) || '') : '')
                          : (analyzeData?.product?.title || '')) as any}
                        onChange={(html: string) => {
                          // Sanitize inline to avoid injecting block tags (e.g., <p>) into the title
                          const cleaned = sanitizeInlineHtml(html);
                          if (detectedPageType === 'collection') {
                            if (!selectedProductCtx) return;
                            setBodySections(prev => {
                              const next = [...prev];
                              const si = next.findIndex(s => s.id === selectedProductCtx.sectionId);
                              if (si === -1) return prev;
                              const arr = [...next[si].products];
                              arr[selectedProductCtx.index] = { ...arr[selectedProductCtx.index], title: cleaned } as any;
                              next[si] = { ...next[si], products: arr };
                              return next;
                            });
                            setRecentlyUpdated({ sectionId: selectedProductCtx.sectionId, index: selectedProductCtx.index, field: 'title', ts: Date.now() });
                          } else {
                            setAnalyzeData(d => d ? ({ ...d, product: { ...d.product, title: cleaned } }) : d);
                            setBodySections(prev => {
                              if (!prev.length || !prev[0].products?.length) return prev;
                              const next = [...prev];
                              const prod = { ...next[0].products[0], title: cleaned } as ProductData;
                              next[0] = { ...next[0], products: [prod, ...next[0].products.slice(1)] };
                              return next;
                            });
                          }
                        }}
                        placeholder="Product title"
                        minHeight={40}
                      />
                    </Box>

                    {/* Price (plain input) */}
                    <TextField
                      id={detectedPageType === 'collection' && selectedProductCtx ? `product-price-${selectedProductCtx.sectionId}-${selectedProductCtx.index}` : 'product-price'}
                      name="price"
                      label="Price"
                      value={(detectedPageType === 'collection'
                        ? (selectedProductCtx ? ((bodySections.find(s => s.id === selectedProductCtx.sectionId)?.products?.[selectedProductCtx.index]?.price) || '') : '')
                        : (analyzeData?.product?.price || ''))}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (detectedPageType === 'collection') {
                          if (!selectedProductCtx) return;
                          setBodySections(prev => {
                            const next = [...prev];
                            const si = next.findIndex(s => s.id === selectedProductCtx.sectionId);
                            if (si === -1) return prev;
                            const arr = [...next[si].products];
                            arr[selectedProductCtx.index] = { ...arr[selectedProductCtx.index], price: val } as any;
                            next[si] = { ...next[si], products: arr };
                            return next;
                          });
                          setRecentlyUpdated({ sectionId: selectedProductCtx.sectionId, index: selectedProductCtx.index, field: 'price', ts: Date.now() });
                        } else {
                          setAnalyzeData(d => d ? ({ ...d, product: { ...d.product, price: val } }) : d);
                          setBodySections(prev => {
                            if (!prev.length || !prev[0].products?.length) return prev;
                            const next = [...prev];
                            const prod = { ...next[0].products[0], price: val } as ProductData;
                            next[0] = { ...next[0], products: [prod, ...next[0].products.slice(1)] };
                            return next;
                          });
                        }
                      }}
                      fullWidth
                      variant="standard"
                      sx={{mb: 2, '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}}
                    />

                    {/* CTA Label (Rich text) */}
                    <Box sx={{ mb: 2 }} id={detectedPageType === 'collection' && selectedProductCtx ? `product-ctaLabel-${selectedProductCtx.sectionId}-${selectedProductCtx.index}` : 'product-ctaLabel'}>
                      <RichTextField
                        label="CTA Label"
                        className="customField"
                        value={(detectedPageType === 'collection'
                          ? (selectedProductCtx ? (((bodySections.find(s => s.id === selectedProductCtx.sectionId)?.products?.[selectedProductCtx.index]?.ctaLabel) || 'SHOP NOW')) : 'SHOP NOW')
                          : ((analyzeData?.product?.ctaLabel) || 'SHOP NOW')) as any}
                        onChange={(html: string) => {
                          const cleaned = sanitizeInlineHtml(html || 'SHOP NOW');
                          if (detectedPageType === 'collection') {
                            if (!selectedProductCtx) return;
                            setBodySections(prev => {
                              const next = [...prev];
                              const si = next.findIndex(s => s.id === selectedProductCtx.sectionId);
                              if (si === -1) return prev;
                              const arr = [...next[si].products];
                              arr[selectedProductCtx.index] = { ...arr[selectedProductCtx.index], ctaLabel: cleaned } as any;
                              next[si] = { ...next[si], products: arr };
                              return next;
                            });
                            setRecentlyUpdated({ sectionId: selectedProductCtx.sectionId, index: selectedProductCtx.index, field: 'ctaLabel', ts: Date.now() });
                          } else {
                            setAnalyzeData(d => d ? ({ ...d, product: { ...d.product, ctaLabel: cleaned } }) : d);
                            setBodySections(prev => {
                              if (!prev.length || !prev[0].products?.length) return prev;
                              const next = [...prev];
                              const prod = { ...next[0].products[0], ctaLabel: cleaned } as ProductData;
                              next[0] = { ...next[0], products: [prod, ...next[0].products.slice(1)] };
                              return next;
                            });
                          }
                        }}
                        placeholder="SHOP NOW"
                        minHeight={40}
                      />
                    </Box>

                    {/* Description (Rich text) */}
                    {(() => {
                      const p: any | undefined = (detectedPageType === 'collection'
                        ? (selectedProductCtx ? ((bodySections.find(s => s.id === selectedProductCtx.sectionId)?.products?.[selectedProductCtx.index]) as any) : undefined)
                        : ((analyzeData?.product as any)));
                      // Mirror preview logic: choose description based on per-product descSource
                      let html = (p?.description || '') as string;
                      const dsRight = (p?.descSource as any) || 'metadata';
                      if (dsRight === 'p' && p?.descriptionP) html = p.descriptionP as string;
                      else if (dsRight === 'ul' && p?.descriptionUl) html = p.descriptionUl as string;
                      return (
                        <Box sx={{ mb: 0 }}>
                          <RichTextField
                            label="Description"
                            className="customField"
                            value={html}
                            onChange={(newHtml: string) => {
                              if (detectedPageType === 'collection') {
                                if (!selectedProductCtx) return;
                                // Mirror to all description variants for symmetry with preview
                                updateProductInSection(selectedProductCtx.sectionId, selectedProductCtx.index, 'description' as any, newHtml as any);
                                updateProductInSection(selectedProductCtx.sectionId, selectedProductCtx.index, 'metadataDescription' as any, newHtml as any);
                                updateProductInSection(selectedProductCtx.sectionId, selectedProductCtx.index, 'descriptionP' as any, newHtml as any);
                                updateProductInSection(selectedProductCtx.sectionId, selectedProductCtx.index, 'descriptionUl' as any, newHtml as any);
                                setRecentlyUpdated({ sectionId: selectedProductCtx.sectionId, index: selectedProductCtx.index, field: 'description', ts: Date.now() });
                              } else {
                                // Single product context (non-collection page)
                                setAnalyzeData(d => {
                                  if (!d) return d;
                                  const prod: any = { ...d.product };
                                  prod.description = newHtml;
                                  prod.metadataDescription = newHtml;
                                  prod.descriptionP = newHtml;
                                  prod.descriptionUl = newHtml;
                                  return { ...d, product: prod };
                                });
                                setBodySections(prev => {
                                  if (!prev.length || !prev[0].products?.length) return prev;
                                  const next = [...prev];
                                  const prod = { ...next[0].products[0], description: newHtml, metadataDescription: newHtml, descriptionP: newHtml, descriptionUl: newHtml } as any;
                                  next[0] = { ...next[0], products: [prod, ...next[0].products.slice(1)] };
                                  return next;
                                });
                              }
                            }}
                            placeholder="Product description"
                            minHeight={80}
                          />
                        </Box>
                      );
                    })()}

                    {/* Description Source selector */}
                    <TextField
                      select
                      fullWidth
                      label="Description Source"
                      id="desc-source-select"
                      InputLabelProps={{ id: 'desc-source-label' }}
                      SelectProps={{ labelId: 'desc-source-label', id: 'desc-source-select' }}
                      name="description-source"
                      value={(detectedPageType === 'collection'
                        ? (selectedProductCtx ? ((((bodySections.find(s => s.id === selectedProductCtx.sectionId)?.products?.[selectedProductCtx.index] as any)?.descSource) || 'metadata')) : 'metadata')
                        : (((analyzeData?.product as any)?.descSource) || 'metadata'))}
                      onChange={(e) => {
                        const v = e.target.value as 'metadata'|'p'|'ul';
                        if (detectedPageType === 'collection') {
                          if (!selectedProductCtx) return;
                          updateProductInSection(selectedProductCtx.sectionId, selectedProductCtx.index, 'descSource' as any, v as any);
                          // Persist descSource for right panel value rendering
                          setBodySections(prev => prev.map(s => {
                            if (s.id !== selectedProductCtx.sectionId) return s;
                            const arr = [...s.products];
                            const prod: any = { ...arr[selectedProductCtx.index] };
                            prod.descSource = v;
                            arr[selectedProductCtx.index] = prod;
                            return { ...s, products: arr };
                          }));
                          setRecentlyUpdated({ sectionId: selectedProductCtx.sectionId, index: selectedProductCtx.index, field: 'descSource', ts: Date.now() });
                        } else {
                          // Non-collection: update analyzeData for the right panel value
                          setAnalyzeData(d => d ? ({
                            ...d,
                            product: {
                              ...(d.product as any),
                              descSource: v,
                              description:
                                v === 'metadata' ? (((d.product as any).metadataDescription as string) || ((d.product as any).originalMetadataDescription as string) || '') :
                                v === 'p' ? (((d.product as any).descriptionP as string) || '') :
                                (((d.product as any).descriptionUl as string) || '')
                            }
                          }) : d);
                          // Also mirror into the first body section product so the main preview updates
                          setBodySections(prev => {
                            if (!prev.length || !prev[0].products?.length) return prev;
                            const next = [...prev];
                            const prod: any = { ...next[0].products[0] };
                            prod.descSource = v;
                            if (v === 'metadata') prod.description = prod.metadataDescription || prod.originalMetadataDescription || '';
                            if (v === 'p') prod.description = prod.descriptionP || '';
                            if (v === 'ul') prod.description = prod.descriptionUl || '';
                            next[0] = { ...next[0], products: [prod, ...next[0].products.slice(1)] };
                            return next;
                          });
                          // Nudge the composer so the code accordion recomputes immediately
                          setRecentlyUpdated({ sectionId: bodySections[0]?.id ?? 0, index: 0, field: 'descSource', ts: Date.now() });
                        }
                      }}
                      variant="standard"
                      sx={{ mb: 2, '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}}
                    >
                      <MenuItem value="metadata">Page metadata</MenuItem>
                      <MenuItem value="p" disabled={detectedPageType === 'collection' ? !(selectedProductCtx && !!(((bodySections.find(s => s.id === selectedProductCtx.sectionId)?.products?.[selectedProductCtx.index] as any)?.descriptionP))) : !(((analyzeData?.product as any)?.descriptionP))}>First paragraph</MenuItem>
                      <MenuItem value="ul" disabled={detectedPageType === 'collection' ? !(selectedProductCtx && !!(((bodySections.find(s => s.id === selectedProductCtx.sectionId)?.products?.[selectedProductCtx.index] as any)?.descriptionUl))) : !(((analyzeData?.product as any)?.descriptionUl))}>Bullet list</MenuItem>
                    </TextField>

                    {/* Exit URL (CTA link) */}
                    <TextField
                      id={detectedPageType === 'collection' && selectedProductCtx ? `product-exit-${selectedProductCtx.sectionId}-${selectedProductCtx.index}` : 'product-exit'}
                      name="exitUrl"
                      label="Exit URL"
                      value={(() => {
                        if (detectedPageType === 'collection') {
                          if (!selectedProductCtx) return '';
                          const sec = bodySections.find(s => s.id === selectedProductCtx.sectionId);
                          const prod = sec?.products?.[selectedProductCtx.index] as any;
                          return (prod?.cta || prod?.url || '') as string;
                        }
                        return (analyzeData?.product?.cta || analyzeData?.product?.url || '') as string;
                      })()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (detectedPageType === 'collection') {
                          if (!selectedProductCtx) return;
                          setBodySections(prev => {
                            const next = [...prev];
                            const si = next.findIndex(s => s.id === selectedProductCtx.sectionId);
                            if (si === -1) return prev;
                            const arr = [...next[si].products];
                            arr[selectedProductCtx.index] = { ...arr[selectedProductCtx.index], cta: val } as any;
                            next[si] = { ...next[si], products: arr };
                            return next;
                          });
                          setRecentlyUpdated({ sectionId: selectedProductCtx.sectionId, index: selectedProductCtx.index, field: 'cta', ts: Date.now() });
                        } else {
                          // Single product context
                          setAnalyzeData(d => d ? ({ ...d, product: { ...d.product, cta: val } }) : d);
                          setBodySections(prev => {
                            if (!prev.length || !prev[0].products?.length) return prev;
                            const next = [...prev];
                            const prod = { ...next[0].products[0], cta: val } as ProductData;
                            next[0] = { ...next[0], products: [prod, ...next[0].products.slice(1)] };
                            return next;
                          });
                        }
                      }}
                      onBlur={(e) => {
                        const raw = (e.target.value || '').trim();
                        if (!raw) return;
                        const cleaned = sanitizeUrl(raw);
                        if (!isHttpUrl(cleaned)) {
                          addNotification(
                            <>Invalid product URL: <span style={{fontWeight:'bold'}}>{cleaned}</span>&nbsp;|&nbsp;Please enter a valid http(s) link.</>
                          );
                          return;
                        }
                        if (detectedPageType === 'collection') {
                          if (!selectedProductCtx) return;
                          setBodySections(prev => {
                            const next = [...prev];
                            const si = next.findIndex(s => s.id === selectedProductCtx.sectionId);
                            if (si === -1) return prev;
                            const arr = [...next[si].products];
                            const current = (arr[selectedProductCtx.index] as any)?.cta || '';
                            if (current !== cleaned) {
                              arr[selectedProductCtx.index] = { ...arr[selectedProductCtx.index], cta: cleaned } as any;
                              next[si] = { ...next[si], products: arr };
                            }
                            return next;
                          });
                          setRecentlyUpdated({ sectionId: selectedProductCtx.sectionId, index: selectedProductCtx.index, field: 'cta', ts: Date.now() });
                        } else {
                          setAnalyzeData(d => d ? ({ ...d, product: { ...d.product, cta: cleaned } }) : d);
                          setBodySections(prev => {
                            if (!prev.length || !prev[0].products?.length) return prev;
                            const next = [...prev];
                            const current = (next[0].products[0] as any)?.cta || '';
                            if (current !== cleaned) {
                              const prod = { ...next[0].products[0], cta: cleaned } as ProductData;
                              next[0] = { ...next[0], products: [prod, ...next[0].products.slice(1)] };
                            }
                            return next;
                          });
                        }
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {(() => {
                              const current = (() => {
                                if (detectedPageType === 'collection') {
                                  if (!selectedProductCtx) return '';
                                  const sec = bodySections.find(s => s.id === selectedProductCtx.sectionId);
                                  const prod = sec?.products?.[selectedProductCtx.index] as any;
                                  return (prod?.cta || prod?.url || '') as string;
                                }
                                return (analyzeData?.product?.cta || analyzeData?.product?.url || '') as string;
                              })();
                              const cleaned = sanitizeUrl((current || '').trim());
                              const ok = !!cleaned && isHttpUrl(cleaned);
                              return (
                                <Tooltip title={ok ? 'Open in new tab' : 'Enter a valid http(s) URL'}>
                                  <span>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (!ok) return;
                                        if (typeof window !== 'undefined') {
                                          window.open(cleaned, '_blank', 'noopener,noreferrer');
                                        }
                                      }}
                                      disabled={!ok}
                                      edge="end"
                                      title={ok ? 'Open in new tab' : 'Enter a valid http(s) URL'}
                                    >
                                      <OpenInNewIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              );
                            })()}
                          </InputAdornment>
                        )
                      }}
                      fullWidth
                      variant="standard"
                      sx={{mb: 2, '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}}
                    />

                    {/* Main product image - centered (no zoom here) */}
                    {(detectedPageType === 'collection'
                      ? (selectedProductCtx ? (bodySections.find(s => s.id === selectedProductCtx.sectionId)?.products?.[selectedProductCtx.index]?.image) : '')
                      : (analyzeData?.product?.image || '')) && (
                      <Box sx={{ mb: 1, textAlign: 'center' }} data-product-cell={detectedPageType === 'collection' ? `${selectedProductCtx?.sectionId}-${selectedProductCtx?.index}` : '0-0'}
                        onClick={(e) => {
                          if (detectedPageType === 'collection' && summaryTab === 0 && selectedProductCtx) {
                            setSummaryTab(1);
                          }
                          const el = e.currentTarget as HTMLElement;
                          el.classList.remove('product-click-ripple');
                          void el.offsetWidth;
                          el.classList.add('product-click-ripple');
                        }}>
                        <img
                          src={detectedPageType === 'collection'
                            ? (selectedProductCtx ? ((bodySections.find(s => s.id === selectedProductCtx.sectionId)?.products?.[selectedProductCtx.index]?.image) || '') : '')
                            : (analyzeData?.product?.image || '')}
                          alt={(detectedPageType === 'collection'
                            ? (selectedProductCtx ? ((bodySections.find(s => s.id === selectedProductCtx.sectionId)?.products?.[selectedProductCtx.index]?.title) || '') : '')
                            : (analyzeData?.product?.title || ''))}
                          style={{ 
                            width: '100%', 
                            height: 'auto', 
                            margin: '0 auto', 
                            display: 'block', 
                            borderRadius: 6,
                            border: '1px solid rgba(0, 0, 0, 0.2)'
                          }}
                        />
                      </Box>
                    )}

                    {/* Product Images grid directly below main image */}
                    {(detectedPageType === 'collection'
                      ? (selectedProductCtx ? ((bodySections.find(s => s.id === selectedProductCtx.sectionId)?.products?.[selectedProductCtx.index]?.images?.length || 0) > 0) : false)
                      : ((analyzeData?.product?.images?.length || 0) > 0)
                    ) ? (
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>Product images</Typography>
                        <Box className="summary-product-grid" sx={{ display: 'grid', gap: 1, width: '100%' }}>
                          {uniqueImages(((detectedPageType === 'collection'
                            ? (selectedProductCtx ? ((bodySections.find(s => s.id === selectedProductCtx.sectionId)?.products?.[selectedProductCtx.index]?.images) || []) : [])
                            : ((analyzeData?.product?.images || []))
                          ) as string[]).map((s: string) => s || ''))
                            .map((src: string) => (
                            <Box
                              key={normalizeImage(src) || src}
                              sx={{
                                cursor: 'pointer',
                                border: (normalizeImage((detectedPageType === 'collection' ? (selectedProductCtx ? (((bodySections.find(s => s.id === selectedProductCtx.sectionId)?.products?.[selectedProductCtx.index]?.image) || '')) : '') : ((analyzeData?.product?.image || '')))) === normalizeImage(src)) ? '2px solid var(--color-primary)' : '2px solid #e0e0e0',
                                borderRadius: 1,
                                opacity: (normalizeImage((detectedPageType === 'collection' ? (selectedProductCtx ? (((bodySections.find(s => s.id === selectedProductCtx.sectionId)?.products?.[selectedProductCtx.index]?.image) || '')) : '') : ((analyzeData?.product?.image || '')))) === normalizeImage(src)) ? 1 : 0.9,
                                overflow: 'hidden',
                                transition: 'opacity .15s ease, border-color .15s ease, box-shadow .15s ease',
                                '& img': { transition: 'transform .4s ease' },
                                '&:hover': { opacity: 1, borderColor: 'var(--color-primary)', boxShadow: '0 0 0 1px rgba(0,0,0,0.02)' },
                                '&:hover img': { transform: 'scale(1.075)' }
                              }}
                              onClick={() => {
                              if (detectedPageType === 'collection') {
                                if (!selectedProductCtx) return;
                                setBodySections(prev => {
                                  const next = [...prev];
                                  const si = next.findIndex(s => s.id === selectedProductCtx.sectionId);
                                  if (si === -1) return prev;
                                  const arr = [...next[si].products];
                                  arr[selectedProductCtx.index] = { ...arr[selectedProductCtx.index], image: src } as any;
                                  next[si] = { ...next[si], products: arr };
                                  return next;
                                });
                              } else {
                                setAnalyzeData(d => d ? ({ ...d, product: { ...d.product, image: src } }) : d);
                                setBodySections(prev => {
                                  if (!prev.length || !prev[0].products?.length) return prev;
                                  const next = [...prev];
                                  const prod = { ...next[0].products[0], image: src } as ProductData;
                                  next[0] = { ...next[0], products: [prod, ...next[0].products.slice(1)] };
                                  return next;
                                });
                              }
                              }}
                            >
                              <img
                                src={src}
                                alt="product"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    ) : null}

                  </>
                )}
              </Stack>
            )}

            {/* Assets Tab Panel */}
            {summaryTab === (detectedPageType === 'collection' ? 2 : 1) && (
              <Stack spacing={2}>
                {/* Hero images */}
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>Hero images</Typography>
                  <Box className="summary-product-grid" sx={{ display: 'grid', gap: 1, width: '100%' }}>
                    {(uniqueImages((heroImages && heroImages.length ? heroImages : (analyzeData?.heroImages || []))) as string[]).map((src: string) => (
                      <Box
                        key={normalizeImage(src) || src}
                        sx={{
                          cursor: 'pointer',
                          border: (normalizeImage(heroImage || '') === normalizeImage(src)) ? '2px solid var(--color-primary)' : '2px solid #e0e0e0',
                          borderRadius: 1,
                          opacity: (normalizeImage(heroImage || '') === normalizeImage(src)) ? 1 : 0.9,
                          overflow: 'hidden',
                          transition: 'opacity .15s ease, border-color .15s ease, box-shadow .15s ease',
                            '& img': { transition: 'transform .4s ease' },
                            '&:hover': { opacity: 1, borderColor: 'var(--color-primary)', boxShadow: '0 0 0 1px rgba(0,0,0,0.02)' },
                            '&:hover img': { transform: 'scale(1.075)' }
                        }}
                        onClick={() => { setHeroImage(src); setHeroHref(brandWebsite || ''); setHeroAlt(analyzeData?.storeName || ''); }}
                      >
                        <img
                          src={src}
                          alt="hero"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Banner images */}
                {(analyzeData?.bannerImages?.length || 0) > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>Banner images</Typography>
                    <Box className="summary-product-grid" sx={{ display: 'grid', gap: 1, width: '100%' }}>
                      {uniqueImages(analyzeData!.bannerImages as any).map((src: string) => (
                        <Box
                          key={normalizeImage(src) || src}
                          sx={{
                            cursor: 'pointer',
                            border: (normalizeImage(bannerImage || '') === normalizeImage(src)) ? '2px solid var(--color-primary)' : '2px solid #e0e0e0',
                            borderRadius: 1,
                            opacity: (normalizeImage(bannerImage || '') === normalizeImage(src)) ? 1 : 0.9,
                            overflow: 'hidden',
                            transition: 'opacity .15s ease, border-color .15s ease, box-shadow .15s ease',
                            '& img': { transition: 'transform .4s ease' },
                            '&:hover': { opacity: 1, borderColor: 'var(--color-primary)', boxShadow: '0 0 0 1px rgba(0,0,0,0.02)' },
                            '&:hover img': { transform: 'scale(1.075)' }
                          }}
                          onClick={() => { setBannerImage(src); setBannerHref(brandWebsite || ''); setBannerAlt(analyzeData?.storeName || ''); }}
                        >
                          <img
                            src={src}
                            alt="banner"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Stack>
            )}

            {/* Brand Tab Panel */}
            {summaryTab === (detectedPageType === 'collection' ? 3 : 2) && (
              <Stack spacing={2}>
                {/* Logo row first: preview left, upload button right */}
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>Logo</Typography>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      {(brandLogoDataUrl || analyzeData?.logo || analyzeData?.logoSvg) ? (
                        brandLogoDataUrl ? (
                          <img src={brandLogoDataUrl} alt="logo" style={{ height: 22, width: 'auto', display: 'block', textAlign: 'left' }} />
                        ) : analyzeData?.logo ? (
                          <img src={analyzeData.logo} alt="logo" style={{ height: 22, width: 'auto', display: 'block', textAlign: 'left'  }} />
                        ) : (
                          <Box sx={{ height: 22, '& svg': { height: '100%' } }} dangerouslySetInnerHTML={{ __html: analyzeData!.logoSvg! }} />
                        )
                      ) : (
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>No logo</Typography>
                      )}
                    </Box>
                    <Box>
                      <Button
                        component="label"
                        role={undefined}
                        tabIndex={-1}
                        variant="contained"
                        color="inherit"
                        startIcon={
                          <SvgIcon>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                            </svg>
                          </SvgIcon>
                        }
                      >
                        Upload a file
                        <VisuallyHiddenInput
                          id="brand-logo-upload"
                          name="brand-logo"
                          type="file"
                          accept="image/*"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const file = e.target.files ? e.target.files[0] : null;
                            setBrandLogo(file);
                          }}
                        />
                      </Button>
                    </Box>
                  </Stack>
                  {brandLogo && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                      {(brandLogo as File).name}
                    </Typography>
                  )}
                </Box>

                {/* Website URL */}
                <Box>
                  <TextField
                    id="summary-website"
                    name="website"
                    label="Website URL"
                    value={brandWebsite}
                    fullWidth
                    variant="standard"
                    sx={{'& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}}
                  />
                </Box>

                {/* Store */}
                <Box>
                  <TextField
                    id="summary-store"
                    name="store"
                    label="Store"
                    value={analyzeData?.storeName || ''}
                    fullWidth
                    onChange={(e)=> setAnalyzeData(d=>d?({...d, storeName: e.target.value}):d)}
                    variant="standard"
                    sx={{'& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}}
                  />
                </Box>

                {/* Brand colors */}
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>Brand colors</Typography>
                  <Stack direction="row" spacing={1}>
                    <MuiColorInput id="brand-primary" name="brand-primary" label="CTA" format="hex" value={brandPrimary} onChange={(value) => setBrandPrimary(value || brandPrimary)} size="small" />
                    <MuiColorInput id="brand-secondary" name="brand-secondary" label="Announcement Bar" format="hex" value={brandSecondary} onChange={(value) => setBrandSecondary(value || brandSecondary)} size="small" />
                  </Stack>
                </Box>

                {/* Brand font selection removed */}

                {/* Announcement (rich text) */}
                <Box>
                  <RichTextField
                    label="Announcement Bar"
                    className="customField"
                    value={brandAnnouncement as any}
                    onChange={(html: string) => setBrandAnnouncement(html)}
                    placeholder="E.g., Free shipping this week • 20% off sitewide • New arrivals"
                    minHeight={60}
                  />
                </Box>

              </Stack>
            )}
          </Box>
        }
      >
            {/* Global top progress when any section loading */}
            {/* Top progress is now handled by AppLayout's LinearProgress; remove page-level skeleton */}
            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
              <div className="preview-bar" style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-2)', position: 'relative' }}>
                <Typography
                  variant="h6"
                  sx={{ flex: 1, fontSize: '0.9rem', fontWeight: 400, color: 'inherit' }}
                >
                  {viewMode === 'preview' ? 'Email Preview' : 'Email Code'}
                </Typography>
                {/* Centered Desktop/Mobile toggle */}
                <div
                  role="group"
                  aria-label="Preview mode"
                  style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.04)', borderRadius: 999, padding: '2px' }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                      e.preventDefault();
                      setPreviewMode((m) => (m === 'desktop' ? 'mobile' : 'desktop'));
                    }
                  }}
                >
                  <button
                    type="button"
                    aria-label="Desktop preview"
                    aria-pressed={previewMode === 'desktop'}
                    onClick={() => setPreviewMode('desktop')}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setPreviewMode('desktop'); }
                      if (e.key === 'ArrowRight') { e.preventDefault(); setPreviewMode('mobile'); }
                      if (e.key === 'ArrowLeft') { e.preventDefault(); setPreviewMode('mobile'); }
                    }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 10px', borderRadius: 999, border: '1px solid transparent',
                      background: previewMode === 'desktop' ? 'var(--color-primary)' : 'transparent',
                      color: previewMode === 'desktop' ? '#fff' : 'inherit', cursor: 'pointer'
                    }}
                  >
                    {/* Monitor icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M3 5h18v10H3zM8 19h8v-2H8z" />
                    </svg>
                    <span style={{ fontSize: 12, fontWeight: previewMode === 'desktop' ? 700 : 500 }}>Desktop</span>
                  </button>
                  <button
                    type="button"
                    aria-label="Mobile preview"
                    aria-pressed={previewMode === 'mobile'}
                    onClick={() => setPreviewMode('mobile')}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setPreviewMode('mobile'); }
                      if (e.key === 'ArrowLeft') { e.preventDefault(); setPreviewMode('desktop'); }
                      if (e.key === 'ArrowRight') { e.preventDefault(); setPreviewMode('desktop'); }
                    }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 10px', borderRadius: 999, border: '1px solid transparent',
                      background: previewMode === 'mobile' ? 'var(--color-primary)' : 'transparent',
                      color: previewMode === 'mobile' ? '#fff' : 'inherit', cursor: 'pointer'
                    }}
                  >
                    {/* Phone icon */}
                    <svg width="12" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2zm5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    <span style={{ fontSize: 12, fontWeight: previewMode === 'mobile' ? 700 : 500 }}>Mobile</span>
                  </button>
                </div>
                <div className="preview-actions">
                  <IconButton onClick={() => setViewMode(viewMode === 'preview' ? 'code' : 'preview')} title={viewMode === 'preview' ? 'Show code' : 'Show preview'}>
                    {viewMode === 'preview' ? <CodeIcon /> : <VisibilityIcon />}
                  </IconButton>
                  <IconButton onClick={() => { copyToClipboard(finalHtml); addNotification('Code copied!'); }} title="Copy full email HTML to clipboard">
                    <ContentCopyIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => downloadAsFile('edm_espresso.html', finalHtml)}
                    title="Download full email HTML"
                    aria-label="Download full email HTML"
                    sx={{
                      backgroundColor: 'var(--color-primary)',
                      color: '#fff',
                      '& svg path': { fill: '#fff' },
                      '&:hover': {
                        backgroundColor: 'var(--color-primary-dark)',
                        color: '#fff',
                        '& svg path': { fill: '#fff' }
                      }
                    }}
                  >
                    <SvgIcon>
                      <path d="M5 20h14a1 1 0 001-1v-4h-2v3H6v-3H4v4a1 1 0 001 1zm7-3l5-5h-3V4h-4v8H7l5 5z" />
                    </SvgIcon>
                  </IconButton>
                </div>
              </div>
              <div id="preview" style={{ overflowY: 'auto', overflowX: 'hidden', padding: '1rem', paddingTop: '0', position: 'relative', paddingBottom: '0px' }}>
                {collectionEnriching && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: 0,
                      bottom: 0,
                      left: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      pointerEvents: 'none'
                    }}
                  >
                    <div
                      style={{
                        background: 'rgba(0,0,0,0.04)',
                        borderRadius: 20,
                        padding: '6px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <CircularProgress size={16} />
                      <span style={{ fontSize: 12, color: 'inherit' }}>Loading selection…</span>
                    </div>
                  </div>
                )}
                {viewMode === 'preview' ? (
                  <Box ref={previewRef} data-preview-container="true" sx={{
                    // Constrain viewport width based on previewMode; center it with margin auto
                    width: previewMode === 'mobile' ? 'var(--mobile-preview-width, 390px)' : 'min(var(--desktop-preview-max, 1280px), 100%)',
                    transition: 'width 200ms ease',
                    mx: 'auto',
                    // Make this wrapper the named container for container queries
                    containerType: 'inline-size',
                    containerName: 'preview',
                    '& a': {
                      color: 'primary.main',
                      textDecoration: 'underline',
                      textUnderlineOffset: '2px',
                      cursor: 'pointer',
                      wordBreak: 'break-word',
                    },
                    '& a:hover': {
                      textDecorationThickness: '2px',
                    },
                    '& a:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.light',
                      outlineOffset: '2px',
                    },
                  }}>
                    <div id="preview-inner">
                    {/* Floating announcement toolbar removed: preview is copy-only */}
                    {showHeaderSection && (
                      loading ? (
                        <Skeleton
                          variant="rectangular"
                          animation={skelAnim}
                          sx={{
                            mb: 2,
                            width: '100%',
                            maxWidth: 600,
                            mx: 'auto',
                            height: previewMode === 'mobile' ? 60 : 80,
                            borderRadius: 2,
                            boxShadow: 'var(--shadow-light)',
                            paddingTop: `${headerPadding.top ?? 0}px`,
                            paddingBottom: `${headerPadding.bottom ?? 0}px`
                          }}
                        />
                      ) : (
                        <div data-section="header" onClick={() => setOpenSection('header')} style={{ position: 'relative' }}>
                          {/* Constrain ripple and content inside a centered 600px wrapper */}
                          <div
                            style={{
                              maxWidth: 600,
                              width: '100%',
                              margin: '0 auto',
                              position: 'relative',
                              overflow: 'hidden',
                              background: '#FFFFFF',
                              // Set text color so TouchRipple uses it via currentColor
                              color: 'var(--color-accent)'
                            }}
                          >
                            {/* Ripple overlay confined to the 600px header box */}
                            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                              <TouchRipple ref={annRippleRef} center={false} />
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: headerHtml }} />
                          </div>
                        </div>
                      )
                    )}
              {sectionOrder.map((id) => {
                       if (id === 'hero' && showHeroSection) {
                         return heroImage && !debouncedLoading ? (
                           <div key="hero" data-section="hero">
                             <HeroTableModule
                               heroImage={heroImage}
                               heroAlt={heroAlt || brandName}
                               heroHref={heroHref}
                               heroImages={heroImages}
                               updateHero={updateHero}
                               templateId={selectedHeroId}
                               onActivate={() => setOpenSection('hero')}
                               wrapperPadding={heroPadding}
                             />
                           </div>
                         ) : (
                           <Skeleton
                             key="hero-skel"
                             variant="rectangular"
                             animation={skelAnim}
                             sx={{
                               mb: 2,
                               width: '100%',
                               maxWidth: 600,
                               mx: 'auto',
                               height: previewMode === 'mobile' ? 140 : 180,
                               borderRadius: 2,
                               boxShadow: 'var(--shadow-light)',
                               paddingTop: `${heroPadding.top ?? 0}px`,
                               paddingBottom: `${heroPadding.bottom ?? 0}px`
                             }}
                           />
                         );
                       }
                      if (id.startsWith('hero-clone-')) {
                        const cloneId = Number(id.replace('hero-clone-',''));
                        const clone = heroClones.find(c => c.id === cloneId);
                        if (!clone) return null;
                        return clone.image && !debouncedLoading ? (
                          <div key={id} data-section={id} onClick={() => setOpenSection(id)}>
                            <HeroTableModule
                              heroImage={clone.image}
                              heroAlt={clone.alt || brandName}
                              heroHref={clone.href}
                              heroImages={heroImages}
                              updateHero={(field, value) => updateHeroCloneField(cloneId, field as any, value)}
                              templateId={clone.templateId}
                              onActivate={() => setOpenSection(id)}
                              wrapperPadding={heroClonePaddings.get(cloneId) || heroPadding}
                            />
                          </div>
                        ) : (
                          <Skeleton
                            key={`${id}-skel`}
                            variant="rectangular"
                            animation={skelAnim}
                            sx={{
                              mb: 2,
                              width: '100%',
                              maxWidth: 600,
                              mx: 'auto',
                              height: previewMode === 'mobile' ? 140 : 180,
                              borderRadius: 2,
                              boxShadow: 'var(--shadow-light)',
                              paddingTop: `${(heroClonePaddings.get(cloneId) || heroPadding).top ?? 0}px`,
                              paddingBottom: `${(heroClonePaddings.get(cloneId) || heroPadding).bottom ?? 0}px`
                            }}
                          />
                        );
                      }
                      if (id === 'banner' && showBannerSection) {
                        return bannerImage && !debouncedLoading ? (
                          <div
                            key="banner"
                            data-section="banner"
                            onClick={() => setOpenSection('banner')}
                            style={{ position: 'relative' }}
                          >
                            {/* Render a preview wrapper like hero: table -> inner wrapper -> img + edit icon siblings.
                                Do not include any external link (<a>) around the image in preview. */}
                            <table
                              role="presentation"
                              width="100%"
                              cellPadding={0}
                              cellSpacing={0}
                              border={0}
                              align="center"
                              style={{ margin: 0, padding: 0 }}
                            >
                              <tbody>
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
                                        padding: `${bannerPadding.top ?? 0}px ${bannerPadding.right ?? 0}px ${bannerPadding.bottom ?? 0}px ${bannerPadding.left ?? 0}px`,
                                        background: '#FFFFFF'
                                      }}
                                    >
                                      <tbody>
                                        <tr>
                                          <td style={{ padding: 0 }}>
                                            <div
                                              className={`banner-image-wrapper${(analyzeData?.bannerImages?.length || 0) > 0 ? ' selectable' : ''}`}
                                              style={{
                                                position: 'relative',
                                                cursor: (analyzeData?.bannerImages?.length || 0) > 0 ? 'pointer' : 'default',
                                                overflow: 'hidden'
                                              }}
                                              onClick={() => {
                                                if ((analyzeData?.bannerImages?.length || 0) > 0) {
                                                  setShowBannerSelector(true);
                                                }
                                              }}
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
                                                src={bannerImage}
                                                alt={bannerAlt || ''}
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
                                              {(analyzeData?.bannerImages?.length || 0) > 0 && (
                                                <div
                                                  className="edit-icon"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenSection('banner');
                                                    setShowBannerSelector(true);
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
                                                  aria-label="Select banner image"
                                                  title="Select banner image"
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
                            {/* Banner ImageSelector overlay (positioned over preview panel) */}
                            {showBannerSelector && (() => {
                                      const previewPanel = typeof window !== 'undefined' ? (document.getElementById('preview') as HTMLElement) : null;
                                      const rect = previewPanel?.getBoundingClientRect() || undefined;
                              const imgs = uniqueImages((analyzeData?.bannerImages || []) as string[]);
                              return (
                                <ImageSelector
                                  images={imgs}
                                  selected={bannerImage}
                                  open={true}
                                  onSelect={(img) => {
                                    setBannerImage(img);
                                    setBannerHref(brandWebsite || '');
                                    setBannerAlt(analyzeData?.storeName || brandName || 'Brand');
                                    setShowBannerSelector(false);
                                  }}
                                  onClose={() => setShowBannerSelector(false)}
                                  anchorRect={rect}
                                />
                              );
                            })()}
                          </div>
                        ) : (
                          <Skeleton
                            key="banner-skel"
                            variant="rectangular"
                            animation={skelAnim}
                            sx={{
                              mb: 2,
                              width: '100%',
                              maxWidth: 600,
                              mx: 'auto',
                              height: previewMode === 'mobile' ? 90 : 120,
                              borderRadius: 2,
                              boxShadow: 'var(--shadow-light)',
                              paddingTop: `${bannerPadding.top ?? 0}px`,
                              paddingBottom: `${bannerPadding.bottom ?? 0}px`
                            }}
                          />
                        );
                      }
                      if (id.startsWith('banner-clone-')) {
                        const cloneId = Number(id.replace('banner-clone-',''));
                        const clone = bannerClones.find(c => c.id === cloneId);
                        if (!clone) return null;
                        return clone.image && !debouncedLoading ? (
                          <div
                            key={id}
                            data-section={id}
                            onClick={() => setOpenSection(id)}
                            style={{ position: 'relative' }}
                          >
                            <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} align="center" style={{ margin:0, padding:0 }}>
                              <tbody><tr><td align="center" style={{ margin:0, padding:0 }}>
                                <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ maxWidth:'600px', margin:'0 auto', width:'100%' }}>
                                  <tbody><tr><td style={{ padding: `${(bannerClonePaddings.get(cloneId)||bannerPadding).top ?? 0}px ${(bannerClonePaddings.get(cloneId)||bannerPadding).right ?? 0}px ${(bannerClonePaddings.get(cloneId)||bannerPadding).bottom ?? 0}px ${(bannerClonePaddings.get(cloneId)||bannerPadding).left ?? 0}px` }}>
                                    <div
                                      className={`banner-image-wrapper${(analyzeData?.bannerImages?.length || 0) > 0 ? ' selectable' : ''}`}
                                      style={{ position:'relative', cursor:(analyzeData?.bannerImages?.length||0)>0?'pointer':'default', overflow:'hidden' }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenSection(id);
                                        if ((analyzeData?.bannerImages?.length || 0) > 0) {
                                          setActiveBannerCloneSelector(cloneId);
                                        }
                                      }}
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
                                        src={clone.image}
                                        alt={clone.alt || brandName || ''}
                                        style={{ width:'100%', height:'auto', display:'block', borderRadius:4, cursor:(analyzeData?.bannerImages?.length||0)>0?'pointer':'default', border:'1px solid rgba(0,0,0,0.2)', transition:'opacity 0.2s ease-in-out' }}
                                      />
                                      {(analyzeData?.bannerImages?.length || 0) > 0 && (
                                        <div
                                          className="edit-icon"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenSection(id);
                                            setActiveBannerCloneSelector(cloneId);
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
                                          aria-label="Select banner image"
                                          title="Select banner image"
                                        >
                                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                            <path d="M14.69 3.1l6.2 6.2c.27.27.27.7 0 .97l-8.2 8.2c-.17.17-.39.26-.62.26H6.5c-.55 0-1-.45-1-1v-5.57c0-.23.09-.45.26-.62l8.2-8.2c.27-.27.7-.27.97 0zM5 20h14v2H5v-2z" />
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                    {activeBannerCloneSelector === cloneId && (() => {
                                      const previewPanel = typeof window !== 'undefined' ? (document.getElementById('preview') as HTMLElement) : null;
                                      const rect = previewPanel?.getBoundingClientRect() || undefined;
                                      const imgs = uniqueImages((analyzeData?.bannerImages || []) as string[]);
                                      return (
                                        <ImageSelector
                                          images={imgs}
                                          selected={clone.image}
                                          open={true}
                                          onSelect={(img) => {
                                            updateBannerCloneField(cloneId, 'image', img);
                                            updateBannerCloneField(cloneId, 'href', brandWebsite || '');
                                            updateBannerCloneField(cloneId, 'alt', analyzeData?.storeName || brandName || 'Brand');
                                            setActiveBannerCloneSelector(null);
                                          }}
                                          onClose={() => setActiveBannerCloneSelector(null)}
                                          anchorRect={rect}
                                        />
                                      );
                                    })()}
                                  </td></tr></tbody>
                                </table>
                              </td></tr></tbody>
                            </table>
                          </div>
                        ) : (
                          <Skeleton
                            key={`${id}-skel`}
                            variant="rectangular"
                            animation={skelAnim}
                            sx={{
                              mb: 2,
                              width: '100%',
                              maxWidth: 600,
                              mx: 'auto',
                              height: previewMode === 'mobile' ? 120 : 160,
                              borderRadius: 2,
                              boxShadow: 'var(--shadow-light)',
                              paddingTop: `${(bannerClonePaddings.get(cloneId)||bannerPadding).top ?? 0}px`,
                              paddingBottom: `${(bannerClonePaddings.get(cloneId)||bannerPadding).bottom ?? 0}px`
                            }}
                          />
                        );
                      }
                      if (id.startsWith('body-')) {
                        const section = bodySections.find((s) => `body-${s.id}` === id);
                        if (!section) return null;
                        return (
                          <div
                            key={id}
                            data-section={`body-${section.id}`}
                            onClick={() => setOpenSection(`body-${section.id}`)}
                          >
                            {section.loading && (
                              <>
                                {(() => {
                                  const pad = getBodySectionPadding(section.id);
                                  const skeletonSx = {
                                    mb: 2,
                                    width: '100%',
                                    maxWidth: 600,
                                    mx: 'auto',
                                    height: 180,
                                    borderRadius: 2,
                                    boxShadow: 'var(--shadow-light)',
                                    paddingTop: `${pad.top ?? 0}px`,
                                    paddingBottom: `${pad.bottom ?? 0}px`
                                  };
                                  if (section.urls.filter(u=>u.trim()).length === 0) {
                                    return (
                                      <Skeleton
                                        variant="rectangular"
                                        animation={skelAnim}
                                        sx={{ ...skeletonSx, height: previewMode === 'mobile' ? 140 : skeletonSx.height }}
                                      />
                                    );
                                  }
                                  return section.urls.filter(u=>u.trim()).map((_,i)=>(
                                    <Skeleton
                                      key={`url-skel-${section.id}-${i}`}
                                      variant="rectangular"
                                      animation={skelAnim}
                                      sx={{ ...skeletonSx, height: previewMode === 'mobile' ? 140 : skeletonSx.height }}
                                    />
                                  ));
                                })()}
                              </>
                            )}
                            {section.selectedBodyId === 'grid' ? (
                              (() => {
                                const tpl = bodyTemplates.find((t) => t.id === 'grid');
                                if (!tpl) return null;
                                // Render grid with clickable images
                                // Use the same table structure as the actual grid template
                                return (
                                  <>
                                    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} align="center" style={{ margin: 0, padding: 0 }}>
                                      <tbody>
                                        <tr>
                                          <td align="center" style={{ margin: 0, padding: 0 }}>
                                            <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ maxWidth: 600, margin: '0 auto', background: '#FFFFFF', padding: (() => { const p = getBodySectionPadding(section.id); const allZero = p.top===0&&p.right===0&&p.bottom===0&&p.left===0; const base = previewMode==='mobile'?12:25; return allZero?`${base}px`:`${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`; })() as any }}>
                                              <tbody>
                                                <tr>
                                                  <td style={{ padding: 0 }}>
                                                    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ width: '100%', margin: 0, padding: 0 }}>
                                                      <tbody>
                                                        {(() => {
                                                          const rows = gridRowChunks(section.products, 3);
                                                          let baseIndex = 0;
                                                          return rows.map((row: any[], rowIdx: number) => {
                                                            const colCount = row.length;
                                                            const percent = colCount === 3 ? '33.333%' : (colCount === 2 ? '50%' : '100%');
                                                            const cells = row.map((prod: any, innerIdx: number) => {
                                                              const globalIdx = baseIndex + innerIdx;
                                                              return (
                                                                <td
                                                                  key={`grid-${section.id}-${rowIdx}-${innerIdx}`}
                                                                  data-product-cell={`${section.id}-${globalIdx}`}
                                                                  align="center"
                                                                  valign="top"
                                                                  style={{ padding: '0 6px 0 6px', position: 'relative', cursor: 'pointer', overflow: 'hidden', width: percent }}
                                                                  onClick={(e) => {
                                                                    setImageSelector({ sectionId: section.id, productIdx: globalIdx });
                                                                    if (detectedPageType === 'collection') {
                                                                      setSelectedProductCtx({ sectionId: section.id, index: globalIdx });
                                                                      setSummaryTab(1);
                                                                    }
                                                                    const cell = e.currentTarget as HTMLElement;
                                                                    cell.classList.remove('product-click-ripple');
                                                                    void cell.offsetWidth;
                                                                    cell.classList.add('product-click-ripple');
                                                                  }}
                                                                  onMouseEnter={e => {
                                                                    const img = e.currentTarget.querySelector('img');
                                                                    const icon = e.currentTarget.querySelector('.edit-icon') as HTMLElement;
                                                                    if (img) (img as HTMLImageElement).style.opacity = '0.7';
                                                                    if (icon) icon.style.transform = 'translateY(-38px)';
                                                                  }}
                                                                  onMouseLeave={e => {
                                                                    const img = e.currentTarget.querySelector('img');
                                                                    const icon = e.currentTarget.querySelector('.edit-icon') as HTMLElement;
                                                                    if (img) (img as HTMLImageElement).style.opacity = '1';
                                                                    if (icon) icon.style.transform = 'translateY(0)';
                                                                  }}
                                                                >
                                                                  <img
                                                                    src={prod.image}
                                                                    alt={prod.title || ''}
                                                                    style={{ display: 'block', width: '100%', height: 'auto', border: 0, outline: 0, textDecoration: 'none', transition: 'opacity 0.2s ease-in-out' }}
                                                                  />
                                                                  {prod.images && prod.images.length > 1 && (
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
                                                                      onClick={e => { e.stopPropagation(); setImageSelector({ sectionId: section.id, productIdx: globalIdx }); }}
                                                                    >
                                                                      <EditIcon style={{ color: '#fff', fontSize: 16 }} />
                                                                    </div>
                                                                  )}
                                                                </td>
                                                              );
                                                            });
                                                            baseIndex += row.length;
                                                            return (
                                                              <React.Fragment key={`grid-wrap-${section.id}-${rowIdx}`}>
                                                                <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ width: '100%', margin: 0, padding: 0 }}>
                                                                  <tbody>
                                                                    <tr>{cells}</tr>
                                                                  </tbody>
                                                                </table>
                                                                {rowIdx === rows.length - 1 ? null : (
                                                                  <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ width: '100%', margin: 0, padding: 0 }}>
                                                                    <tbody>
                                                                      <tr><td style={{ height: 12, fontSize: 0, lineHeight: '12px' }}>&nbsp;</td></tr>
                                                                    </tbody>
                                                                  </table>
                                                                )}
                                                              </React.Fragment>
                                                            );
                                                          });
                                                        })()}
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
                                    {/* Universal ImageSelector for grid */}
                                    {imageSelector && imageSelector.sectionId === section.id && section.products[imageSelector.productIdx] && (() => {
                                      // Limit backdrop to main area
                                      const mainPanel = typeof window !== 'undefined' ? document.querySelector('main') as HTMLElement : null;
                                      const rect = mainPanel?.getBoundingClientRect() || undefined;
                                      return (
                                        <ImageSelector
                                          images={section.products[imageSelector.productIdx].images || []}
                                          selected={section.products[imageSelector.productIdx].image}
                                          open={true}
                                          onSelect={(img) => {
                                            updateProductInSection(section.id, imageSelector.productIdx, 'image', img);
                                            setImageSelector(null);
                                          }}
                                          onClose={() => setImageSelector(null)}
                                          anchorRect={rect}
                                        />
                                      );
                                    })()}
                                  </>
                                );
                              })()
                            ) : (
                              // For non-grid, preview modules inside a single 600px wrapper to reflect section padding once
                              (<>
                                <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} align="center" style={{ margin: 0, padding: 0 }}>
                                  <tbody>
                                    <tr>
                                      <td align="center" style={{ margin: 0, padding: 0 }}>
                                        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ maxWidth: 600, margin: '0 auto', background: '#FFFFFF', padding: (() => {
                                          const p = getBodySectionPadding(section.id);
                                          const allZero = p.top===0&&p.right===0&&p.bottom===0&&p.left===0;
                                          const base = previewMode==='mobile'?12:25;
                                          // If user supplied any non-zero padding, always honor it even for feature templates.
                                          if (!allZero) {
                                            return `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`;
                                          }
                                          // Otherwise, for feature templates preserve previous behavior (outer wrapper padding 0) to avoid double padding.
                                          if (section.selectedBodyId === 'product-image-left-copy-right' || section.selectedBodyId === 'product-copy-left-image-right') {
                                            return 0;
                                          }
                                          return `${base}px`;
                                        })() as any }}>
                                          <tbody>
                                            <tr>
                                              <td style={{ padding: 0 }}>
                                                {section.products.map((prod, idx) => {
                                // Alternate orientation across products for feature templates; start with the template's base orientation.
                                let orientation: 'left-image' | 'right-image';
                                if (section.selectedBodyId === 'product-image-left-copy-right') {
                                  if (section.alternate === false) {
                                    orientation = 'left-image';
                                  } else {
                                    orientation = (idx % 2 === 0) ? 'left-image' : 'right-image';
                                  }
                                } else if (section.selectedBodyId === 'product-copy-left-image-right') {
                                  if (section.alternate === false) {
                                    orientation = 'right-image';
                                  } else {
                                    orientation = (idx % 2 === 0) ? 'right-image' : 'left-image';
                                  }
                                } else {
                                  // Other templates: keep previous alternating fallback
                                  orientation = idx % 2 === 0 ? 'left-image' : 'right-image';
                                }
                                // Choose description source for preview (per-product)
                                const dsPrev = (prod as any).descSource || 'metadata';
                                let chosenDescription = (prod as any).description || '';
                                if (dsPrev === 'p' && (prod as any).descriptionP) {
                                  chosenDescription = (prod as any).descriptionP as string;
                                } else if (dsPrev === 'ul' && (prod as any).descriptionUl) {
                                  chosenDescription = (prod as any).descriptionUl as string;
                                } else if (dsPrev === 'metadata') {
                                  const meta = (prod as any).metadataDescription || (prod as any).originalMetadataDescription || '';
                                  if (meta) chosenDescription = meta as string;
                                }
                                if (!chosenDescription) {
                                  const meta = (prod as any).metadataDescription || (prod as any).originalMetadataDescription || '';
                                  if (meta) chosenDescription = meta as string;
                                }
                                return (
                                  <div key={`mod-${section.id}-${idx}`} data-product-cell={`${section.id}-${idx}`} className="product-module-wrapper" onClick={(e) => {
                                    if (detectedPageType === 'collection') {
                                      setSelectedProductCtx({ sectionId: section.id, index: idx });
                                      setSummaryTab(1);
                                    }
                                    const cell = (e.currentTarget as HTMLElement);
                                    cell.classList.remove('product-click-ripple');
                                    void cell.offsetWidth;
                                    cell.classList.add('product-click-ripple');
                                  }}>
                                  <ProductTableModule
                                    key={`${section.id}-${idx}`}
                                    product={{ ...prod, description: chosenDescription }}
                                    index={idx}
                                    total={section.products.length}
                                    featureTemplate={section.selectedBodyId === 'product-image-left-copy-right' || section.selectedBodyId === 'product-copy-left-image-right'}
                                    orientation={orientation}
                                    templateId={section.selectedBodyId as any}
                                    updateProduct={(i: number, field: any, value: string) => updateProductInSection(section.id, i, field, value)}
                                    onActivate={() => {
                                      setOpenSection(`body-${section.id}`);
                                      if (detectedPageType === 'collection') {
                                        setSelectedProductCtx({ sectionId: section.id, index: idx });
                                        // Removed auto switch to Product tab; user stays on Collection
                                      }
                                    }}
                                    onProductFieldClick={() => {
                                      setShowBrandPanel(true);
                                      setSummaryTab(detectedPageType === 'collection' ? 1 : 0);
                                    }}
                                    ctaBg={brandPrimary}
                                    overlayContainerRef={previewRef as any}
                                    brandName={brandName}
                                    descSource={(prod as any).descSource as any}
                                    onChangeDescSource={(src: any) => updateProductInSection(section.id, idx, 'descSource' as any, src)}
                                  />
                                  </div>
                                );
                              })}
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </>)
                            )}
                          </div>
                        );
                      }
                      return null;
                    })}
                    {showFooterSection && (
                      loading ? (
                        <Skeleton
                          variant="rectangular"
                          animation={skelAnim}
                          sx={{
                            mb: 2,
                            width: '100%',
                            maxWidth: 600,
                            mx: 'auto',
                            height: 80,
                            borderRadius: 2,
                            boxShadow: 'var(--shadow-light)',
                            paddingTop: `${footerPadding.top ?? 0}px`,
                            paddingBottom: `${footerPadding.bottom ?? 0}px`
                          }}
                        />
                      ) : (
                        <div data-section="footer" onClick={() => setOpenSection('footer')} style={{ position: 'relative' }}>
                          {/* Constrain ripple and content to centered 600px wrapper */}
                          <div
                            onMouseDown={handleFooterRippleMouseDown}
                            onMouseUp={handleFooterRippleMouseUp}
                            onMouseLeave={handleFooterRippleMouseLeave}
                            style={{
                              maxWidth: 600,
                              width: '100%',
                              margin: '0 auto',
                              position: 'relative',
                              overflow: 'hidden',
                              background: '#FFFFFF',
                              color: 'var(--color-accent)'
                            }}
                          >
                            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                              <TouchRipple ref={footerRippleRef} center={false} />
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: footerHtml }} />
                          </div>
                        </div>
                      )
                    )}
                    </div>
                  </Box>
                ) : (
                  <div className="code-accordion" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-2)' }}>
                    {codeSections.map((section) => {
                      const isOpen = openCodeSections[section.key] !== false;
                      return (
                        <Paper key={section.key} variant="outlined" square sx={{ bgcolor: 'background.paper', borderColor: 'divider' }}>
                          <Box
                            className="code-section-header"
                            onClick={() => toggleCodeSection(section.key)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              px: 2,
                              py: 1,
                              bgcolor: 'background.paper',
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {section.title}
                            </Typography>
                            <Box className="code-actions" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconButton onClick={(e) => { e.stopPropagation(); toggleCodeSection(section.key); }} title={isOpen ? 'Collapse section' : 'Expand section'}>
                                {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                              <IconButton onClick={(e) => { e.stopPropagation(); copyToClipboard(section.code); addNotification('Code copied!'); }} title="Copy code to clipboard">
                                <ContentCopyIcon />
                              </IconButton>
                            </Box>
                          </Box>
                          {isOpen && (
                            <Box
                              component="pre"
                              sx={{
                                m: 0,
                                maxHeight: 200,
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                bgcolor: 'background.paper',
                                color: 'text.primary',
                                px: 2,
                                py: 1,
                                fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                overflowWrap: 'anywhere',
                                borderLeft: '3px solid',
                                borderColor: 'divider'
                              }}
                            >
                              <code dangerouslySetInnerHTML={{ __html: highlight(section.code) }} />
                            </Box>
                          )}
                        </Paper>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
        </AppLayout>

        {/* Global quick actions SpeedDial fixed to viewport bottom-right */}
        {viewMode === 'preview' && (
          <Box
            aria-hidden={false}
            sx={{
              position: 'fixed',
              zIndex: (theme) => theme.zIndex.tooltip + 2,
              bottom: 16,
              right: `calc(var(--right-panel-offset, 0px) + 16px)`
            }}
          >
            <SpeedDial
              ariaLabel="Preview quick actions"
              open={speedDialOpen}
              onClose={() => setSpeedDialOpen(false)}
              icon={
                <SpeedDialIcon
                  icon={
                    <SvgIcon sx={{ fontSize: 28, width: 28, height: 28 }} viewBox="0 0 24 24">
                      <path d="M11 5h2v14h-2zM5 11h14v2H5z" />
                    </SvgIcon>
                  }
                  openIcon={<CloseIcon2 sx={{ fontSize: 28, width: 28, height: 28 }} />}
                  sx={{ '& .MuiSpeedDialIcon-openIcon': { fontSize: 28, width: 28, height: 28 } }}
                />
              }
              FabProps={{
                onClick: () => setSpeedDialOpen(o => !o),
                sx: {
                  bgcolor: 'var(--color-primary)',
                  color: '#fff',
                  '&:hover': { bgcolor: 'var(--color-primary-dark)', color: '#fff' }
                }
              }}
            >
              <SpeedDialAction
                key="new-edm"
                icon={<AddIcon sx={{ fontSize: 28, width: 28, height: 28 }} />}
                tooltipTitle="Build New EDM"
                aria-label="Build New EDM"
                FabProps={{
                  sx: {
                    bgcolor: 'var(--color-primary)',
                    color: '#fff',
                    '&:hover': { bgcolor: 'var(--color-primary-dark)', color: '#fff' }
                  }
                }}
                onClick={() => { setConfirmNewOpen(true); setSpeedDialOpen(false); }}
              />
              <SpeedDialAction
                key="download-edm"
                icon={<DownloadIcon />}
                tooltipTitle="Download"
                aria-label="Download EDM HTML"
                FabProps={{
                  sx: {
                    bgcolor: 'var(--color-primary)',
                    color: '#fff',
                    '&:hover': { bgcolor: 'var(--color-primary-dark)', color: '#fff' }
                  }
                }}
                onClick={() => { downloadAsFile('edm_espresso.html', finalHtml); setSpeedDialOpen(false); }}
              />
            </SpeedDial>
          </Box>
        )}

        {/* Wizard Dialog removed: content moved to persistent right summary panel */}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMsg as any}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        />

        {/* Confirm reset dialog */}
  <Dialog open={confirmNewOpen} onClose={() => setConfirmNewOpen(false)} aria-labelledby="confirm-new-edm-title">
          <DialogTitle id="confirm-new-edm-title">Start a new EDM?</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              This will clear your current draft, URLs, and generated sections. You can’t undo this action.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmNewOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setConfirmNewOpen(false);
                resetAllState();
              }}
            >
              Confirm reset
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
}
