import Typography from '@mui/material/Typography';
import AltRouteIcon from '@mui/icons-material/AltRoute';

export default function TitleUnstacked() {
    return (
        <>
            <AltRouteIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            <Typography
                variant="h6"
                noWrap
                component="a"
                sx={{
                    mr: 2,
                    display: { xs: 'none', md: 'flex' },
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '.3rem',
                    color: 'inherit',
                    textDecoration: 'none',
                }}
            >
                The CDJ
            </Typography>
        </>
    )
}