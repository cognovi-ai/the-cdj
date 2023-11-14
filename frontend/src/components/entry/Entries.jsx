import { styled } from '@mui/material/styles';
import { Paper, Grid, Box, Button, TextField, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, AspectRatio as FocusIcon, CancelPresentation as UnfocusIcon, Send as SendIcon } from '@mui/icons-material';
import { useState, useEffect } from "react";

const testJournal = "6552c74152807822e7df31a1";

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
    const [newEntry, setNewEntry] = useState('');
    const [focusing, setFocusing] = useState(false);
    const [focusedData, setFocusedData] = useState({
        title: '',
        content: '',
        mood: '',
        tags: [],
        privacy_settings: {},
    });
    const [focusedEntryId, setFocusedEntryId] = useState('');
    const [messages, setMessages] = useState([]);
    const [chatData, setChatData] = useState({
        content: '',
        createdAt: Date(),
    });
    const [editing, setEditing] = useState(false);
    const [editedData, setEditedData] = useState({
        title: '',
        content: '',
        mood: '',
        tags: [],
        privacy_settings: {},
    });
    const [editedEntryId, setEditedEntryId] = useState('');

    useEffect(() => {
        const makeRequest = async () => {
            try {
                // Construct the URL with the specific journal ID
                setJournalId(testJournal);
                const url = `http://192.168.50.157:3000/journals/${ testJournal }/entries`;

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
        const journalId = testJournal;
        const url = `http://192.168.50.157:3000/journals/${ journalId }/entries`;

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

            // Clear the input field and update the entries state if needed
            setNewEntry('');
        } catch (error) {
            console.error("Error:", error);
        }
    };

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

    const handleUnfocus = () => {
        setFocusing(false);
    }

    const handleSendChat = () => {

        setMessages([
            ...messages,
            { content: chatData, createdAt: Date() }
        ])

        setChatData("");
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
                    {focusing ? (
                        <div>
                            <Box>
                                <h2>Thought Analysis</h2>
                                <h3>{focusedData.content}</h3>
                                <p>TODO: Setup Analyses.</p>
                                <div>
                                    <IconButton
                                        aria-label="Unfocus"
                                        color="primary"
                                        onClick={() => handleUnfocus()}>
                                        <UnfocusIcon />
                                    </IconButton>
                                </div>
                            </Box>
                            <Box>
                                <h2>Chat</h2>
                                {messages.map((message, index) => (
                                    <div key={index}>
                                        <p>TODO: Setup Chat.</p>
                                        {/* FIXME: message.content does not work: Objects are not valid as a React Child */}
                                        {/* <p>{message.content}</p> */}
                                    </div>
                                ))}
                                <TextField
                                    label="Dive deeper."
                                    variant="filled"
                                    fullWidth
                                    multiline
                                    minRows={3}
                                    maxRows={6}
                                    onChange={(e) =>
                                        setChatData({
                                            ...chatData,
                                            content: e.target.value,
                                        })
                                    }
                                />
                                <Box display="flex"
                                    justifyContent="flex-end"
                                    marginTop={2}>
                                    <IconButton
                                        aria-label="Send Chat"
                                        color="primary"
                                        onClick={() => handleSendChat()}>
                                        <SendIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        </div>
                    ) : (
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
                    )}

                </Item>
            </Grid>
        </Grid>
    );
}
