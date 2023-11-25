import { Box, Grid, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import Chat from './chat/Chat';
import { useEntries } from '../../../hooks/useEntries';

export default function Analysis({ journalId, focusedEntryId, editedEntryId }) {
    const [focusedData, setFocusedData] = useState({});
    const [chat, setChat] = useState({});

    const entries = useEntries();

    useEffect(() => {
        const makeRequest = async () => {
            try {
                if (!focusedEntryId.length) {
                    setChat();
                    setFocusedData();
                    return
                }

                const entryAnalysisData = await entries(`/${ focusedEntryId }/analysis`, 'GET');

                setFocusedData(entryAnalysisData);

                const chatData = await entries(`/${ focusedEntryId }/chat`, 'GET');

                setChat(chatData);

            } catch (error) {
                console.error(error);
            }
        };

        makeRequest();
    }, [focusedEntryId, editedEntryId]);

    return (
        <div>
            <Box>
                <Typography variant="h2">Thought Analysis</Typography>
                <Grid container spacing={2}>
                    <Grid item md={6} xs={12}>
                        <Typography variant="body1">{focusedData && focusedData.entry && focusedData.entry.content}</Typography>
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
