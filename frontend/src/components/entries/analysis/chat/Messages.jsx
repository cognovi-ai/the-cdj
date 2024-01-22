import './Messages.css';

import { Box, Grid, Typography } from '@mui/material';

import { useEffect } from 'react';

export default function Messages({ chat, lastMessageRef, setHasSent }) {
    useEffect(() => {
        setHasSent(false);
    });

    const getReadableDate = (date) => {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };

        return new Date(date).toLocaleString('en-US', options);
    }


    return (
        <Box sx={{ width: '100%' }}>
            {chat && chat.messages && chat.messages.map((message, index) => (
                <Grid
                    container
                    key={index}
                    margin="0 0 1em"
                    ref={index === chat.messages.length - 1 ? lastMessageRef : null}
                    spacing={1}
                >
                    <Grid item xs={4} />
                    <Grid item style={{ textAlign: 'left' }} xs={8}>
                        <Typography
                            className="message-bubble blue-bg"
                            variant="body2"
                        >
                            {message.message_content}
                        </Typography>
                    </Grid>
                    <Grid item style={{ textAlign: 'left' }} xs={8}>
                        <Typography
                            className="message-bubble gray-bg"
                            variant="body2"
                        >
                            {message.llm_response}
                        </Typography>
                    </Grid>
                    <Grid item xs={4} />
                    <Grid item xs={12}>
                        <Typography
                            align="center"
                            display="block"
                            mt="1em"
                            variant="caption"
                        >
                            {getReadableDate(message.created_at)}
                        </Typography>
                    </Grid>
                </Grid>
            ))}
        </Box>
    );
}
