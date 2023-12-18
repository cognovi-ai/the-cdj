import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { Menu as MenuIcon } from '@mui/icons-material';

import MenuLink from './MenuLink';

import { useJournal } from '../../../contexts/useJournal';

export default function NavMenuStacked({
    navItems = {},
    handleOpenNavMenu,
    handleCloseNavMenu,
    anchorElNav }) {
    const { journalId } = useJournal();
    const [visibleLinks, setVisibleLinks] = useState({});

    useEffect(() => {
        const updatedVisibility = {};

        navItems.pages.forEach(page => {
            if (!page.visibility) {
                updatedVisibility[page.name] = true;
            } else {
                updatedVisibility[page.name] = page.visibility === 'private' ? !!journalId : !journalId;
            }
        });

        setVisibleLinks(updatedVisibility);
    }, [journalId, navItems.pages]);

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
                {navItems.pages.map((page) => (
                    visibleLinks[page.name] && (
                        <MenuItem key={page.name} onClick={handleCloseNavMenu}>
                            <Typography textAlign="center">
                                <MenuLink page={page} />
                            </Typography>
                        </MenuItem>
                    )
                ))}
            </Menu>
        </Box>
    );
}
