import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

type LabeledSelectProps = Omit<TextFieldProps, 'label' | 'id' | 'select'> & {
  idBase: string;
  label: string;
  fullWidth?: boolean;
};

// LabeledSelect renders a TextField with select enabled, using the app's standard
// underline styling to match fields like "Description Source".
export default function LabeledSelect({ idBase, label, fullWidth = true, children, ...textFieldProps }: LabeledSelectProps) {
  const selectId = `${idBase}-select`;
  const labelId = `${idBase}-label`;
  return (
    <TextField
      select
      fullWidth={fullWidth}
      label={label}
      // Associate the label and the select for a11y/autofill correctness
      id={selectId}
      name={(textFieldProps as any)?.name ?? idBase}
      // For non-native MUI Select, link by labelId instead of htmlFor
      InputLabelProps={{ id: labelId }}
      SelectProps={{
        labelId,
        id: selectId
      }}
      variant="standard"
      sx={{ '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' }, '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-primary)' } }}
      {...textFieldProps}
    >
      {children}
    </TextField>
  );
}
