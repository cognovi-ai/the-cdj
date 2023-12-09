import './Messages.css';

import { Grid, Typography } from '@mui/material';

export default function Messages({ chat }) {
    return (
        <div>
            {chat && chat.messages && chat.messages.map((message, index) => (
                <Grid container key={index} margin="0 0 1em" spacing={1}>
                    <Grid item xs={4} />
                    <Grid item style={{ textAlign: 'left' }} xs={8}>
                        <div className="message-bubble blue-bg">
                            <Typography variant="body2">
                                {message.message_content}
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item style={{ textAlign: 'left' }} xs={8}>
                        <div className="message-bubble gray-bg">
                            <Typography variant="body2">
                                {message.llm_response}
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item xs={4} />
                    <Grid item xs={12}>
                        <Typography align="center" display="block" variant="caption">
                            {message.created_at}
                        </Typography>
                    </Grid>
                </Grid>
            ))}
        </div>
    );
}
