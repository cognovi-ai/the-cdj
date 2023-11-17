import { Box, Button, TextField, InputLabel, Typography } from '@mui/material';

import { useState } from "react";

export default function Entry({ testJournal, setEntries, setFocusedEntryId }) {
    const [newEntry, setNewEntry] = useState('');
    const [validationError, setValidationError] = useState('');

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

        // Construct the URL with the specific journal ID
        const journalId = testJournal;
        const url = `http://192.168.50.157:3000/journals/${ journalId }/entries`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newEntry,
                    content: newEntry,
                }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            // Assuming the server responds with the created entry
            const data = await response.json();

            // Clear the input field and validation error
            setNewEntry('');
            setValidationError('');

            // Make the new entry the focused entry on submit
            setFocusedEntryId(data._id);

            // Add new entry to thought list
            setEntries((entries) => (
                [data, ...entries]
            ));
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div>
            <InputLabel sx={{ color: "inherit" }} htmlFor="new-entry">
                <Typography variant="h2">Thought Entry</Typography>
            </InputLabel>
            <form onSubmit={handleSubmit}>
                <TextField
                    id="new-entry"
                    label="Enter your thought."
                    variant="outlined"
                    fullWidth
                    multiline
                    minRows={3}
                    maxRows={6}
                    value={newEntry}
                    onChange={handleNewEntryChange}
                    onKeyDown={handleEnterKeyPress}
                    error={Boolean(validationError)}
                    helperText={validationError}
                />
                <Box
                    display="flex"
                    justifyContent="flex-end"
                    marginTop={2}
                >
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={Boolean(validationError)}
                    >
                        Submit
                    </Button>
                </Box>
            </form>
        </div>
    );
}