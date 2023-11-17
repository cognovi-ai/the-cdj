import { Box, TextField, IconButton } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

import { useState } from "react";

export default function ChatEntry({ journalId, focusedEntryId, chat, setChat }) {
    const [newChat, setNewChat] = useState("");
    const [validationError, setValidationError] = useState("");

    const handleNewChatChange = (event) => {
        setNewChat(event.target.value);
        setValidationError(""); // Clear validation error when input changes
    };

    const handleEnterKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevents a new line
            handleSendChat(event);
        }
    };

    const handleSendChat = async (event) => {
        event.preventDefault(); // Prevent form submission

        // Validate the input
        if (newChat.trim() === "") {
            setValidationError("This field is required.");
            return; // Exit early if validation fails
        }

        try {
            const url = `http://192.168.50.157:3000/journals/${ journalId }/entries/${ focusedEntryId }/chat${ chat.chat_id ? "/" + chat.chat_id : "" }`;

            const response = await fetch(url, {
                method: chat.messages ? "PUT" : "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message_content: newChat }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            // Assuming the server responds with the created entry
            await response.json()
                .then((data) => {
                    // Update the chat state by adding the new message
                    setChat((prevChat) => {
                        if (prevChat.messages) {
                            return {
                                ...prevChat,
                                messages: [...data.messages],
                            };
                        } else {
                            return {
                                ...data,
                            };
                        }
                    });
                });

            // Clear the input field and validation error
            setNewChat("");
            setValidationError("");
        } catch (error) {
            console.error("Error:", error);
        }
    }

    return (
        <div>
            <form onSubmit={handleSendChat}>
                <TextField
                    id="new-message"
                    label="Send a message."
                    variant="filled"
                    fullWidth
                    multiline
                    minRows={3}
                    maxRows={6}
                    value={newChat}
                    onChange={handleNewChatChange}
                    onKeyDown={handleEnterKeyPress}
                    error={Boolean(validationError)}
                    helperText={validationError}
                />
                <Box
                    display="flex"
                    justifyContent="flex-end"
                    marginTop={2}
                >
                    <IconButton
                        aria-label="Send Chat"
                        color="primary"
                        onClick={handleSendChat}
                        disabled={Boolean(validationError)}
                    >
                        <SendIcon />
                    </IconButton>
                </Box>
            </form>
        </div>
    )
}