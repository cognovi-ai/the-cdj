import { Box } from '@mui/material';

import ChatEntry from './ChatEntry';
import Messages from './Messages';

export default function Chat({ journalId, focusedEntryId, chat, setChat }) {
    return (
        <Box>
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