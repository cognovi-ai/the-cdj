import { Avatar, Box, Button, Container, Grid, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AltRoute from '@mui/icons-material/AltRoute'; // Import appropriate icon
import MenuLink from '../../../components/nav/menus/MenuLink';

import { useAccess } from '../../../hooks/useAccess';
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

export default function ResetPassword() {
    const [passwords, setPasswords] = useState({ newPassword: '', confirmNewPassword: '' });
    const [showPassword, setShowPassword] = useState({ newPassword: false, confirmNewPassword: false });
    const [error, setError] = useState('');

    const [searchParams] = useSearchParams();

    const access = useAccess();
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        if (passwords.newPassword !== passwords.confirmNewPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');

        const formData = new FormData(event.currentTarget);
        const token = searchParams.get('token');
        const newPassword = formData.get('newPassword');

        // Send the token and new password to the server
        access(
            '/reset-password',
            'POST',
            { 'Content-Type': 'application/json' },
            { token, newPassword }
        )
            .then(() => {
                navigate('/login', { replace: true });
            })
            .catch((error) => {
                console.error(error);
            });

    };

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;
        setPasswords({ ...passwords, [name]: value });
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword({ ...showPassword, [field]: !showPassword[field] });
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
                    Reset password
                </Typography>
                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="Toggle new password visibility"
                                        onClick={() => togglePasswordVisibility('newPassword')}
                                    >
                                        {showPassword.newPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        autoFocus
                        fullWidth
                        label="New Password"
                        margin="normal"
                        name="newPassword"
                        onChange={handlePasswordChange}
                        required
                        type={showPassword.newPassword ? 'text' : 'password'}
                        value={passwords.newPassword}
                    />
                    <TextField
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="Toggle confirm new password visibility"
                                        onClick={() => togglePasswordVisibility('confirmNewPassword')}
                                    >
                                        {showPassword.confirmNewPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        fullWidth
                        label="Confirm New Password"
                        margin="normal"
                        name="confirmNewPassword"
                        onChange={handlePasswordChange}
                        required
                        type={showPassword.confirmNewPassword ? 'text' : 'password'}
                        value={passwords.confirmNewPassword}
                    />
                    {error && (
                        <Typography color="error" sx={{ mt: 2 }}>
                            {error}
                        </Typography>
                    )}
                    <Button
                        fullWidth
                        sx={{ mt: 3, mb: 2 }}
                        type="submit"
                        variant="contained"
                    >
                        Reset Password
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
