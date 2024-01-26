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
    const [editedData, setEditedData] = useState('');
    const [editing, setEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
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
                setFocusedData({ entry: entryData.entry, analysis_content: entryData.analysis.analysis_content });
                setEditedData(entryData.entry.content);

                // Render child Chat component
                setChat(entryData.chat?.messages ? entryData.chat : {});

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

    const handleSave = () => {
        if (!editedData.length) {
            setValidationError('This field is required.');
            return;
        } else if (editedData === focusedData?.entry?.content) {
            setValidationError('');
            setEditing(false);
            return;
        }

        setIsSaving(true);
        setIsSubmitting(true);

        const makeRequest = async () => {
            try {
                // Update the entry on the server
                await entries(
                    `/${ focusedEntryId }`,
                    'PUT',
                    { 'Content-Type': 'application/json' },
                    { content: editedData }
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
                setEditing(false);
                setIsSaving(false);
                setIsSubmitting(false);
            }
        }

        makeRequest();
    }

    const handleEditing = (event) => {
        // Update the edited data
        setEditedData(event.target.value);
    }

    const handleOnBlur = () => {
        setIsSubmitting(false);
        setEditing(false);
    }

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSave();
        } else if (event.key === 'Escape') {
            setEditedData(focusedData?.entry?.content);
            setValidationError('');
            setEditing(false);
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
            <Typography lineHeight="2em" mb="0.5em" variant="h2">
                {focusedData?.entry?.title}
            </Typography>
            <Box sx={{ maxHeight: '45vh', overflow: 'auto', pr: '1em' }}>
                <Grid container spacing={2}>
                    <Grid item md={6} xs={12}>
                        {editing ? (
                            <TextField
                                autoFocus
                                disabled={isSaving}
                                error={Boolean(validationError)}
                                fullWidth
                                helperText={validationError}
                                label="Edit your thought."
                                multiline
                                onBlur={handleOnBlur}
                                onChange={handleEditing}
                                onKeyDown={handleKeyPress}
                                sx={{ mt: '0.5em' }}
                                value={editedData}
                                variant="outlined"
                            />
                        ) : (
                            <Tooltip title="Click to edit your thought.">
                                <Typography
                                    onClick={() => setEditing(true)}
                                    sx={{ cursor: 'pointer' }}
                                    variant="body1"
                                >
                                    {focusedData?.entry?.content}
                                </Typography>
                            </Tooltip>
                        )}
                        {isSaving && <LinearProgress />}
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
                                {typeWrittenId ? typedAnalysis : focusedData?.analysis_content}
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
