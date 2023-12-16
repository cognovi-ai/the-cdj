import './Footer.css';

import { BottomNavigation, Box } from '@mui/material';

export default function Footer() {
    return (
        <Box className="footer">
            <BottomNavigation sx={{ backgroundColor: '#282828', height: '100%', }}>
                <h5>
                    © 2023 The Cognitive Distortion Journal
                </h5>
            </BottomNavigation>
        </Box >
    );
}