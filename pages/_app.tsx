import type { AppProps } from 'next/app';
import '../styles/globals.css';
import '../styles/module.css';
import 'prismjs/themes/prism.css';

// MUI foundation setup
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: { mode: 'light',
    background: {
      default: '#f5f6fa',
    },
   },
  typography: {
    fontFamily: "'Montserrat', Arial, 'Helvetica Neue', Helvetica, sans-serif",
    fontSize: 12
  },
  shape: { borderRadius: 6 },
  components: {
    MuiButton: {
      defaultProps: { size: 'medium', variant: 'contained', disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
          backgroundColor: 'var(--color-primary)',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: 'var(--color-primary-dark)'
          }
        }
      },
    },
    MuiIconButton: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          padding: 8,
          color: 'var(--icon-color)',
          transition: 'color 0.2s ease, background-color 0.2s ease',
          '&:hover': {
            color: 'var(--icon-color-hover)',
            backgroundColor: 'var(--icon-hover-bg)'
          }
        }
      },
    },
    MuiSvgIcon: { defaultProps: { fontSize: 'small', color: 'inherit' } },
    MuiTextField: { defaultProps: { size: 'small', variant: 'outlined' } },
    MuiSelect: { defaultProps: { size: 'small', variant: 'outlined' as any } },
    MuiSlider: { defaultProps: { size: 'small' } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 6 } } },
  },
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
