import { Grid, Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import Analysis from './analysis/Analysis';
import Entry from './thoughts/Entry';
import Thoughts from './thoughts/Thoughts';

import { styled } from '@mui/material/styles';
import { useJournal } from '../../context/useJournal';
import { useParams } from 'react-router-dom';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#282828' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    color: theme.palette.text.primary,
    boxShadow: 'none',
}));

export default function Entries() {
    const { journalId, journalTitle } = useJournal();
    const [entries, setEntries] = useState([]);
    const [focusedEntryId, setFocusedEntryId] = useState('');
    const [editedEntryId, setEditedEntryId] = useState('');
    const { entryId } = useParams();

    useEffect(() => {
        const makeRequest = async () => {
            try {
                // Construct the URL with the specific journal ID
                const url = `http://192.168.50.157:3000/journals/${ journalId }/entries`;

                const response = await fetch(url, {
                    credentials: 'include'
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setEntries([...data.entries]);

                // If the URL has a specific entry ID, set that as the focused entry
                if (entryId) {
                    setFocusedEntryId(entryId);
                } else {
                    setFocusedEntryId(data.entries.length ? data.entries[0]._id : '');
                }

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
                    <Typography variant="h1">
                        {journalTitle}
                    </Typography>
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
                        journalId={journalId}
                        setEntries={setEntries}
                        setFocusedEntryId={setFocusedEntryId}
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
