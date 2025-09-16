import React from 'react';
import { Box, Paper, IconButton, Tooltip } from '@mui/material';
import DescriptionSourceDialog, { DescSource } from './shared/DescriptionSourceDialog';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import LinkIcon from '@mui/icons-material/Link';
import { ImageSelector } from './shared/ImageSelector';

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

function ProductTableModule(props: any) {
  // Formatting command handler for floating toolbar
  function handleFormat(cmd: string) {
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

  const [toolbarRect, setToolbarRect] = React.useState<DOMRect | null>(null);
  const [showToolbar, setShowToolbar] = React.useState(false);
  const toolbarFieldRef = React.useRef<HTMLElement | null>(null);

  // Show toolbar on click/focus inside editable fields; hide on outside click
  React.useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const moduleRoot = target?.closest('table[role="presentation"]') as HTMLElement | null;
      const field = moduleRoot ? (target?.closest('h2, .sale-price, p, .cta-label') as HTMLElement | null) : null;
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
      const moduleRoot = next?.closest('table[role="presentation"]') as HTMLElement | null;
      const insideField = !!(moduleRoot && next?.closest('h2, .sale-price, p, .cta-label'));
      if (!insideToolbar && !insideField) {
        setShowToolbar(false);
        toolbarFieldRef.current = null;
      }
    }
    document.addEventListener('focusout', handleFocusOut);
    return () => document.removeEventListener('focusout', handleFocusOut);
  }, []);

  // Show toolbar on keyboard focus within editable fields
  React.useEffect(() => {
    function handleFocusIn(e: FocusEvent) {
      const target = e.target as HTMLElement | null;
      const moduleRoot = target?.closest('table[role="presentation"]') as HTMLElement | null;
      const field = moduleRoot ? (target?.closest('h2, .sale-price, p, .cta-label') as HTMLElement | null) : null;
      if (field) {
        toolbarFieldRef.current = field;
        setShowToolbar(true);
        setToolbarRect(field.getBoundingClientRect());
      }
    }
    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);

  const floatingToolbar = showToolbar ? <FloatingToolbar anchorRect={toolbarRect} onFormat={handleFormat} /> : null;

  // Render logic restored
  const {
    product,
    index,
    orientation,
    updateProduct,
    ctaBg,
    brandName,
    descSource,
    onChangeDescSource,
    ...rest
  } = props;

  // Helper to sanitize and render HTML
  function renderSanitizedHtml(html: string, inline = false, fallback = ''): { __html: string } {
    if (!html) return { __html: fallback };
    // Use your existing sanitize helpers if available
    // fallback to returning as is
    return { __html: html };
  }

  // Copy column
  const renderCopy = () => (
    <td className="stack-cols" width="50%" valign="top" style={{ padding: '0 8px' }}>
      {/* Title */}
      <h2
        style={{
          margin: '0 0 10px 0',
          fontFamily: "'Montserrat',Arial,Helvetica,sans-serif",
          fontSize: '26px',
          lineHeight: '1.2',
          color: '#111111',
          fontWeight: 300,
          whiteSpace: 'pre-wrap',
          transition: 'opacity 0.2s ease-in-out'
        }}
  contentEditable
  tabIndex={0}
        suppressContentEditableWarning
        onBlur={(e) => {
          const text = e.currentTarget.innerText.replace(/\n$/, '');
          updateProduct(index, 'title', text);
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.5';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        dangerouslySetInnerHTML={renderSanitizedHtml(product.title, true, 'Product title')}
      />

      {/* Price (original crossed + sale/current editable) */}
      <p
        style={{
          margin: '0 0 10px 0',
          fontFamily: "'Montserrat',Arial,Helvetica,sans-serif",
          fontSize: '16px',
          lineHeight: '1',
          color: '#111111',
          fontWeight: 600
        }}
      >
        {product.originalPrice && (
          <span style={{ textDecoration: 'line-through', marginRight: '8px', fontWeight: 400 }}>
            ${product.originalPrice}
          </span>
        )}
        <span
          contentEditable
          tabIndex={0}
          suppressContentEditableWarning
          style={{
            transition: 'opacity 0.2s ease-in-out'
          }}
          onBlur={(e) => {
            const value = e.currentTarget.innerText.replace(/\$/g, '').trim();
            updateProduct(index, 'price', value);
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          dangerouslySetInnerHTML={renderSanitizedHtml(product.price ? `$${product.price}` : '', true, 'Price')}
        />
      </p>

      {/* Description with per-product source selector (edit icon + dialog) */}
      <div
        style={{ position: 'relative', overflow: 'hidden' }}
        onMouseEnter={(e) => {
          const p = e.currentTarget.querySelector('p');
          const icon = e.currentTarget.querySelector('.edit-desc-icon') as HTMLElement | null;
          if (p) (p as HTMLElement).style.opacity = '0.5';
          if (icon) icon.style.transform = 'translateY(-38px)';
        }}
        onMouseLeave={(e) => {
          const p = e.currentTarget.querySelector('p');
          const icon = e.currentTarget.querySelector('.edit-desc-icon') as HTMLElement | null;
          if (p) (p as HTMLElement).style.opacity = '1';
          if (icon) icon.style.transform = 'translateY(0)';
        }}
      >
        {(() => {
          const descHtml = (product.description || '') as string;
          const isList = /<\s*(ul|ol)(\s|>)/i.test(descHtml);
          const whiteSpaceStyle: React.CSSProperties["whiteSpace"] = isList ? 'normal' : 'pre-wrap';
          return (
        <p
          style={{
            margin: '0 0 16px 0',
            fontFamily: "'Montserrat',Arial,Helvetica,sans-serif",
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#333333',
            whiteSpace: whiteSpaceStyle,
            transition: 'opacity 0.2s ease-in-out'
          }}
          contentEditable
          tabIndex={0}
          suppressContentEditableWarning
          onBlur={(e) => {
            const text = e.currentTarget.innerText.replace(/\n$/, '');
            updateProduct(index, 'description', text);
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.5'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          dangerouslySetInnerHTML={renderSanitizedHtml(product.description || '', false, 'Description')}
        />
          );
        })()}
        {/* Edit description overlay icon */}
        <div
          className="edit-desc-icon"
          onClick={(e) => { e.stopPropagation(); setShowDescDialog(true); }}
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
          aria-label="Change description source"
          title="Change description source"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
          </svg>
        </div>
      </div>

      {/* CTA + Colours row */}
      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ margin: 0, padding: 0 }}>
        <tbody>
          <tr>
            {/* CTA (left) */}
            <td align="left" valign="middle" style={{ padding: 0, whiteSpace: 'nowrap' }}>
              <table role="presentation" cellPadding={0} cellSpacing={0} border={0} style={{ margin: 0, padding: 0 }}>
                <tbody>
                  <tr>
                    <td align="center" style={{ background: ctaBg }}>
                      <a
                        href={product.cta || product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block',
                          padding: '12px 22px',
                          fontFamily: "'Montserrat',Arial,Helvetica,sans-serif",
                          fontSize: '14px',
                          lineHeight: '14px',
                          color: '#ffffff',
                          textDecoration: 'none',
                          transition: 'opacity 0.2s ease-in-out'
                        }}
                        contentEditable
                        className="cta-label"
                        tabIndex={0}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const html = e.currentTarget.innerHTML.trim();
                          updateProduct(index, 'ctaLabel', html || 'SHOP NOW');
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                        dangerouslySetInnerHTML={{ __html: (product.ctaLabel || 'SHOP NOW') as string }}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            {/* Spacer */}
            <td width="12" style={{ fontSize: 0, lineHeight: 0 }}>&nbsp;</td>
            {/* Colour swatches removed per requirements */}
          </tr>
        </tbody>
      </table>
    </td>
  );

  // Image column
  const [showImageSelector, setShowImageSelector] = React.useState(false);
  const canSelectImage = Array.isArray(product?.images) && (product.images?.length || 0) > 0;
  const openImageSelector = () => {
    if (canSelectImage) setShowImageSelector(true);
  };
  const handleSelectImage = (img: string) => {
    updateProduct(index, 'image', img);
    setShowImageSelector(false);
  };

  const renderImage = () => (
    <td className="stack-cols" width="50%" valign="top" style={{ padding: '0 8px' }}>
      <div
        className={`product-image-wrapper${canSelectImage ? ' selectable' : ''}`}
        style={{ position: 'relative', cursor: canSelectImage ? 'pointer' : 'default', overflow: 'hidden' }}
        onClick={openImageSelector}
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
          src={product.image}
          alt={product.title || brandName || ''}
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            outline: 0,
            textDecoration: 'none',
            transition: 'opacity 0.2s ease-in-out'
          }}
        />
        {canSelectImage && (
          <div
            className="edit-icon"
            onClick={(e) => { e.stopPropagation(); openImageSelector(); }}
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
            aria-label="Select product image"
            title="Select product image"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M14.69 3.1l6.2 6.2c.27.27.27.7 0 .97l-8.2 8.2c-.17.17-.39.26-.62.26H6.5c-.55 0-1-.45-1-1v-5.57c0-.23.09-.45.26-.62l8.2-8.2c.27-.27.7-.27.97 0zM5 20h14v2H5v-2z" />
            </svg>
          </div>
        )}
      </div>
    </td>
  );

  // Description source dialog state
  const [showDescDialog, setShowDescDialog] = React.useState(false);
  const [localDescSource, setLocalDescSource] = React.useState<DescSource>(descSource || 'metadata');
  const previews = React.useMemo(() => ({
    metadata: (product as any).metadataDescription || (product as any).description || '',
    p: (product as any).descriptionP || '',
    ul: (product as any).descriptionUl || ''
  }), [product]);
  const handleApplyDescSource = () => {
    onChangeDescSource && onChangeDescSource(localDescSource);
    setShowDescDialog(false);
  };

  return (
    <>
      {floatingToolbar}
      <table
        role="presentation"
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        border={0}
        align="center"
        style={{ margin: '0', padding: '0' }}
      >
        <tbody>
          {/* Main row */}
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
                  background: '#FFFFFF',
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ padding: '24px 16px' }}>
                      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ width: '100%', margin: 0, padding: 0 }}>
                        <tbody>
                          <tr>
                            {/* Orientation determines order */}
                            {orientation === 'left-image' ? (
                              <>
                                {renderImage()}
                                {renderCopy()}
                              </>
                            ) : (
                              <>
                                {renderCopy()}
                                {renderImage()}
                              </>
                            )}
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
      {/* Description source selector dialog with consistent styling and preview */}
      <DescriptionSourceDialog
        open={showDescDialog}
        selected={localDescSource}
        onChange={(s) => setLocalDescSource(s)}
        onApply={handleApplyDescSource}
        onClose={() => setShowDescDialog(false)}
        previews={previews}
      />
      {/* Image selector dialog overlay (positioned over preview panel) */}
      <ImageSelector
        images={product.images || []}
        selected={product.image}
        open={showImageSelector}
        onSelect={handleSelectImage}
        onClose={() => setShowImageSelector(false)}
      />
    </>
  );
}

export default ProductTableModule;


