import { Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import MenuLink from './MenuLink';
import { useJournal } from '../../../context/useJournal';

export default function NavMenuUnstacked({ navItems = {}, handleCloseNavMenu }) {
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
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {navItems.pages.map((page) => (
                visibleLinks[page.name] && (
                    <Button
                        key={page.name}
                        onClick={handleCloseNavMenu}
                        sx={{ my: 2, color: 'white', display: 'block' }}
                    >
                        <MenuLink page={page} />
                    </Button>
                )
            ))}
        </Box>
    );
}
