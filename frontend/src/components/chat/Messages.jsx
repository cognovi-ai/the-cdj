import React from 'react';
import { Stack, Grid, Typography } from '@mui/material';

export default function Messages({ chat }) {
    return (
        <div>
            <h2>Chat</h2>
            {chat.messages && chat.messages.map((message, index) => (
                <Stack margin="0 0 1em" key={index}>
                    <Grid item xs={12}>
                        <Typography align="right" variant="body1">
                            {message.message_content}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography align="left" variant="body1">
                            {message.llm_response}
                        </Typography>
                    </Grid>
                </Stack>
            ))}
        </div>
    );
}
