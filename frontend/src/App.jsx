import './App.css'

import { Body, Document } from './styles/components';
import { CssBaseline } from '@mui/material';

import FlashMessages from './components/utils/FlashMessages.jsx';
import Footer from './components/body/Footer';
import Header from './components/body/Header';

import { JournalProvider } from './contexts/JournalProvider.jsx';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './styles/theme.jsx'

export default function App() {
  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <Document>
          <JournalProvider>
            <Header />
            <Body>
              <FlashMessages />
              <Outlet />
            </Body>
          </JournalProvider>
          <Footer />
        </Document>
      </ThemeProvider>
    </>
  )
}