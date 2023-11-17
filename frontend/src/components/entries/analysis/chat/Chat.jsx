import { Box, InputLabel, Typography } from '@mui/material';

import ChatEntry from './ChatEntry';
import Messages from './Messages';

export default function Chat({ journalId, focusedEntryId, chat, setChat }) {
    return (
        <Box>
            <InputLabel sx={{ color: "inherit" }} htmlFor="new-message">
                <Typography variant='h2'>Chat</Typography>
            </InputLabel >
            <Messages
                chat={chat}
            />
            <ChatEntry
                journalId={journalId}
                focusedEntryId={focusedEntryId}
                chat={chat}
                setChat={setChat}
            />
        </Box>
    )
}