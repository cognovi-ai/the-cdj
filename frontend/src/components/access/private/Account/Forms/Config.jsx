import { Button, FormControl, FormHelperText, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import PopupDialog from '../../../../utils/PopupDialog';

import { useAccess } from '../../../../../hooks/useAccess';

import { useAccount } from '../../../../../contexts/useAccount';
import { useJournal } from '../../../../../contexts/useJournal';
import { useState } from 'react';

const configFields = [
    { key: 'model', gpt: 'analysis', label: 'LLM analysis model', helperText: 'OpenAI models are currently only supported', type: 'select' },
    { key: 'model', gpt: 'chat', label: 'LLM chat model', helperText: 'OpenAI models are currently only supported', type: 'text' },
    { key: 'apiKey', label: 'API key', helperText: 'Retrieve your API key at https://platform.openai.com/api-keys', type: 'password' },
];

const analysisModels = [
    'gpt-3.5-turbo-1106', 'gpt-4-1106-preview',
];

export default function Config({ savedConfig, setSavedConfig }) {
    const [showApiKey, setShowApiKey] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const { config, setConfig } = useAccount();
    const { journalId } = useJournal();

    const access = useAccess();

    const handleConfigChange = (event) => {
        const { name, value } = event.target;

        setConfig((prevConfig) => {
            if (name === 'chat' || name === 'analysis') {
                return {
                    ...prevConfig,
                    model: {
                        ...prevConfig.model,
                        [name]: value,
                    },
                };
            }
            return {
                ...prevConfig,
                [name]: value,
            };
        });
    };

    const handleDeleting = async () => {
        setDeleting(true);
    }

    const deleteConfig = async () => {
        try {
            await access(
                `/${ journalId }/account?deletionItem=config`,
                'DELETE'
            );

            setConfig({});
            setSavedConfig({});

        } catch (error) {
            console.error(error);
        }
    }

    const toggleApiKeyVisibility = () => setShowApiKey(!showApiKey);

    const getConfigValue = (key, gpt) => {
        if (key === 'model') {
            return (config[key] && config[key][gpt] !== undefined) ? config[key][gpt] : (savedConfig[key] && savedConfig[key][gpt]) || '';
        } else {
            return config[key] !== undefined ? config[key] : savedConfig[key] || '';
        }
    };

    return (
        <>
            <Typography gutterBottom variant="h6">
                Config
            </Typography>
            <Grid container spacing={3}>
                {configFields.map(({ key, gpt, label, helperText, type }) => (
                    <Grid item key={gpt ? gpt : key} xs={12}>
                        {type === 'select' ? (
                            <FormControl fullWidth variant="standard">
                                <InputLabel>{label}</InputLabel>
                                <Select
                                    displayEmpty
                                    name={gpt}
                                    onChange={handleConfigChange}
                                    renderValue={(selected) => {
                                        return selected || undefined;
                                    }}
                                    value={getConfigValue(key, gpt)}
                                >
                                    <MenuItem key="none" value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {analysisModels.map((model) => (
                                        <MenuItem key={model} value={model}>
                                            {model}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{helperText}</FormHelperText>
                            </FormControl>
                        ) : (
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
                                id={gpt ? gpt : key}
                                label={label}
                                name={gpt ? gpt : key}
                                onChange={handleConfigChange}
                                required
                                type={key === 'apiKey' && showApiKey ? 'text' : type}
                                value={getConfigValue(key, gpt)}
                                variant="standard"
                            />
                        )}
                    </Grid>
                ))}
                <Grid item>
                    <Button
                        color="danger"
                        onClick={handleDeleting}
                        sx={{ mt: '10px' }}
                        variant="contained">Delete Config</Button>
                </Grid>
            </Grid>
            <PopupDialog
                action={deleteConfig}
                buttonAgree="Delete"
                buttonDeny="Cancel"
                description="Are you sure you want to delete your config? This action cannot be undone."
                open={deleting}
                setOpen={setDeleting}
                title="Delete Config"
            />
        </>
    );
}
