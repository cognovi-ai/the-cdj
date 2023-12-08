import { Box, Button, InputLabel, TextField, Typography } from '@mui/material';

import { useEntries } from '../../../hooks/useEntries';
import { useFlash } from '../../../context/useFlash';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Entry({ setEntries, setFocusedEntryId }) {
    const [newEntry, setNewEntry] = useState('');
    const [validationError, setValidationError] = useState('');

    const { setFlash } = useFlash();

    const entries = useEntries();
    const navigate = useNavigate();

    const handleNewEntryChange = (event) => {
        setNewEntry(event.target.value);
        setValidationError(''); // Clear validation error when input changes
    };

    const handleEnterKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevents a new line
            handleSubmit(event);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validate the input
        if (newEntry.trim() === '') {
            setValidationError('This field is required.');
            return; // Exit early if validation fails
        }

        try {
            // Send the new entry to the server
            const data = await entries(
                '/',
                'POST',
                { 'Content-Type': 'application/json' },
                { content: newEntry }
            );

            // Clear the input field and validation error
            setNewEntry('');
            setValidationError('');

            // Make the new entry the focused entry on submit
            setFocusedEntryId(data._id);
            navigate(`/entries/${ data._id }`);

            // Add new entry to thought list
            setEntries((entries) => (
                [data, ...entries]
            ));

            // Append new flash messages
            setFlash(prevFlash => {
                const newFlash = { ...prevFlash };
                Object.keys(data.flash).forEach(key => {
                    newFlash[key] = newFlash[key] ? [...newFlash[key], ...data.flash[key]] : [...data.flash[key]];
                });
                return newFlash;
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <InputLabel htmlFor="new-entry" sx={{ color: 'inherit' }}>
                <Typography variant="h2">Thought Entry</Typography>
            </InputLabel>
            <form onSubmit={handleSubmit}>
                <TextField
                    error={Boolean(validationError)}
                    fullWidth
                    helperText={validationError}
                    id="new-entry"
                    label="Enter your thought."
                    maxRows={6}
                    minRows={3}
                    multiline
                    onChange={handleNewEntryChange}
                    onKeyDown={handleEnterKeyPress}
                    value={newEntry}
                    variant="outlined"
                />
                <Box
                    display="flex"
                    justifyContent="flex-end"
                    marginTop={2}
                >
                    <Button
                        color="primary"
                        disabled={Boolean(validationError)}
                        type="submit"
                        variant="contained"
                    >
                        Submit
                    </Button>
                </Box>
            </form>
        </div>
    );
}