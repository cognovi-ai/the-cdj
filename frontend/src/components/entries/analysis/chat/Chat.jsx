import { Box, InputLabel, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import ChatEntry from './ChatEntry';
import Messages from './Messages';

export default function Chat({ journalId, focusedEntryId, focusedData, chat, setChat }) {
    const messagesEndRef = useRef(null);
    const lastMessageRef = useRef(null);
    const alignChatRef = useRef(null);

    const [hasSent, setHasSent] = useState(false);

    useEffect(() => {
        if (messagesEndRef.current) {
            if (hasSent) {
                lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
                alignChatRef.current.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
            } else {
                messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
            }
        }
    }, [chat]);

    return (
        <Box
            ref={alignChatRef}
            sx={{ display: 'flex', flexDirection: 'column' }}
        >
            <InputLabel
                htmlFor="new-message"
                sx={{ color: 'inherit' }}>
                <Typography variant="h2">Chat</Typography>
            </InputLabel >
            <Typography mb="1.5em" variant="body1">
                Talk about <i>{focusedData?.entry?.title}</i>.
            </Typography>
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
                    <Messages
                        chat={chat}
                        lastMessageRef={lastMessageRef}
                        setHasSent={setHasSent}
                    />
                </Box>}
            <ChatEntry
                chat={chat}
                focusedEntryId={focusedEntryId}
                journalId={journalId}
                setChat={setChat}
                setHasSent={setHasSent}
            />
        </Box>
    )
}