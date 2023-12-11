import { Box, IconButton, TextField } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

import { useEntries } from '../../../../hooks/useEntries';
import { useState } from 'react';

export default function ChatEntry({ focusedEntryId, chat, setChat }) {
    const [newChat, setNewChat] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState('');

    const entries = useEntries();

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
        event.preventDefault();
        setIsSubmitting(true);

        // Validate the input
        if (newChat.trim() === '') {
            setValidationError('This field is required.');
            setIsSubmitting(false);
            return; // Exit early if validation fails
        }

        try {
            // Send the new message to the server
            const data = await entries(
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
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div>
            <form onSubmit={handleSendChat}>
                <TextField
                    disabled={chat === undefined || isSubmitting}
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
                        disabled={chat === undefined || Boolean(validationError) || isSubmitting}
                        onClick={handleSendChat}
                    >
                        <SendIcon />
                    </IconButton>
                </Box>
            </form>
        </div>
    )
}