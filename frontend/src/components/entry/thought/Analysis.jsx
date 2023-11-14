import { Box, TextField, IconButton } from '@mui/material';
import { CancelPresentation as UnfocusIcon, Send as SendIcon } from '@mui/icons-material';

export default function Analysis({ focusedData, setFocusing, messages, setMessages, chatData, setChatData }) {
    const handleUnfocus = () => {
        setFocusing(false);
    }

    const handleSendChat = () => {

        setMessages([
            ...messages,
            { content: chatData, createdAt: Date() }
        ])

        setChatData("");
    }

    return (
        <div>
            <Box>
                <h2>Thought Analysis</h2>
                <h3>{focusedData.content}</h3>
                <p>TODO: Setup Analyses.</p>
                <div>
                    <IconButton
                        aria-label="Unfocus"
                        color="primary"
                        onClick={() => handleUnfocus()}>
                        <UnfocusIcon />
                    </IconButton>
                </div>
            </Box>
            <Box>
                <h2>Chat</h2>
                {messages.map((message, index) => (
                    <div key={index}>
                        <p>TODO: Setup Chat.</p>
                        {/* FIXME: message.content does not work: Objects are not valid as a React Child */}
                        {/* <p>{message.content}</p> */}
                    </div>
                ))}
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
            </Box>
        </div>
    );
}