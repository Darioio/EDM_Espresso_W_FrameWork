  // ...existing code...

// ...existing code...
// ...existing code...

  // ...existing code...
  // Place this after bodySections and generateSection are defined
import React, { useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import Head from 'next/head';
import AppLayout from '../components/AppLayout';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
// MUI components for Brand Customisation panel
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
// Grid removed; using Box with CSS grid for layout
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
// Padding toggles removed
import Paper from '@mui/material/Paper';
import CloseIcon from '@mui/icons-material/Close';
import { MuiColorInput } from 'mui-color-input';
import InputAdornment from '@mui/material/InputAdornment';
// Removed padding controls
import SvgIcon from '@mui/material/SvgIcon';
import { styled } from '@mui/material/styles';
import Backdrop from '@mui/material/Backdrop';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {
  defaultTemplates as defaultBodyTemplates,
  Template as BodyTemplate,
  renderTemplate
} from '../data/templates';
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
import { sanitizeEmailHtml, sanitizeInlineHtml } from '../lib/sanitize';
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
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  DndContext,
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
}

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
  descriptionSource?: 'metadata' | 'p' | 'ul';
  /** Per-section wrapper padding (px) applied to the 600px wrapper table */
  padding?: PaddingValue;
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
      setBodySections((sections) => {
        const oldIndex = sections.findIndex((s) => `body-${s.id}` === active.id);
        const newIndex = sections.findIndex((s) => `body-${s.id}` === over.id);
        return arrayMove(sections, oldIndex, newIndex);
      });
    }
  };

  // Separate component for product URL fields to avoid focus loss
  const ProductUrlFields: React.FC<{
    sectionId: number;
    urls: string[];
    onUrlChange: (sectionId: number, index: number, value: string) => void;
    onAddField: (sectionId: number, index: number) => void;
    onRemoveField: (sectionId: number, index: number) => void;
    addNotification: (msg: React.ReactNode) => void;
  }> = React.memo(({ sectionId, urls, onUrlChange, onAddField, onRemoveField, addNotification }) => {
    // Keep completely local state for input values - only sync on blur
    const [localValues, setLocalValues] = useState<string[]>(() => 
      urls.length > 0 ? urls : ['']
    );
    // Only update local values if the actual URLs have meaningfully changed
    const prevUrlsRef = useRef<string[]>([]);
    useEffect(() => {
      const urlsChanged = urls.length !== prevUrlsRef.current.length || 
        urls.some((url, i) => url !== prevUrlsRef.current[i]);
      if (urlsChanged) {
        setLocalValues(urls.length > 0 ? urls : ['']);
        prevUrlsRef.current = [...urls];
      }
    }, [urls]);

  // addNotification is now passed as a prop from parent

    // Helper to validate a URL
    const isValidUrl = (url: string) => {
      try {
        // Accept only http(s) URLs
        const u = new URL(url);
        return u.protocol === 'http:' || u.protocol === 'https:';
      } catch {
        return false;
      }
    };

    const updateLocalValue = (index: number, value: string) => {
      setLocalValues(prev => {
        const next = [...prev];
        next[index] = value;
        return next;
      });
    };

    const syncToParent = (index: number) => {
      const cleaned = sanitizeUrl(localValues[index] || '');
      // Show notification if not a valid URL and not empty
      if (cleaned && !isValidUrl(cleaned)) {
        addNotification(
          <span>
            Invalid product URL: <span style={{fontWeight:'bold'}}>{cleaned}</span>&nbsp;|&nbsp;Please enter a valid http(s) link.
          </span>
        );
      }
      onUrlChange(sectionId, index, cleaned);
    };

    return (
      <div style={{ width: '100%', paddingRight: '0px' }}>
        <Typography variant="subtitle1" sx={{ mb: 1, mt: 1, fontWeight: '600' }}>Product URLs</Typography>
        {localValues.map((localValue, index) => (
          <Box
            key={index}
            sx={{
              mb: 2,
              position: 'relative',
              width: '100%',
              overflow: 'visible',
              pr: '44px' // reserve space for + icon so all rows match the last row width
            }}
          >
            <TextField
              id={`url-${sectionId}-${index}`}
              type="url"
              label={`Product URL ${index + 1}`}
              value={localValue}
              fullWidth
              onChange={(e) => updateLocalValue(index, e.target.value)}
              onBlur={() => syncToParent(index)}
              InputProps={{
                endAdornment: localValues.length > 1 ? (
                  <InputAdornment position="end">
                    <IconButton onClick={() => onRemoveField(sectionId, index)} title="Remove URL" edge="end">
                      <CloseIcon2 fontSize="medium" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              inputProps={{
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                  const curr = e.currentTarget as HTMLInputElement;
                  const value = curr.value.trim();
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    syncToParent(index);
                    if (value && index === localValues.length - 1) {
                      onAddField(sectionId, index + 1);
                    }
                    curr.blur();
                  } else if (e.key === 'Tab' && !e.shiftKey && index === localValues.length - 1) {
                    e.preventDefault();
                    syncToParent(index);
                    onAddField(sectionId, index + 1);
                  }
                }
              }}
              variant="standard"
              sx={{'& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}}
            />
            {index === localValues.length - 1 && (
              <IconButton
                onClick={() => onAddField(sectionId, index + 1)}
                title="Add URL"
                edge="end"
                sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
              >
                <AddIcon fontSize="medium" />
              </IconButton>
            )}
          </Box>
        ))}
      </div>
    );
  });

  const SortableBodySection: React.FC<{ section: BodySection; isOpen: boolean }> = ({ section, isOpen }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: `body-${section.id}` });
    const { ['aria-describedby']: _ariaDescribedBy, ...sortableAttributes } = attributes as any;
    const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

    // Stable handler so PaddingControls.onChange identity doesn't change across renders
    const handlePaddingChange = useCallback((p: PaddingValue) => setBodySectionPadding(section.id, p), [section.id, setBodySectionPadding]);
    return (
      <div className={`accordion-section${isOpen ? ' open' : ''}`} ref={setNodeRef} style={style}>
        <div className={`accordion-header${isOpen ? ' open' : ''}`} onClick={() => handleAccordionToggle(`body-${section.id}`)}>
          <IconButton
            size="medium"
            {...sortableAttributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            title="Reorder section"
          >
            <DragIndicatorIcon fontSize="medium" />
          </IconButton>
          <span>{section.name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-2)', marginLeft: 'auto' }}>
            <IconButton
              size="medium"
              onClick={(e) => {
                e.stopPropagation();
                removeBodySection(section.id);
              }}
              title="Remove section"
            >
              <DeleteIcon fontSize="medium" />
            </IconButton>
            <IconButton
              size="medium"
              onClick={(e) => {
                e.stopPropagation();
                handleAccordionToggle(`body-${section.id}`);
              }}
              title={isOpen ? 'Collapse section' : 'Expand section'}
            >
              {isOpen ? (
                <ExpandLessIcon fontSize="medium" />
              ) : (
                <ExpandMoreIcon fontSize="medium" />
              )}
            </IconButton>
          </div>
        </div>
        {isOpen && (
          <div className="accordion-content">
            {/* Move Template + Description Source controls above URLs */}
            <div className="template-row" style={{ display: 'flex', gap: 'var(--gap-2)', alignItems: 'center', marginTop: '0.5rem'  }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id={`body-template-${section.id}`}>Template</InputLabel>
                <Select
                  labelId={`body-template-${section.id}`}
                  id={`body-template-select-${section.id}`}
                  label="Template"
                  value={section.selectedBodyId}
                  onChange={(e) => setSectionTemplate(section.id, e.target.value as string)}
                >
                  {bodyTemplates.map((tpl) => (
                    <MenuItem key={tpl.id} value={tpl.id}>{tpl.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
            />
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: 'var(--gap-2)' }}>
              <Button
                onClick={() => {
                  if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                  }
                  setTimeout(() => generateSection(section.id), 0);
                }}
                disabled={section.loading}
              >
                {section.loading ? 'Generating…' : 'Update'}
              </Button>
              {/* Add URL button removed in favor of inline plus icon next to the last field */}
            </div>
            <PaddingControls
              label="Section padding (px)"
              value={getBodySectionPadding(section.id)}
              onChange={handlePaddingChange}
              persistKey={`body:${section.id}:padding`}
            />
            {/* CTA background customization removed */}
          </div>
        )}
      </div>
    );
  };

  // Avoid re-rendering body sections when only unrelated state (like padding map) changes.
  const MemoizedSortableBodySection = React.memo(
    SortableBodySection,
    (prev, next) => prev.section === next.section && prev.isOpen === next.isOpen
  );

  const SortableHeroSection: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: 'hero' });
    const { ['aria-describedby']: _ariaDescribedBy, ...sortableAttributes } = attributes as any;
    const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;
    return (
      <div className={`accordion-section${isOpen ? ' open' : ''}`} ref={setNodeRef} style={style}>
        <div className={`accordion-header${isOpen ? ' open' : ''}`} onClick={() => handleAccordionToggle('hero')}>
          <IconButton
            size="medium"
            {...sortableAttributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            title="Reorder section"
          >
            <DragIndicatorIcon fontSize="medium" />
          </IconButton>
          <span>Hero</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--gap-2)' }}>
            <IconButton
              size="medium"
              onClick={(e) => {
                e.stopPropagation();
                removeHeroSection();
              }}
              title="Remove section"
            >
              <DeleteIcon fontSize="medium" />
            </IconButton>
            <IconButton
              size="medium"
              onClick={(e) => {
                e.stopPropagation();
                handleAccordionToggle('hero');
              }}
              title={isOpen ? 'Collapse section' : 'Expand section'}
            >
              {isOpen ? <ExpandLessIcon fontSize="medium" /> : <ExpandMoreIcon fontSize="medium" />}
            </IconButton>
          </div>
        </div>
        {isOpen && (
          <div className="accordion-content">
            {heroImage ? (
              <div style={{ marginBottom: '0.5rem' }}>
                <img src={heroImage} alt={heroAlt || ''} style={{ width: '100%', height: 'auto', border: '1px solid rgba(0, 0, 0, 0.2)', borderRadius: '6px', overflow: 'hidden'  }} />
              </div>
            ) : (
              <p>No hero image selected.</p>
            )}
            <div className="template-row" style={{ display: 'flex', gap: 'var(--gap-2)', alignItems: 'center', marginTop: '1.5rem'  }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="hero-template-label">Template</InputLabel>
                <Select labelId="hero-template-label" id="hero-template-select" label="Template" value={selectedHeroId} onChange={(e) => setSelectedHeroId(e.target.value)}>
                  {heroTemplates.map((tpl) => (
                    <MenuItem key={tpl.id} value={tpl.id}>{tpl.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
            <PaddingControls label="Section padding (px)" value={heroPadding} onChange={onHeroPaddingChange} persistKey="hero:padding" />
          </div>
        )}
      </div>
    );
  };

  const SortableBannerSection: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: 'banner' });
    const { ['aria-describedby']: _ariaDescribedBy, ...sortableAttributes } = attributes as any;
    const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;
    return (
      <div className={`accordion-section${isOpen ? ' open' : ''}`} ref={setNodeRef} style={style}>
        <div className={`accordion-header${isOpen ? ' open' : ''}`} onClick={() => handleAccordionToggle('banner')}>
          <IconButton
            size="medium"
            {...sortableAttributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            title="Reorder section"
          >
            <DragIndicatorIcon fontSize="medium" />
          </IconButton>
          <span>Banner</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--gap-2)' }}>
            <IconButton
              size="medium"
              onClick={(e) => {
                e.stopPropagation();
                removeBannerSection();
              }}
              title="Remove section"
            >
              <DeleteIcon fontSize="medium" />
            </IconButton>
            <IconButton
              size="medium"
              onClick={(e) => {
                e.stopPropagation();
                handleAccordionToggle('banner');
              }}
              title={isOpen ? 'Collapse section' : 'Expand section'}
            >
              {isOpen ? <ExpandLessIcon fontSize="medium" /> : <ExpandMoreIcon fontSize="medium" />}
            </IconButton>
          </div>
        </div>
        {isOpen && (
          <div className="accordion-content">
            {bannerImage ? (
              <div style={{ marginBottom: '0.5rem' }}>
                <img src={bannerImage} alt={bannerAlt || ''} style={{ width: '100%', height: 'auto', border: '1px solid rgba(0, 0, 0, 0.2)', borderRadius: '6px', overflow: 'hidden' }} />
              </div>
            ) : (
              <p>No hero image selected.</p>
            )}
              <div className="template-row" style={{ display: 'flex', gap: 'var(--gap-2)', alignItems: 'center', marginTop: '1.5rem'  }}>
              <FormControl fullWidth variant="outlined" >
                <InputLabel id="banner-template-label">Template</InputLabel>
                <Select labelId="banner-template-label" id="banner-template-select" label="Template" value={selectedBannerId} onChange={(e) => setSelectedBannerId(e.target.value)}>
                  {bannerTemplates.map((tpl) => (
                    <MenuItem key={tpl.id} value={tpl.id}>{tpl.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
            <PaddingControls label="Section padding (px)" value={bannerPadding} onChange={onBannerPaddingChange} persistKey="banner:padding" />
          </div>
        )}
      </div>
    );
  };

  const MemoizedSortableHeroSection = React.memo(SortableHeroSection);
  const MemoizedSortableBannerSection = React.memo(SortableBannerSection);

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
  const [summaryTab, setSummaryTab] = useState(0); // 0: Brand, 1: Product, 2: Assets

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
  const [showBrandPanel, setShowBrandPanel] = useState(false);
  const [brandName, setBrandName] = useState('');
  // Top loading bar (buffer variant)
  const [progress, setProgress] = useState<number>(-1);
  const [buffer, setBuffer] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(false);
  const [brandFont, setBrandFont] = useState('');
  const [brandPrimary, setBrandPrimary] = useState('#d19aa0');
  const [brandSecondary, setBrandSecondary] = useState('#F0C3C7');
  const [brandWebsite, setBrandWebsite] = useState('');
  // Section paddings (px)
  const [headerPadding, setHeaderPadding] = useState<PaddingValue>({ top: 0, right: 0, bottom: 0, left: 0 });
  const [heroPadding, setHeroPadding] = useState<PaddingValue>({ top: 0, right: 0, bottom: 0, left: 0 });
  const [bannerPadding, setBannerPadding] = useState<PaddingValue>({ top: 0, right: 0, bottom: 0, left: 0 });
  const [footerPadding, setFooterPadding] = useState<PaddingValue>({ top: 0, right: 0, bottom: 0, left: 0 });
  const [bodySectionPaddings, setBodySectionPaddings] = useState<Map<number, PaddingValue>>(new Map());

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
  // When the user submits a product URL, initialize the first body section with that URL
  useEffect(() => {
    if (brandWebsite && bodySections.length === 0 && brandUrlInput) {
      setBodySections([
        {
          id: 1,
          name: 'Body 1',
          urls: [brandUrlInput],
          products: [],
          selectedBodyId: defaultBodyTemplates[0].id,
          loading: false,
          descriptionSource: 'metadata'
        }
      ]);
    }
  }, [brandWebsite, brandUrlInput]);

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
  const [brandLogo, setBrandLogo] = useState<File | null>(null);
  // Wizard: analysis results and visibility
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardLoading, setWizardLoading] = useState(false);
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

  // Ensure page metadata description persists when switching sources:
  // if analyzeData.product.metadataDescription is missing but product.description exists,
  // initialize metadataDescription from description once.
  useEffect(() => {
    if (!analyzeData?.product) return;
    setAnalyzeData((d) => {
      if (!d) return d;
      const p: any = d.product as any;
      if (typeof p.metadataDescription === 'undefined' && typeof p.description === 'string') {
        return { ...d, product: { ...p, metadataDescription: p.description } } as any;
      }
      return d;
    });
  }, [analyzeData?.product]);
  const [wizardSelection, setWizardSelection] = useState({
    includeLogo: true,
    selectedHero: null as string | null,
    selectedBanner: null as string | null,
    includeColors: true,
    selectedPrimary: null as string | null,
    selectedText: 'black' as 'black' | 'white',
    includeFonts: true,
    includeProduct: true,
    includeAnnouncement: true
  });
  // Optional announcement bar content to inject into header template
  const [brandAnnouncement, setBrandAnnouncement] = useState<string>('');
  // Selected text color for contrast on CTA/announcement (black or white)
  const [brandTextColor, setBrandTextColor] = useState<'black' | 'white'>('black');

  /** Notifications for user feedback. Each notification has a unique id
   * and a message. Notifications are displayed in a stack in the
   * top‑right corner and fade out after a short delay. */
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState<ReactNode>('');

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
  const addNotification = useCallback((message: ReactNode) => {
    setSnackbarMsg(message);
    setSnackbarOpen(true);
  }, []);

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
      setWizardLoading(true);
      (async () => {
        try {
          const res = await fetch(`/api/analyze?url=${encodeURIComponent(brandUrlInput)}`);
          if (!res.ok) throw new Error(`Analyze failed: ${res.status}`);
          const data = await res.json();
          setAnalyzeData(data);
          setWizardSelection((sel) => ({
            ...sel,
            selectedHero: data.heroImages?.[0] || null,
            selectedBanner: data.bannerImages?.[0] || null,
            selectedText: (data.textColor as 'black' | 'white') || sel.selectedText
          }));
          // Open the right summary panel
          setShowBrandPanel(true);
        } catch (err) {
          console.error(err);
          addNotification('Failed to analyze page. You can continue manually.');
        } finally {
          setWizardLoading(false);
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
    const el = previewRef.current;
    if (!el) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor) {
        e.preventDefault();
        e.stopPropagation();
        const href = anchor.getAttribute('href');
        if (href) {
          addNotification(
            <span>
              External link: <a href={href} target="_blank" rel="noopener noreferrer">{href}</a>
            </span>
          );
          const sectionEl = anchor.closest('[data-section]');
          const sectionId = sectionEl?.getAttribute('data-section');
          if (sectionId) {
            setOpenSection(sectionId);
          }
        }
      }
    };
    el.addEventListener('click', handleClick);
    return () => {
      el.removeEventListener('click', handleClick);
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
    if (brandFont && brandFont.trim()) {
      // Replace the default font stack. We do a simple replace on the
      // exact string used in the templates. If more variants are
      // needed this could be expanded.
      const regex = new RegExp("'Montserrat',Arial,Helvetica,sans-serif", 'gi');
      out = out.replace(regex, brandFont);
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
    if (!brandLogoDataUrl) return html;
    return html.replace(/<img([^>]+)src="[^">]*"/, `<img$1src="${brandLogoDataUrl}"`);
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

  // Inject padding into the wrapper table (the one with max-width:600px)
  const applyWrapperPadding = (html: string, padding?: PaddingValue): string => {
    if (!padding) return html;
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
    const pr = padding ? `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px` : '0';
    return `\n<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0;padding:0;">\n  <tr>\n    <td align="center" style="margin:0;padding:0;">\n      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;background:#FFFFFF;padding:${pr};">\n        <tr>\n          <td style="padding:0;">\n            ${innerHtml}\n          </td>\n        </tr>\n      </table>\n    </td>\n  </tr>\n</table>`;
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

  // When analyzeData arrives, initialize brand font and announcement if not set
  useEffect(() => {
    if (!analyzeData) return;
    // Prefill brand font: prefer first detected font family; else Montserrat default
    if (!brandFont || !brandFont.trim()) {
      const detected = (analyzeData.fontFamilies && analyzeData.fontFamilies[0]) || '';
      if (detected) {
        const needsQuote = /[^a-z0-9-]/i.test(detected);
        const css = `${needsQuote ? `'${detected}'` : detected},Arial,Helvetica,sans-serif`;
        setBrandFont(css);
      } else {
        setBrandFont("'Montserrat',Arial,Helvetica,sans-serif");
      }
    }
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
  useEffect(() => {
    const el = previewRef.current?.querySelector('[data-announcement="true"]') as HTMLElement | null;
    if (!el) return;
    // Keep it editable and add subtle hover affordance
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('spellcheck', 'false');
    const onBlur = () => {
      const html = (el.innerHTML || '').trim();
      setBrandAnnouncement(html);
    };
    const onEnter = () => { el.style.opacity = '0.6'; };
    const onLeave = () => { el.style.opacity = '1'; };
    el.addEventListener('blur', onBlur);
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('blur', onBlur);
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
      loading: false
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
    setBodySections((prev) => prev.filter((section) => section.id !== sectionId));
    setSectionOrder((prev) => prev.filter((id) => id !== `body-${sectionId}`));
    setOpenSection((prev) => (prev === `body-${sectionId}` ? '' : prev));
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
    let headerStr = '';
    if (showHeaderSection) {
      const headerTemplate = headerTemplates.find((t) => t.id === selectedHeaderId);
      headerStr = headerTemplate ? headerTemplate.html : '';
  headerStr = applyBrandColoursAndFont(headerStr);
  headerStr = applyBrandLogo(headerStr);
  headerStr = applyAnnouncementCopy(headerStr);
  headerStr = applyWrapperPadding(headerStr, headerPadding);
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
        const salePrice = (prod as any).price || '';
        const originalPrice = (prod as any).originalPrice;
        let priceHtml = '';
        if (originalPrice && originalPrice !== salePrice) {
          priceHtml = `<span style="text-decoration:line-through;color:#888888;margin-right:8px;font-weight:400;">${originalPrice}</span> ${salePrice}`;
        } else {
          priceHtml = salePrice;
        }
        // Choose description source per section
        let chosenDescription = (prod as any).description || '';
        if (section.descriptionSource === 'p' && (prod as any).descriptionP) {
          chosenDescription = (prod as any).descriptionP;
        } else if (section.descriptionSource === 'ul' && (prod as any).descriptionUl) {
          chosenDescription = (prod as any).descriptionUl;
        }
  const ds = section.descriptionSource || 'metadata';
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
        // Render module using the full template. Passing only
        // tpl.html causes runtime errors because renderTemplate
        // expects a Template object.
    let moduleHtml = renderTemplate(tpl as any, productData);
        if (ds === 'ul' && (prod as any).descriptionUl) {
          const ulHtml = emailSafe ? sanitizeEmailHtml((prod as any).descriptionUl as string) : (prod as any).descriptionUl as string;
          moduleHtml = moduleHtml.replace(/<p[^>]*>\s*\[\[DESC_MARKER\]\]\s*<\/p>/i, ulHtml);
        }
  moduleHtml = stripModuleWrapper(moduleHtml);
  moduleHtml = applyBrandColoursAndFont(moduleHtml);
        sectionHtml += moduleHtml;
      });
      // Apply padding once to a single outer wrapper around the whole section
      bodyHtmlMap[`body-${section.id}`] = wrapSectionWithWrapper(sectionHtml, getBodySectionPadding(section.id));
    });
    // Compose banner if an image has been fetched
    let bannerStr = '';
    const bannerTemplate = bannerTemplates.find((t) => t.id === selectedBannerId);
    if (showBannerSection && bannerTemplate && bannerImage) {
      const data: any = {
        bannerImage,
        bannerAlt: bannerAlt || '',
        bannerHref: bannerHref || ''
      };
      if (!data.bannerAlt && brandName) data.bannerAlt = brandName;
  bannerStr = renderTemplate(bannerTemplate as any, data);
  bannerStr = applyBrandColoursAndFont(bannerStr);
  bannerStr = applyWrapperPadding(bannerStr, bannerPadding);
    }
    // Compose footer
    let footerStr = '';
    if (showFooterSection) {
      const footerTemplate = footerTemplates.find((t) => t.id === selectedFooterId);
      footerStr = footerTemplate ? footerTemplate.html : '';
    footerStr = applyBrandColoursAndFont(footerStr);
    footerStr = applyWrapperPadding(footerStr, footerPadding);
    }
    let orderedHtml = '';
    sectionOrder.forEach((id) => {
      if (id === 'hero') orderedHtml += heroStr;
      else if (id === 'banner') orderedHtml += bannerStr;
      else if (id.startsWith('body-')) orderedHtml += bodyHtmlMap[id] || '';
    });

    setHeaderHtml(headerStr);
    setHeroHtml(heroStr);
    setBodyHtml(sectionOrder.filter((id) => id.startsWith('body-')).map((id) => bodyHtmlMap[id]).join(''));
    setBannerHtml(bannerStr);
    setFooterHtml(footerStr);
    setFinalHtml(`${headerStr}${orderedHtml}${footerStr}`);
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
    brandFont,
    brandLogoDataUrl,
    brandAnnouncement,
    heroImage,
    heroAlt,
    heroHref,
    bannerImage,
    bannerAlt,
    bannerHref,
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
      const salePrice = (prod as any).price || '';
      const originalPrice = (prod as any).originalPrice;
      let priceHtml = '';
      if (originalPrice && originalPrice !== salePrice) {
        priceHtml = `<span style="text-decoration:line-through;color:#888888;margin-right:8px;font-weight:400;">${originalPrice}</span> ${salePrice}`;
      } else {
        priceHtml = salePrice;
      }
      // Compose data object for templating
        // Choose description for code view as well
        let chosenDesc2 = (prod as any).description || '';
        if (section.descriptionSource === 'p' && (prod as any).descriptionP) {
          chosenDesc2 = (prod as any).descriptionP as string;
        } else if (section.descriptionSource === 'ul' && (prod as any).descriptionUl) {
          chosenDesc2 = (prod as any).descriptionUl as string;
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
      if (section.descriptionSource === 'ul' && (prod as any).descriptionUl) {
        const ulHtml = emailSafe ? sanitizeEmailHtml((prod as any).descriptionUl as string) : (prod as any).descriptionUl as string;
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
  const sanitizeUrl = (url: string) => url.split('?')[0];
  const isHttpUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  /**
   * Update a URL within a body section. Called whenever the user
   * edits one of the URL inputs. Accepts the section id, the
   * index of the URL within that section and the new value. State
   * is updated immutably to ensure React re-renders appropriately.
   */
  const handleUrlChange = (sectionId: number, index: number, value: string) => {
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
    setDraftUrls((prev) => {
      const current = prev[sectionId] ?? getDraftUrls(sectionId);
      return { ...prev, [sectionId]: current.filter((_, i) => i !== index) };
    });
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
  const generateSection = async (sectionId: number) => {
    const section = bodySections.find((s) => s.id === sectionId);
    if (!section) return;
    // Always use the latest draftUrls for this section
    const filtered = (draftUrls[sectionId] ?? section.urls).map((u) => u.trim()).filter((u) => u);
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
      (data.products || []).forEach((p: any) => {
        const hasInfo = Object.keys(p || {}).some((key) => key !== 'url' && p[key]);
        if (!hasInfo) {
          const badUrl = p.url || 'Unknown URL';
          addNotification(`Error on fetching data from the url ${badUrl}`);
          return;
        }
        productMap.set(p.url, {
          url: p.url,
          pretitle: p.pretitle || '',
          title: p.title || '',
          price: p.price || '',
          originalPrice: p.originalPrice || undefined,
          description: p.description || '',
          descriptionP: p.descriptionP || '',
          descriptionUl: p.descriptionUl || '',
          image: p.image || '',
          images: Array.isArray(p.images) ? p.images : undefined,
          cta: p.cta || p.url,
          ctaLabel: (p as any).ctaLabel || 'SHOP NOW'
        });
      });
      // Only keep URLs that are still present and have a valid product
      const validUrls: string[] = filtered.filter((url) => productMap.has(url));
      const processed: ProductData[] = validUrls.map((url) => productMap.get(url)!);
      // Progress bar logic
      const totalItems = Math.max(1, filtered.length);
      validUrls.forEach((url, idx) => {
        const pct = 30 + Math.round(((idx + 1) / totalItems) * 60);
        const prog = Math.min(90, pct);
        setProgress(prog);
        setBuffer(Math.min(100, prog + 10));
      });
      // Final composition
      setProgress(95);
      setBuffer(100);
      setBodySections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? { ...s, products: processed, urls: [...validUrls, ''], loading: false }
            : s
        )
      );
      setDraftUrls((prev) => ({ ...prev, [sectionId]: [...validUrls, ''] }));
      setProgress(100); // complete
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
    setBodySections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;
        const newProducts = [...section.products];
        const prod = { ...newProducts[index] } as any;
        prod[field] = value;
        newProducts[index] = prod;
        return { ...section, products: newProducts };
      })
    );
  };

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

  if (!brandWebsite) {
    // Show a simple dialog to prompt for a product URL
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#fafbfc' }}>
        <form onSubmit={handleBrandUrlSubmit} style={{ background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginBottom: 16 }}>Enter a product URL to get started</h2>
          <input
            type="url"
            value={brandUrlInput}
            onChange={e => setBrandUrlInput(e.target.value)}
            placeholder="https://yourstore.com/products/example"
            style={{ width: 360, padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc', marginBottom: 16 }}
            required
          />
          <div style={{ textAlign: 'right' }}>
            <button type="submit" style={{ padding: '8px 20px', fontSize: 16, borderRadius: 4, background: '#d19aa0', color: '#fff', border: 'none', cursor: 'pointer' }}>Continue</button>
          </div>
        </form>
        {/* Wizard Dialog */}
        <Dialog open={wizardOpen} onClose={() => setWizardOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Product Page Detected!</DialogTitle>
          <DialogContent dividers>
            {wizardLoading || !analyzeData ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
                <Stack spacing={1} sx={{ width: '100%' }}>
                  <Skeleton variant="text" width={240} height={28} />
                  <Skeleton variant="rectangular" height={180} />
                  <Skeleton variant="text" width={300} height={24} />
                </Stack>
              </Box>
            ) : (
              <Stack spacing={3}>
                <Typography variant="h6">Store: {analyzeData.storeName || 'Unknown'}</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Card variant="outlined">
                      {analyzeData.logo || analyzeData.logoSvg ? (
                        analyzeData.logo ? (
                          <CardMedia component="img" image={analyzeData.logo} alt="Store logo" sx={{ objectFit: 'contain', maxHeight: 120 }} />
                        ) : (
                          <Box sx={{ p: 2 }} dangerouslySetInnerHTML={{ __html: analyzeData.logoSvg! }} />
                        )
                      ) : (<Box sx={{ p: 2 }}><Typography variant="body2">No logo found</Typography></Box>)}
                      <CardContent>
                        <FormControlLabel
                          control={<Checkbox checked={wizardSelection.includeLogo} onChange={(_, v) => setWizardSelection({ ...wizardSelection, includeLogo: v })} />}
                          label="Include store logo"
                        />
                      </CardContent>
                    </Card>
                  </Box>
                  <Box>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1">Hero Images</Typography>
                        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 1 }}>
                          {(heroImages || []).map((src: string) => (
                            <Box key={src} sx={{ border: wizardSelection.selectedHero === src ? '2px solid #1976d2' : '1px solid #ddd', borderRadius: 1, p: 0.5, cursor: 'pointer' }} onClick={() => setWizardSelection({ ...wizardSelection, selectedHero: src })}>
                              <img src={src} alt="hero" style={{ height: 80, display: 'block' }} />
                            </Box>
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>
                  <Box>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1">Banner Images</Typography>
                        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 1 }}>
                          {(analyzeData.bannerImages || []).map((src: string) => (
                            <Box key={src} sx={{ border: wizardSelection.selectedBanner === src ? '2px solid #1976d2' : '1px solid #ddd', borderRadius: 1, p: 0.5, cursor: 'pointer' }} onClick={() => setWizardSelection({ ...wizardSelection, selectedBanner: src })}>
                              <img src={src} alt="banner" style={{ height: 80, display: 'block' }} />
                            </Box>
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>
                  <Box>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1">Brand Colors</Typography>
                        <Stack spacing={1} sx={{ py: 1 }}>
                          <Box>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>Primary color</Typography>
                            <Stack direction="row" spacing={1}>
                              {([analyzeData.primaryColor, ...(analyzeData.colorCandidates?.map(c => c.color) || [])].filter(Boolean) as string[]).map((hex: string) => (
                                <Box key={hex} sx={{ width: 28, height: 28, borderRadius: '50%', border: wizardSelection.selectedPrimary === hex ? '2px solid #1976d2' : '1px solid rgba(0,0,0,0.2)', background: hex, cursor: 'pointer' }} title={hex} onClick={() => setWizardSelection({ ...wizardSelection, selectedPrimary: hex })} />
                              ))}
                            </Stack>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>Text color</Typography>
                            <ToggleButtonGroup
                              size="small"
                              exclusive
                              value={wizardSelection.selectedText}
                              onChange={(_,v)=> v && setWizardSelection({ ...wizardSelection, selectedText: v })}
                            >
                              <ToggleButton value="black">Black</ToggleButton>
                              <ToggleButton value="white">White</ToggleButton>
                            </ToggleButtonGroup>
                          </Box>
                        </Stack>
                        <FormControlLabel control={<Checkbox checked={wizardSelection.includeColors} onChange={(_, v) => setWizardSelection({ ...wizardSelection, includeColors: v })} />} label="Apply colors to CTA & accents" />
                      </CardContent>
                    </Card>
                  </Box>
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1">Fonts</Typography>
                        <Stack spacing={0.5} sx={{ py: 1 }}>
                          {(analyzeData.fontFamilies || []).map((f: string) => (
                            <Typography key={f} variant="body2" sx={{ fontFamily: `'${f}', Montserrat, Arial, Helvetica, sans-serif` }}>{f}</Typography>
                          ))}
                        </Stack>
                        <FormControlLabel control={<Checkbox checked={wizardSelection.includeFonts} onChange={(_, v) => setWizardSelection({ ...wizardSelection, includeFonts: v })} />} label="Apply font family" />
                      </CardContent>
                    </Card>
                  </Box>
                  {analyzeData.announcementCopy && (
                    <Box sx={{ gridColumn: '1 / -1' }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1">Announcement Bar</Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>{analyzeData.announcementCopy}</Typography>
                          <FormControlLabel control={<Checkbox checked={wizardSelection.includeAnnouncement} onChange={(_, v) => setWizardSelection({ ...wizardSelection, includeAnnouncement: v })} />} label="Use this copy in header" />
                        </CardContent>
                      </Card>
                    </Box>
                  )}
                  <Box sx={{ gridColumn: '1 / -1' }}>
                        {/* Secondary product images for selection */}
                        {(analyzeData.product?.images && analyzeData.product.images.length > 0) && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Choose product image</Typography>
                            <ImageList cols={6} gap={6} sx={{ m: 0.5 }}>
                              {uniqueImages(analyzeData.product.images).map((src: string) => (
                                <ImageListItem key={src} sx={{ cursor: 'pointer' }}>
                                  <img
                                    src={src}
                                    alt="product"
                                    style={{
                                      border: (analyzeData.product.image === src) ? '3px solid var(--color-primary)' : '3px solid transparent',
                                      borderRadius: 6,
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                    onClick={() => setAnalyzeData(d => d ? ({ ...d, product: { ...d.product, image: src } }) : d)}
                                  />
                                </ImageListItem>
                              ))}
                            </ImageList>
                          </Box>
                        )}
                        {/* Description source options */}
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>Choose description</Typography>
                          <Stack spacing={1}>
                            <FormControlLabel control={<Checkbox checked={!('descChoice' in (analyzeData.product as any)) || (analyzeData.product as any).descChoice === 'metadata'} onChange={(_, v) => v && setAnalyzeData(d => d ? ({ ...d, product: { ...(d.product as any), descChoice: 'metadata', description: (d.product as any).metadataDescription || (d.product as any).description || '' } }) : d)} />} label="Page metadata" />
                            {('descriptionP' in (analyzeData.product as any)) && (analyzeData.product as any).descriptionP && (
                              <FormControlLabel control={<Checkbox checked={(analyzeData.product as any).descChoice === 'p'} onChange={(_, v) => v && setAnalyzeData(d => d ? ({ ...d, product: { ...(d.product as any), descChoice: 'p', description: (d.product as any).descriptionP } }) : d)} />} label="First paragraph" />
                            )}
                            {('descriptionUl' in (analyzeData.product as any)) && (analyzeData.product as any).descriptionUl && (
                              <FormControlLabel control={<Checkbox checked={(analyzeData.product as any).descChoice === 'ul'} onChange={(_, v) => v && setAnalyzeData(d => d ? ({ ...d, product: { ...(d.product as any), descChoice: 'ul', description: (d.product as any).descriptionUl } }) : d)} />} label="Bullet list" />
                            )}
                          </Stack>
                        </Box>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1">Product</Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                          {analyzeData.product?.image && (
                            <img src={analyzeData.product.image} alt={analyzeData.product.title || ''} style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 6 }} />
                          )}
                          <div>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{analyzeData.product?.title}</Typography>
                            {('descChoice' in (analyzeData.product as any)) && (analyzeData.product as any).descChoice === 'ul' && (analyzeData.product as any).descriptionUl ? (
                              <Box sx={{ maxWidth: 560 }} dangerouslySetInnerHTML={{ __html: (analyzeData.product as any).descriptionUl }} />
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560 }}>{analyzeData.product?.description}</Typography>
                            )}
                            <Typography variant="body2" sx={{ mt: 0.5 }}>{analyzeData.product?.originalPrice ? `${analyzeData.product.originalPrice} → ${analyzeData.product.price}` : analyzeData.product?.price}</Typography>
                          </div>
                        </Stack>
                        <FormControlLabel control={<Checkbox checked={wizardSelection.includeProduct} onChange={(_, v) => setWizardSelection({ ...wizardSelection, includeProduct: v })} />} label="Include this product in the EDM" />
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setWizardOpen(false)}>Cancel</Button>
            <Button variant="contained" disabled={!analyzeData} onClick={() => {
              if (!analyzeData) return;
              // Apply selections into builder state
              if (wizardSelection.includeColors) {
                const chosen = wizardSelection.selectedPrimary || analyzeData.primaryColor || analyzeData.colorScheme?.[0];
                if (chosen) setBrandPrimary(chosen);
                // Set text color choice as well
                if (wizardSelection.selectedText) setBrandTextColor(wizardSelection.selectedText);
              }
              if (wizardSelection.includeFonts && analyzeData.fontFamilies?.length) {
                setBrandFont(analyzeData.fontFamilies[0] || brandFont);
              }
              if (wizardSelection.includeLogo && analyzeData.logo) {
                // just store URL as data URL is not necessary for now
                setBrandLogoDataUrl(analyzeData.logo);
              }
              if (wizardSelection.includeAnnouncement && analyzeData.announcementCopy) {
                setBrandAnnouncement(analyzeData.announcementCopy);
              }
              if (wizardSelection.selectedHero) {
                setHeroImage(wizardSelection.selectedHero);
                setHeroHref(brandWebsite || '');
                setHeroAlt(analyzeData?.storeName || brandName || 'Brand');
              }
              if (wizardSelection.selectedBanner) {
                setBannerImage(wizardSelection.selectedBanner);
                setBannerHref(brandWebsite || '');
                setBannerAlt(analyzeData?.storeName || brandName || 'Brand');
              }
              if (wizardSelection.includeProduct && analyzeData.product) {
                // Ensure body section exists with this product URL
                const url = analyzeData.product.url;
                setBodySections((prev) => prev.length ? prev : [{ id: 1, name: 'Body 1', urls: [url], products: [analyzeData.product], selectedBodyId: defaultBodyTemplates[0].id, loading: false, descriptionSource: 'metadata' }]);
                setDraftUrls((prev) => ({ ...prev, 1: [url] }));
              }
              setWizardOpen(false);
            }}>Add to Email</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>EDM Expresso</title>
        <meta name="description" content="Build modular EDMs from product pages" />
      </Head>
      <AppLayout
        title="EDM Espresso"
        left={<div className={`accordion-list${openSection ? ' has-open' : ''}`} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Button to add another body section */}
            {/* The Add Body Section button has been relocated to the bottom row
               next to the Generate EDM button. The original container
               has been removed to avoid duplicate controls. */}
            {/* Header section */}
            {showHeaderSection && (
              <div className={`accordion-section${openSection === 'header' ? ' open' : ''}`}>
                <div className={`accordion-header${openSection === 'header' ? ' open' : ''}`} onClick={() => handleAccordionToggle('header')}>
                  <span>Header</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--gap-2)' }}>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        removeHeaderSection();
                      }}
                      title="Remove section"
                    >
                      <DeleteIcon fontSize="medium" />
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAccordionToggle('header');
                      }}
                      title={openSection === 'header' ? 'Collapse section' : 'Expand section'}
                    >
                      {openSection === 'header' ? <ExpandLessIcon fontSize="medium" /> : <ExpandMoreIcon fontSize="medium" />}
                    </IconButton>
                  </div>
                </div>
                {openSection === 'header' && (
                  <div className="accordion-content">
                    {/* Render only the active header template thumbnail */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', border: '1px solid rgba(0, 0, 0, 0.2)', borderRadius: '6px', overflow: 'hidden' }}>
                      {(() => {
                        const activeTpl = headerTemplates.find(tpl => tpl.id === selectedHeaderId);
                        if (!activeTpl) return null;
                        return (
                          <div key={activeTpl.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <HtmlThumbnail html={activeTpl.html} width={600} forceAutoHeight />
                          </div>
                        );
                      })()}
                    </div>
                    {/* Template selector row - moved below thumbnails */}
                    <div className="template-row" style={{ display: 'flex', gap: 'var(--gap-2)', alignItems: 'center', marginTop: '1.5rem' }}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="header-template-label">Template</InputLabel>
                        <Select labelId="header-template-label" id="header-template-select" label="Template" value={selectedHeaderId} onChange={(e) => setSelectedHeaderId(e.target.value)}>
                          {headerTemplates.map((tpl) => (
                            <MenuItem key={tpl.id} value={tpl.id}>{tpl.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
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
                    <PaddingControls label="Section padding (px)" value={headerPadding} onChange={setHeaderPadding} persistKey="header:padding" />
                  </div>
                )}
              </div>
              )}
            {/* Draggable sections (hero, body, banner) */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleSectionDragEnd}
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
                  if (id.startsWith('body-')) {
                    const section = bodySections.find((s) => `body-${s.id}` === id);
                    if (!section) return null;
                    const isOpen = openSection === id;
                    return <MemoizedSortableBodySection key={id} section={section} isOpen={isOpen} />;
                  }
                  return null;
                })}
              </SortableContext>
            </DndContext>

            {/* Footer section */}
            {showFooterSection && (
              <div className={`accordion-section${openSection === 'footer' ? ' open' : ''}`}>
                <div className={`accordion-header${openSection === 'footer' ? ' open' : ''}`} onClick={() => handleAccordionToggle('footer')}>
                  <span>Footer</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--gap-2)' }}>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFooterSection();
                      }}
                      title="Remove section"
                    >
                      <DeleteIcon fontSize="medium" />
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAccordionToggle('footer');
                      }}
                      title={openSection === 'footer' ? 'Collapse section' : 'Expand section'}
                    >
                      {openSection === 'footer' ? <ExpandLessIcon fontSize="medium" /> : <ExpandMoreIcon fontSize="medium" />}
                    </IconButton>
                  </div>
                </div>
                {openSection === 'footer' && (
                  <div className="accordion-content">
                  {/* Render only the active footer template thumbnail */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', border: '1px solid rgba(0, 0, 0, 0.2)', borderRadius: '6px', overflow: 'hidden' }}>
                    {(() => {
                      const activeTpl = footerTemplates.find(tpl => tpl.id === selectedFooterId);
                      if (!activeTpl) return null;
                      return (
                        <div key={activeTpl.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                          <HtmlThumbnail html={activeTpl.html} width={600} forceAutoHeight />
                        </div>
                      );
                    })()}
                  </div>
                  {/* Template selector row - moved below thumbnails */}
                  <div className="template-row" style={{ display: 'flex', gap: 'var(--gap-2)', alignItems: 'center', marginTop: '1.5rem' }}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="footer-template-label">Template</InputLabel>
                      <Select labelId="footer-template-label" id="footer-template-select" label="Template" value={selectedFooterId}  onChange={(e) => setSelectedFooterId(e.target.value)}>
                        {footerTemplates.map((tpl) => (
                          <MenuItem key={tpl.id} value={tpl.id}>{tpl.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
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
                  <PaddingControls label="Section padding (px)" value={footerPadding} onChange={setFooterPadding} persistKey="footer:padding" />
                </div>
              )}
              </div>
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
              <Typography variant="h6" component="h2">Summary</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            {/* Tabs header for Summary sections */}
            <Tabs value={summaryTab} onChange={(_, v) => setSummaryTab(v)} aria-label="summary tabs" sx={{ mb: 2 }}>
              <Tab label="Brand" />
              <Tab label="Product" />
              <Tab label="Assets" />
            </Tabs>

            {/* Brand Tab Panel */}
            {summaryTab === 0 && (
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
                        variant="outlined"
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
                    <MuiColorInput id="brand-primary" label="Primary" format="hex" value={brandPrimary} onChange={(value) => setBrandPrimary(value || brandPrimary)} size="small" />
                    <MuiColorInput id="brand-secondary" label="Secondary" format="hex" value={brandSecondary} onChange={(value) => setBrandSecondary(value || brandSecondary)} size="small" />
                  </Stack>
                </Box>

                {/* Brand font */}
                <TextField
                  select
                  fullWidth
                  label="Brand font"
                  id="brand-font"
                  value={brandFont}
                  onChange={(e) => setBrandFont(e.target.value as string)}
                  variant="standard"
                  sx={{'& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}}
                >
                  {(Array.from(new Set(analyzeData?.fontFamilies || [])) as string[]).map((f) => {
                    const needsQuote = /[^a-z0-9-]/i.test(f);
                    const css = `${needsQuote ? `'${f}'` : f},Arial,Helvetica,sans-serif`;
                    return (
                      <MenuItem key={`det-${f}`} value={css}>{f}</MenuItem>
                    );
                  })}
                  <MenuItem value="'Montserrat',Arial,Helvetica,sans-serif">Default (Montserrat)</MenuItem>
                  <MenuItem value="Arial, Helvetica, sans-serif">Arial</MenuItem>
                  <MenuItem value="Georgia, serif">Georgia</MenuItem>
                  <MenuItem value="Times New Roman, serif">Times New Roman</MenuItem>
                  <MenuItem value="Courier New, monospace">Courier New</MenuItem>
                </TextField>

                {/* Announcement (rich text) */}
                <Box>
                  <RichTextField
                    label="Announcement Bar"
                    value={brandAnnouncement as any}
                    onChange={(html: string) => setBrandAnnouncement(html)}
                    placeholder="E.g., Free shipping this week • 20% off sitewide • New arrivals"
                    minHeight={60}
                  />
                </Box>

              </Stack>
            )}

            {/* Product Tab Panel */}
            {summaryTab === 1 && (
              <Stack spacing={2}>
                {analyzeData?.product && (
                  <>
                    {/* Main product image - centered (no zoom here) */}
                    {analyzeData.product.image && (
                      <Box sx={{ mb: 1, textAlign: 'center' }}>
                        <img
                          src={analyzeData.product.image}
                          alt={analyzeData.product.title || ''}
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
                    {analyzeData?.product?.images?.length ? (
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>Product images</Typography>
                        <Box className="summary-product-grid" sx={{ display: 'grid', gap: 1, width: '100%' }}>
                          {uniqueImages((analyzeData.product.images || []).map((s: string) => s || ''))
                            .map((src: string) => (
                            <Box
                              key={normalizeImage(src) || src}
                              sx={{
                                cursor: 'pointer',
                                border: (normalizeImage(analyzeData.product.image || '') === normalizeImage(src)) ? '2px solid var(--color-primary)' : '2px solid #e0e0e0',
                                borderRadius: 1,
                                opacity: (normalizeImage(analyzeData.product.image || '') === normalizeImage(src)) ? 1 : 0.9,
                                overflow: 'hidden',
                                transition: 'opacity .15s ease, border-color .15s ease, box-shadow .15s ease',
                                '& img': { transition: 'transform .4s ease' },
                                '&:hover': { opacity: 1, borderColor: 'var(--color-primary)', boxShadow: '0 0 0 1px rgba(0,0,0,0.02)' },
                                '&:hover img': { transform: 'scale(1.075)' }
                              }}
                              onClick={() => {
                              setAnalyzeData(d => d ? ({ ...d, product: { ...d.product, image: src } }) : d);
                              setBodySections(prev => {
                                if (!prev.length || !prev[0].products?.length) return prev;
                                const next = [...prev];
                                const prod = { ...next[0].products[0], image: src } as ProductData;
                                next[0] = { ...next[0], products: [prod, ...next[0].products.slice(1)] };
                                return next;
                              });
                              }}
                            >
                              <img
                                src={src}
                                alt="product"
                                style={{
                                  width: '100%',
                                  height: 'auto',
                                  objectFit: 'contain',
                                  display: 'block'
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    ) : null}

                    {/* Title (Rich text) */}
                    <Box sx={{ mb: 2 }}>
                      <RichTextField
                        label="Title"
                        value={(analyzeData.product.title || '') as any}
                        onChange={(html: string) => {
                          setAnalyzeData(d => d ? ({ ...d, product: { ...d.product, title: html } }) : d);
                          setBodySections(prev => {
                            if (!prev.length || !prev[0].products?.length) return prev;
                            const next = [...prev];
                            const prod = { ...next[0].products[0], title: html } as ProductData;
                            next[0] = { ...next[0], products: [prod, ...next[0].products.slice(1)] };
                            return next;
                          });
                        }}
                        placeholder="Product title"
                        minHeight={40}
                      />
                    </Box>

                    {/* Price (plain input) */}
                    <TextField
                      label="Price"
                      value={analyzeData.product.price || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAnalyzeData(d => d ? ({ ...d, product: { ...d.product, price: val } }) : d);
                        setBodySections(prev => {
                          if (!prev.length || !prev[0].products?.length) return prev;
                          const next = [...prev];
                          const prod = { ...next[0].products[0], price: val } as ProductData;
                          next[0] = { ...next[0], products: [prod, ...next[0].products.slice(1)] };
                          return next;
                        });
                      }}
                      fullWidth
                      variant="standard"
                      sx={{mb: 2, '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}}
                    />

                    {/* Description (Rich text) */}
                    {(() => {
                      const p: any = analyzeData.product as any;
                      const choice: 'metadata'|'p'|'ul' = (p.descChoice || 'metadata');
                      let html = '';
                      if (choice === 'ul' && p.descriptionUl) html = p.descriptionUl;
                      else if (choice === 'p') html = p.descriptionP || '';
                      else html = p.metadataDescription || '';
                      return (
                        <Box sx={{ mb: 0 }}>
                          <RichTextField
                            label="Description"
                            value={html}
                            onChange={(newHtml: string) => {
                              setAnalyzeData(d => {
                                if (!d) return d;
                                const prod: any = { ...d.product };
                                if (choice === 'ul') prod.descriptionUl = newHtml;
                                else if (choice === 'p') prod.descriptionP = newHtml;
                                else prod.metadataDescription = newHtml;
                                return { ...d, product: prod };
                              });
                              setBodySections(prev => {
                                if (!prev.length || !prev[0].products?.length) return prev;
                                const next = [...prev];
                                const prod = { ...next[0].products[0], description: newHtml } as ProductData;
                                next[0] = { ...next[0], products: [prod, ...next[0].products.slice(1)] };
                                return next;
                              });
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
                      value={(analyzeData.product as any).descChoice || 'metadata'}
                      onChange={(e) => {
                        const v = e.target.value as 'metadata'|'p'|'ul';
                        setAnalyzeData(d => d ? ({
                          ...d,
                          product: {
                            ...(d.product as any),
                            descChoice: v,
                            description:
                              v === 'metadata' ? (((d.product as any).metadataDescription as string) || '') :
                              v === 'p' ? (((d.product as any).descriptionP as string) || '') :
                              (((d.product as any).descriptionUl as string) || '')
                          }
                        }) : d);
                        setBodySections(prev => {
                          if (!prev.length || !prev[0].products?.length) return prev;
                          const next = [...prev];
                          const p = next[0].products[0] as any;
                          let desc = '';
                          if (v === 'metadata') desc = ((analyzeData?.product as any).metadataDescription as string) || '';
                          if (v === 'p') desc = (p.descriptionP as string) || '';
                          if (v === 'ul') desc = (p.descriptionUl as string) || '';
                          const prod = { ...next[0].products[0], description: desc } as ProductData;
                          (prod as any).descSource = v;
                          next[0] = { ...next[0], products: [prod, ...next[0].products.slice(1)] };
                          return next;
                        });
                      }}
                      variant="standard"
                      sx={{ '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' },}}
                    >
                      <MenuItem value="metadata">Page metadata</MenuItem>
                      <MenuItem value="p" disabled={!((analyzeData.product as any).descriptionP)}>First paragraph</MenuItem>
                      <MenuItem value="ul" disabled={!((analyzeData.product as any).descriptionUl)}>Bullet list</MenuItem>
                    </TextField>
                  </>
                )}
              </Stack>
            )}

            {/* Assets Tab Panel */}
            {summaryTab === 2 && (
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
                            height: 'auto',
                            objectFit: 'contain',
                            display: 'block'
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
                              height: 'auto',
                              objectFit: 'contain',
                              display: 'block'
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Stack>
            )}
          </Box>
        }
      >
            {/* Global top progress when any section loading */}
            {/* Top progress is now handled by AppLayout's LinearProgress; remove page-level skeleton */}
            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
              <div className="preview-bar" style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-2)' }}>
                <Typography
                  variant="h6"
                  sx={{ flex: 1, fontSize: '0.9rem', fontWeight: 400 }}
                >
                  {viewMode === 'preview' ? 'Email Preview' : 'Email Code'}
                </Typography>
                <div className="preview-actions">
                  <IconButton onClick={() => setViewMode(viewMode === 'preview' ? 'code' : 'preview')} title={viewMode === 'preview' ? 'Show code' : 'Show preview'}>
                    {viewMode === 'preview' ? <CodeIcon /> : <VisibilityIcon />}
                  </IconButton>
                  <IconButton onClick={() => { copyToClipboard(finalHtml); addNotification('Code copied!'); }} title="Copy full email HTML to clipboard">
                    <ContentCopyIcon />
                  </IconButton>
                </div>
              </div>
              <div style={{ overflowY: 'auto', overflowX: 'hidden', padding: '1rem', paddingTop: '0', position: 'relative' }}>
                {viewMode === 'preview' ? (
                  <div ref={previewRef} data-preview-container="true">
                    {showHeaderSection && (
                      loading ? (
                        <Skeleton
                          variant="rectangular"
                          animation="wave"
                          sx={{
                            mb: 2,
                            width: '100%',
                            maxWidth: 600,
                            mx: 'auto',
                            height: 80,
                            borderRadius: 2,
                            boxShadow: 'var(--shadow-light)',
                            paddingTop: `${headerPadding.top ?? 0}px`,
                            paddingBottom: `${headerPadding.bottom ?? 0}px`
                          }}
                        />
                      ) : (
                        <div data-section="header" onClick={() => setOpenSection('header')} dangerouslySetInnerHTML={{ __html: headerHtml }} />
                      )
                    )}
                    {sectionOrder.map((id) => {
                       if (id === 'hero' && showHeroSection) {
                         return heroImage && !loading ? (
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
                             animation="wave"
                             sx={{
                               mb: 2,
                               width: '100%',
                               maxWidth: 600,
                               mx: 'auto',
                               height: 180,
                               borderRadius: 2,
                               boxShadow: 'var(--shadow-light)',
                               paddingTop: `${heroPadding.top ?? 0}px`,
                               paddingBottom: `${heroPadding.bottom ?? 0}px`
                             }}
                           />
                         );
                       }
                      if (id === 'banner' && showBannerSection) {
                        return bannerImage && !loading ? (
                          <div key="banner" data-section="banner" onClick={() => setOpenSection('banner')} dangerouslySetInnerHTML={{ __html: bannerHtml }} />
                        ) : (
                          <Skeleton
                            key="banner-skel"
                            variant="rectangular"
                            animation="wave"
                            sx={{
                              mb: 2,
                              width: '100%',
                              maxWidth: 600,
                              mx: 'auto',
                              height: 120,
                              borderRadius: 2,
                              boxShadow: 'var(--shadow-light)',
                              paddingTop: `${bannerPadding.top ?? 0}px`,
                              paddingBottom: `${bannerPadding.bottom ?? 0}px`
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
                                        animation="wave"
                                        sx={skeletonSx}
                                      />
                                    );
                                  }
                                  return section.urls.filter(u=>u.trim()).map((_,i)=>(
                                    <Skeleton
                                      key={i}
                                      variant="rectangular"
                                      animation="wave"
                                      sx={skeletonSx}
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
                                            <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ maxWidth: 600, margin: '0 auto', background: '#FFFFFF', padding: (() => { const p = getBodySectionPadding(section.id); return `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`; })() as any }}>
                                              <tbody>
                                                <tr>
                                                  <td style={{ padding: 0 }}>
                                                    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ width: '100%', margin: 0, padding: 0 }}>
                                                      <tbody>
                                                        <tr>
                                                          {section.products.map((prod, idx) => (
                                                            <td key={idx} align="center" valign="top" style={{ padding: 0, position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
                                                                onClick={() => setImageSelector({ sectionId: section.id, productIdx: idx })}
                                                                onMouseEnter={e => {
                                                                  const img = e.currentTarget.querySelector('img');
                                                                  const icon = e.currentTarget.querySelector('.edit-icon') as HTMLElement;
                                                                  if (img) img.style.opacity = '0.7';
                                                                  if (icon) icon.style.transform = 'translateY(-38px)';
                                                                }}
                                                                onMouseLeave={e => {
                                                                  const img = e.currentTarget.querySelector('img');
                                                                  const icon = e.currentTarget.querySelector('.edit-icon') as HTMLElement;
                                                                  if (img) img.style.opacity = '1';
                                                                  if (icon) icon.style.transform = 'translateY(0)';
                                                                }}
                                                            >
                                                              <img
                                                                src={prod.image}
                                                                alt={prod.title || ''}
                                                                style={{ display: 'block', width: '100%', height: 'auto', border: 0, outline: 0, textDecoration: 'none', transition: 'opacity 0.2s ease-in-out' }}
                                                              />
                                                              {/* Edit icon overlay; only show if there are additional images. */}
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
                                                                  onClick={e => { e.stopPropagation(); setImageSelector({ sectionId: section.id, productIdx: idx }); }}
                                                                >
                                                                  <EditIcon style={{ color: '#fff', fontSize: 16 }} />
                                                                </div>
                                                              )}
                                                            </td>
                                                          ))}
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
                                        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ maxWidth: 600, margin: '0 auto', background: '#FFFFFF', padding: (() => { const p = getBodySectionPadding(section.id); return `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`; })() as any }}>
                                          <tbody>
                                            <tr>
                                              <td style={{ padding: 0 }}>
                                                {section.products.map((prod, idx) => {
                                let orientation: 'left-image' | 'right-image';
                                if (section.selectedBodyId === 'product-image-left-copy-right') {
                                  orientation = idx % 2 === 0 ? 'left-image' : 'right-image';
                                } else {
                                  orientation = idx % 2 === 0 ? 'right-image' : 'left-image';
                                }
                                // Choose description source for preview (per-product)
                                const dsPrev = (prod as any).descSource || 'metadata';
                                let chosenDescription = (prod as any).description || '';
                                if (dsPrev === 'p' && (prod as any).descriptionP) {
                                  chosenDescription = (prod as any).descriptionP as string;
                                } else if (dsPrev === 'ul' && (prod as any).descriptionUl) {
                                  chosenDescription = (prod as any).descriptionUl as string;
                                }
                                return (
                                  <ProductTableModule
                                    key={`${section.id}-${idx}`}
                                    product={{ ...prod, description: chosenDescription }}
                                    index={idx}
                                    orientation={orientation}
                                    updateProduct={(i, field, value) => updateProductInSection(section.id, i, field, value)}
                                    onActivate={() => setOpenSection(`body-${section.id}`)}
                                    ctaBg={brandPrimary}
                                    overlayContainerRef={previewRef as any}
                                    brandName={brandName}
                                    descSource={(prod as any).descSource as any}
                                    onChangeDescSource={(src) => updateProductInSection(section.id, idx, 'descSource' as any, src)}
                                  />
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
                          animation="wave"
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
                        <div data-section="footer" onClick={() => setOpenSection('footer')} dangerouslySetInnerHTML={{ __html: footerHtml }} />
                      )
                    )}
                  </div>
                ) : (
                  <div className="code-accordion" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-2)' }}>
                    {codeSections.map((section) => {
                      const isOpen = openCodeSections[section.key] !== false;
                      return (
                        <div key={section.key} className="code-section">
                          <div
                            className="code-section-header"
                            onClick={() => toggleCodeSection(section.key)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '0.6rem 1rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}
                          >
                            <span>{section.title}</span>
                            <div className="code-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-2)' }}>
                              <IconButton onClick={(e) => { e.stopPropagation(); toggleCodeSection(section.key); }} title={isOpen ? 'Collapse section' : 'Expand section'}>
                                {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                              <IconButton onClick={(e) => { e.stopPropagation(); copyToClipboard(section.code); addNotification('Code copied!'); }} title="Copy code to clipboard">
                                <ContentCopyIcon />
                              </IconButton>
                            </div>
                          </div>
                          {isOpen && (
                            <pre style={{ margin: 0, maxHeight: '200px', overflow: 'auto', background: '#ffffff', padding: '0.5rem 1rem' }}>
                              <code dangerouslySetInnerHTML={{ __html: highlight(section.code) }} />
                            </pre>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
      </AppLayout>

      {/* Wizard Dialog removed: content moved to persistent right summary panel */}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMsg as any}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    </>
  );
}
