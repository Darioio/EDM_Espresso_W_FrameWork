import React from 'react';
import { Box, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import FontSize from '@tiptap/extension-font-size';
import Color from '@tiptap/extension-color';
import {
  RichTextEditorProvider,
  RichTextField as MUIRichTextField,
  MenuControlsContainer,
  MenuButtonBold,
  MenuButtonItalic,
  MenuButtonBulletedList,
  MenuButtonOrderedList,
  MenuButtonEditLink,
  MenuSelectFontSize,
  MenuButtonTextColor,
} from 'mui-tiptap';

export type RichTextFieldProps = {
  label?: string;
  value: string; // HTML
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

export default function RichTextFieldInner({ label, value, onChange, placeholder, minHeight = 80 }: RichTextFieldProps) {
  // Disable all tooltip triggers within this editor (right panel) to avoid popups
  const noTooltipTheme = React.useMemo(() => createTheme({
    components: {
      MuiTooltip: {
        defaultProps: {
          disableHoverListener: true,
          disableFocusListener: true,
          disableTouchListener: true,
        },
      },
    },
  }), []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      FontSize,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { rel: 'noopener noreferrer nofollow' },
      }),
      Placeholder.configure({ placeholder: placeholder || '' }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: `min-height:${minHeight}px; outline:none;`,
      },
    },
  }, [value, placeholder, minHeight]);

  React.useEffect(() => {
    if (!editor) return;
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
          {/* Minimal compact toolbar (no tooltips due to ThemeProvider overrides) */}
          <MenuControlsContainer sx={{ mb: 0.5 }}>
            <MenuSelectFontSize />
            <MenuButtonTextColor />
            <MenuButtonBold />
            <MenuButtonItalic />
            <MenuButtonBulletedList />
            <MenuButtonOrderedList />
            <MenuButtonEditLink />
          </MenuControlsContainer>
          {/* Render the Tiptap EditorContent directly */}
          <Box sx={{ minHeight }}>
            <EditorContent editor={editor} />
          </Box>
        </RichTextEditorProvider>
      </Box>
    </ThemeProvider>
  );
}
