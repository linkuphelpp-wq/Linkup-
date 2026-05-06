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
    primary: { main: '#4361ee' }, // أزرق ملكي فخم
    secondary: { main: '#f72585' },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  shape: { borderRadius: 20 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.02)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
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
          '&:hover': { boxShadow: '0 4px 12px rgba(67,97,238,0.15)' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 28,
            background: '#f8fafc',
            '& fieldset': { borderColor: '#e2e8f0' },
            '&:hover fieldset': { borderColor: '#4361ee' },
          },
        },
      },
    },
  },
});

export default themeLight;