import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

export default function Footer() {
    return (
        <Box sx={{
            position: 'fixed',
            bottom: 0,
            width: '100%',
        }}>
            <AppBar position="static" color="primary">
                <Toolbar>
                    <h5>
                        © 2023 The Cognitive Distortion Journal
                    </h5>
                </Toolbar>
            </AppBar>
        </Box>
    );
}