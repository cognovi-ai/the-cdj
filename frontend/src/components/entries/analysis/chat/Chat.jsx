import { Box, InputLabel, Typography } from '@mui/material';

import ChatEntry from './ChatEntry';
import Messages from './Messages';

export default function Chat({ journalId, focusedEntryId, chat, setChat }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <InputLabel htmlFor="new-message" sx={{ color: 'inherit' }}>
                <Typography variant="h2">Chat</Typography>
            </InputLabel >
            {chat.messages && <Box sx={{ overflowY: 'auto', overflowX: 'hidden', flexGrow: 1, maxHeight: '50vh', pl: '1.6em', pr: '1.6em' }}>
                <Messages
                    chat={chat}
                />
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