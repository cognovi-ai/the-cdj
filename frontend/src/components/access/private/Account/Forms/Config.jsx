import { Grid, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { useState } from 'react';

const configFields = [
    { key: 'model', label: 'LLM model', helperText: 'OpenAI models are currently only supported', type: 'text' },
    { key: 'apiKey', label: 'API key', helperText: 'Retrieve your API key at https://platform.openai.com/api-keys', type: 'password' },
];

export default function Config({ config, setConfig }) {
    const [showApiKey, setShowApiKey] = useState(false);

    const handleConfigChange = (event) => {
        const { name, value } = event.target;
        setConfig(prevConfig => ({ ...prevConfig, [name]: value }));
    };

    const toggleApiKeyVisibility = () => setShowApiKey(!showApiKey);

    return (
        <>
            <Typography gutterBottom variant="h6">
                Config
            </Typography>
            <Grid container spacing={3}>
                {configFields.map(({ key, label, helperText, type }) => (
                    <Grid item key={key} xs={12}>
                        <TextField
                            InputProps={key === 'apiKey' ? {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            edge="end"
                                            onClick={toggleApiKeyVisibility}
                                        >
                                            {showApiKey ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            } : undefined}
                            fullWidth
                            helperText={helperText}
                            id={key}
                            label={label}
                            name={key}
                            onChange={handleConfigChange}
                            required
                            type={key === 'apiKey' && showApiKey ? 'text' : type}
                            value={config[key] || ''}
                            variant="standard"
                        />
                    </Grid>
                ))}
            </Grid>
        </>
    );
}
