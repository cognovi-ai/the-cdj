import React from 'react';
import { Stack, Grid, Typography } from '@mui/material';

export default function Messages({ chat }) {
    return (
        <div>
            {chat.messages && chat.messages.map((message, index) => (
                <Grid container margin="0 0 1em" spacing={1} key={index}>
                    <Grid item xs={6} />
                    <Grid item xs={6}>
                        <Typography align="left" variant="body2">
                            {message.message_content}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography align="left" variant="body2">
                            {message.llm_response}
                        </Typography>
                    </Grid>
                    <Grid item xs={6} />
                    <Grid item xs={12}>
                        <Typography display="block" align="center" variant="caption">
                            {message.created_at}
                        </Typography>
                    </Grid>
                </Grid>
            ))}
        </div>
    );
}
