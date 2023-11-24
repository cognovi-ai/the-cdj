import { Avatar, Box, Button, Checkbox, Container, FormControlLabel, Grid } from '@mui/material';

import { AltRoute } from '@mui/icons-material';

import MenuLink from '../../../components/nav/menus/MenuLink';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useJournal } from '../../../context/useJournal';
import { useNavigate } from 'react-router-dom';

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
    const { setJournalId, setJournalTitle } = useJournal();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        try {
            // Construct the URL with the specific journal ID
            const url = 'http://192.168.50.157:3000/access/login';

            const response = await fetch(url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formData.get('email'),
                        password: formData.get('password'),
                    }),
                    credentials: 'include',
                });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // Set the journal ID and title in the context
            setJournalId(data.journalId);
            setJournalTitle(data.journalTitle);

            // Redirect to the entries page
            navigate('/entries', { replace: true });

        } catch (error) {
            console.error('Error:', error);
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
                        control={<Checkbox color="primary" value="remember" />}
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