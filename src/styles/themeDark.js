import { createTheme } from '@mui/material/styles';

const themeDark = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Tajawal, sans-serif',
    h6: { fontWeight: 700 },
    body1: { fontWeight: 500 },
  },
  palette: {
    mode: 'dark',
    primary: { main: '#6366f1' },
    secondary: { main: '#f43f5e' },
    background: {
      default: '#0b0f19',
      paper: '#1e2432',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
  },
  shape: { borderRadius: 20 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.2)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(30,36,50,0.7)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
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
            background: '#1e2432',
            '& fieldset': { borderColor: '#334155' },
            '&:hover fieldset': { borderColor: '#6366f1' },
          },
        },
      },
    },
  },
});

export default themeDark;