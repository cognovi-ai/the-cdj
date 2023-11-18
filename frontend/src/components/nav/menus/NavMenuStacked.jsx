import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';

import { Menu as MenuIcon } from '@mui/icons-material';
import MenuLink from './MenuLink';

export default function NavMenuStacked({
    pages = [],
    handleOpenNavMenu,
    handleCloseNavMenu,
    anchorElNav }) {
    return (
        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
                aria-controls="menu-appbar"
                aria-haspopup="true"
                aria-label="account of current user"
                color="inherit"
                onClick={handleOpenNavMenu}
                size="large"
            >
                <MenuIcon />
            </IconButton>
            <Menu
                anchorEl={anchorElNav}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                id="menu-appbar"
                keepMounted
                onClose={handleCloseNavMenu}
                open={Boolean(anchorElNav)}
                sx={{
                    display: { xs: 'block', md: 'none' },
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                {pages.map((page) => (
                    <MenuItem key={page} onClick={handleCloseNavMenu}>
                        <Typography textAlign="center">
                            <MenuLink page={page} />
                        </Typography>
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    )
}