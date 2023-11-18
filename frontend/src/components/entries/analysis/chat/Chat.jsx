import { Box, InputLabel, Typography } from '@mui/material';

import ChatEntry from './ChatEntry';
import Messages from './Messages';

export default function Chat({ journalId, focusedEntryId, chat, setChat }) {
    return (
        <Box>
            <InputLabel htmlFor="new-message" sx={{ color: 'inherit' }}>
                <Typography variant="h2">Chat</Typography>
            </InputLabel >
            <Messages
                chat={chat}
            />
            <ChatEntry
                chat={chat}
                focusedEntryId={focusedEntryId}
                journalId={journalId}
                setChat={setChat}
            />
        </Box>
    )
}