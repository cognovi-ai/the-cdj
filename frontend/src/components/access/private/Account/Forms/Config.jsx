import { Button, Grid, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import PopupDialog from '../../../../utils/PopupDialog';

import { useAccess } from '../../../../../hooks/useAccess';

import { useAccount } from '../../../../../context/useAccount';
import { useJournal } from '../../../../../context/useJournal';

import { useState } from 'react';

const configFields = [
    { key: 'model', label: 'LLM model', helperText: 'OpenAI models are currently only supported', type: 'text' },
    { key: 'apiKey', label: 'API key', helperText: 'Retrieve your API key at https://platform.openai.com/api-keys', type: 'password' },
];

export default function Config({ savedConfig }) {
    const [showApiKey, setShowApiKey] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const { config, setConfig } = useAccount();

    const { journalId } = useJournal();
    const access = useAccess();

    const handleConfigChange = (event) => {
        const { name, value } = event.target;
        setConfig((prevConfig) => ({
            ...prevConfig,
            [name]: value,
        }));
    };

    const handleDeleting = async () => {
        setDeleting(true);
    }

    const deleteConfig = async () => {
        try {
            access(`/${ journalId }/account?deletionItem=config`, 'DELETE');
            setConfig({});

        } catch (error) {
            console.error(error);
        }
    }

    const toggleApiKeyVisibility = () => setShowApiKey(!showApiKey);

    const getConfigValue = (key) => {
        return config[key] !== undefined ? config[key] : savedConfig[key] || '';
    };

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
                            value={getConfigValue(key)}
                            variant="standard"
                        />
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
