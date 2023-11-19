import './Thoughts.css'

import { Box, Button, IconButton, TextField, Typography } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, AspectRatio as FocusIcon } from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Thoughts({ journalId, entries, setEntries, focusedEntryId, setFocusedEntryId, editedEntryId, setEditedEntryId }) {
    const [editing, setEditing] = useState(false);
    const [editedData, setEditedData] = useState({
        title: '',
        content: '',
        mood: '',
        tags: [],
        privacy_settings: {},
    });
    const [validationError, setValidationError] = useState('');
    const navigate = useNavigate();

    const handleFocus = async (entryId) => {
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Focus thought analysis view on selected entry
        setFocusedEntryId(entryId);
        navigate(`/entries/${ entryId }`);
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
            const entryUrl = `http://192.168.50.157:3000/journals/${ journalId }/entries/${ entryId }`;
            const entryResponse = await fetch(entryUrl);

            if (!entryResponse.ok) {
                throw new Error('Network response was not ok');
            }

            const entryData = await entryResponse.json();

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
            console.error('Error:', error);
        }
    };

    const handleCancelEdit = () => {
        // Clear the editing state and validation error
        setEditing(false);
        setEditedData({});
        setEditedEntryId('');
        setValidationError('');
    };

    const handleSaveEdit = async () => {
        // Validate the input
        if (editedData.content.trim() === '') {
            setValidationError('This field is required.');
            return; // Exit early if validation fails
        }

        // Construct the URL with the specific entry ID
        const url = `http://192.168.50.157:3000/journals/${ journalId }/entries/${ editedEntryId }`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedData),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Update the entries state with the edited data
            setEntries((prevEntries) =>
                prevEntries.map((entry) =>
                    entry._id === editedEntryId ? { ...entry, ...editedData } : entry
                )
            );

            // Clear the editing state and validation error
            setEditing(false);
            setEditedData({});
            setEditedEntryId('');
            setValidationError('');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (entryId) => {
        const url = `http://192.168.50.157:3000/journals/${ journalId }/entries/${ entryId }`;

        try {
            const response = await fetch(url, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const filteredEntries = entries.filter((entry) => entry._id !== entryId);

            // Ensure a focused entry is still set after deletion
            setFocusedEntryId(filteredEntries.length ? filteredEntries[0]._id : '');

            // Remove the deleted entry from the state
            setEntries(filteredEntries);
            navigate(`/entries/${ entryId }`);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <Typography variant="h2">Recent Thoughts</Typography>
            {entries.map((entry) => (
                <Box
                    className={entry._id === focusedEntryId ? 'focused' : ''}
                    key={entry._id}
                    sx={{
                        margin: '0 0 2em',
                        padding: '8px 12px',
                    }}>
                    <Typography variant="body1">{entry.content}</Typography>
                    {editing && editedEntryId === entry._id ? (
                        <div>
                            <TextField
                                autoFocus
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
                            <Box display="flex" justifyContent="flex-end" marginTop={2}>
                                <Button
                                    color="primary"
                                    disabled={Boolean(validationError)}
                                    onClick={handleSaveEdit}
                                    variant="contained"
                                >
                                    Save
                                </Button>
                                <Button
                                    color="cancel"
                                    onClick={handleCancelEdit}
                                    style={{ marginLeft: 8 }}
                                    variant="contained"
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </div>
                    ) : (
                        <div>
                            <IconButton
                                aria-label="Focus"
                                color="primary"
                                onClick={() => handleFocus(entry._id)}>
                                <FocusIcon />
                            </IconButton>
                            <IconButton
                                aria-label="Edit"
                                color="edit"
                                onClick={() => handleEdit(entry._id)}
                            >
                                <EditIcon />
                            </IconButton>
                            <IconButton
                                aria-label="Delete"
                                color="danger"
                                onClick={() => handleDelete(entry._id)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </div>
                    )}
                </Box>
            ))}
        </div>
    );
}