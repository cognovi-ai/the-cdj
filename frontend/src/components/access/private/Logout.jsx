import { Avatar, Box, Container, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { AltRoute } from '@mui/icons-material';

import MenuLink from '../../../components/nav/menus/MenuLink';

import { useJournal } from '../../../context/JournalContext';
import { useNavigate } from 'react-router-dom';

function Copyright(props) {
    return (
        <Typography align="center" color="text.secondary" variant="body2" {...props}>
            {'© 2023 '}
            <MenuLink
                label={'The Cognitive Distortion Journal'}
                page="" />
        </Typography>
    );
}

export default function Logout() {
    const { setJournalId, setJournalTitle } = useJournal();
    const [isLoggingOut, setIsLoggingOut] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const handleLogout = async () => {
            try {
                await fetch('http://192.168.50.157:3000/access/logout', {
                    credentials: 'include'
                });

                // Logout successful
                setTimeout(() => {
                    setIsLoggingOut(false);

                    // Clear the journal ID and title in the context
                    setJournalId('');
                    setJournalTitle('');
                }, 1000); // 2000 milliseconds delay    

                setTimeout(() => navigate('/login', { replace: true }), 2000); // 2000 milliseconds delay
            } catch (error) {
                console.error('Logout failed:', error);
                // Handle logout error here
            }
        };

        handleLogout();
    }, [navigate]);

    return (<Container component="main" maxWidth="xs">
        <Box
            sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Avatar sx={{ m: 1, bgcolor: '' }}>
                <AltRoute />
            </Avatar>

            {isLoggingOut ? <Typography variant="h3">Logging out, please wait...</Typography> : <Typography variant="h1">Logged out</Typography>}
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
    );
}
