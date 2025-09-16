import { Box, Paper, IconButton, Tooltip } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import LinkIcon from '@mui/icons-material/Link';
// Floating formatting toolbar for contentEditable fields
function FloatingToolbar({ anchorRect, onFormat }: { anchorRect: DOMRect | null, onFormat: (cmd: string) => void }) {
  if (!anchorRect) return null;
  const style: React.CSSProperties = {
    position: 'fixed',
    top: anchorRect.top - 44 > 0 ? anchorRect.top - 44 : anchorRect.bottom + 8,
    left: anchorRect.left + (anchorRect.width / 2) - 90,
    zIndex: 9999,
    background: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    borderRadius: 8,
    padding: 4,
    display: 'flex',
    gap: 2,
    minWidth: 180,
    alignItems: 'center',
  };
  return (
    <Paper elevation={3} style={style}>
      <Tooltip title="Font Size"><IconButton size="small" onMouseDown={e => { e.preventDefault(); onFormat('fontSize'); }}><FormatSizeIcon fontSize="small" /></IconButton></Tooltip>
      <Tooltip title="Text Color"><IconButton size="small" onMouseDown={e => { e.preventDefault(); onFormat('foreColor'); }}><FormatColorTextIcon fontSize="small" /></IconButton></Tooltip>
      <Tooltip title="Bold"><IconButton size="small" onMouseDown={e => { e.preventDefault(); onFormat('bold'); }}><FormatBoldIcon fontSize="small" /></IconButton></Tooltip>
      <Tooltip title="Italic"><IconButton size="small" onMouseDown={e => { e.preventDefault(); onFormat('italic'); }}><FormatItalicIcon fontSize="small" /></IconButton></Tooltip>
      <Tooltip title="Bullet List"><IconButton size="small" onMouseDown={e => { e.preventDefault(); onFormat('insertUnorderedList'); }}><FormatListBulletedIcon fontSize="small" /></IconButton></Tooltip>
      <Tooltip title="Numbered List"><IconButton size="small" onMouseDown={e => { e.preventDefault(); onFormat('insertOrderedList'); }}><FormatListNumberedIcon fontSize="small" /></IconButton></Tooltip>
      <Tooltip title="Link"><IconButton size="small" onMouseDown={e => { e.preventDefault(); onFormat('createLink'); }}><LinkIcon fontSize="small" /></IconButton></Tooltip>
    </Paper>
  );
}
  // Floating toolbar state
  const [toolbarRect, setToolbarRect] = React.useState<DOMRect | null>(null);
  const [showToolbar, setShowToolbar] = React.useState(false);
  const toolbarFieldRef = React.useRef<HTMLElement | null>(null);

  // Show toolbar on click/focus; hide on outside click
  React.useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const moduleRoot = target?.closest('.module') as HTMLElement | null;
      const field = moduleRoot ? (target?.closest('.title, .description, .sale-price, .cta-label') as HTMLElement | null) : null;
      const insideToolbar = !!target?.closest('.MuiPaper-root');
      if (field) {
        toolbarFieldRef.current = field;
        setShowToolbar(true);
        setToolbarRect(field.getBoundingClientRect());
      } else if (!insideToolbar) {
        setShowToolbar(false);
        toolbarFieldRef.current = null;
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  // Show toolbar on keyboard focus within editable fields
  React.useEffect(() => {
    function handleFocusIn(e: FocusEvent) {
      const target = e.target as HTMLElement | null;
      const moduleRoot = target?.closest('.module') as HTMLElement | null;
      const field = moduleRoot ? (target?.closest('.title, .description, .sale-price, .cta-label') as HTMLElement | null) : null;
      if (field) {
        toolbarFieldRef.current = field;
        setShowToolbar(true);
        setToolbarRect(field.getBoundingClientRect());
      }
    }
    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);
  // Reposition while selecting text only if toolbar is already visible
  React.useEffect(() => {
    function handleSelection() {
      if (!showToolbar || !toolbarFieldRef.current) return;
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      const node = range.startContainer instanceof Element ? range.startContainer : range.startContainer.parentElement;
      if (node && toolbarFieldRef.current.contains(node as Node)) {
        const rect = range.getBoundingClientRect();
        if (rect && (rect.width || rect.height)) {
          setToolbarRect(rect);
        } else {
          setToolbarRect(toolbarFieldRef.current.getBoundingClientRect());
        }
      }
    }
    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, [showToolbar]);

  // Keep position on resize/scroll
  React.useEffect(() => {
    function updatePos() {
      if (toolbarFieldRef.current && showToolbar) {
        setToolbarRect(toolbarFieldRef.current.getBoundingClientRect());
      }
    }
    window.addEventListener('resize', updatePos);
    document.addEventListener('scroll', updatePos, { passive: true } as any);
    return () => {
      window.removeEventListener('resize', updatePos);
      document.removeEventListener('scroll', updatePos as any);
    };
  }, [showToolbar]);

  // Auto-hide when focus leaves editable fields and toolbar
  React.useEffect(() => {
    function handleFocusOut(e: FocusEvent) {
      const next = (e.relatedTarget as HTMLElement) || document.activeElement as HTMLElement | null;
      const insideToolbar = !!next?.closest('.MuiPaper-root');
      const moduleRoot = next?.closest('.module') as HTMLElement | null;
      const insideField = !!(moduleRoot && next?.closest('.title, .description, .sale-price, .cta-label'));
      if (!insideToolbar && !insideField) {
        setShowToolbar(false);
        toolbarFieldRef.current = null;
      }
    }
    document.addEventListener('focusout', handleFocusOut);
    return () => document.removeEventListener('focusout', handleFocusOut);
  }, []);

  // Formatting command handler
  function handleFormat(cmd: string) {
    if (!toolbarFieldRef.current) return;
    toolbarFieldRef.current.focus();
    if (cmd === 'bold') document.execCommand('bold');
    if (cmd === 'italic') document.execCommand('italic');
    if (cmd === 'fontSize') document.execCommand('fontSize', false, '4');
    if (cmd === 'foreColor') document.execCommand('foreColor', false, '#e91e63');
    if (cmd === 'insertUnorderedList') document.execCommand('insertUnorderedList');
    if (cmd === 'insertOrderedList') document.execCommand('insertOrderedList');
    if (cmd === 'createLink') {
      const url = window.prompt('Enter the URL');
      if (url) document.execCommand('createLink', false, url);
    }
  }
import React from 'react';
import { uniqueImages } from '../lib/imageUtils';
import { ProductData } from '../lib/types';
import { sanitizeEmailHtml, sanitizeInlineHtml } from '../lib/sanitize';

// Universal helper to render any field as sanitized HTML
function renderSanitizedHtml(html: string, inline = false, fallback = ''): { __html: string } {
  if (!html) return { __html: fallback };
  return { __html: inline ? sanitizeInlineHtml(html) : sanitizeEmailHtml(html) };
}

interface EditableModuleProps {
  product: ProductData;
  index: number;
  orientation: 'left-image' | 'right-image';
  /**
   * Update a single field on the product. The parent component
   * owns the full array of products and will re-render the code
   * when updates occur. The field must be one of the keys on
   * ProductData. When updating the image the value should be a
   * complete URL from the product.images array.
   */
  updateProduct: (index: number, field: keyof ProductData, value: string) => void;
}

const EditableModule: React.FC<EditableModuleProps> = ({
  product,
  index,
  orientation,
  updateProduct
}) => {
  // Determine whether to reverse the flex order based on orientation.
  const isReverse = orientation === 'right-image';

  // Popup state for selecting an alternate image. When true the
  // selector modal is rendered over the page. The component uses
  // local state to manage visibility because multiple modules can be
  // open independently.
  const [showSelector, setShowSelector] = React.useState(false);

  // Handler to open the selector. The onClick is attached to both
  // the image itself and a small edit icon overlay. When invoked
  // the modal becomes visible.
  const openSelector = () => {
    if (product.images && product.images.length > 0) {
      setShowSelector(true);
    }
  };

  // Handler for picking an alternative image. It updates the
  // product image via the parent callback then closes the modal.
  const selectImage = (src: string) => {
    updateProduct(index, 'image', src);
    setShowSelector(false);
  };

  return (
    <div className={`module${isReverse ? ' reverse' : ''}`}>
      {/* Image column */}
      <div
        className={`image${product.images && product.images.length > 0 ? ' selectable' : ''}`}
        onClick={openSelector}
      >
        <img src={product.image} alt={product.title} />
        {/* Edit icon overlay */}
        {product.images && product.images.length > 0 && (
          <div className="edit-icon" onClick={(e) => { e.stopPropagation(); openSelector(); }}>
            {/* Simple pencil SVG icon */}
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M14.69 3.1l6.2 6.2c.27.27.27.7 0 .97l-8.2 8.2c-.17.17-.39.26-.62.26H6.5c-.55 0-1-.45-1-1v-5.57c0-.23.09-.45.26-.62l8.2-8.2c.27-.27.7-.27.97 0zM5 20h14v2H5v-2z" />
            </svg>
          </div>
        )}
      </div>
      {/* Text column */}
      <div className="content">
        {/* Title */}
        <div
          className="title"
          contentEditable
          tabIndex={0}
          suppressContentEditableWarning
          onBlur={(e) => {
            const text = e.currentTarget.innerText.replace(/\n$/, '');
            updateProduct(index, 'title', text);
          }}
          dangerouslySetInnerHTML={renderSanitizedHtml(product.title, true, 'Product title')}
        />
        {/* Price: show original price if available (non‑editable) and sale price editable */}
        <div className="price">
          {product.originalPrice && (
            <span className="original-price">
              {'$' + product.originalPrice}
            </span>
          )}
          <span
            className="sale-price"
            contentEditable
            tabIndex={0}
            suppressContentEditableWarning
            onBlur={(e) => {
              const value = e.currentTarget.innerText.replace(/\$/g, '').trim();
              updateProduct(index, 'price', value);
            }}
            dangerouslySetInnerHTML={renderSanitizedHtml(product.price ? '$' + product.price : '', true, 'Price')}
          />
        </div>
        {/* Description */}
        <div
          className="description"
          contentEditable
          tabIndex={0}
          suppressContentEditableWarning
          onBlur={(e) => {
            const text = e.currentTarget.innerText.replace(/\n$/, '');
            const html = text.replace(/\n/g, '<br>');
            updateProduct(index, 'description', html);
          }}
          dangerouslySetInnerHTML={renderSanitizedHtml(product.description, false, 'Description')}
        />
  {/* Floating formatting toolbar for preview fields */}
  {showToolbar && <FloatingToolbar anchorRect={toolbarRect} onFormat={handleFormat} />}
        <div className="cta-row">
          <a
            href={product.cta || product.url}
            className="button cta-label"
            target="_blank"
            rel="noopener noreferrer"
            contentEditable
            tabIndex={0}
            suppressContentEditableWarning
            onBlur={(e) => {
              const html = (e.currentTarget.innerHTML || '').trim() || 'SHOP NOW';
              updateProduct(index, 'ctaLabel', html);
            }}
            dangerouslySetInnerHTML={renderSanitizedHtml(product.ctaLabel || 'SHOP NOW', true)}
          />
        </div>
      </div>
      {/* Image selector modal */}
      {showSelector && product.images && product.images.length > 0 && (
        <div className="image-selector-overlay" onClick={() => setShowSelector(false)}>
          <div className="image-selector" onClick={(e) => e.stopPropagation()}>
            {/*
              Deduplicate images by base path (strip query parameters). Shopify and
              other e‑commerce platforms often serve the same image with
              different query strings for size or format. Using a Map ensures
              that only one instance of each base URL is shown. The current
              selected image is highlighted with a border.
            */}
            {/*
              Build a unique list of images by stripping query parameters from
              each URL. This avoids showing duplicates where Shopify uses
              different size or format parameters. We also preserve order.
            */}
            {uniqueImages(product.images || []).map((img, i) => {
              const isSelected = img === product.image;
              return (
                <img
                  key={i}
                  src={img}
                  alt=""
                  onClick={() => selectImage(img)}
                  className={isSelected ? 'selected' : undefined}
                />
              );
            })}
            <button onClick={() => setShowSelector(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableModule;
