import { Box, Button } from '@mui/material';

import MenuLink from './MenuLink';

export default function AccessMenuUnstacked({ access = [], handleCloseNavMenu }) {
    return (
        <Box
            sx={{
                alignItems: 'flex-end',
                display: { xs: 'none', md: 'flex' }
            }}
        >
            {access.map((page) => (
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