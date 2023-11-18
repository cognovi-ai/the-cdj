import { AltRoute as AltRouteIcon } from '@mui/icons-material';
import { Typography } from '@mui/material';

export default function TitleStacked() {
    return (
        <>
            <AltRouteIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
            <Typography
                component="a"
                noWrap
                sx={{
                    mr: 2,
                    display: { xs: 'flex', md: 'none' },
                    flexGrow: 1,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '.3rem',
                    color: 'inherit',
                    textDecoration: 'none',
                }}
                variant="h5"
            >
                The CDJ
            </Typography>
        </>
    )
}