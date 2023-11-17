import { Box, TextField, IconButton } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

import { useState } from "react";

export default function ChatEntry({ journalId, focusedEntryId, chat, setChat }) {
    const [newChat, setNewChat] = useState("");

    const handleNewChatChange = (event) => {
        setNewChat(event.target.value);
    };

    const handleSendChat = async () => {
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

            // Clear the input field
            setNewChat("");
        } catch (error) {
            console.error("Error:", error);
        }
    }

    return (
        <div>
            <TextField
                label="Dive deeper."
                variant="filled"
                fullWidth
                multiline
                minRows={3}
                maxRows={6}
                value={newChat}
                onChange={handleNewChatChange}
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
        </div>
    )
}