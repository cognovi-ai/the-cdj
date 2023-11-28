import * as React from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export default function Profile() {
    return (
        <React.Fragment>
            <Typography gutterBottom variant="h6">
                Profile
            </Typography>
            <Grid container spacing={3}>
                <Grid item sm={6} xs={12}>
                    <TextField
                        autoComplete="first-name"
                        fullWidth
                        id="firstName"
                        label="First name"
                        name="firstName"
                        required
                        variant="standard"
                    />
                </Grid>
                <Grid item sm={6} xs={12}>
                    <TextField
                        autoComplete="last-name"
                        fullWidth
                        id="lastName"
                        label="Last name"
                        name="lastName"
                        required
                        variant="standard"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        autoComplete="email"
                        fullWidth
                        id="email"
                        label="Email"
                        name="email"
                        required
                        variant="standard"
                    />
                </Grid>
            </Grid>
        </React.Fragment>
    );
}