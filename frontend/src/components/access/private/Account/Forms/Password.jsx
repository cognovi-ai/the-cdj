import * as React from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export default function Password() {
    return (
        <React.Fragment>
            <Typography gutterBottom variant="h6">
                Password
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        autoComplete="old-password"
                        fullWidth
                        id="oldPassword"
                        label="Old Password"
                        required
                        variant="standard"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        autoComplete="new-password"
                        fullWidth
                        id="newPassword"
                        label="New Password"
                        required
                        variant="standard"
                    />
                </Grid>
            </Grid>
        </React.Fragment>
    );
}