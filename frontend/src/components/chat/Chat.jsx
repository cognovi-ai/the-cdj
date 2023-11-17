import { Box, Typography } from '@mui/material';

import ChatEntry from './ChatEntry';
import Messages from './Messages';

export default function Chat({ journalId, focusedEntryId, chat, setChat }) {
    return (
        <Box>
            <Typography variant='h2'>Chat</Typography>
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