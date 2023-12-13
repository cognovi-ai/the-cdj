import { Avatar, Box, Button, Checkbox, Container, FormControlLabel, Grid } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import { AltRoute } from '@mui/icons-material';

import MenuLink from '../../../components/nav/menus/MenuLink';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useAccess } from '../../../hooks/useAccess';
import { useJournal } from '../../../context/useJournal';
import { useState } from 'react';

function Copyright(props) {
    return (
        <Typography align="center" color="text.secondary" variant="body2" {...props}>
            {'© 2023 '}
            <MenuLink
                page={{
                    label: 'The Cognitive Distortion Journal',
                    name: '',
                    visibility: ''
                }} />
        </Typography>
    );
}

export default function Login() {
    const [isRememberMeChecked, setIsRememberMeChecked] = useState(false);

    const { setJournalId, setJournalTitle } = useJournal();

    const access = useAccess();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        if (!isRememberMeChecked) {
            localStorage.removeItem('token');
        }

        try {
            const data = await access(
                '/login',
                'POST',
                { 'Content-Type': 'application/json' },
                {
                    email: formData.get('email'),
                    password: formData.get('password'),
                    remember: isRememberMeChecked === true,
                });

            // Set the journal ID and title in the context
            setJournalId(data.journalId);
            setJournalTitle(data.journalTitle);

            if (data.token) {
                localStorage.setItem('token', data.token);
            }

            // Navigate back to the previous page
            const previousPage = location.state?.from || '/entries';
            navigate(previousPage);

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
                    Sign in
                </Typography>
                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        autoComplete="email"
                        autoFocus
                        fullWidth
                        id="email"
                        label="Email Address"
                        margin="normal"
                        name="email"
                        required
                    />
                    <TextField
                        autoComplete="current-password"
                        fullWidth
                        id="password"
                        label="Password"
                        margin="normal"
                        name="password"
                        required
                        type="password"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isRememberMeChecked}
                                color="primary"
                                onChange={() => setIsRememberMeChecked(!isRememberMeChecked)}
                            />
                        }
                        label="Remember me"
                    />
                    <Button
                        fullWidth
                        sx={{ mt: 3, mb: 2 }}
                        type="submit"
                        variant="contained"
                    >
                        Sign In
                    </Button>
                    <Grid container>
                        <Grid item xs>
                            <MenuLink
                                page={{
                                    label: 'Forgot password?',
                                    name: 'forgot-password',
                                    visibility: 'public'
                                }} />
                        </Grid>
                        <Grid item>
                            <MenuLink
                                page={{
                                    label: 'Don\'t have an account? Sign Up',
                                    name: 'register',
                                    visibility: 'public'
                                }} />
                        </Grid>
                    </Grid>
                </Box>
            </Box>
            <Copyright sx={{ mt: 8, mb: 4 }} />
        </Container>
    );
}