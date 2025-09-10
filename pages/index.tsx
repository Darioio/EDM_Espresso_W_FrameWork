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
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
// Padding toggles removed
import Paper from '@mui/material/Paper';
import CloseIcon from '@mui/icons-material/Close';
import { MuiColorInput } from 'mui-color-input';
import InputAdornment from '@mui/material/InputAdornment';
// Removed padding controls
import UploadFileIcon from '@mui/icons-material/UploadFile';
// import Backdrop from '@mui/material/Backdrop';
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
import HeroTableModule from '../components/HeroTableModule';
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
}

export default function Home() {
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
  const [bodySections, setBodySections] = useState<BodySection[]>([
    {
      id: 1,
      name: 'Body 1',
      urls: [
        'https://www.belleandbloom.com/products/mad-about-you-floral-print-mini-dress-white-blue',
        'https://www.belleandbloom.com/products/wanderlace-ruffle-maxi-skirt-white',
        'https://www.belleandbloom.com/products/lost-found-knitted-sweater-camel',
        ''
      ],
      products: [],
      selectedBodyId: defaultBodyTemplates[0].id,
      loading: false,
      descriptionSource: 'metadata'
    }
  ]);

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
  // Order of draggable sections excluding header/footer
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

  const SortableBodySection: React.FC<{ section: BodySection }> = ({ section }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: `body-${section.id}` });
    const { ['aria-describedby']: _ariaDescribedBy, ...sortableAttributes } = attributes as any;
    const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;
    return (
      <div className={`accordion-section${openSection === `body-${section.id}` ? ' open' : ''}`} ref={setNodeRef} style={style}>
        <div className={`accordion-header${openSection === `body-${section.id}` ? ' open' : ''}`} onClick={() => handleAccordionToggle(`body-${section.id}`)}>
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
              title={openSection === `body-${section.id}` ? 'Collapse section' : 'Expand section'}
            >
              {openSection === `body-${section.id}` ? (
                <ExpandLessIcon fontSize="medium" />
              ) : (
                <ExpandMoreIcon fontSize="medium" />
              )}
            </IconButton>
          </div>
        </div>
        {openSection === `body-${section.id}` && (
          <div className="accordion-content">
            {/* Move Template + Description Source controls above URLs */}
            <div className="template-row" style={{ display: 'flex', gap: 'var(--gap-2)', alignItems: 'center' }}>
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
                <TextField id={`body-draft-html-${section.id}`} label="Template HTML" value={draftBodyHtml} onChange={(e) => setDraftBodyHtml(e.target.value)} rows={8} fullWidth multiline sx={{ fontFamily: 'monospace' }} />
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
                <TextField id={`body-new-name-${section.id}`} label="Template name" type="text" value={newBodyName} onChange={(e) => setNewBodyName(e.target.value)} fullWidth sx={{ mb: 1 }} />
                <TextField id={`body-new-html-${section.id}`} label="Template HTML" value={newBodyHtml} onChange={(e) => setNewBodyHtml(e.target.value)} rows={6} fullWidth multiline sx={{ fontFamily: 'monospace' }} />
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
            <div>
              <Typography variant="subtitle1" sx={{ fontSize: '1rem', mb: 1, mt: 1 }}>Product URLs</Typography>
              {getDraftUrls(section.id).map((url, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <TextField
                    id={`url-${section.id}-${index}`}
                    type="url"
                    label={`Product URL ${index + 1}`}
                    defaultValue={url}
                    fullWidth
                    onBlur={(e) => {
                      const cleaned = sanitizeUrl(e.currentTarget.value);
                      handleUrlChange(section.id, index, cleaned);
                    }}
                    InputProps={{
                      endAdornment: getDraftUrls(section.id).length > 1 ? (
                        <InputAdornment position="end">
                          <IconButton onClick={() => removeUrlField(section.id, index)} title="Remove URL" edge="end">
                            <CloseIcon2 fontSize="medium" />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    }}
                    inputProps={{
                      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const curr = (e.currentTarget as HTMLInputElement);
                          const value = curr.value.trim();
                          const listLen = getDraftUrls(section.id).length;
                          if (value && index === listLen - 1) {
                            addUrlField(section.id, index + 1);
                          }
                          curr.blur();
                        }
                      }
                    }}
                  />
                </Box>
              ))}
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: 'var(--gap-2)' }}>
              <Button onClick={() => generateSection(section.id)} disabled={section.loading}>
                {section.loading ? 'Generating…' : 'Update'}
              </Button>
            </div>
            {/* Bottom padding controls removed */}
            {/* CTA background customization removed */}
          </div>
        )}
      </div>
    );
  };

  const SortableHeroSection: React.FC = () => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: 'hero' });
    const { ['aria-describedby']: _ariaDescribedBy, ...sortableAttributes } = attributes as any;
    const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;
    return (
      <div className={`accordion-section${openSection === 'hero' ? ' open' : ''}`} ref={setNodeRef} style={style}>
        <div className={`accordion-header${openSection === 'hero' ? ' open' : ''}`} onClick={() => handleAccordionToggle('hero')}>
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
              title={openSection === 'hero' ? 'Collapse section' : 'Expand section'}
            >
              {openSection === 'hero' ? <ExpandLessIcon fontSize="medium" /> : <ExpandMoreIcon fontSize="medium" />}
            </IconButton>
          </div>
        </div>
        {openSection === 'hero' && (
          <div className="accordion-content">
            {heroImage ? (
              <div style={{ marginBottom: '0.5rem' }}>
                <img src={heroImage} alt={heroAlt || ''} style={{ width: '100%', height: 'auto' }} />
              </div>
            ) : (
              <p>No hero image selected.</p>
            )}
            <div className="template-row">
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
                <TextField id="hero-draft-html" label="Template HTML" value={draftHeroHtml} onChange={(e) => setDraftHeroHtml(e.target.value)} rows={6} fullWidth multiline sx={{ fontFamily: 'monospace' }} />
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
              sx={{ mt: 2 }}
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
              sx={{ mt: 2 }}
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
                <TextField id="hero-new-name" label="Template name" type="text" value={newHeroName} onChange={(e) => setNewHeroName(e.target.value)} fullWidth sx={{ mb: 1 }} />
                <TextField id="hero-new-html" label="Template HTML" value={newHeroHtml} onChange={(e) => setNewHeroHtml(e.target.value)} rows={6} fullWidth multiline sx={{ fontFamily: 'monospace' }} />
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
            {/* Hero bottom padding controls removed */}
          </div>
        )}
      </div>
    );
  };

  const SortableBannerSection: React.FC = () => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: 'banner' });
    const { ['aria-describedby']: _ariaDescribedBy, ...sortableAttributes } = attributes as any;
    const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;
    return (
      <div className={`accordion-section${openSection === 'banner' ? ' open' : ''}`} ref={setNodeRef} style={style}>
        <div className={`accordion-header${openSection === 'banner' ? ' open' : ''}`} onClick={() => handleAccordionToggle('banner')}>
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
              title={openSection === 'banner' ? 'Collapse section' : 'Expand section'}
            >
              {openSection === 'banner' ? <ExpandLessIcon fontSize="medium" /> : <ExpandMoreIcon fontSize="medium" />}
            </IconButton>
          </div>
        </div>
        {openSection === 'banner' && (
          <div className="accordion-content">
            {bannerImage ? (
              <div style={{ marginBottom: '0.5rem' }}>
                <img src={bannerImage} alt={bannerAlt || ''} style={{ width: '100%', height: 'auto' }} />
              </div>
            ) : (
              <p>No hero image selected.</p>
            )}
              <div className="template-row" style={{ display: 'flex', gap: 'var(--gap-2)', alignItems: 'center' }}>
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
                <TextField id="banner-draft-html" label="Template HTML" value={draftBannerHtml} onChange={(e) => setDraftBannerHtml(e.target.value)} rows={8} fullWidth multiline sx={{ fontFamily: 'monospace' }} />
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
                <TextField id="banner-new-name" label="Template name" type="text" value={newBannerName} onChange={(e) => setNewBannerName(e.target.value)} fullWidth sx={{ mb: 1 }} />
                <TextField id="banner-new-html" label="Template HTML" value={newBannerHtml} onChange={(e) => setNewBannerHtml(e.target.value)} rows={6} fullWidth multiline sx={{ fontFamily: 'monospace' }} />
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
              sx={{ mt: 2 }}
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
              sx={{ mt: 2 }}
              inputProps={{
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    (e.currentTarget as HTMLInputElement).blur();
                  }
                }
              }}
            />
            {/* Banner bottom padding controls removed */}
          </div>
        )}
      </div>
    );
  };

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
  const [brandName, setBrandName] = useState('belle and bloom');
  // Top loading bar (buffer variant)
  const [progress, setProgress] = useState<number>(-1);
  const [buffer, setBuffer] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(false);
  const [brandFont, setBrandFont] = useState('');
  const [brandPrimary, setBrandPrimary] = useState('#d19aa0');
  const [brandSecondary, setBrandSecondary] = useState('#F0C3C7');
  const [brandWebsite, setBrandWebsite] = useState('https://www.belleandbloom.com/');
  const [brandLogo, setBrandLogo] = useState<File | null>(null);

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
    setOpenCodeSections((prev) => ({ ...prev, [key]: !prev[key] }));
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
          setHeroAlt(brandName || 'Brand');
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
          setBannerAlt(brandName || 'Brand');
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
        const ds = (prod as any).descSource || 'metadata';
        // For UL in code view, use a marker to later swap the paragraph with UL markup
        const descForTemplate = ds === 'ul' && (prod as any).descriptionUl ? '[[DESC_MARKER]]' : chosenDescription;
        const productData: any = {
          ...prod,
          description: descForTemplate,
          ctaLabel: (prod as any).ctaLabel || 'SHOP NOW',
          priceHtml,
          ctaBg: brandPrimary
        };
        // Render module using the full template. Passing only
        // tpl.html causes runtime errors because renderTemplate
        // expects a Template object.
        let moduleHtml = renderTemplate(tpl as any, productData);
        if (ds === 'ul' && (prod as any).descriptionUl) {
          const ulHtml = (prod as any).descriptionUl as string;
          moduleHtml = moduleHtml.replace(/<p[^>]*>\s*\[\[DESC_MARKER\]\]\s*<\/p>/i, ulHtml);
        }
        moduleHtml = applyBrandColoursAndFont(moduleHtml);
        sectionHtml += moduleHtml;
      });
      bodyHtmlMap[`body-${section.id}`] = sectionHtml;
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
    }
    // Compose footer
    let footerStr = '';
    if (showFooterSection) {
      const footerTemplate = footerTemplates.find((t) => t.id === selectedFooterId);
      footerStr = footerTemplate ? footerTemplate.html : '';
      footerStr = applyBrandColoursAndFont(footerStr);
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
  }, [bodySections, selectedBodyId, selectedHeaderId, selectedFooterId, selectedBannerId, bodyTemplates, headerTemplates, footerTemplates, bannerTemplates, brandPrimary, brandSecondary, brandFont, brandLogoDataUrl, heroImage, heroAlt, heroHref, bannerImage, bannerAlt, bannerHref, selectedHeroId, heroTemplates, showHeaderSection, showHeroSection, showBannerSection, showFooterSection, sectionOrder]);

  /**
   * PrismJS reference and load state. We load Prism only on the client
   * to avoid issues with server‑side rendering. When loaded, we save the
   * module on a ref so that the highlight function can access it.
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
          description: chosenDesc2,
          ctaLabel: (prod as any).ctaLabel || 'SHOP NOW',
          priceHtml,
          ctaBg: brandPrimary
      };
      // Render HTML and apply brand customisations
      let html = renderTemplate(tpl as any, data);
      html = applyBrandColoursAndFont(html);
      combinedHtml += html;
    });
      if (combinedHtml) {
        codeSections.push({ key: id, title: section.name, code: combinedHtml });
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
            setFooterTemplates((prev) => [...prev, ...parsedFooter]);
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
    const filtered = (draftUrls[sectionId] ?? section.urls).map((u) => u.trim()).filter((u) => u);
    if (filtered.length === 0) {
      alert('Please provide at least one product URL.');
      return;
    }
    // Set loading true for this section and clear previous products
    setBodySections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, loading: true, products: [] } : s))
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
        throw new Error(`Request failed with status ${res.status}`);
      }
      // Response received
      setProgress(20);
      setBuffer(40);
      const data = (await res.json()) as GenerateResponse;
      // Parsed JSON
      setProgress(30);
      setBuffer(50);
      const processed: ProductData[] = [];
      const validUrls: string[] = [];
      const totalItems = Math.max(1, data.products.length || 0);
      data.products.forEach((p: any, idx: number) => {
        const hasInfo = Object.keys(p || {}).some(
          (key) => key !== 'url' && p[key]
        );
        if (!hasInfo) {
          const badUrl = filtered[idx] || p.url || 'Unknown URL';
          addNotification(`Error on fetching data from the url ${badUrl}`);
          return;
        }
        validUrls.push(filtered[idx]);
        processed.push({
          url: p.url,
          pretitle: p.pretitle || '',
          title: p.title || '',
          price: p.price || '',
          originalPrice: p.originalPrice || undefined,
          description: p.description || '',
          // Additional description sources scraped from .product__description
          // (plain text from <p> and joined text from <ul>)
          descriptionP: p.descriptionP || '',
          descriptionUl: p.descriptionUl || '',
          image: p.image || '',
          images: Array.isArray(p.images) ? p.images : undefined,
          cta: p.cta || p.url,
          ctaLabel: (p as any).ctaLabel || 'SHOP NOW'
        });
        // Process items linearly: advance from 30% up to 90%
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
      alert(`Failed to generate products: ${error.message}`);
      setBodySections((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, loading: false } : s))
      );
      // Ensure the loading bar hides on error
      setLoading(false);
      setProgress(-1);
      setBuffer(-1);
    }
  };

  // Fetch initial product data for the first body section on page load
  useEffect(() => {
    generateSection(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                  {/* Hero template selector label */}
                  <div className="template-row" style={{ display: 'flex', gap: 'var(--gap-2)', alignItems: 'center' }}>
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
                      <TextField id="header-draft-html" label="Template HTML" value={draftHeaderHtml} onChange={(e) => setDraftHeaderHtml(e.target.value)} rows={8} fullWidth multiline sx={{ fontFamily: 'monospace' }} />
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
                      <TextField id="header-new-name" label="Template name" type="text" value={newHeaderName} onChange={(e) => setNewHeaderName(e.target.value)} fullWidth sx={{ mb: 1 }} />
                      <TextField id="header-new-html" label="Template HTML" value={newHeaderHtml} onChange={(e) => setNewHeaderHtml(e.target.value)} rows={6} fullWidth multiline sx={{ fontFamily: 'monospace' }} />
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
                  {/* Header bottom padding controls removed */}
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
                  if (id === 'hero' && showHeroSection) return <SortableHeroSection key="hero" />;
                  if (id === 'banner' && showBannerSection) return <SortableBannerSection key="banner" />;
                  if (id.startsWith('body-')) {
                    const section = bodySections.find((s) => `body-${s.id}` === id);
                    return section ? <SortableBodySection key={id} section={section} /> : null;
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
                  <div className="template-row" style={{ display: 'flex', gap: 'var(--gap-2)', alignItems: 'center' }}>
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
                        <TextField id="footer-draft-html" label="Template HTML" value={draftFooterHtml} onChange={(e) => setDraftFooterHtml(e.target.value)} rows={8} fullWidth multiline sx={{ fontFamily: 'monospace' }} />
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
                      <TextField id="footer-new-name" label="Template name" type="text" value={newFooterName} onChange={(e) => setNewFooterName(e.target.value)} fullWidth sx={{ mb: 1 }} />
                      <TextField id="footer-new-html" label="Template HTML" value={newFooterHtml} onChange={(e) => setNewFooterHtml(e.target.value)} rows={6} fullWidth multiline sx={{ fontFamily: 'monospace' }} />
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
                  {/* Footer bottom padding controls removed */}
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
          <>
            <Box sx={{ p: 0 }}>
              <Typography variant="h6" component="h2">Brand Customisation</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              <TextField
                id="brand-name"
                label="Brand Name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                fullWidth
              />
              <TextField
                select
                fullWidth
                label="Font"
                id="brand-font"
                value={brandFont}
                onChange={(e) => setBrandFont(e.target.value as string)}
              >
                <MenuItem value="">Default (Montserrat)</MenuItem>
                <MenuItem value="Arial, Helvetica, sans-serif">Arial</MenuItem>
                <MenuItem value="Georgia, serif">Georgia</MenuItem>
                <MenuItem value="Times New Roman, serif">Times New Roman</MenuItem>
                <MenuItem value="Courier New, monospace">Courier New</MenuItem>
              </TextField>

              <MuiColorInput
                id="brand-primary"
                label="Primary Colour"
                format="hex"
                value={brandPrimary}
                onChange={(value) => setBrandPrimary(value || brandPrimary)}
                size="small"
              />

              <MuiColorInput
                id="brand-secondary"
                label="Secondary Colour"
                format="hex"
                value={brandSecondary}
                onChange={(value) => setBrandSecondary(value || brandSecondary)}
                size="small"
              />

              <TextField
                id="brand-website"
                label="Website URL"
                type="url"
                value={brandWebsite}
                onChange={(e) => setBrandWebsite(e.target.value)}
                onBlur={(e) => setBrandWebsite(sanitizeUrl(e.currentTarget.value))}
                placeholder="https://example.com"
                fullWidth
              />

              <TextField
                id="brand-logo"
                label="Company Logo"
                placeholder="No file chosen"
                value={brandLogo ? (brandLogo as File).name : ''}
                fullWidth
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button startIcon={<UploadFileIcon />} component="label">
                        Browse
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files ? e.target.files[0] : null;
                            setBrandLogo(file);
                          }}
                        />
                      </Button>
                    </InputAdornment>
                  )
                }}
              />

              <Box sx={{ display: 'flex', gap: 1, pt: 1 }}>
                <Button onClick={() => setShowBrandPanel(false)}>Close</Button>
                <Button onClick={() => setShowBrandPanel(false)}>Save</Button>
              </Box>
            </Stack>
          </>
        }
      >
            {/* Global top progress when any section loading */}
            {/* Top progress is now handled by AppLayout's LinearProgress; remove page-level skeleton */}
            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
              <div className="preview-bar" style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-2)', borderBottom: '1px solid #e5e7eb' }}>
                <Typography variant="h6" sx={{ flex: 1 }}>{viewMode === 'preview' ? 'Email Preview' : 'Email Code'}</Typography>
                <div className="preview-actions">
                  <IconButton onClick={() => setViewMode(viewMode === 'preview' ? 'code' : 'preview')} title={viewMode === 'preview' ? 'Show code' : 'Show preview'}>
                    {viewMode === 'preview' ? <CodeIcon /> : <VisibilityIcon />}
                  </IconButton>
                  <IconButton onClick={() => { copyToClipboard(finalHtml); addNotification('Code copied!'); }} title="Copy full email HTML to clipboard">
                    <ContentCopyIcon />
                  </IconButton>
                </div>
              </div>
              <div style={{ overflowY: 'auto', overflowX: 'hidden', paddingBottom: '6rem', position: 'relative' }}>
                {viewMode === 'preview' ? (
                  <div ref={previewRef} data-preview-container="true">
                    {showHeaderSection && (
                      <div data-section="header" onClick={() => setOpenSection('header')} dangerouslySetInnerHTML={{ __html: headerHtml }} />
                    )}
                    {sectionOrder.map((id) => {
                       if (id === 'hero' && showHeroSection && heroImage) {
                         return (
                           <div key="hero" data-section="hero">
                             <HeroTableModule
                               heroImage={heroImage}
                               heroAlt={heroAlt || brandName}
                               heroHref={heroHref}
                               heroImages={heroImages}
                               updateHero={updateHero}
                               templateId={selectedHeroId}
                               onActivate={() => setOpenSection('hero')}
                             />
                           </div>
                         );
                       }
                      if (id === 'banner' && showBannerSection && bannerImage) {
                        return (
                      <div key="banner" data-section="banner" onClick={() => setOpenSection('banner')} dangerouslySetInnerHTML={{ __html: bannerHtml }} />
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
                                {section.urls.filter(u=>u.trim()).length === 0 ? (
                                  <Skeleton
                                    variant="rectangular"
                                    animation="wave"
                                    sx={{
                                      mb: 2,
                                      width: '100%',
                                      maxWidth: 600,
                                      mx: 'auto',
                                      height: 180,
                                      borderRadius: 2,
                                      boxShadow: 'var(--shadow-light)'
                                    }}
                                  />
                                ) : (
                                  section.urls.filter(u=>u.trim()).map((_,i)=>(
                                    <Skeleton
                                      key={i}
                                      variant="rectangular"
                                      animation="wave"
                                      sx={{
                                        mb: 2,
                                        width: '100%',
                                        maxWidth: 600,
                                        mx: 'auto',
                                        height: 180,
                                        borderRadius: 2,
                                        boxShadow: 'var(--shadow-light)'
                                      }}
                                    />
                                  ))
                                )}
                              </>
                            )}
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
                          </div>
                        );
                      }
                      return null;
                    })}
                    {showFooterSection && (
                      <div data-section="footer" onClick={() => setOpenSection('footer')} dangerouslySetInnerHTML={{ __html: footerHtml }} />
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
