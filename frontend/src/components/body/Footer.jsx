import { AppBar, Toolbar } from '@mui/material';

export default function Footer() {
    return (
        <AppBar color="primary" position="static">
            <Toolbar>
                <h5>
                    {`© ${ new Date().getFullYear() } The Cognitive Distortion Journal`}
                </h5>
            </Toolbar>
        </AppBar>
    );
}