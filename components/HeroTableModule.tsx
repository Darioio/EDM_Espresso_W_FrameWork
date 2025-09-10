import React, { useState } from 'react';
import { uniqueImages } from '../lib/imageUtils';

interface HeroTableModuleProps {
  /** Selected hero image URL */
  heroImage: string;
  /** Optional alt text for the hero image */
  heroAlt: string;
  /** Optional link that wraps the hero image */
  heroHref: string;
  /** List of alternate hero images extracted from the carousel */
  heroImages: string[];
  /** Callback to update hero properties. Pass the field name and new value. */
  updateHero: (field: 'image' | 'alt' | 'href', value: string) => void;

  /** Identifier of the selected hero template. Allows the preview
   *  component to adjust margins/padding to more closely match the
   *  selected template. Unknown ids fall back to the default style. */
  templateId?: string;
  /** Callback when the module is interacted with */
  onActivate?: () => void;
}

/**
 * HeroTableModule renders a single hero section using the same
 * table-based structure as the email template. The hero
 * consists of a single image wrapped in an anchor. An edit
 * icon overlays the image; clicking it opens a modal overlay
 * listing all available hero images. Selecting a thumbnail
 * updates the heroImage via the parent callback. A close
 * button dismisses the overlay. Inline styles mirror the
 * markup used in the email template so the preview closely
 * matches the final generated HTML.
 */
const HeroTableModule: React.FC<HeroTableModuleProps> = ({
  heroImage,
  heroAlt,
  heroHref,
  heroImages,
  updateHero,
  templateId,
  onActivate
}) => {
  // Local state controlling the visibility of the image selector
  // overlay. When true the modal covers the right panel and shows
  // all available hero images. Selecting an image or clicking
  // outside the modal closes it.
  const [showSelector, setShowSelector] = useState(false);

  const availableImages = uniqueImages(heroImages);

  const openSelector = () => {
    if (availableImages.length > 0) {
      setShowSelector(true);
    }
  };
  const closeSelector = () => {
    setShowSelector(false);
  };
  const handleSelect = (img: string) => {
    updateHero('image', img);
    setShowSelector(false);
  };

  return (
    // Determine outer wrapper styles based on the selected hero template.
    // The default hero has no side padding. The "hero-margins" template
    // introduces 25px padding on the left and right of the outer table.
    (() => {
      const outerPadding = templateId === 'hero-margins' ? '0 25px' : '0';
      return (
        <>
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          border={0}
          align="center"
        style={{ margin: '0', padding: 0 }}
          onClick={onActivate}
        >
          <tbody>
            <tr>
              <td align="center" style={{ margin: 0, padding: 0 }}>
                {/* Wrapper */}
                <table
                  role="presentation"
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  border={0}
                  style={{ maxWidth: '600px', margin: '0 auto', padding: outerPadding, background: '#FFFFFF' }}
                >
                  <tbody>
                    <tr>
                      <td style={{ padding: 0 }}>
                        {/* Render hero image without a surrounding anchor so clicking does not navigate.
                           Instead, clicking the image or edit icon opens the selector. */}
                        <div
                          className={`hero-image-wrapper${availableImages.length > 0 ? ' selectable' : ''}`}
                          style={{ position: 'relative', cursor: availableImages.length > 0 ? 'pointer' : 'default' }}
                          onClick={() => {
                            if (availableImages.length > 0) {
                              openSelector();
                            }
                          }}
                        >
                          <img
                            src={heroImage || ''}
                            alt={heroAlt || ''}
                            style={{ display: 'block', width: '100%', height: 'auto', border: 0, outline: 0, textDecoration: 'none' }}
                          />
                          {heroImages && heroImages.length > 0 && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                onActivate?.();
                                openSelector();
                              }}
                              style={{
                                position: 'absolute',
                                bottom: 8,
                                right: 8,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                color: '#ffffff',
                                borderRadius: '50%',
                                padding: 4,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                              aria-label="Select hero image"
                              title="Select hero image"
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
        {/* Modal overlay for hero image selection. Centered within the right panel */}
        {showSelector && availableImages.length > 0 && (() => {
          const container = (document.querySelector('[data-preview-container="true"]') as HTMLElement) || null;
          const rect = container?.getBoundingClientRect();
          const overlayStyle: React.CSSProperties = rect ? {
            position: 'fixed', left: rect.left, top: 0, width: rect.width, height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          } : { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
          return (
          <div onClick={closeSelector} style={overlayStyle}>
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#ffffff',
                padding: '1rem',
                borderRadius: 8,
                maxWidth: '90%',
                maxHeight: '80%',
                overflowY: 'auto',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--gap-2)',
                justifyContent: 'center',
              }}
            >
              {availableImages.map((img, i) => {
                const isSelected = img === heroImage;
                return (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    style={{
                      border: isSelected ? '2px solid #d19aa0' : '2px solid transparent',
                      boxSizing: 'border-box',
                      width: 120,
                      height: 120,
                      objectFit: 'cover',
                      borderRadius: 6,
                    }}
                    onClick={() => handleSelect(img)}
                  />
                );
              })}
              <button
                onClick={closeSelector}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
          );
        })()}
        </>
      );
    })()
  );
};

export default React.memo(HeroTableModule);
