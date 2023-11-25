import { Box, IconButton, TextField } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

import { useEntriesApi } from '../../../../hooks/useEntriesApi';
import { useState } from 'react';

export default function ChatEntry({ focusedEntryId, chat, setChat }) {
    const [newChat, setNewChat] = useState('');
    const [validationError, setValidationError] = useState('');

    const fetchData = useEntriesApi();

    const handleNewChatChange = (event) => {
        setNewChat(event.target.value);
        setValidationError(''); // Clear validation error when input changes
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
        if (newChat.trim() === '') {
            setValidationError('This field is required.');
            return; // Exit early if validation fails
        }

        try {
            // Send the new message to the server
            const data = await fetchData(
                `/${ focusedEntryId }/chat${ chat._id ? '/' + chat._id : '' }`,
                chat.messages ? 'PUT' : 'POST',
                { 'Content-Type': 'application/json' },
                { messages: [{ message_content: newChat }] }
            );

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

            // Clear the input field and validation error
            setNewChat('');
            setValidationError('');
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div>
            <form onSubmit={handleSendChat}>
                <TextField
                    disabled={chat === undefined}
                    error={Boolean(validationError)}
                    fullWidth
                    helperText={validationError}
                    id="new-message"
                    label="Send a message."
                    maxRows={6}
                    minRows={3}
                    multiline
                    onChange={handleNewChatChange}
                    onKeyDown={handleEnterKeyPress}
                    value={newChat}
                    variant="filled"
                />
                <Box
                    display="flex"
                    justifyContent="flex-end"
                    marginTop={2}
                >
                    <IconButton
                        aria-label="Send Chat"
                        color="primary"
                        disabled={chat === undefined || Boolean(validationError)}
                        onClick={handleSendChat}
                    >
                        <SendIcon />
                    </IconButton>
                </Box>
            </form>
        </div>
    )
}