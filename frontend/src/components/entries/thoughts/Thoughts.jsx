import './Thoughts.css'

import { Box, Button, CircularProgress, Grid, IconButton, LinearProgress, TextField, Typography } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, AspectRatio as FocusIcon } from '@mui/icons-material';

import { Item } from '../../../styles/components';
import { useEntries } from '../../../hooks/useEntries';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Thoughts({ allEntries, setAllEntries, focusedEntryId, setFocusedEntryId, editedEntryId, setEditedEntryId, setTypeWrittenId, isSubmitting, setIsSubmitting }) {
    const [editing, setEditing] = useState(false);
    const [editedData, setEditedData] = useState({
        title: '',
        content: '',
        mood: '',
        tags: [],
        privacy_settings: {},
    });
    const [validationError, setValidationError] = useState('');

    const entries = useEntries();
    const navigate = useNavigate();

    const handleFocus = async (entryId) => {
        setIsSubmitting(true);

        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Focus thought analysis view on selected entry
        setFocusedEntryId(entryId);
        navigate(`/entries/${ entryId }`);

        setIsSubmitting(false);

        // Stop typing animation on focus change
        setTypeWrittenId('');
    }

    const handleEnterKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevents a new line
            handleSaveEdit();
        }
    };

    const handleEditing = (event) => {
        setEditedData({ ...editedData, content: event.target.value });
        setValidationError(''); // Clear validation error when input changes
    }

    const handleEdit = async (entryId) => {
        try {
            // Fetch the entry data for editing
            const entryData = await entries(`/${ entryId }`, 'GET');

            setEditing(true);
            setEditedData({
                title: entryData.title,
                content: entryData.content,
                mood: entryData.mood,
                tags: entryData.tags,
                privacy_settings: entryData.privacy_settings,
            });
            setEditedEntryId(entryId);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCancelEdit = () => {
        // Clear the editing state and validation error
        setEditing(false);
        setEditedData({});
        setEditedEntryId('');
        setValidationError('');
        setIsSubmitting(false);
    };

    const handleSaveEdit = async () => {
        setIsSubmitting(true);

        // Validate the input
        if (editedData.content.trim() === '') {
            setValidationError('This field is required.');
            setIsSubmitting(false);
            return; // Exit early if validation fails
        }

        try {
            // Update the entry on the server
            const edited = await entries(
                `/${ editedEntryId }`,
                'PUT',
                { 'Content-Type': 'application/json' },
                editedData
            );

            // Update the entries state with the edited data
            setAllEntries((prevEntries) =>
                prevEntries.map((entry) =>
                    entry._id === editedEntryId ? { ...entry, ...edited } : entry
                )
            );

            // Clear the editing state and validation error
            setEditing(false);
            setEditedData({});
            setEditedEntryId('');
            setValidationError('');

            // Set the entry to be typed
            setTypeWrittenId(editedEntryId);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (entryId) => {
        setIsSubmitting(true);

        try {
            // Delete the entry on the server
            await entries(`/${ entryId }`, 'DELETE');

            const filteredEntries = allEntries.filter((entry) =>
                entry._id !== entryId
            );

            // If the deleted entry was the focused entry
            if (focusedEntryId === entryId) {
                // Set the focused entry to the first entry in the list
                setFocusedEntryId(
                    filteredEntries.length ? filteredEntries[0]._id : ''
                );
            }

            // Remove the deleted entry from the state
            setAllEntries(filteredEntries);

            // If deleted entry was edited entry 
            if (focusedEntryId === entryId) {
                // Navigate to the next entry if filteredEntries is not empty
                navigate(`/entries/${ filteredEntries.length ? filteredEntries[0]._id : '' }`);
            } else {
                // Stay on the focused entry if filteredEntries is not empty
                navigate(`/entries/${ filteredEntries.length ? focusedEntryId : '' }`);
            }

            // Clear typing animation
            setTypeWrittenId('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getReadableDate = (date) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        return new Date(date).toLocaleDateString('en-US', options);
    }

    return (
        <Item>
            <Grid container>
                <Grid item>
                    {!editing && isSubmitting && <CircularProgress color="edit" size={20} sx={{ mt: '25px', mr: '15px' }} />}
                </Grid>
                <Grid item>
                    <Typography mt="-2em" variant="h2">Recent Thoughts</Typography>
                </Grid>
            </Grid>
            <Box sx={{ height: '90vh', overflow: 'auto' }}>
                {allEntries.map((entry) => (
                    <Box
                        className={entry._id === focusedEntryId ? 'focused' : ''}
                        key={entry._id}
                        sx={{
                            margin: '0 0 2em',
                        }}>
                        <Box
                            sx={{
                                display: 'flex',
                            }}
                        >
                            <Typography
                                sx={{ flex: 2 }}
                                variant="body1"
                            >
                                {entry.title}
                            </Typography>
                            <Typography
                                sx={{ flex: 1, lineHeight: '2.6em', textAlign: 'right' }}
                                variant="caption"
                            >
                                {getReadableDate(entry.created_at)}
                            </Typography>
                        </Box>
                        <Typography noWrap variant="body2">{entry.content}</Typography>
                        {editing && editedEntryId === entry._id ? (
                            <>
                                <TextField
                                    autoFocus
                                    disabled={isSubmitting}
                                    error={Boolean(validationError)}
                                    fullWidth
                                    helperText={validationError}
                                    label="Edit your thought."
                                    maxRows={6}
                                    minRows={3}
                                    multiline
                                    onChange={handleEditing}
                                    onKeyDown={handleEnterKeyPress}
                                    value={editedData.content}
                                    variant="filled"
                                />
                                {isSubmitting && <LinearProgress />}
                                <Box display="flex" justifyContent="flex-end" marginTop={2}>
                                    <Button
                                        color="primary"
                                        disabled={Boolean(validationError) || isSubmitting}
                                        onClick={handleSaveEdit}
                                        variant="contained"
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        color="cancel"
                                        disabled={isSubmitting}
                                        onClick={handleCancelEdit}
                                        style={{ marginLeft: 8 }}
                                        variant="contained"
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            </>
                        ) : (
                            <>
                                <IconButton
                                    aria-label="Focus"
                                    color="primary"
                                    disabled={isSubmitting}
                                    onClick={() => handleFocus(entry._id)}>
                                    <FocusIcon />
                                </IconButton>
                                <IconButton
                                    aria-label="Edit"
                                    color="edit"
                                    disabled={isSubmitting}
                                    onClick={() => handleEdit(entry._id)}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    aria-label="Delete"
                                    color="danger"
                                    disabled={isSubmitting}
                                    onClick={() => handleDelete(entry._id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </>
                        )}
                    </Box>
                ))}
            </Box>
        </Item>
    );
}