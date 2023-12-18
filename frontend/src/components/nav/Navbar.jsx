import { AppBar, Container, Toolbar } from '@mui/material';
import { useEffect, useState } from 'react';

import AccessMenuUnstacked from './menus/AccessMenuUnstacked';
import NavMenuStacked from './menus/NavMenuStacked';
import NavMenuUnstacked from './menus/NavMenuUnstacked';
import TitleStacked from './TitleStacked';
import TitleUnstacked from './TitleUnstacked';
import UserMenu from './menus/UserMenu';

import { useJournal } from '../../contexts/useJournal';
import { useTheme } from '@mui/material/styles';

const navItems = {
    navMenu: {
        pages: [
            { name: 'Home', visibility: '' },
            { name: 'Entries', visibility: 'private' }]
    },
    accessMenu: {
        pages: [
            { name: 'Login', visibility: 'public' },
            { name: 'Register', visibility: 'public' }]
    },
    userMenu: {
        pages: [
            { name: 'Account', visibility: 'private' },
            { name: 'Logout', visibility: 'private' }]
    },
}

export default function Navbar() {
    const { journalId } = useJournal();
    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [visibleLinks, setVisibleLinks] = useState({});

    const theme = useTheme();

    useEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => {
            // Clean up the event listener
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleResize = () => {
        // Close the hamburger menu when screen size is md or greater
        if (window.innerWidth >= theme.breakpoints.values.md) {
            setAnchorElNav(null);
        }
    };

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleVisibilityChange = (pageName, isVisible) => {
        setVisibleLinks(prev => ({ ...prev, [pageName]: isVisible }));
    };

    return (
        <AppBar position="sticky" >
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <TitleUnstacked />
                    <NavMenuUnstacked
                        handleCloseNavMenu={handleCloseNavMenu}
                        navItems={navItems.navMenu}
                        onVisibilityChange={handleVisibilityChange}
                        visibleLinks={visibleLinks}
                    />

                    <NavMenuStacked
                        anchorElNav={anchorElNav}
                        handleCloseNavMenu={handleCloseNavMenu}
                        handleOpenNavMenu={handleOpenNavMenu}
                        navItems={{
                            pages:
                                [...navItems.navMenu.pages,
                                ...navItems.accessMenu.pages]
                        }}
                    />
                    <TitleStacked />

                    <AccessMenuUnstacked
                        handleCloseNavMenu={handleCloseNavMenu}
                        navItems={navItems.accessMenu}
                    />
                    {journalId && (
                        <UserMenu
                            anchorElUser={anchorElUser}
                            handleCloseUserMenu={handleCloseUserMenu}
                            handleOpenUserMenu={handleOpenUserMenu}
                            navItems={navItems.userMenu}
                        />
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
}
