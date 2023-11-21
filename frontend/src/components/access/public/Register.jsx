import { Avatar, Box, Button, Container, Grid } from '@mui/material';

import { AltRoute } from '@mui/icons-material';

import MenuLink from '../../../components/nav/menus/MenuLink';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

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

export default function Register() {
    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        try {
            // Construct the URL with the specific journal ID
            const url = 'http://192.168.50.157:3000/access/register';

            const response = await fetch(url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fname: formData.get('firstName'),
                        lname: formData.get('lastName'),
                        email: formData.get('email'),
                        password: formData.get('password'),
                    }),
                });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log(data);

            // Redirect to the entries page
            window.location.replace('/entries');

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
                                label={'Already have an account? Sign in'}
                                page="login" />
                        </Grid>
                    </Grid>
                </Box>
            </Box>
            <Copyright sx={{ mt: 5 }} />
        </Container>
    );
}