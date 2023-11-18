import { AltRoute as AltRouteIcon } from '@mui/icons-material';
import { Typography } from '@mui/material';

export default function TitleUnstacked() {
    return (
        <>
            <AltRouteIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            <Typography
                component="a"
                noWrap
                sx={{
                    mr: 2,
                    display: { xs: 'none', md: 'flex' },
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '.3rem',
                    color: 'inherit',
                    textDecoration: 'none',
                }}
                variant="h6"
            >
                The CDJ
            </Typography>
        </>
    )
}