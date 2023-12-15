import './App.css'

import { Box, CssBaseline } from '@mui/material';

import FlashMessages from './components/utils/FlashMessages.jsx';
import Footer from './components/body/Footer';
import Header from './components/body/Header';

import { JournalProvider } from './context/JournalProvider.jsx';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './styles/Theme.jsx';

export default function App() {
  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <JournalProvider>
          <Header />
          <Box className="outlet" >
            <FlashMessages />
            <Outlet />
          </Box>
        </JournalProvider>
        <Footer />
      </ThemeProvider>
    </>
  )
}