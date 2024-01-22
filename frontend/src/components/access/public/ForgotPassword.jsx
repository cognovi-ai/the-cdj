import { Avatar, Box, Button, Container, Grid } from '@mui/material';

import { AltRoute } from '@mui/icons-material';

import Copyright from '../../utils/Copyright';
import MenuLink from '../../../components/nav/menus/MenuLink';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useAccess } from '../../../hooks/useAccess';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
    const access = useAccess();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get('email');

        // Check if the email field is empty
        if (!email.trim()) {
            return;
        }

        try {
            await access(
                '/forgot-password',
                'POST',
                { 'Content-Type': 'application/json' },
                { email });

            navigate('/login', { replace: true });
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
                <Typography
                    sx={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        lineHeight: 2.0,
                    }}
                    variant="h5"
                >
                    Forgot password
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
                    <Button
                        fullWidth
                        sx={{ mt: 3, mb: 2 }}
                        type="submit"
                        variant="contained"
                    >
                        Send recovery email
                    </Button>
                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <MenuLink
                                page={{
                                    label: 'Remember your password? Sign in',
                                    name: 'login',
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