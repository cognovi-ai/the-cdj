import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#282828',
        },
        chat: {
            main: '#4fc3f7',
        },
        edit: {
            main: '#4fc3f7',
        },
        cancel: {
            main: '#f44336',
            contrastText: '#fff',
        },
        danger: {
            main: '#e63939',
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
            fontSize: '1.2rem',
            fontWeight: 600,
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

export { theme };