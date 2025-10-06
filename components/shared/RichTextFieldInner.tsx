import React from 'react';
import { Box, Typography, IconButton, TextField, Button, Popover, Stack } from '@mui/material';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import FontSize from '@tiptap/extension-font-size';
import Color from '@tiptap/extension-color';
import FormatStrikethroughIcon from '@mui/icons-material/FormatStrikethrough';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import {
  RichTextEditorProvider,
  MenuButtonBold,
  MenuButtonItalic,
  MenuButtonBulletedList,
  MenuButtonOrderedList,
  MenuSelectFontSize,
  MenuButtonTextColor,
  // LinkBubbleMenu and handler removed; we use our own MUI Dialog prompt
} from 'mui-tiptap';

export type RichTextFieldProps = {
  label?: string;
  value: string; // HTML
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
};

export default function RichTextFieldInner({ label, value, onChange, placeholder, minHeight = 80, className }: RichTextFieldProps) {
  const editorId = React.useId();
  const toolbarRef = React.useRef<HTMLDivElement | null>(null);
  const [isEditorFocused, setIsEditorFocused] = React.useState(false);
  const [linkPopoverAnchor, setLinkPopoverAnchor] = React.useState<HTMLElement | null>(null);
  const [linkInput, setLinkInput] = React.useState('');
  const baseTheme = useTheme();
  const noTooltipTheme = React.useMemo(
    () =>
      createTheme(baseTheme, {
        components: {
          MuiTooltip: {
            defaultProps: {
              disableHoverListener: true,
              disableFocusListener: true,
              disableTouchListener: true,
            },
          },
        },
      }),
    [baseTheme]
  );

  // Build extension list and defensively de-duplicate by .name to avoid duplicate-name warnings
  const extensions = React.useMemo(() => {
    const list: any[] = [
      StarterKit,
      TextStyle,
      Color,
      FontSize,
      Placeholder.configure({ placeholder: placeholder || '' }),
    ];
    const seen = new Set<string>();
    const unique: any[] = [];
    for (const ext of list) {
      const name = (ext as any)?.name;
      if (name && seen.has(name)) continue;
      if (name) seen.add(name);
      unique.push(ext);
    }
    return unique;
  }, [placeholder, minHeight]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: `min-height:${minHeight}px; outline:none;`,
      },
    },
  }, [placeholder, minHeight]);

  // Track editor focus so we can conditionally render popovers/menus only when relevant
  React.useEffect(() => {
    if (!editor) return;
    const onFocus = () => setIsEditorFocused(true);
    const onBlur = () => setIsEditorFocused(false);
    editor.on('focus', onFocus);
    editor.on('blur', onBlur);
    // Initialize state
    setIsEditorFocused(editor.isFocused);
    return () => {
      editor.off('focus', onFocus);
      editor.off('blur', onBlur);
    };
  }, [editor]);

  // Ensure any interactive fields rendered by toolbar plugins have unique id/name
  React.useEffect(() => {
    const root = toolbarRef.current;
    if (!root) return;
    let i = 0;
    const assign = (nodeList: NodeListOf<Element>) => {
      nodeList.forEach((el) => {
        if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
          if (!el.name) el.name = `${editorId}-field-${i}`;
          if (!el.id) el.id = `${editorId}-field-${i}`;
          i += 1;
        }
      });
    };
    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        const added: Element[] = [];
        m.addedNodes.forEach((n) => { if (n instanceof Element) added.push(n); });
        if (added.length) {
          added.forEach((node) => {
            if (node.matches?.('input, select, textarea')) assign([node] as any);
            const inner = node.querySelectorAll?.('input, select, textarea');
            if (inner && inner.length) assign(inner);
          });
        }
      });
    });
    mo.observe(root, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [editorId]);

  React.useEffect(() => {
    if (!editor) return;
    // Do not clobber caret while user is typing
    if (editor.isFocused) return;
    const current = editor.getHTML();
    if (value !== current) {
      // Avoid losing selection/focus abruptly; do not emit update to avoid loops
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <ThemeProvider theme={noTooltipTheme}>
      <Box>
        {label ? (
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>{label}</Typography>
        ) : null}
        <RichTextEditorProvider editor={editor}>
          {/* Minimal compact toolbar (no tooltips due to ThemeProvider overrides). Attach ref to wrapper Box. */}
          <Box sx={{ mb: 0.5 }} ref={toolbarRef} role="toolbar" display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
            <MenuSelectFontSize />
            <MenuButtonTextColor />
            <MenuButtonBold />
            <MenuButtonItalic />
            {/* Strikethrough */}
            <IconButton
              size="small"
              aria-label="Strikethrough"
              onMouseDown={(e) => {
                e.preventDefault();
                editor?.chain().focus().toggleStrike().run();
              }}
            >
              <FormatStrikethroughIcon fontSize="small" />
            </IconButton>
            <MenuButtonBulletedList />
            <MenuButtonOrderedList />
            {/* Link: open a compact Popover near the icon for URL entry */}
            <IconButton
              size="small"
              aria-label="Add or edit link"
              onClick={(e) => {
                const ed: any = editor;
                if (!ed) return;
                const currentHref: string = (ed?.getAttributes?.('link')?.href) || '';
                setLinkInput(currentHref || 'https://');
                setLinkPopoverAnchor(e.currentTarget as HTMLElement);
              }}
            >
              <LinkIcon fontSize="small" />
            </IconButton>
            {/* Remove Link */}
            <IconButton
              size="small"
              aria-label="Remove Link"
              onMouseDown={(e) => {
                e.preventDefault();
                editor?.chain().focus().unsetLink().run();
              }}
            >
              <LinkOffIcon fontSize="small" />
            </IconButton>
          </Box>
          {/* Compact Popover for link entry, anchored to the link icon */}
          <Popover
            open={Boolean(linkPopoverAnchor)}
            anchorEl={linkPopoverAnchor}
            onClose={() => setLinkPopoverAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            disableAutoFocus
            disableEnforceFocus
            slotProps={{ paper: { sx: { p: 1, minWidth: 280 } } } as any}
          >
            <Stack direction="column" spacing={1}>
              <TextField
                id={`${editorId}-link-url`}
                placeholder="https://example.com"
                type="url"
                size="small"
                fullWidth
                autoFocus
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const ed: any = editor;
                    if (!ed) { setLinkPopoverAnchor(null); return; }
                    let hrefRaw = (linkInput || '').trim();
                    if (!hrefRaw) { setLinkPopoverAnchor(null); return; }
                    if (!/^https?:\/\//i.test(hrefRaw) && !hrefRaw.startsWith('mailto:') && !hrefRaw.startsWith('tel:')) {
                      hrefRaw = 'https://' + hrefRaw;
                    }
                    const selectionEmpty = ed?.state?.selection?.empty;
                    const chain = ed.chain().focus();
                    if (selectionEmpty) {
                      chain.insertContent(`<a href="${hrefRaw}" target="_blank" rel="noopener noreferrer nofollow">${hrefRaw}</a>`).run();
                    } else {
                      if (chain.extendMarkRange) chain.extendMarkRange('link');
                      if (chain.setLink) chain.setLink({ href: hrefRaw, target: '_blank', rel: 'noopener noreferrer nofollow' }).run();
                      else {
                        try { ed.commands.setMark?.('link', { href: hrefRaw }); } catch {}
                      }
                    }
                    setLinkPopoverAnchor(null);
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setLinkPopoverAnchor(null);
                  }
                }}
              />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const ed: any = editor;
                    if (!ed) { setLinkPopoverAnchor(null); return; }
                    const chain = ed.chain().focus();
                    if (chain.extendMarkRange) chain.extendMarkRange('link');
                    if (chain.unsetLink) chain.unsetLink().run();
                    else {
                      try { ed.commands.unsetMark?.('link'); } catch {}
                    }
                    setLinkPopoverAnchor(null);
                  }}
                >
                  Remove
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => {
                    const ed: any = editor;
                    if (!ed) { setLinkPopoverAnchor(null); return; }
                    let hrefRaw = (linkInput || '').trim();
                    if (!hrefRaw) { setLinkPopoverAnchor(null); return; }
                    if (!/^https?:\/\//i.test(hrefRaw) && !hrefRaw.startsWith('mailto:') && !hrefRaw.startsWith('tel:')) {
                      hrefRaw = 'https://' + hrefRaw;
                    }
                    const selectionEmpty = ed?.state?.selection?.empty;
                    const chain = ed.chain().focus();
                    if (selectionEmpty) {
                      chain.insertContent(`<a href="${hrefRaw}" target="_blank" rel="noopener noreferrer nofollow">${hrefRaw}</a>`).run();
                    } else {
                      if (chain.extendMarkRange) chain.extendMarkRange('link');
                      if (chain.setLink) chain.setLink({ href: hrefRaw, target: '_blank', rel: 'noopener noreferrer nofollow' }).run();
                      else {
                        try { ed.commands.setMark?.('link', { href: hrefRaw }); } catch {}
                      }
                    }
                    setLinkPopoverAnchor(null);
                  }}
                >
                  Apply
                </Button>
              </Stack>
            </Stack>
          </Popover>
          {/* Render the Tiptap EditorContent directly */}
          <Box className={className} sx={{
            minHeight,
            // Make hyperlinks visually obvious inside the editor (best practice: not color alone, always underline)
            '& .ProseMirror a': {
              color: 'primary.main',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              cursor: 'pointer',
              wordBreak: 'break-word',
            },
            '& .ProseMirror a:hover': {
              textDecorationThickness: '2px',
            },
            '& .ProseMirror a:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.light',
              outlineOffset: '2px',
            },
          }}
            onClick={(e) => {
              // Prevent link clicks from navigating in the editor area
              const target = e.target as HTMLElement;
              const anchor = target.closest('a');
              if (anchor) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            <EditorContent editor={editor} aria-label={label || 'Rich text editor'} />
          </Box>
        </RichTextEditorProvider>
      </Box>
    </ThemeProvider>
  );
}
