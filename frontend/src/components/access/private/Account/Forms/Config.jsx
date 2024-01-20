import { Button, FormControl, FormHelperText, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import PopupDialog from '../../../../utils/PopupDialog';

import { useAccount } from '../../../../../contexts/useAccount';
import { useState } from 'react';

const configFields = [
    { key: 'model', gpt: 'analysis', label: 'LLM analysis model', helperText: 'Used to analyze thoughts and for metadata processing', type: 'select' },
    { key: 'model', gpt: 'chat', label: 'LLM chat model', helperText: 'Used as the therapy assistant in chat', type: 'select' },
];

const models = {
    analysis: ['gpt-3.5-turbo-1106', 'gpt-4-1106-preview',],
    chat: ['gpt-3.5-turbo', 'gpt-3.5-turbo-16k', 'gpt-4', 'gpt-4-32k'],
};

export default function Config({ savedConfig }) {
    const [visible, setVisible] = useState(false);
    const [recommending, setRecommending] = useState(false);

    const { config, setConfig } = useAccount();

    const handleConfigChange = (event) => {
        const { name, value } = event.target;

        setConfig((prevConfig) => {
            return {
                ...prevConfig,
                model: {
                    ...prevConfig.model,
                    [name]: value,
                },
            };
        });
    };

    const handleRecommending = async () => {
        setRecommending(true);
    }

    const recommendConfig = async () => {
        const recommendedConfig = {
            model: {
                analysis: 'gpt-3.5-turbo-1106',
                chat: 'gpt-4',
            },
        };

        setConfig(recommendedConfig);
        setRecommending(false);
    }

    const toggleVisibility = () => setVisible(!visible);

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
                                    {gpt === 'analysis' ? models.analysis.map((model) => (
                                        <MenuItem key={model} value={model}>
                                            {model}
                                        </MenuItem>
                                    )) : models.chat.map((model) => (
                                        <MenuItem key={model} value={model}>
                                            {model}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{helperText}</FormHelperText>
                            </FormControl>
                        ) : (
                            <TextField
                                InputProps={key === 'sensitive' ? {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                edge="end"
                                                onClick={toggleVisibility}
                                            >
                                                {visible ? <VisibilityOff /> : <Visibility />}
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
                                type={key === 'sensitive' && visible ? 'text' : type}
                                value={getConfigValue(key, gpt)}
                                variant="standard"
                            />
                        )}
                    </Grid>
                ))}
                <Grid item>
                    <Button
                        color="info"
                        onClick={handleRecommending}
                        sx={{ mt: '10px' }}
                        variant="contained">Recommend</Button>
                </Grid>
            </Grid>
            <PopupDialog
                action={recommendConfig}
                buttonAgree="Accept"
                buttonDeny="No thanks"
                description="For the optimal experience, we recommend using gpt-3.5-turbo-1106 for speed and gpt-4 for brevity."
                open={recommending}
                setOpen={setRecommending}
                title="Recommend Config"
            />
        </>
    );
}
