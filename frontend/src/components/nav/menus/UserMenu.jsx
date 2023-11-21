import { Avatar, Box, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material';

import MenuLink from './MenuLink';

export default function UserMenu({
    navItems = {},
    handleOpenUserMenu,
    handleCloseUserMenu,
    anchorElUser }) {
    return (
        <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorElUser}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                id="menu-appbar"
                keepMounted
                onClose={handleCloseUserMenu}
                open={Boolean(anchorElUser)}
                sx={{ mt: '45px' }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                {navItems.pages.map((page) => (
                    <MenuItem key={page} onClick={handleCloseUserMenu}>
                        <Typography textAlign="center">
                            <MenuLink page={page} />
                        </Typography>
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    )
}