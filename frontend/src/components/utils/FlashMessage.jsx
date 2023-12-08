import { Alert, Collapse, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export default function FlashMessage({ message, severity, onClose }) {
    return (
        <Collapse in={true} sx={{ mb: 2 }}>
            <Alert
                action={
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        onClick={onClose}
                        size="small"
                    >
                        <CloseIcon fontSize="inherit" />
                    </IconButton>
                }
                severity={severity}
            >
                {message}
            </Alert>
        </Collapse>
    );
}
