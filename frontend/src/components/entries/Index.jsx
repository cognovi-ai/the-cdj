import { Grid, Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import Analysis from './analysis/Analysis';

import Entry from './thoughts/Entry';
import FlashMessages from '../utils/FlashMessages';
import Thoughts from './thoughts/Thoughts';

import { styled } from '@mui/material/styles';
import { useEntries } from '../../hooks/useEntries';
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

    const [flash, setFlash] = useState([]);
    const [allEntries, setAllEntries] = useState([]);
    const [focusedEntryId, setFocusedEntryId] = useState('');
    const [editedEntryId, setEditedEntryId] = useState('');

    const entries = useEntries();
    const { entryId } = useParams();

    useEffect(() => {
        const makeRequest = async () => {
            try {
                // Get all the entries for the journal
                const data = await entries('/', 'GET');

                setAllEntries([...data.entries]);

                // If the URL has an entryId
                if (entryId) {
                    // Set the focused entry to the entryId in the URL
                    setFocusedEntryId(entryId);

                } else {
                    // Or to the first entry in the journal
                    setFocusedEntryId(
                        data.entries.length ? data.entries[0]._id : ''
                    );
                }

            } catch (error) {
                console.error(error);
            }
        };

        makeRequest();
    }, []);

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <Item>
                    <FlashMessages flash={flash} setFlash={setFlash} />
                </Item>
            </Grid>
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
                        setEntries={setAllEntries}
                        setFlash={setFlash}
                        setFocusedEntryId={setFocusedEntryId}
                    />
                </Item>
                <Item>
                    <Thoughts
                        allEntries={allEntries}
                        editedEntryId={editedEntryId}
                        focusedEntryId={focusedEntryId}
                        journalId={journalId}
                        setAllEntries={setAllEntries}
                        setEditedEntryId={setEditedEntryId}
                        setFocusedEntryId={setFocusedEntryId}
                    />
                </Item>
            </Grid>
        </Grid>
    );
}
