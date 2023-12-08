import { Alert, Collapse, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';

import { Close as CloseIcon } from '@mui/icons-material';

export default function FlashMessage({ message, severity, onClose }) {
    const [open, setOpen] = useState(true);

    useEffect(() => {
        const time = () => {
            switch (severity) {
                case 'error':
                    return 25000;
                case 'warning':
                    return 15000;
                case 'info':
                    return 20000;
                case 'success':
                    return 5000;
                default:
                    return 5000;
            }
        }

        const timer = setTimeout(() => {
            setOpen(false);
        }, time());

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
