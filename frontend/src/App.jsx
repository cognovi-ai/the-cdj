import './App.css'

import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import Footer from './components/body/Footer';
import Header from './components/body/Header';

import { Outlet } from 'react-router-dom';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#282828',
    },
    edit: {
      main: '#4fc3f7',
    },
    cancel: {
      main: '#f44336',
      contrastText: '#fff',
    },
    danger: {
      main: '#e57373',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    fontSize: 16,
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 2.0,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 3.0,
    },
    h3: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 4.0,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 2.0,
    },
    body2: {
      fontSize: '1rem',
      fontWeight: 300,
      lineHeight: 2.0,
    },
    caption: {
      fontSize: '0.8rem',
      fontWeight: 100,
      lineHeight: 2.0,
    },
  },
  // ...other theme configuration options
});

export default function App() {
  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <Header />
        <Box sx={{ minHeight: '100vh' }}>
          <Outlet />
        </Box>
        <Footer />
      </ThemeProvider>
    </>
  )
}