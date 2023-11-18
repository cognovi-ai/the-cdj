import { Grid, Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import Analysis from './analysis/Analysis';
import Entry from './thoughts/Entry';
import Thoughts from './thoughts/Thoughts';

import { styled } from '@mui/material/styles';

const testJournal = '6555c8b561fb25d5edb15ea7';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#282828' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    color: theme.palette.text.primary,
    boxShadow: 'none',
}));

export default function Entries() {
    const [entries, setEntries] = useState([]);
    const [journalId, setJournalId] = useState('');
    const [focusedEntryId, setFocusedEntryId] = useState('');
    const [editedEntryId, setEditedEntryId] = useState('');

    useEffect(() => {
        const makeRequest = async () => {
            try {
                // Construct the URL with the specific journal ID
                setJournalId(testJournal);
                const url = `http://192.168.50.157:3000/journals/${ testJournal }/entries`;

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setEntries([...data.entries]);
                setFocusedEntryId(data.entries.length ? data.entries[0]._id : '')
            } catch (error) {
                console.error('Error:', error);
            }
        };

        makeRequest();
    }, []);

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <Item>
                    <Typography variant="h1">Ryan&apos;s Thought Journal</Typography>
                </Item>
            </Grid>
            <Grid item md={6} xs={12}>
                <Item>
                    <Analysis
                        editedEntryId={editedEntryId}
                        focusedEntryId={focusedEntryId}
                        journalId={journalId}
                    />
                </Item>
            </Grid>
            <Grid item md={6} xs={12}>
                <Item>
                    <Entry
                        setEntries={setEntries}
                        setFocusedEntryId={setFocusedEntryId}
                        testJournal={testJournal}
                    />
                </Item>
                <Item>
                    <Thoughts
                        editedEntryId={editedEntryId}
                        entries={entries}
                        focusedEntryId={focusedEntryId}
                        journalId={journalId}
                        setEditedEntryId={setEditedEntryId}
                        setEntries={setEntries}
                        setFocusedEntryId={setFocusedEntryId}
                    />
                </Item>
            </Grid>
        </Grid>
    );
}
