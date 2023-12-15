import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#282828' : 'rgba(255, 255, 255, 0.3)',
    ...theme.typography.body2,
    color: theme.palette.text.primary,
    boxShadow: 'none',
}));