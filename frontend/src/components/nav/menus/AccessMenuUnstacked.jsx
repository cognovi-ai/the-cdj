import { Box, Button } from '@mui/material';

import MenuLink from './MenuLink';

export default function AccessMenuUnstacked({ navItems = {}, handleCloseNavMenu }) {
    return (
        <Box
            sx={{
                alignItems: 'flex-end',
                display: { xs: 'none', md: 'flex' }
            }}
        >
            {navItems.pages.map((page) => (
                <Button
                    key={page}
                    onClick={handleCloseNavMenu}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                >
                    <MenuLink
                        page={page}
                    />
                </Button>
            ))}
        </Box>
    )
}