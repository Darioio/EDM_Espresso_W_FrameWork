import React from 'react';
import { Box, Typography } from '@mui/material';
import { useEditor } from '@tiptap/react';
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
    <Box>
      {label ? (
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>{label}</Typography>
      ) : null}
      <RichTextEditorProvider editor={editor}>
        {/* Minimal compact toolbar */}
        <MenuControlsContainer sx={{ mb: 0.5 }}>
          <MenuSelectFontSize />
          <MenuButtonTextColor />
          <MenuButtonBold />
          <MenuButtonItalic />
          <MenuButtonBulletedList />
          <MenuButtonOrderedList />
          <MenuButtonEditLink />
        </MenuControlsContainer>
        <MUIRichTextField variant="outlined" controls={null} />
      </RichTextEditorProvider>
    </Box>
  );
}
