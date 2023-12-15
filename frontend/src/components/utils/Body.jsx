import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Body = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#282828' : 'transparent',
    padding: '2em',
    boxShadow: 'none',
}));