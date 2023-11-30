import { Grid, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { useAccount } from '../../../../../context/useAccount';

import { useState } from 'react';

const passwordFields = [
    { key: 'oldPassword', label: 'Old password' },
    { key: 'newPassword', label: 'New password' },
];

export default function Password() {
    const [showPassword, setShowPassword] = useState({ oldPassword: false, newPassword: false });

    const { password, setPassword } = useAccount();

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;

        if (!value) {
            setPassword((prevPassword) => {
                delete prevPassword[name];
                return { ...prevPassword };
            });
        } else {
            setPassword((prevPassword) => ({
                ...prevPassword,
                [name]: value,
            }));
        }
    };

    const togglePasswordVisibility = (key) => {
        setShowPassword({ ...showPassword, [key]: !showPassword[key] });
    };

    return (
        <>
            <Typography gutterBottom variant="h6">
                Password
            </Typography>
            <Grid container spacing={3}>
                {passwordFields.map(({ key, label }) => (
                    <Grid item key={key} xs={12}>
                        <TextField
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label={`Toggle ${ label.toLowerCase() } visibility`}
                                            edge="end"
                                            onClick={() => togglePasswordVisibility(key)}
                                        >
                                            {showPassword[key] ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            fullWidth
                            id={key}
                            label={label}
                            name={key}
                            onChange={handlePasswordChange}
                            required
                            type={showPassword[key] ? 'text' : 'password'}
                            value={password[key] || ''}
                            variant="standard"
                        />
                    </Grid>
                ))}
            </Grid>
        </>
    );
}
