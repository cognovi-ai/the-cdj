import { styled } from '@mui/material/styles';
import { Paper, Grid, Box, Button, TextField } from '@mui/material';
import { useState, useEffect } from "react";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#282828' : '#fff',
    ...theme.typography.body1,
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    color: theme.palette.text.secondary,
    boxShadow: 'none', // Remove the shadow here
}));

export default function Entries() {
    const [entries, setEntries] = useState([]);
    const [journalId, setJournalId] = useState('');
    const [newEntry, setNewEntry] = useState('');

    useEffect(() => {
        const makeRequest = async () => {
            try {
                // Construct the URL with the specific journal ID
                setJournalId("654d3abea2e75bc664a982eb");
                const url = `http://192.168.50.112:3000/journals/654d3abea2e75bc664a982eb/entries`;

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                setEntries([...data.entries]);
            } catch (error) {
                console.error("Error:", error);
            }
        };

        makeRequest();
    }, [entries]);


    const handleNewEntryChange = (event) => {
        setNewEntry(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Construct the URL with the specific journal ID
        const journalId = "654d3abea2e75bc664a982eb"; // Replace with your actual journal ID
        const url = `http://192.168.50.112:3000/journals/${ journalId }/entries`;

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
            console.log("New Entry Submitted:", data);

            // Clear the input field and update the entries state if needed
            setNewEntry('');
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Item>
                    <h1>Ryan&apos;s Thought Journal</h1>
                </Item>
            </Grid>
            <Grid item xs={12} md={6}>
                <Item>
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
                </Item>
            </Grid>
            <Grid item xs={12} md={6}>
                <Item>
                    <h2>Thoughts</h2>
                    {entries && entries.map((entry, index) => {
                        return <p key={index}>{entry.content}</p>
                    })}
                </Item>
            </Grid>
        </Grid>
    )
}
