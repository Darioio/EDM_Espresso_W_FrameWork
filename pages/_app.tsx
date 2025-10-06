import type { AppProps } from 'next/app';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import '../styles/module.css';
import 'prismjs/themes/prism.css';

// MUI foundation setup
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeMode, ThemeModeContext } from '../lib/ThemeModeContext';

function makeTheme(mode: ThemeMode) {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      background: {
        default: isDark ? '#0b0f14' : '#f5f6fa',
        paper: isDark ? '#0f141a' : '#fff',
      },
      primary: {
        main: '#718ec0',
        dark: '#3f5b80',
      },
    },
    typography: {
      fontFamily: "'Montserrat', Arial, 'Helvetica Neue', Helvetica, sans-serif",
      fontSize: 12,
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
  MuiSelect: { defaultProps: { size: 'small', variant: 'outlined' } },
      MuiSlider: { defaultProps: { size: 'small' } },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 6 } } },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            backgroundColor: isDark ? '#11161d' : '#fff',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#0b0f14' : '#F5F6FA',
            boxShadow: 'none',
            borderBottom: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'
          }
        }
      }
    },
  });
}

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [mode, setMode] = useState<ThemeMode>('light');

  // Initialize from localStorage or prefers-color-scheme
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? (localStorage.getItem('edm-theme-mode') as ThemeMode | null) : null;
      if (saved === 'light' || saved === 'dark') {
        setMode(saved);
        return;
      }
    } catch {}
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const theme = useMemo(() => makeTheme(mode), [mode]);
  const ctx = useMemo(() => ({
    mode,
    toggle: () => {
      setMode((m) => {
        const next = m === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem('edm-theme-mode', next); } catch {}
        return next;
      });
    }
  }), [mode]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', mode);
    }
  }, [mode]);

  return (
    <ThemeModeContext.Provider value={ctx}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div key={router.asPath} className="page-fade">
          <Component {...pageProps} />
        </div>
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
