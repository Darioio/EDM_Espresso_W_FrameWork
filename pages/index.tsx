import React, { useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import Head from 'next/head';
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
import { ProductData } from '../components/EditableModule';
// Import interactive modules for preview. ProductTableModule renders
// each product module with inline editing and image selection. The
// HeroTableModule renders the hero section with image selection.
import ProductTableModule from '../components/ProductTableModule';
import HeroTableModule from '../components/HeroTableModule';
// ProductTableModule was used for an interactive preview in earlier versions. When
// rendering via Option A the preview uses the compiled HTML directly so we
// no longer import or use ProductTableModule here.

// Import FontAwesome icons for various actions. Icons are imported
// individually to keep bundle size down. We use code, eye, edit,
// plus, copy, save and times icons. The FontAwesomeIcon component
// renders the SVGs inline.
import { faCopy, faCode, faEye, faPlus, faTimes, faSave, faPen, faMinus, faCog, faTrash, faChevronDown, faChevronUp, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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

/**
 * Inject a padding-bottom style into the first or last table with
 * a max-width of 600px. Email modules share this structure and the
 * padding should live on the table rather than an external wrapper.
 */
const addPaddingToTable = (html: string, padding: number, last = false) => {
  const marker = 'max-width:600px';
  const idx = last ? html.lastIndexOf(marker) : html.indexOf(marker);
  if (idx === -1) return html;
  // Find the full style attribute containing the marker so we can
  // read any existing padding values. We'll then append our padding
  // to whatever bottom padding already exists rather than relying on
  // an external wrapper element.
  const styleStart = html.lastIndexOf('style="', idx);
  const styleEnd = html.indexOf('"', idx);
  if (styleStart === -1 || styleEnd === -1) return html;

  let styleStr = html.slice(styleStart + 7, styleEnd);

  // Determine existing bottom padding from either a padding-bottom
  // declaration or the shorthand padding property.
  let existing = 0;
  const bottomMatch = styleStr.match(/padding-bottom:\s*(\d+)px/);
  if (bottomMatch) {
    existing = parseInt(bottomMatch[1], 10);
    styleStr = styleStr.replace(/padding-bottom:\s*\d+px;?/, '');
  } else {
    const paddingMatch = styleStr.match(/padding:\s*([^;]+);?/);
    if (paddingMatch) {
      const parts = paddingMatch[1].trim().split(/\s+/);
      if (parts.length === 1 || parts.length === 2) {
        existing = parseInt(parts[0], 10);
      } else if (parts.length === 3) {
        existing = parseInt(parts[2], 10);
      } else if (parts.length === 4) {
        existing = parseInt(parts[2], 10);
      }
    }
  }

  // Ensure the style string ends with a semicolon before appending.
  styleStr = styleStr.trim();
  if (styleStr && !styleStr.endsWith(';')) styleStr += ';';
  styleStr += `padding-bottom:${existing + padding}px`;

  return (
    html.slice(0, styleStart + 7) +
    styleStr +
    html.slice(styleEnd)
  );
};

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
  urls: string[];
  products: ProductData[];
  selectedBodyId: string;
  loading: boolean;
  /** Whether bottom padding should be applied after this section */
  paddingEnabled: boolean;
  /** Bottom padding value in pixels */
  padding: number;
  /** Background colour for CTAs within this section */
  ctaBg: string;
  /** Temporary preview colour while adjusting the picker */
  ctaBgPreview?: string;
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
      paddingEnabled: false,
      padding: 25,
      ctaBg: '#d19aa0'
    }
  ]);

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
      <div className="accordion-section" ref={setNodeRef} style={style}>
        <div className="accordion-header" onClick={() => handleAccordionToggle(`body-${section.id}`)}>
          <button
            className="icon-button"
            {...sortableAttributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            title="Reorder section"
          >
            <FontAwesomeIcon icon={faGripVertical} />
          </button>
          <span>{section.name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
            <button
              className="icon-button"
              onClick={(e) => {
                e.stopPropagation();
                removeBodySection(section.id);
              }}
              title="Remove section"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
            <button
              className="icon-button"
              onClick={(e) => {
                e.stopPropagation();
                handleAccordionToggle(`body-${section.id}`);
              }}
              title={openSection === `body-${section.id}` ? 'Collapse section' : 'Expand section'}
            >
              <FontAwesomeIcon icon={openSection === `body-${section.id}` ? faMinus : faPlus} />
            </button>
          </div>
        </div>
        {openSection === `body-${section.id}` && (
          <div className="accordion-content">
            <div>
              <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0' }}>Product URLs</h3>
              {section.urls.map((url, index) => (
                <div className="url-row" key={index}>
                  <input
                    id={`url-${section.id}-${index}`}
                    type="url"
                    placeholder="https://example.com/product"
                    value={url}
                    onChange={(e) => handleUrlChange(section.id, index, e.target.value)}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData('text');
                      e.preventDefault();
                      const cleaned = sanitizeUrl(pasted);
                      handleUrlChange(section.id, index, cleaned);
                      if (cleaned.trim() && index === section.urls.length - 1) {
                        addUrlField(section.id, section.urls.length);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key === 'Enter' &&
                        e.currentTarget.value.trim() &&
                        index === section.urls.length - 1
                      ) {
                        e.preventDefault();
                        addUrlField(section.id, section.urls.length);
                      }
                    }}
                    onBlur={(e) => {
                      const cleaned = sanitizeUrl(e.currentTarget.value);
                      handleUrlChange(section.id, index, cleaned);
                      if (cleaned.trim() && index === section.urls.length - 1) {
                        addUrlField(section.id);
                      }
                    }}
                  />
                  {section.urls.length > 1 && (
                    <button className="icon-button" onClick={() => removeUrlField(section.id, index)} title="Remove URL">
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <h3 style={{ fontSize: '1rem', margin: '30px 0px 0.5rem' }}>Template</h3>
            <div className="template-row">
              <select
                className="template-select"
                value={section.selectedBodyId}
                onChange={(e) => setSectionTemplate(section.id, e.target.value)}
              >
                {bodyTemplates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                ))}
              </select>
              <button className="icon-button" onClick={() => setBodyEditMode((v) => !v)} title={bodyEditMode ? 'Close editor' : 'Edit template'}>
                <FontAwesomeIcon icon={faPen} />
              </button>
              <button className="icon-button" onClick={() => setShowNewBody((v) => !v)} title={showNewBody ? 'Cancel new template' : 'Add new template'}>
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            {bodyEditMode && (
              <div>
                <textarea value={draftBodyHtml} onChange={(e) => setDraftBodyHtml(e.target.value)} rows={8} style={{ fontFamily: 'monospace', width: '100%' }} />
                <div className="new-template-actions">
                  <button className="icon-button" onClick={() => setBodyEditMode(false)} title="Cancel edit">
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                  <button className="icon-button" onClick={() => { saveBodyEdits(); setBodyEditMode(false); }} title="Save edits">
                    <FontAwesomeIcon icon={faSave} />
                  </button>
                </div>
              </div>
            )}
            {showNewBody && (
              <div className="new-template-form">
                <input type="text" placeholder="Template name" value={newBodyName} onChange={(e) => setNewBodyName(e.target.value)} />
                <textarea placeholder="HTML with {{placeholders}}" value={newBodyHtml} onChange={(e) => setNewBodyHtml(e.target.value)} rows={6} style={{ fontFamily: 'monospace', width: '100%' }} />
                <div className="new-template-actions">
                  <button className="icon-button" onClick={() => { setShowNewBody(false); setNewBodyName(''); setNewBodyHtml(''); }} title="Cancel new template">
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                  <button className="icon-button" onClick={() => { addNewBodyTemplate(); setShowNewBody(false); }} title="Save new template">
                    <FontAwesomeIcon icon={faSave} />
                  </button>
                </div>
              </div>
            )}
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => generateSection(section.id)}
                disabled={section.loading}
                style={{ fontSize: '1rem' }}
              >
                {section.loading ? 'Generating…' : 'Update'}
              </button>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Enable bottom padding</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={section.paddingEnabled}
                    onChange={(e) =>
                      setBodySections((prev) =>
                        prev.map((s) =>
                          s.id === section.id ? { ...s, paddingEnabled: e.target.checked } : s
                        )
                      )
                    }
                  />
                  <span className="slider" />
                </label>
              </div>
              {section.paddingEnabled && (
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={section.padding}
                    onChange={(e) =>
                      setBodySections((prev) =>
                        prev.map((s) =>
                          s.id === section.id ? { ...s, padding: Number(e.target.value) } : s
                        )
                      )
                    }
                  />
                  <span>{section.padding}px</span>
                </div>
              )}
            </div>
            {section.products.some((p) => p.cta) && (
              <div
                style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <label>CTA background</label>
                <input
                  type="color"
                  value={section.ctaBgPreview ?? section.ctaBg}
                  onInput={(e) =>
                    setBodySections((prev) =>
                      prev.map((s) =>
                        s.id === section.id ? { ...s, ctaBgPreview: e.currentTarget.value } : s
                      )
                    )
                  }
                  onChange={(e) =>
                    setBodySections((prev) =>
                      prev.map((s) =>
                        s.id === section.id
                          ? { ...s, ctaBg: e.target.value, ctaBgPreview: undefined }
                          : s
                      )
                    )
                  }
                  style={{ width: '2rem', height: '2rem', padding: 0, border: 'none' }}
                />
              </div>
            )}
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
      <div className="accordion-section" ref={setNodeRef} style={style}>
        <div className="accordion-header" onClick={() => handleAccordionToggle('hero')}>
          <button
            className="icon-button"
            {...sortableAttributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            title="Reorder section"
          >
            <FontAwesomeIcon icon={faGripVertical} />
          </button>
          <span>Hero</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="icon-button"
              onClick={(e) => {
                e.stopPropagation();
                removeHeroSection();
              }}
              title="Remove section"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
            <button
              className="icon-button"
              onClick={(e) => {
                e.stopPropagation();
                handleAccordionToggle('hero');
              }}
              title={openSection === 'hero' ? 'Collapse section' : 'Expand section'}
            >
              <FontAwesomeIcon icon={openSection === 'hero' ? faMinus : faPlus} />
            </button>
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
            <h3 style={{ fontSize: '1rem', margin: '30px 0px 0.5rem' }}>Template</h3>
            <div className="template-row">
              <select className="template-select" value={selectedHeroId} onChange={(e) => setSelectedHeroId(e.target.value)}>
                {heroTemplates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
              <button className="icon-button" onClick={() => setHeroEditMode((v) => !v)} title={heroEditMode ? 'Close editor' : 'Edit template'}>
                <FontAwesomeIcon icon={faPen} />
              </button>
              <button className="icon-button" onClick={() => setShowNewHero((v) => !v)} title={showNewHero ? 'Cancel new template' : 'Add new template'}>
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            {heroEditMode && (
              <div>
                <textarea value={draftHeroHtml} onChange={(e) => setDraftHeroHtml(e.target.value)} rows={6} style={{ fontFamily: 'monospace', width: '100%' }} />
                <div className="new-template-actions">
                  <button className="icon-button" onClick={() => setHeroEditMode(false)} title="Cancel edit">
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                  <button className="icon-button" onClick={() => { saveHeroEdits(); setHeroEditMode(false); }} title="Save edits">
                    <FontAwesomeIcon icon={faSave} />
                  </button>
                </div>
              </div>
            )}
            {showNewHero && (
              <div className="new-template-form">
                <input type="text" placeholder="Template name" value={newHeroName} onChange={(e) => setNewHeroName(e.target.value)} />
                <textarea placeholder="HTML" value={newHeroHtml} onChange={(e) => setNewHeroHtml(e.target.value)} rows={6} style={{ fontFamily: 'monospace', width: '100%' }} />
                <div className="new-template-actions">
                  <button className="icon-button" onClick={() => { setShowNewHero(false); setNewHeroName(''); setNewHeroHtml(''); }} title="Cancel new template">
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                  <button className="icon-button" onClick={() => { addNewHeroTemplate(); setShowNewHero(false); }} title="Save new template">
                    <FontAwesomeIcon icon={faSave} />
                  </button>
                </div>
              </div>
            )}
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Enable bottom padding</span>
                <label className="toggle-switch">
                  <input type="checkbox" checked={heroPaddingEnabled} onChange={(e) => setHeroPaddingEnabled(e.target.checked)} />
                  <span className="slider" />
                </label>
              </div>
              {heroPaddingEnabled && (
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="range" min={0} max={100} value={heroPadding} onChange={(e) => setHeroPadding(Number(e.target.value))} />
                  <span>{heroPadding}px</span>
                </div>
              )}
            </div>
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
      <div className="accordion-section" ref={setNodeRef} style={style}>
        <div className="accordion-header" onClick={() => handleAccordionToggle('banner')}>
          <button
            className="icon-button"
            {...sortableAttributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            title="Reorder section"
          >
            <FontAwesomeIcon icon={faGripVertical} />
          </button>
          <span>Banner</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="icon-button"
              onClick={(e) => {
                e.stopPropagation();
                removeBannerSection();
              }}
              title="Remove section"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
            <button
              className="icon-button"
              onClick={(e) => {
                e.stopPropagation();
                handleAccordionToggle('banner');
              }}
              title={openSection === 'banner' ? 'Collapse section' : 'Expand section'}
            >
              <FontAwesomeIcon icon={openSection === 'banner' ? faMinus : faPlus} />
            </button>
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
            <h3 style={{ fontSize: '1rem', margin: '30px 0 0.5rem' }}>Template</h3>
            <div className="template-row">
              <select className="template-select" value={selectedBannerId} onChange={(e) => setSelectedBannerId(e.target.value)}>
                {bannerTemplates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
              <button className="icon-button" onClick={() => setBannerEditMode((v) => !v)} title={bannerEditMode ? 'Close editor' : 'Edit template'}>
                <FontAwesomeIcon icon={faPen} />
              </button>
              <button className="icon-button" onClick={() => setShowNewBanner((v) => !v)} title={showNewBanner ? 'Cancel new template' : 'Add new template'}>
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            {bannerEditMode && (
              <div>
                <textarea value={draftBannerHtml} onChange={(e) => setDraftBannerHtml(e.target.value)} rows={8} style={{ fontFamily: 'monospace', width: '100%' }} />
                <div className="new-template-actions">
                  <button className="icon-button" onClick={() => setBannerEditMode(false)} title="Cancel edit">
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                  <button className="icon-button" onClick={() => { saveBannerEdits(); setBannerEditMode(false); }} title="Save edits">
                    <FontAwesomeIcon icon={faSave} />
                  </button>
                </div>
              </div>
            )}
            {showNewBanner && (
              <div className="new-template-form">
                <input type="text" placeholder="Template name" value={newBannerName} onChange={(e) => setNewBannerName(e.target.value)} />
                <textarea placeholder="HTML" value={newBannerHtml} onChange={(e) => setNewBannerHtml(e.target.value)} rows={6} style={{ fontFamily: 'monospace', width: '100%' }} />
                <div className="new-template-actions">
                  <button className="icon-button" onClick={() => { setShowNewBanner(false); setNewBannerName(''); setNewBannerHtml(''); }} title="Cancel new template">
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                  <button className="icon-button" onClick={() => { addNewBannerTemplate(); setShowNewBanner(false); }} title="Save new template">
                    <FontAwesomeIcon icon={faSave} />
                  </button>
                </div>
              </div>
            )}
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Enable bottom padding</span>
                <label className="toggle-switch">
                  <input type="checkbox" checked={bannerPaddingEnabled} onChange={(e) => setBannerPaddingEnabled(e.target.checked)} />
                  <span className="slider" />
                </label>
              </div>
              {bannerPaddingEnabled && (
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="range" min={0} max={100} value={bannerPadding} onChange={(e) => setBannerPadding(Number(e.target.value))} />
                  <span>{bannerPadding}px</span>
                </div>
              )}
            </div>
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
  // Bottom padding controls for each major section
  const [headerPaddingEnabled, setHeaderPaddingEnabled] = useState(false);
  const [headerPadding, setHeaderPadding] = useState(25);
  const [heroPaddingEnabled, setHeroPaddingEnabled] = useState(false);
  const [heroPadding, setHeroPadding] = useState(25);
  const [bannerPaddingEnabled, setBannerPaddingEnabled] = useState(false);
  const [bannerPadding, setBannerPadding] = useState(25);
  const [footerPaddingEnabled, setFooterPaddingEnabled] = useState(false);
  const [footerPadding, setFooterPadding] = useState(25);
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
  const [brandFont, setBrandFont] = useState('');
  const [brandPrimary, setBrandPrimary] = useState('#d19aa0');
  const [brandSecondary, setBrandSecondary] = useState('#F0C3C7');
  const [brandWebsite, setBrandWebsite] = useState('https://www.belleandbloom.com/');
  const [brandLogo, setBrandLogo] = useState<File | null>(null);

  /** Notifications for user feedback. Each notification has a unique id
   * and a message. Notifications are displayed in a stack in the
   * top‑right corner and fade out after a short delay. */
  const [notifications, setNotifications] = useState<{ id: number; message: ReactNode }[]>([]);

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
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message }]);
    // Remove after 3 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
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
  const [heroAlt, setHeroAlt] = useState<string>('');
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
  const [bannerAlt, setBannerAlt] = useState<string>('');
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
          setHeroAlt('');
        }
      }
    } catch (err) {
      console.warn('Failed to fetch hero images', err);
    }
  }, [brandWebsite]);

  const fetchBannerForBrand = useCallback(async () => {
    if (!brandWebsite) return;
    try {
      const res = await fetch(`/api/banner?url=${encodeURIComponent(brandWebsite)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.image) {
          setBannerImage(data.image);
          setBannerHref(brandWebsite);
          setBannerAlt('');
        }
      }
    } catch (err) {
      console.warn('Failed to fetch banner image', err);
    }
  }, [brandWebsite]);

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
      loading: false,
      paddingEnabled: false,
      padding: 25,
      ctaBg: '#d19aa0'
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
      if (headerPaddingEnabled) {
        headerStr = addPaddingToTable(headerStr, headerPadding);
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
      // Render hero using the full template object. Passing the raw
      // HTML string causes renderTemplate to receive undefined for
      // template.html and results in runtime errors. See data/templates.ts.
      heroStr = renderTemplate(heroTemplate as any, heroData);
      heroStr = applyBrandColoursAndFont(heroStr);
      if (heroPaddingEnabled) {
        heroStr = addPaddingToTable(heroStr, heroPadding);
      }
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
        // Build colour swatches HTML: up to three colours displayed
        // as 24x24 squares separated by 8px spacing. Colours are
        // filtered to remove white/grey backgrounds. If there are
        // additional colours beyond the first three, we append a
        // plus symbol in a white square. This HTML is injected into
        // the template via the {{coloursHtml}} placeholder.
        const rawColours = Array.isArray(prod.colors) ? prod.colors : [];
        const colours = rawColours
          .filter((c) => typeof c === 'string' && c.trim() && !/^(#?fff(?:fff)?|#?f7f7f7)$/i.test(c.trim()))
          .slice(0, 3);
        let coloursHtmlStr = '';
        if (colours.length > 0) {
          let swatchCells = '';
          colours.forEach((colour, idx) => {
            swatchCells += `<td width="24" height="24" style="background:${colour};"></td>`;
            if (idx < colours.length - 1) {
              swatchCells += '<td width="8"></td>';
            }
          });
          if (rawColours.length > colours.length) {
            if (swatchCells) swatchCells += '<td width="8"></td>';
            swatchCells += '<td width="24" height="24" style="background:#ffffff;text-align:center;line-height:24px;font-family:\'Montserrat\',Arial,Helvetica,sans-serif;font-size:14px;color:#333333;">+</td>';
          }
          coloursHtmlStr = `<div style="text-align:right !important;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;padding:0;"><tr>${swatchCells}</tr></table></div>`;
        }
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
        const productData: any = {
          ...prod,
          ctaLabel: (prod as any).ctaLabel || 'SHOP NOW',
          coloursHtml: coloursHtmlStr,
          colorsHtml: coloursHtmlStr,
          priceHtml,
          ctaBg: section.ctaBg
        };
        // Render module using the full template. Passing only
        // tpl.html causes runtime errors because renderTemplate
        // expects a Template object.
        let moduleHtml = renderTemplate(tpl as any, productData);
        moduleHtml = applyBrandColoursAndFont(moduleHtml);
        sectionHtml += moduleHtml;
      });
      if (section.paddingEnabled) {
        sectionHtml = addPaddingToTable(sectionHtml, section.padding, true);
      }
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
      bannerStr = renderTemplate(bannerTemplate as any, data);
      bannerStr = applyBrandColoursAndFont(bannerStr);
      if (bannerPaddingEnabled) {
        bannerStr = addPaddingToTable(bannerStr, bannerPadding);
      }
    }
    // Compose footer
    let footerStr = '';
    if (showFooterSection) {
      const footerTemplate = footerTemplates.find((t) => t.id === selectedFooterId);
      footerStr = footerTemplate ? footerTemplate.html : '';
      footerStr = applyBrandColoursAndFont(footerStr);
      if (footerPaddingEnabled) {
        footerStr = addPaddingToTable(footerStr, footerPadding);
      }
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
  }, [bodySections, selectedBodyId, selectedHeaderId, selectedFooterId, selectedBannerId, bodyTemplates, headerTemplates, footerTemplates, bannerTemplates, brandPrimary, brandSecondary, brandFont, brandLogoDataUrl, heroImage, heroAlt, heroHref, bannerImage, bannerAlt, bannerHref, selectedHeroId, heroTemplates, showHeaderSection, showHeroSection, showBannerSection, showFooterSection, headerPaddingEnabled, headerPadding, heroPaddingEnabled, heroPadding, bannerPaddingEnabled, bannerPadding, footerPaddingEnabled, footerPadding, sectionOrder]);

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
      // Build colours HTML (up to 3 colours) with plus sign if more
      const rawColours: string[] = Array.isArray((prod as any).colors)
        ? ((prod as any).colors as string[])
        : [];
      const colours: string[] = rawColours
        .filter((c) => typeof c === 'string' && c.trim() && !/^(#?fff(?:fff)?|#?f7f7f7)$/i.test(c.trim()))
        .slice(0, 3);
      let coloursHtmlStr = '';
      if (colours.length > 0) {
        let swatchCells = '';
        colours.forEach((colour, cidx) => {
          swatchCells += `<td width="24" height="24" style="background:${colour};"></td>`;
          if (cidx < colours.length - 1) swatchCells += '<td width="8"></td>';
        });
        if (rawColours.length > colours.length) {
          if (swatchCells) swatchCells += '<td width="8"></td>';
          swatchCells += '<td width="24" height="24" style="background:#ffffff;text-align:center;line-height:24px;font-family:\'Montserrat\',Arial,Helvetica,sans-serif;font-size:14px;color:#333333;">+</td>';
        }
        coloursHtmlStr = `<div style="text-align:right !important;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;padding:0;"><tr>${swatchCells}</tr></table></div>`;
      }
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
      const data: any = {
        ...prod,
        ctaLabel: (prod as any).ctaLabel || 'SHOP NOW',
        coloursHtml: coloursHtmlStr,
        colorsHtml: coloursHtmlStr,
        priceHtml,
        ctaBg: section.ctaBg
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
    setBodySections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;
        const newUrls = [...section.urls];
        newUrls[index] = value;
        return { ...section, urls: newUrls };
      })
    );
  };
  // Add a new blank URL input to a section. Optionally focus the newly
  // created field by passing its index.
  const addUrlField = (sectionId: number, focusIndex?: number) => {
    setBodySections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;
        return { ...section, urls: [...section.urls, ''] };
      })
    );
    if (focusIndex !== undefined) {
      setTimeout(() => {
        const el = document.getElementById(`url-${sectionId}-${focusIndex}`) as HTMLInputElement | null;
        el?.focus();
      }, 0);
    }
  };
  // Remove a URL input from a section at index.
  const removeUrlField = (sectionId: number, index: number) => {
    setBodySections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;
        return { ...section, urls: section.urls.filter((_, i) => i !== index) };
      })
    );
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
    const filtered = section.urls.map((u) => u.trim()).filter((u) => u);
    if (filtered.length === 0) {
      alert('Please provide at least one product URL.');
      return;
    }
    // Set loading true for this section and clear previous products
    setBodySections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, loading: true, products: [] } : s))
    );
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: filtered, templateId: section.selectedBodyId })
      });
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const data = (await res.json()) as GenerateResponse;
      const processed: ProductData[] = [];
      const validUrls: string[] = [];
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
          image: p.image || '',
          images: Array.isArray(p.images) ? p.images : undefined,
          colors: Array.isArray(p.colors) ? p.colors : [],
          cta: p.cta || p.url,
          ctaLabel: (p as any).ctaLabel || 'SHOP NOW'
        });
      });
      setBodySections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? { ...s, products: processed, urls: [...validUrls, ''], loading: false }
            : s
        )
      );
    } catch (error: any) {
      console.error('Generation failed', error);
      alert(`Failed to generate products: ${error.message}`);
      setBodySections((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, loading: false } : s))
      );
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

  const headingStyle: React.CSSProperties = {
    fontSize: '2rem',
    padding: '20px',
    border: '1px solid #e5e7eb',
    borderRadius: 'var(--radius-small)',
    marginBottom: '2rem',
    backgroundColor: 'var(--color-surface)',
    boxShadow: 'var(--shadow-light)',
    fontWeight: '300'
  };

  return (
    <>
      <Head>
        <title>EDM Expresso</title>
        <meta name="description" content="Build modular EDMs from product pages" />
      </Head>
      <main className="fade-in">
        <h1 style={headingStyle}>EDM Expresso</h1>
        <div className="page-container">
          {/* Left panel with accordion */}
          <div className="left-panel">
            {/* Button to add another body section */}
            {/* The Add Body Section button has been relocated to the bottom row
               next to the Generate EDM button. The original container
               has been removed to avoid duplicate controls. */}
            {/* Header section */}
            {showHeaderSection && (
              <div className="accordion-section">
                <div className="accordion-header" onClick={() => handleAccordionToggle('header')}>
                  <span>Header</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      className="icon-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeHeaderSection();
                      }}
                      title="Remove section"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                    <button
                      className="icon-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAccordionToggle('header');
                      }}
                      title={openSection === 'header' ? 'Collapse section' : 'Expand section'}
                    >
                      <FontAwesomeIcon icon={openSection === 'header' ? faMinus : faPlus} />
                    </button>
                  </div>
                </div>
                {openSection === 'header' && (
                  <div className="accordion-content">
                  <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem' }}>Template</h3>
                  {/* Hero template selector label */}
                  <div className="template-row">
                    <select className="template-select" value={selectedHeaderId} onChange={(e) => setSelectedHeaderId(e.target.value)}>
                      {headerTemplates.map((tpl) => (
                        <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                      ))}
                    </select>
                    <button className="icon-button" onClick={() => setHeaderEditMode((v) => !v)} title={headerEditMode ? 'Close editor' : 'Edit template'}>
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button className="icon-button" onClick={() => setShowNewHeader((v) => !v)} title={showNewHeader ? 'Cancel new template' : 'Add new template'}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                  {headerEditMode && (
                    <div>
                      <textarea value={draftHeaderHtml} onChange={(e) => setDraftHeaderHtml(e.target.value)} rows={8} style={{ fontFamily: 'monospace', width: '100%' }} />
                      <div className="new-template-actions">
                        <button className="icon-button" onClick={() => setHeaderEditMode(false)} title="Cancel edit">
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                        <button className="icon-button" onClick={() => { saveHeaderEdits(); setHeaderEditMode(false); }} title="Save edits">
                          <FontAwesomeIcon icon={faSave} />
                        </button>
                      </div>
                    </div>
                  )}
                  {showNewHeader && (
                    <div className="new-template-form">
                      <input type="text" placeholder="Template name" value={newHeaderName} onChange={(e) => setNewHeaderName(e.target.value)} />
                      <textarea placeholder="HTML" value={newHeaderHtml} onChange={(e) => setNewHeaderHtml(e.target.value)} rows={6} style={{ fontFamily: 'monospace', width: '100%' }} />
                      <div className="new-template-actions">
                        <button className="icon-button" onClick={() => { setShowNewHeader(false); setNewHeaderName(''); setNewHeaderHtml(''); }} title="Cancel new template">
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                        <button className="icon-button" onClick={() => { addNewHeaderTemplate(); setShowNewHeader(false); }} title="Save new template">
                          <FontAwesomeIcon icon={faSave} />
                        </button>
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>Enable bottom padding</span>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={headerPaddingEnabled}
                          onChange={(e) => setHeaderPaddingEnabled(e.target.checked)}
                        />
                        <span className="slider" />
                      </label>
                    </div>
                    {headerPaddingEnabled && (
                      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={headerPadding}
                          onChange={(e) => setHeaderPadding(Number(e.target.value))}
                        />
                        <span>{headerPadding}px</span>
                      </div>
                    )}
                  </div>
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
              <div className="accordion-section">
                <div className="accordion-header" onClick={() => handleAccordionToggle('footer')}>
                  <span>Footer</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      className="icon-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFooterSection();
                      }}
                      title="Remove section"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                    <button
                      className="icon-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAccordionToggle('footer');
                      }}
                      title={openSection === 'footer' ? 'Collapse section' : 'Expand section'}
                    >
                      <FontAwesomeIcon icon={openSection === 'footer' ? faMinus : faPlus} />
                    </button>
                  </div>
                </div>
                {openSection === 'footer' && (
                  <div className="accordion-content">
                  <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem' }}>Template</h3>
                  <div className="template-row">
                    <select className="template-select" value={selectedFooterId} onChange={(e) => setSelectedFooterId(e.target.value)}>
                      {footerTemplates.map((tpl) => (
                        <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                      ))}
                    </select>
                    <button className="icon-button" onClick={() => setFooterEditMode((v) => !v)} title={footerEditMode ? 'Close editor' : 'Edit template'}>
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button className="icon-button" onClick={() => setShowNewFooter((v) => !v)} title={showNewFooter ? 'Cancel new template' : 'Add new template'}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                  {footerEditMode && (
                    <div>
                      <textarea value={draftFooterHtml} onChange={(e) => setDraftFooterHtml(e.target.value)} rows={8} style={{ fontFamily: 'monospace', width: '100%' }} />
                      <div className="new-template-actions">
                        <button className="icon-button" onClick={() => setFooterEditMode(false)} title="Cancel edit">
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                        <button className="icon-button" onClick={() => { saveFooterEdits(); setFooterEditMode(false); }} title="Save edits">
                          <FontAwesomeIcon icon={faSave} />
                        </button>
                      </div>
                    </div>
                  )}
                  {showNewFooter && (
                    <div className="new-template-form">
                      <input type="text" placeholder="Template name" value={newFooterName} onChange={(e) => setNewFooterName(e.target.value)} />
                      <textarea placeholder="HTML" value={newFooterHtml} onChange={(e) => setNewFooterHtml(e.target.value)} rows={6} style={{ fontFamily: 'monospace', width: '100%' }} />
                      <div className="new-template-actions">
                        <button className="icon-button" onClick={() => { setShowNewFooter(false); setNewFooterName(''); setNewFooterHtml(''); }} title="Cancel new template">
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                        <button className="icon-button" onClick={() => { addNewFooterTemplate(); setShowNewFooter(false); }} title="Save new template">
                          <FontAwesomeIcon icon={faSave} />
                        </button>
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>Enable bottom padding</span>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={footerPaddingEnabled}
                          onChange={(e) => setFooterPaddingEnabled(e.target.checked)}
                        />
                        <span className="slider" />
                      </label>
                    </div>
                    {footerPaddingEnabled && (
                      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={footerPadding}
                          onChange={(e) => setFooterPadding(Number(e.target.value))}
                        />
                        <span style={{ width: '45px' }}>{footerPadding}px</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              </div>
            )}

            {/* Universal Generate EDM button and Add Section button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '1rem', marginTop: '1rem' }}>
              <button
                onClick={generateAllSections}
                style={{
                  padding: '0.6rem 1.2rem',
                  fontSize: '1rem',
                  border: 'none',
                  borderRadius: 'var(--radius-small)',
                  cursor: 'pointer'
                }}
              >
                Generate EDM
              </button>
              <div ref={addSectionRef} style={{ position: 'relative', marginLeft: '1rem' }}>
                <button
                  onClick={() => setShowAddSectionMenu((v) => !v)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    fontSize: '1rem',
                    border: 'none',
                    borderRadius: 'var(--radius-small)',
                    cursor: 'pointer',
                    background: 'var(--color-primary)',
                    color: '#fff'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-dark)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary)')}
                  title="Add section"
                >
                  Add Section
                  <FontAwesomeIcon icon={showAddSectionMenu ? faChevronUp : faChevronDown} style={{ marginLeft: '0.5rem' }} />
                </button>
                {showAddSectionMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      background: 'var(--color-primary)',
                      border: '1px solid var(--color-primary-dark)',
                      borderRadius: 'var(--radius-small)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      zIndex: 10,
                      minWidth: '12rem',
                      maxHeight: '12rem',
                      overflowY: 'auto',
                      color: '#fff'
                    }}
                  >
                    {availableSectionTypes.map((opt, idx) => (
                      <button
                        key={opt.key}
                        onClick={() => addSectionByType(opt.key)}
                        style={{
                          padding: '0.6rem 1rem',
                          textAlign: 'left',
                          background: 'var(--color-primary)',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          borderTop: idx > 0 ? '1px solid var(--color-primary-dark)' : 'none',
                          display: 'block',
                          borderRadius: '0px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-dark)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary)')}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
            {/* Settings gear icon at bottom-left */}
            <div style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}>
              <button className="icon-button" onClick={() => setShowBrandPanel(true)} title="Brand customisation">
                <FontAwesomeIcon icon={faCog} />
              </button>
            </div>
            {/* Right panel */}
          <div className="right-panel">
            <div className="preview-bar">
              <h2 style={{ margin: 0, fontSize: '1.2rem', width: '100%' }}>{viewMode === 'preview' ? 'Email Preview' : 'Email Code'}</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {/* Toggle between preview and code views. The title on the button
                   reflects the current state. */}
                <button
                  className="icon-button"
                  onClick={() => setViewMode(viewMode === 'preview' ? 'code' : 'preview')}
                  title={viewMode === 'preview' ? 'Show code' : 'Show preview'}
                >
                  <FontAwesomeIcon icon={viewMode === 'preview' ? faCode : faEye} />
                </button>
                {/* Universal copy code button. Copies the entire email HTML,
                   not just the body. Always visible regardless of view mode. */}
                <button
                  className="icon-button"
                  onClick={() => {
                    copyToClipboard(finalHtml);
                    addNotification('Code copied!');
                  }}
                  title="Copy full email HTML to clipboard"
                >
                  <FontAwesomeIcon icon={faCopy} />
                </button>
              </div>
            </div>
                {viewMode === 'preview' ? (
              // In preview mode render the email using interactive
              // components for the body and hero sections. The
              // header and footer are still rendered from the
              // compiled HTML because they are static. The hero
              // and product modules display edit icons and image
              // selectors allowing the user to modify the image
              // directly from the preview. Edits update the
              // underlying data model and will be reflected in the
              // generated HTML and code view.
              <div ref={previewRef} style={{ marginTop: '3.5rem', marginBottom: '6rem' }}>
                {/* Header preview */}
                {showHeaderSection && (
                  <div data-section="header" onClick={() => setOpenSection('header')} dangerouslySetInnerHTML={{ __html: headerHtml }} />
                )}
                {sectionOrder.map((id) => {
                  if (id === 'hero' && showHeroSection && heroImage) {
                    return (
                      <div key="hero" data-section="hero">
                        <HeroTableModule
                          heroImage={heroImage}
                          heroAlt={heroAlt}
                          heroHref={heroHref}
                          heroImages={heroImages}
                          updateHero={updateHero}
                          templateId={selectedHeroId}
                          paddingBottom={heroPaddingEnabled ? heroPadding : undefined}
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
                        {section.products.map((prod, idx) => {
                          let orientation: 'left-image' | 'right-image';
                          if (section.selectedBodyId === 'product-image-left-copy-right') {
                            orientation = idx % 2 === 0 ? 'left-image' : 'right-image';
                          } else {
                            orientation = idx % 2 === 0 ? 'right-image' : 'left-image';
                          }
                          const isLast = idx === section.products.length - 1;
                          return (
                            <ProductTableModule
                              key={`${section.id}-${idx}`}
                              product={prod}
                              index={idx}
                              orientation={orientation}
                              updateProduct={(i, field, value) => updateProductInSection(section.id, i, field, value)}
                              paddingBottom={section.paddingEnabled && isLast ? section.padding : undefined}
                              onActivate={() => setOpenSection(`body-${section.id}`)}
                              ctaBg={section.ctaBgPreview ?? section.ctaBg}
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
              // Code view: render an accordion for each HTML section. Users can
              // expand or collapse sections independently. A copy icon on
              // each header allows copying that section’s HTML. The
              // highlight() helper applies PrismJS syntax highlighting. A
              // universal copy icon is provided in the preview bar above.
              <div className="code-accordion" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '3.5rem', marginBottom: '6rem' }}>
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
                        <div className="code-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            className="icon-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCodeSection(section.key);
                            }}
                            title={isOpen ? 'Collapse section' : 'Expand section'}
                          >
                            <FontAwesomeIcon icon={isOpen ? faMinus : faPlus} />
                          </button>
                          <button
                            className="icon-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(section.code);
                              addNotification('Code copied!');
                            }}
                            title="Copy code to clipboard"
                          >
                            <FontAwesomeIcon icon={faCopy} />
                          </button>
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
      </main>
      {/* Sliding Brand Customisation Panel */}
      {showBrandPanel && (
        <>
          <div className={showBrandPanel ? 'black-overlay open' : 'black-overlay'} onClick={() => setShowBrandPanel(false)}></div>
          <div className={showBrandPanel ? 'brand-panel open' : 'brand-panel'}>
            <h2 style={{ fontSize: '1.2rem', marginTop: 0 }}>Brand Customisation</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Font</label>
              <select value={brandFont} onChange={(e) => setBrandFont(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
                <option value="">Default (Montserrat)</option>
                <option value="Arial, Helvetica, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Times New Roman, serif">Times New Roman</option>
                <option value="Courier New, monospace">Courier New</option>
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Primary Colour</label>
              <input type="color" value={brandPrimary} onChange={(e) => setBrandPrimary(e.target.value)} style={{ width: '100%', height: '2rem', padding: 0, border: 'none' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Secondary Colour</label>
              <input type="color" value={brandSecondary} onChange={(e) => setBrandSecondary(e.target.value)} style={{ width: '100%', height: '2rem', padding: 0, border: 'none' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Website URL</label>
              <input
                type="url"
                value={brandWebsite}
                onChange={(e) => setBrandWebsite(e.target.value)}
                onBlur={(e) => setBrandWebsite(sanitizeUrl(e.currentTarget.value))}
                placeholder="https://example.com"
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Company Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files ? e.target.files[0] : null;
                  setBrandLogo(file);
                }}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setShowBrandPanel(false)} style={{ padding: '0.5rem 1rem' }}>Close</button>
              <button onClick={() => setShowBrandPanel(false)} style={{ padding: '0.5rem 1rem' }}>Save</button>
            </div>
          </div>
        </>
      )}

      {/* Notification container */}
      <div className="notifications-container">
        {notifications.map((note) => (
          <div key={note.id} className="notification">
            {note.message}
          </div>
        ))}
      </div>
    </>
  );
}