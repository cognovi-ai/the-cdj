import { Box, Collapse, Divider, IconButton, InputLabel, Typography } from '@mui/material';
import { ArrowDropDown as DownIcon, ArrowDropUp as UpIcon } from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';

import ChatEntry from './ChatEntry';
import Messages from './Messages';

export default function Chat({ journalId, focusedEntryId, focusedData, chat, setChat }) {
    const messagesEndRef = useRef(null);
    const lastMessageRef = useRef(null);
    const alignChatRef = useRef(null);

    const [hasSent, setHasSent] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (messagesEndRef.current) {
            if (hasSent) alignChat();
            else messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    }, [chat, isCollapsed]);

    useEffect(() => {
        if (isFocused) alignChat();
    }, [isFocused]);

    const handleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    }

    const alignChat = () => {
        lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });

        // Ensure previous scroll has finished
        setTimeout(() => {
            alignChatRef.current.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
        }, 50);
    }

    return (
        <Box
            ref={alignChatRef}
            sx={{ display: 'flex', flexDirection: 'column' }}
        >
            <InputLabel
                htmlFor="new-message"
                sx={{ color: 'inherit' }}
            >
                <Typography variant="h2" >
                    Chat
                    <IconButton aria-label="Collapse" color="primary" onClick={handleCollapse} size="small">
                        {isCollapsed ? <DownIcon /> : <UpIcon />}
                    </IconButton>
                </Typography>
            </InputLabel >
            <InputLabel
                htmlFor="new-message"
                sx={{ color: 'inherit' }}
            >
                <Typography mb="1.5em" variant="body1">
                    Talk about <i>{focusedData?.entry?.title}</i>.
                </Typography>
            </InputLabel>
            {isCollapsed && <Divider />}
            <Collapse in={!isCollapsed} timeout="auto" unmountOnExit>
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
                    setIsFocused={setIsFocused}
                />
            </Collapse>
        </Box>
    )
}