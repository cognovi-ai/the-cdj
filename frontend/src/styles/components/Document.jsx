import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Document = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    minWidth: '100vw',
}));