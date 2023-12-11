import { Box, Button, InputLabel, LinearProgress, TextField, Typography } from '@mui/material';

import { useEntries } from '../../../hooks/useEntries';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Entry({ setEntries, setFocusedEntryId }) {
    const [newEntry, setNewEntry] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState('');

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
        setIsSubmitting(true);

        // Validate the input
        if (newEntry.trim() === '') {
            setValidationError('This field is required.');
            setIsSubmitting(false);
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
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <InputLabel htmlFor="new-entry" sx={{ color: 'inherit' }}>
                <Typography variant="h2">Thought Entry</Typography>
            </InputLabel>
            <form onSubmit={handleSubmit}>
                <TextField
                    disabled={isSubmitting}
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
                {isSubmitting && <LinearProgress />}
                <Box
                    display="flex"
                    justifyContent="flex-end"
                    marginTop={2}
                >
                    <Button
                        color="primary"
                        disabled={Boolean(validationError) || isSubmitting}
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