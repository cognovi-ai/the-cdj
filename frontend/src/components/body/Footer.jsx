import { AppBar, Box, Toolbar } from '@mui/material';

export default function Footer() {
    return (
        <Box sx={{
            position: 'sticky',
            bottom: 0,
            width: '100%',
            minHeight: '100%',
        }}>
            <AppBar color="primary" position="static">
                <Toolbar>
                    <h5>
                        © 2023 The Cognitive Distortion Journal
                    </h5>
                </Toolbar>
            </AppBar>
        </Box>
    );
}