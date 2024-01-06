import { Box, InputLabel, Typography } from '@mui/material';

import { useEffect, useRef } from 'react';

import ChatEntry from './ChatEntry';
import Messages from './Messages';

export default function Chat({ journalId, focusedEntryId, chat, setChat }) {
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    }, [chat]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <InputLabel
                htmlFor="new-message"
                sx={{ color: 'inherit' }}>
                <Typography variant="h2">Chat</Typography>
            </InputLabel >
            {chat.messages &&
                <Box
                    ref={messagesEndRef}
                    sx={{
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        flexGrow: 1,
                        maxHeight: '50vh',
                        pl: '1.6em',
                        pr: '1.6em'
                    }}>
                    <Messages chat={chat} />
                </Box>}
            <ChatEntry
                chat={chat}
                focusedEntryId={focusedEntryId}
                journalId={journalId}
                setChat={setChat}
            />
        </Box>
    )
}