import { Box, Button, TextField, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, AspectRatio as FocusIcon } from '@mui/icons-material';

import { useState } from "react";

export default function Thoughts({ journalId, entries, setEntries, setFocusing, setFocusedData, setFocusedEntryId }) {
    const [editing, setEditing] = useState(false);
    const [editedData, setEditedData] = useState({
        title: '',
        content: '',
        mood: '',
        tags: [],
        privacy_settings: {},
    });
    const [editedEntryId, setEditedEntryId] = useState('');

    const handleFocus = async (entryId) => {
        try {
            // Fetch the entry data for editing
            const entryUrl = `http://192.168.50.157:3000/journals/${ journalId }/entries/${ entryId }`;
            const entryResponse = await fetch(entryUrl);

            if (!entryResponse.ok) {
                throw new Error("Network response was not ok");
            }

            const entryData = await entryResponse.json();

            setFocusing(true);
            setFocusedData({
                title: entryData.title,
                content: entryData.content,
                mood: entryData.mood,
                tags: entryData.tags,
                privacy_settings: entryData.privacy_settings,
            });
            setFocusedEntryId(entryId);

        } catch (error) {
            console.error("Error:", error);
        }
    }

    const handleEdit = async (entryId) => {
        try {
            // Fetch the entry data for editing
            const entryUrl = `http://192.168.50.157:3000/journals/${ journalId }/entries/${ entryId }`;
            const entryResponse = await fetch(entryUrl);

            if (!entryResponse.ok) {
                throw new Error("Network response was not ok");
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
            console.error("Error:", error);
        }
    };

    const handleCancelEdit = () => {
        // Clear the editing state
        setEditing(false);
        setEditedData({});
        setEditedEntryId('');
    };

    const handleSaveEdit = async () => {
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
                throw new Error("Network response was not ok");
            }

            // Update the entries state with the edited data
            setEntries((prevEntries) =>
                prevEntries.map((entry) =>
                    entry._id === editedEntryId ? { ...entry, ...editedData } : entry
                )
            );

            // Clear the editing state
            setEditing(false);
            setEditedData({});
            setEditedEntryId('');
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleDelete = async (entryId) => {
        const url = `http://192.168.50.157:3000/journals/${ journalId }/entries/${ entryId }`;

        try {
            const response = await fetch(url, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            // Remove the deleted entry from the state
            setEntries(entries.filter((entry) => entry._id !== entryId));
        } catch (error) {
            console.error("Error:", error);
        }
    };


    return (
        <div>
            <h2>Thoughts</h2>
            {entries.map((entry) => (
                <div key={entry._id}>
                    <p>{entry.content}</p>
                    {editing && editedEntryId === entry._id ? (
                        <div>
                            <TextField
                                label="Edit your thought."
                                variant="filled"
                                fullWidth
                                multiline
                                minRows={3}
                                maxRows={6}
                                value={editedData.content}
                                onChange={(e) =>
                                    setEditedData({ ...editedData, content: e.target.value })
                                }
                            />
                            <Box display="flex" justifyContent="flex-end" marginTop={2}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSaveEdit}
                                >
                                    Save
                                </Button>
                                <Button
                                    variant="contained"
                                    color="cancel"
                                    onClick={handleCancelEdit}
                                    style={{ marginLeft: 8 }}
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
                </div>
            ))}
        </div>
    )
}