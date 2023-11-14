import { Box, IconButton } from '@mui/material';
import { CancelPresentation as UnfocusIcon } from '@mui/icons-material';

import { useState } from "react";

import ChatEntry from '../../chat/ChatEntry';
import Messages from '../../chat/Messages';

export default function Analysis({ focusedData, setFocusing }) {
    const [messages, setMessages] = useState([]);
    const [chatData, setChatData] = useState({
        content: '',
        createdAt: Date(),
    });

    const handleUnfocus = () => {
        setFocusing(false);
    }

    return (
        <div>
            <Box>
                <h2>Thought Analysis</h2>
                <h3>{focusedData.content}</h3>
                <p>TODO: Setup Analyses.</p>
                <div>
                    <IconButton
                        aria-label="Unfocus"
                        color="primary"
                        onClick={() => handleUnfocus()}>
                        <UnfocusIcon />
                    </IconButton>
                </div>
            </Box>
            <Box>
                <Messages
                    messages={messages}
                />
                <ChatEntry
                    messages={messages}
                    setMessages={setMessages}
                    chatData={chatData}
                    setChatData={setChatData}
                />
            </Box>
        </div>
    );
}