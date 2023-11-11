import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';

import TitleUnstacked from './TitleUnstacked';
import TitleStacked from './TitleStacked';
import NavMenuStacked from './NavMenuStacked';
import NavMenuUnstacked from './NavMenuUnstacked';
import UserMenu from './UserMenu';

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

    const handleCloseNavMenu = (event) => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <AppBar position="fixed" >
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <TitleUnstacked />
                    <NavMenuUnstacked pages={pages}
                        handleCloseNavMenu={handleCloseNavMenu} />

                    <NavMenuStacked pages={pages}
                        handleOpenNavMenu={handleOpenNavMenu}
                        handleCloseNavMenu={handleCloseNavMenu}
                        anchorElNav={anchorElNav} />
                    <TitleStacked />

                    <UserMenu settings={settings}
                        handleOpenUserMenu={handleOpenUserMenu}
                        handleCloseUserMenu={handleCloseUserMenu}
                        anchorElUser={anchorElUser} />
                </Toolbar>
            </Container>
        </AppBar>
    );
}
