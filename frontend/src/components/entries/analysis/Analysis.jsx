import { Box, Button, Grid, LinearProgress, TextField, Tooltip, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import Chat from './chat/Chat';

import { Item } from '../../../styles/components';
import { Update as UpdateIcon } from '@mui/icons-material';

import typeWriter from '../../../scripts/typeWriter'

import { useEntries } from '../../../hooks/useEntries';
import { v4 as uuid } from 'uuid';

export default function Analysis({ journalId, focusedEntryId, editedEntryId, setAllEntries, typeWrittenId, setTypeWrittenId, setIsSubmitting }) {
    const [focusedData, setFocusedData] = useState({});
    const [editedEntry, setEditedEntry] = useState('');
    const [editedTitle, setEditedTitle] = useState('');
    const [editingEntry, setEditingEntry] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);
    const [isSavingEntry, setIsSavingEntry] = useState(false);
    const [isSavingTitle, setIsSavingTitle] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [regenerating, setRegenerating] = useState(false);
    const [chat, setChat] = useState({});
    const [typedAnalysis, setTypedAnalysis] = useState('')

    const entries = useEntries();

    useEffect(() => {
        const makeRequest = async () => {
            try {
                if (!focusedEntryId.length) {
                    setChat();
                    setFocusedData();
                    return
                }

                const entryData = await entries(`/${ focusedEntryId }`, 'GET');

                // Data displayed in this component
                setFocusedData(entryData);
                setEditedEntry(entryData.content);
                setEditedTitle(entryData.title);

                // Render child Chat component
                setChat(entryData.conversation?.messages ? entryData.conversation : {});

                setTypedAnalysis('');
                if (typeWrittenId) {
                    typeWriter(entryData.analysis?.analysis_content, setTypedAnalysis, 10);
                }

            } catch (error) {
                console.error(error);
            }
        };

        makeRequest();
    }, [focusedEntryId, editedEntryId, typeWrittenId]);

    const handleEntrySave = () => {
        if (!editedEntry.length) {
            setValidationError('This field is required.');
            return;
        } else if (editedEntry === focusedData?.entry?.content) {
            setValidationError('');
            setEditingEntry(false);
            return;
        }

        setIsSavingEntry(true);
        setIsSubmitting(true);

        const makeRequest = async () => {
            try {
                // Update the entry on the server
                await entries(
                    `/${ focusedEntryId }`,
                    'PUT',
                    { 'Content-Type': 'application/json' },
                    { content: editedEntry }
                );

                // Get the entry analysis data
                const entryAnalysisData = await entries(`/${ focusedEntryId }/analysis`, 'GET');

                // Re-render this component
                setFocusedData(entryAnalysisData);

                // Side-effect re-renders sibling Thoughts component
                setAllEntries(allEntries => allEntries.map(entry =>
                    entry._id === focusedEntryId ? { ...entryAnalysisData.entry } : entry
                ));

                // Set the entry to be typed
                setTypeWrittenId(uuid());

            } catch (error) {
                console.error(error);
            } finally {
                setEditingEntry(false);
                setIsSavingEntry(false);
                setIsSubmitting(false);
            }
        }

        makeRequest();
    }

    const handleTitleSave = () => {
        if (!editedTitle.length) {
            setValidationError('This field is required.');
            return;
        } else if (editedTitle === focusedData?.title) {
            setValidationError('');
            setEditingTitle(false);
            return;
        }

        setIsSavingTitle(true);
        setIsSubmitting(true);

        const makeRequest = async () => {
            try {
                // Update the entry on the server
                await entries(
                    `/${ focusedEntryId }`,
                    'PUT',
                    { 'Content-Type': 'application/json' },
                    { title: editedTitle }
                );

                // Re-render this component
                setFocusedData({ ...focusedData, title: editedTitle });

                // Side-effect re-renders sibling Thoughts component
                setAllEntries(allEntries => allEntries.map(entry =>
                    entry._id === focusedEntryId ? { ...focusedData, title: editedTitle } : entry
                ));

            } catch (error) {
                console.error(error);
            } finally {
                setEditingTitle(false);
                setIsSavingTitle(false);
                setIsSubmitting(false);
            }
        }

        makeRequest();
    }

    const handleEditingEntry = (event) => {
        // Update the edited data
        setEditedEntry(event.target.value);
    }

    const handleEditingTitle = (event) => {
        // Update the edited title
        setEditedTitle(event.target.value);
    }

    const handleOnBlur = () => {
        setIsSubmitting(false);
        setEditingEntry(false);
        setEditingTitle(false);
    }

    const handleEditEntryKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleEntrySave();
        } else if (event.key === 'Escape') {
            setEditedEntry(focusedData?.entry?.content);
            setValidationError('');
            setEditingEntry(false);
        }
    }

    const handleEditTitleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleTitleSave();
        } else if (event.key === 'Escape') {
            setEditedTitle(focusedData?.title);
            setValidationError('');
            setEditingTitle(false);
        }
    }

    const handleNewAnalysis = (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        const makeRequest = async () => {
            setRegenerating(true);

            try {
                const response = await entries(`/${ focusedEntryId }/analysis`, 'PUT');

                // Re-render this component
                setFocusedData({ ...response });

                // Side-effect re-renders sibling Thoughts component
                setAllEntries(allEntries => allEntries.map(entry =>
                    entry._id === focusedEntryId ? { ...response.entry } : entry
                ));

                // Random ID to trigger typeWriter if focusedEntryId is the same
                setTypeWrittenId(uuid());

            } catch (error) {
                console.error(error);
            } finally {
                setRegenerating(false);
                setIsSubmitting(false);
            }
        };

        makeRequest();
    }

    const getReadableDate = (date) => {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        return new Date(date).toLocaleDateString('en-US', options);
    }

    return (
        <Item>
            {editingTitle ? (
                <TextField
                    autoFocus
                    disabled={isSavingEntry}
                    error={Boolean(validationError)}
                    fullWidth
                    helperText={validationError}
                    label="Edit your thought."
                    multiline
                    onBlur={handleOnBlur}
                    onChange={handleEditingTitle}
                    onKeyDown={handleEditTitleKeyPress}
                    value={editedTitle}
                    variant="outlined"
                />
            ) : (
                <Tooltip title="Click to edit your title.">
                    <Typography
                        lineHeight="2em"
                        mb="0.5em"
                        onClick={() => setEditingTitle(true)}
                        sx={{ cursor: 'pointer' }}
                        variant="h2"
                    >
                        {focusedData?.title}
                    </Typography>
                </Tooltip>
            )}
            {isSavingTitle && <LinearProgress />}
            <Box sx={{ maxHeight: '45vh', overflow: 'auto', pr: '1em' }}>
                <Grid container spacing={2}>
                    <Grid item md={6} xs={12}>
                        {editingEntry ? (
                            <TextField
                                autoFocus
                                disabled={isSavingEntry}
                                error={Boolean(validationError)}
                                fullWidth
                                helperText={validationError}
                                label="Edit your thought."
                                multiline
                                onBlur={handleOnBlur}
                                onChange={handleEditingEntry}
                                onKeyDown={handleEditEntryKeyPress}
                                sx={{ mt: '0.5em' }}
                                value={editedEntry}
                                variant="outlined"
                            />
                        ) : (
                            <Tooltip title="Click to edit your thought.">
                                <Typography
                                    onClick={() => setEditingEntry(true)}
                                    sx={{ cursor: 'pointer' }}
                                    variant="body1"
                                >
                                    {focusedData?.content}
                                </Typography>
                            </Tooltip>
                        )}
                        {isSavingEntry && <LinearProgress />}
                    </Grid>
                    <Grid item md={6} xs={12}>
                        {regenerating ? (
                            <>
                                <Typography
                                    fontStyle={'italic'}
                                    variant="body1"
                                >
                                    Please wait. Generating a new analysis...
                                </Typography>
                                <LinearProgress color="edit" />
                            </>
                        ) : (
                            <Typography variant="body2">
                                {typeWrittenId ? typedAnalysis : focusedData?.analysis?.analysis_content}
                            </Typography>
                        )}
                        <Tooltip title="Generate a new analysis.">
                            <Box display="flex" justifyContent="flex-end">
                                <Button
                                    disabled={regenerating}
                                >
                                    <UpdateIcon
                                        fontSize="small"
                                        onClick={handleNewAnalysis}
                                    />
                                </Button>
                            </Box>
                        </Tooltip>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="caption">
                            {getReadableDate(focusedData?.created_at)}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
            <Box>
                <Chat
                    chat={chat}
                    focusedData={focusedData}
                    focusedEntryId={focusedEntryId}
                    journalId={journalId}
                    setChat={setChat}
                />
            </Box>
        </Item>
    );
}
