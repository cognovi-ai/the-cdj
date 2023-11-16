import { Box, IconButton } from '@mui/material';
import { CancelPresentation as UnfocusIcon } from '@mui/icons-material';

import { useEffect, useState } from "react";

import ChatEntry from '../../chat/ChatEntry';
import Messages from '../../chat/Messages';

export default function Analysis({ journalId, focusedEntryId, setFocusing }) {
    const [focusedData, setFocusedData] = useState({});
    const [messages, setMessages] = useState([]);
    const [chatData, setChatData] = useState({
        content: '',
        createdAt: Date(),
    });

    useEffect(() => {
        const makeRequest = async () => {
            try {
                // Fetch the entry analysis data to display
                const entryUrl = `http://192.168.50.157:3000/journals/${ journalId }/entries/${ focusedEntryId }/analysis`;
                const entryAnalysisResponse = await fetch(entryUrl);

                if (!entryAnalysisResponse.ok) {
                    throw new Error("Network response was not ok");
                }

                const entryAnalysisData = await entryAnalysisResponse.json();

                setFocusedData(entryAnalysisData);

            } catch (error) {
                console.error("Error:", error);
            }
        };

        makeRequest();
    }, []);

    const handleUnfocus = () => {
        setFocusing(false);
    }

    return (
        <div>
            <Box>
                <h2>Thought Analysis</h2>
                <h3>{focusedData.content}</h3>
                <p>{focusedData.analysis_content}</p>
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
                    journalId={journalId}
                    messages={messages}
                    setMessages={setMessages}
                    focusedEntryId={focusedEntryId}
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