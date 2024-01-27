import { Box, Collapse, Divider, IconButton, Typography } from '@mui/material';
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
    }, [chat, isCollapsed, hasSent]);

    useEffect(() => {
        if (isFocused) alignChat();
    }, [isFocused]);

    const handleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    }

    const isElementInView = (el) => {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    const alignChat = () => {
        if (lastMessageRef.current && !isElementInView(lastMessageRef.current))
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
            <Box alignItems="center" display="flex">
                <Typography onClick={handleCollapse} sx={{ cursor: 'pointer' }} variant="h2">
                    Chat
                </Typography>
                <IconButton aria-label="Collapse" color="primary" onClick={handleCollapse} size="small">
                    {isCollapsed ? <DownIcon /> : <UpIcon />}
                </IconButton>
            </Box>
            <Typography mb="1.5em" variant="body1">
                <label htmlFor="new-message" style={{ cursor: 'pointer' }}>
                    Talk about <i>{focusedData?.title}</i>.
                </label>
            </Typography>
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