import { Grid, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import Analysis from './analysis/Analysis';
import Entry from './thoughts/Entry';

import { Item } from '../../styles/components/Item';

import Thoughts from './thoughts/Thoughts';

import { useAccess } from '../../hooks/useAccess';
import { useEntries } from '../../hooks/useEntries';
import { useJournal } from '../../context/useJournal';
import { useParams } from 'react-router-dom';

export default function Entries() {
    const { journalId, journalTitle, setJournalTitle } = useJournal();
    const { entryId } = useParams();

    const [allEntries, setAllEntries] = useState([]);
    const [focusedEntryId, setFocusedEntryId] = useState('');
    const [editedEntryId, setEditedEntryId] = useState('');
    const [enteringTitle, setEnteringTitle] = useState('');
    const [copiedJournalTitle, setCopiedJournalTitle] = useState('');
    const [validationError, setValidationError] = useState('');

    const entries = useEntries();
    const access = useAccess();

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

    const isEnteringTitle = () => {
        setEnteringTitle(true);
        setCopiedJournalTitle(journalTitle);
    }

    const handleEnterKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleTitleSubmit();
        } else if (event.key === 'Escape') {
            setJournalTitle(copiedJournalTitle);
            setEnteringTitle(false);
        }
    }

    const handleTitleChange = (event) => {
        setJournalTitle(event.target.value);
    }

    const handleTitleSubmit = async () => {
        if (journalTitle.trim() === '') {
            setValidationError('This field is required.');
            setJournalTitle(copiedJournalTitle);
            return;
        } else if (journalTitle === copiedJournalTitle) {
            setValidationError('');
            setEnteringTitle(false);
            return;
        }

        try {
            // // Update the journal title
            await access(
                `/journal/${ journalId }`,
                'PUT',
                { 'Content-Type': 'application/json' },
                { title: journalTitle.trim() }
            );
            setEnteringTitle(false);
            setValidationError('');
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <Item>
                    {enteringTitle ? (
                        <TextField
                            autoFocus
                            error={Boolean(validationError)}
                            fullWidth
                            helperText={validationError}
                            label="Journal Title"
                            onBlur={handleTitleSubmit}
                            onChange={handleTitleChange}
                            onKeyDown={handleEnterKeyPress}
                            value={journalTitle}
                            variant="standard"
                        />
                    ) : (
                        <Typography
                            onClick={isEnteringTitle}
                            sx={{ cursor: 'pointer' }}
                            variant="h1"
                        >
                            {journalTitle}
                        </Typography>
                    )
                    }
                </Item>
            </Grid>
            <Grid item md={6} xs={12}>
                {focusedEntryId && <Analysis
                    editedEntryId={editedEntryId}
                    focusedEntryId={focusedEntryId}
                    journalId={journalId}
                    setAllEntries={setAllEntries}
                />}
            </Grid>
            <Grid item md={focusedEntryId ? 6 : 12} xs={12}>
                <Entry
                    journalId={journalId}
                    setEntries={setAllEntries}
                    setFocusedEntryId={setFocusedEntryId}
                />
                {focusedEntryId && <Thoughts
                    allEntries={allEntries}
                    editedEntryId={editedEntryId}
                    focusedEntryId={focusedEntryId}
                    journalId={journalId}
                    setAllEntries={setAllEntries}
                    setEditedEntryId={setEditedEntryId}
                    setFocusedEntryId={setFocusedEntryId}
                />}
            </Grid>
        </Grid>
    );
}
