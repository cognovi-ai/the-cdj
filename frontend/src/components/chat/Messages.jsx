import React from 'react';
import { Grid, Typography } from '@mui/material';

import "./Messages.css";

export default function Messages({ chat }) {
    return (
        <div>
            {chat.messages && chat.messages.map((message, index) => (
                <Grid container margin="0 0 1em" spacing={1} key={index}>
                    <Grid item xs={6} />
                    <Grid item xs={6} style={{ textAlign: 'right' }}>
                        <div className="message-bubble blue-bg">
                            <Typography variant="body2">
                                {message.message_content}
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item xs={6} style={{ textAlign: 'left' }}>
                        <div className="message-bubble gray-bg">
                            <Typography variant="body2">
                                {message.llm_response}
                            </Typography>
                        </div>
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
