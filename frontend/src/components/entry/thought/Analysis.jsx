import { Box, IconButton } from '@mui/material';
import { CancelPresentation as UnfocusIcon } from '@mui/icons-material';
import { useEffect, useState } from "react";

import ChatEntry from '../../chat/ChatEntry';
import Messages from '../../chat/Messages';

export default function Analysis({ journalId, focusedEntryId }) {
    const [focusedData, setFocusedData] = useState({});
    const [chat, setChat] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch the entry analysis data to display
                const entryUrl = `http://192.168.50.157:3000/journals/${ journalId }/entries/${ focusedEntryId }/analysis`;
                const entryAnalysisResponse = await fetch(entryUrl);

                if (!entryAnalysisResponse.ok) {
                    throw new Error("Network response was not ok");
                }

                const entryAnalysisData = await entryAnalysisResponse.json();

                setFocusedData(entryAnalysisData);

                // Fetch chat data and set it here
                const chatEntryUrl = `http://192.168.50.157:3000/journals/${ journalId }/entries/${ focusedEntryId }/chat`;
                const chatResponse = await fetch(chatEntryUrl);

                if (!chatResponse.ok) {
                    throw new Error("Network response for chat was not ok");
                }

                const chatData = await chatResponse.json();
                setChat(chatData);

            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchData();
    }, [focusedEntryId]);

    return (
        <div>
            <Box>
                <h2>Thought Analysis</h2>
                <h3>{focusedData.content}</h3>
                <p>{focusedData.analysis_content}</p>
            </Box>
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
        </div>
    );
}
