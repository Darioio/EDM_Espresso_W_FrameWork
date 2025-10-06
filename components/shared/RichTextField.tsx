import React from 'react';
import dynamic from 'next/dynamic';
import { Box, Typography, Paper } from '@mui/material';

export type RichTextFieldProps = {
  label?: string;
  value: string; // HTML
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
};

const ClientRichText = dynamic(() => import('./RichTextFieldInner'), { ssr: false });

export default function RichTextField({ label, value, onChange, placeholder, minHeight = 80, className }: RichTextFieldProps) {
  return (
    <Box>
      {label ? (
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>{label}</Typography>
      ) : null}
      <Paper variant="outlined" sx={{ p: 1, borderRadius: 1 }}>
        {typeof window === 'undefined' ? (
          <Box className={className} sx={{ minHeight }} dangerouslySetInnerHTML={{ __html: value || '' }} />
        ) : (
          <ClientRichText label={undefined} value={value} onChange={onChange} placeholder={placeholder} minHeight={minHeight} className={className} />
        )}
      </Paper>
    </Box>
  );
}
