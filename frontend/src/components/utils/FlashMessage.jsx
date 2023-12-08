import { Alert, Collapse, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';

import { Close as CloseIcon } from '@mui/icons-material';

export default function FlashMessage({ message, severity, onClose }) {
    const [open, setOpen] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setOpen(false);
        }, severity === 'error' ? 25000 : 5000);

        return () => clearTimeout(timer);
    }, [open]);

    const handleOnClose = () => {
        setOpen(false);
    };

    return (
        <Collapse
            in={open}
            onExited={onClose}
            sx={{ mb: 2 }}
        >
            <Alert
                action={
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        onClick={handleOnClose}
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
