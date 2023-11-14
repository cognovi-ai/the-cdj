import { Box, TextField, IconButton } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

export default function ChatEntry({ messages, setMessages, chatData, setChatData }) {
    const handleSendChat = () => {

        setMessages([
            ...messages,
            { content: chatData, createdAt: Date() }
        ])

        setChatData("");
    }

    return (
        <div>
            <TextField
                label="Dive deeper."
                variant="filled"
                fullWidth
                multiline
                minRows={3}
                maxRows={6}
                onChange={(e) =>
                    setChatData({
                        ...chatData,
                        content: e.target.value,
                    })
                }
            />
            <Box display="flex"
                justifyContent="flex-end"
                marginTop={2}>
                <IconButton
                    aria-label="Send Chat"
                    color="primary"
                    onClick={() => handleSendChat()}>
                    <SendIcon />
                </IconButton>
            </Box>
        </div>
    )
}