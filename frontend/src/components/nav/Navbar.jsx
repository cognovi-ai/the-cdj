import { AppBar, Container, Toolbar } from '@mui/material';

import NavMenuStacked from './menus/NavMenuStacked';
import NavMenuUnstacked from './menus/NavMenuUnstacked';
import TitleStacked from './TitleStacked';
import TitleUnstacked from './TitleUnstacked';
import UserMenu from './menus/UserMenu';

import { useState } from 'react';

const pages = ['Home', 'Entries'];
const settings = ['Account', 'Logout'];

export default function Navbar() {
    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);

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

    return (
        <AppBar position="sticky" >
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <TitleUnstacked />
                    <NavMenuUnstacked handleCloseNavMenu={handleCloseNavMenu}
                        pages={pages} />

                    <NavMenuStacked anchorElNav={anchorElNav}
                        handleCloseNavMenu={handleCloseNavMenu}
                        handleOpenNavMenu={handleOpenNavMenu}
                        pages={pages} />
                    <TitleStacked />

                    <UserMenu anchorElUser={anchorElUser}
                        handleCloseUserMenu={handleCloseUserMenu}
                        handleOpenUserMenu={handleOpenUserMenu}
                        settings={settings} />
                </Toolbar>
            </Container>
        </AppBar>
    );
}
