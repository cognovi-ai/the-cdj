import { Box, Button, TextField } from '@mui/material';

import { useState } from "react";

export default function Entry({ testJournal, setEntries, setFocusedEntryId }) {
    const [newEntry, setNewEntry] = useState('');

    const handleNewEntryChange = (event) => {
        setNewEntry(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

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

            // Clear the input field and update the entries state if needed
            setNewEntry('');

            // Make the new entry the focused entry on submit
            setFocusedEntryId(data._id)

            // Add new entry to thought list
            setEntries((entries) => (
                [data, ...entries]
            ))
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div>
            <h2>Thought Entry</h2>
            <form onSubmit={handleSubmit}>
                <TextField
                    id="new-entry"
                    label="Place your thoughts here."
                    variant="outlined"
                    fullWidth
                    multiline
                    minRows={3}
                    maxRows={6}
                    value={newEntry}
                    onChange={handleNewEntryChange}
                />
                <Box display="flex" justifyContent="flex-end" marginTop={2}>
                    <Button type="submit" variant="contained" color="primary">
                        Submit
                    </Button>
                </Box>
            </form>
        </div>
    )
}