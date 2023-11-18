import { Box, Grid, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import Chat from './chat/Chat';

export default function Analysis({ journalId, focusedEntryId, editedEntryId }) {
    const [focusedData, setFocusedData] = useState({});
    const [chat, setChat] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!focusedEntryId.length) {
                    setChat();
                    setFocusedData();
                    return
                }

                // Fetch the entry analysis data to display
                const entryUrl = `http://192.168.50.157:3000/journals/${ journalId }/entries/${ focusedEntryId }/analysis`;
                const entryAnalysisResponse = await fetch(entryUrl);

                if (!entryAnalysisResponse.ok) {
                    throw new Error('Network response was not ok');
                }

                const entryAnalysisData = await entryAnalysisResponse.json();

                setFocusedData(entryAnalysisData);

                // Fetch chat data and set it here
                const chatEntryUrl = `http://192.168.50.157:3000/journals/${ journalId }/entries/${ focusedEntryId }/chat`;
                const chatResponse = await fetch(chatEntryUrl);

                if (!chatResponse.ok) {
                    throw new Error('Network response for chat was not ok');
                }

                const chatData = await chatResponse.json();
                setChat(chatData);

            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchData();
    }, [focusedEntryId, editedEntryId]);

    return (
        <div>
            <Box>
                <Typography variant="h2">Thought Analysis</Typography>
                <Grid container spacing={2}>
                    <Grid item md={6} xs={12}>
                        <Typography variant="body1">{focusedData && focusedData.content}</Typography>
                    </Grid>
                    <Grid item md={6} xs={12}>
                        <Typography variant="body2">{focusedData && focusedData.analysis_content}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="caption">{focusedData && focusedData.created_at}</Typography>
                    </Grid>
                </Grid>
            </Box>
            <Box>
                <Chat
                    chat={chat}
                    focusedEntryId={focusedEntryId}
                    journalId={journalId}
                    setChat={setChat}
                />
            </Box>
        </div>
    );
}
