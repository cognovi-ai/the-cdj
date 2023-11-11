import Typography from '@mui/material/Typography';
import AltRouteIcon from '@mui/icons-material/AltRoute';

export default function TitleStacked() {
    return (
        <>
            <AltRouteIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
            <Typography
                variant="h5"
                noWrap
                component="a"
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
            >
                The CDJ
            </Typography>
        </>
    )
}