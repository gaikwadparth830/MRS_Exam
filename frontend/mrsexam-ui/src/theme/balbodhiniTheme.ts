import { createTheme } from '@mui/material'

export const balbodhiniTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0b4f6c',
      light: '#1a6f92',
      dark: '#07384d',
      contrastText: '#f7fafc',
    },
    secondary: {
      main: '#b45309',
      light: '#d97706',
      dark: '#92400e',
      contrastText: '#fff8f1',
    },
    success: {
      main: '#1f6f54',
    },
    warning: {
      main: '#b45309',
    },
    error: {
      main: '#9f1239',
    },
    background: {
      default: '#eef3f6',
      paper: '#ffffff',
    },
    text: {
      primary: '#12263a',
      secondary: '#4b6174',
    },
    divider: 'rgba(11, 79, 108, 0.12)',
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Noto Sans Devanagari", "Segoe UI", sans-serif',
    h1: {
      fontFamily: '"Source Serif 4", "Noto Serif Devanagari", Georgia, serif',
      fontWeight: 650,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Source Serif 4", "Noto Serif Devanagari", Georgia, serif',
      fontWeight: 650,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontFamily: '"Source Serif 4", "Noto Serif Devanagari", Georgia, serif',
      fontWeight: 650,
    },
    h4: {
      fontFamily: '"Source Serif 4", "Noto Serif Devanagari", Georgia, serif',
      fontWeight: 650,
    },
    h5: {
      fontFamily: '"Source Serif 4", "Noto Serif Devanagari", Georgia, serif',
      fontWeight: 650,
    },
    h6: {
      fontFamily: '"Source Serif 4", "Noto Serif Devanagari", Georgia, serif',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
    overline: {
      letterSpacing: '0.14em',
      fontWeight: 700,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(circle at 0% 0%, rgba(11, 79, 108, 0.08), transparent 42%), radial-gradient(circle at 100% 0%, rgba(180, 83, 9, 0.06), transparent 36%), linear-gradient(180deg, #f5f8fa 0%, #e8eef3 100%)',
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingInline: 16,
        },
        containedPrimary: {
          backgroundImage: 'linear-gradient(180deg, #13607f 0%, #0b4f6c 100%)',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(11, 79, 108, 0.1)',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: '1px solid rgba(11, 79, 108, 0.1)',
          boxShadow: '0 12px 30px rgba(18, 38, 58, 0.06)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.9)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(11, 79, 108, 0.04)',
        },
      },
    },
  },
})
