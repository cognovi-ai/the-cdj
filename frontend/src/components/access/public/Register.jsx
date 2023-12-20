import { Avatar, Box, Button, Container, Grid } from '@mui/material';

import { AltRoute } from '@mui/icons-material';

import Copyright from '../../utils/Copyright';
import MenuLink from '../../../components/nav/menus/MenuLink';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useAccess } from '../../../hooks/useAccess';
import { useJournal } from '../../../contexts/useJournal';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const { setJournalId, setJournalTitle } = useJournal();

    const access = useAccess();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        try {
            const data = await access(
                '/register',
                'POST',
                { 'Content-Type': 'application/json' },
                {
                    fname: formData.get('firstName'),
                    lname: formData.get('lastName'),
                    email: formData.get('email'),
                    password: formData.get('password'),
                });

            // Set the journal ID and title in the context
            setJournalId(data.journalId);
            setJournalTitle(data.journalTitle);

            // Redirect to the entries page
            navigate('/entries', { replace: true });

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
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
                <Typography variant="h1">
                    Sign up
                </Typography>
                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item sm={6} xs={12}>
                            <TextField
                                autoComplete="given-name"
                                autoFocus
                                fullWidth
                                id="firstName"
                                label="First Name"
                                name="firstName"
                                required
                            />
                        </Grid>
                        <Grid item sm={6} xs={12}>
                            <TextField
                                autoComplete="family-name"
                                fullWidth
                                id="lastName"
                                label="Last Name"
                                name="lastName"
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                autoComplete="email"
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                autoComplete="new-password"
                                fullWidth
                                id="password"
                                label="Password"
                                name="password"
                                required
                                type="password"
                            />
                        </Grid>
                    </Grid>
                    <Button
                        fullWidth
                        sx={{ mt: 3, mb: 2 }}
                        type="submit"
                        variant="contained"
                    >
                        Sign Up
                    </Button>
                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <MenuLink
                                page={{
                                    label: 'Already have an account? Sign in',
                                    name: 'login',
                                    visibility: 'public'
                                }} />
                        </Grid>
                    </Grid>
                </Box>
            </Box>
            <Copyright sx={{ mt: 5 }} />
        </Container>
    );
}