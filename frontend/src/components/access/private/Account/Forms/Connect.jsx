import * as React from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export default function Password() {
    return (
        <React.Fragment>
            <Typography gutterBottom variant="h6">
                Config
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        autoComplete="model"
                        fullWidth
                        helperText="OpenAI models are currently only supported"
                        id="model"
                        label="LLM Model"
                        required
                        variant="standard"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        autoComplete="api-key"
                        fullWidth
                        helperText="Retrieve your API key at https://platform.openai.com/api-keys"
                        id="apiKey"
                        label="API Key"
                        required
                        variant="standard"
                    />
                </Grid>
            </Grid>
        </React.Fragment>
    );
}