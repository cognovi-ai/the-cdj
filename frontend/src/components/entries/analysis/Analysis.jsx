import { Box, Button, Grid, LinearProgress, Tooltip, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import Chat from './chat/Chat';

import { Item } from '../../utils/Item';
import { Update as UpdateIcon } from '@mui/icons-material';
import { useEntries } from '../../../hooks/useEntries';

export default function Analysis({ journalId, focusedEntryId, editedEntryId }) {
    const [focusedData, setFocusedData] = useState({});
    const [updating, setUpdating] = useState(false);
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

    const handleNewAnalysis = (event) => {
        event.preventDefault();

        const makeRequest = async () => {
            setUpdating(true);

            try {
                await entries(`/${ focusedEntryId }/analysis`, 'PUT');

                const entryAnalysisData = await entries(`/${ focusedEntryId }/analysis`, 'GET');

                setFocusedData(entryAnalysisData);
            } catch (error) {
                console.error(error);
            } finally {
                setUpdating(false);
            }
        };

        makeRequest();
    }

    return (
        <Item>
            <Box>
                <Typography variant="h2">
                    {focusedData?.entry?.title}
                </Typography>
                <Grid container spacing={2}>
                    <Grid item md={6} xs={12}>
                        <Typography variant="body1">
                            {focusedData?.entry?.content}
                        </Typography>
                    </Grid>
                    <Grid item md={6} xs={12}>
                        {updating ? (
                            <>
                                <Typography
                                    fontStyle={'italic'}
                                    variant="body1"
                                >
                                    Please wait. Generating a new analysis...
                                </Typography>
                                <LinearProgress color="edit" />
                            </>
                        ) : (
                            <Typography variant="body2">
                                {focusedData?.analysis_content}
                            </Typography>
                        )
                        }
                        <Tooltip title="Generate a new analysis">
                            <Box display="flex" justifyContent="flex-end">
                                <Button
                                    disabled={updating}
                                >
                                    <UpdateIcon
                                        fontSize="small"
                                        onClick={handleNewAnalysis}
                                    />
                                </Button>
                            </Box>
                        </Tooltip>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="caption">
                            {focusedData?.created_at}
                        </Typography>
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
        </Item>
    );
}
