import './App.css'

import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles';

import Header from './components/Header';
import Footer from './components/Footer';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
  },
});

export default function App() {
  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={darkTheme}>
        <Header />
        <Footer />
      </ThemeProvider>
    </>
  )
}