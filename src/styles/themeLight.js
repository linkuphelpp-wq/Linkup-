import { createTheme } from '@mui/material/styles';

const themeLight = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Tajawal, sans-serif',
    h6: { fontWeight: 700 },
    body1: { fontWeight: 500 },
  },
  palette: {
    mode: 'light',
    primary: { main: '#2563eb' }, // أزرق ملكي واضح
    secondary: { main: '#db2777' },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    divider: '#e2e8f0',
  },
  shape: { borderRadius: 20 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.02)',
          border: '1px solid #f1f5f9',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#ffffff',
          boxShadow: 'none',
          borderBottom: '1px solid #e2e8f0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 40,
          padding: '10px 20px',
          boxShadow: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 28,
            background: '#ffffff',
            '& fieldset': { borderColor: '#cbd5e1' },
            '&:hover fieldset': { borderColor: '#2563eb' },
          },
        },
      },
    },
  },
});

export default themeLight;