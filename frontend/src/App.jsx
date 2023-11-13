import './App.css'

import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

import Header from './components/body/Header';
import Footer from './components/body/Footer';
import { Outlet } from 'react-router-dom';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#282828',
    },
  },
});

export default function App() {
  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={lightTheme}>
        <Header />
        <Box sx={{ minHeight: '100vh' }}>
          <Outlet />
        </Box>
        <Footer />
      </ThemeProvider>
    </>
  )
}