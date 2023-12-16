import './Home.css'

import { Box, Typography } from '@mui/material';

export default function Home() {
    return (
        <Box className="home" display="flex" flexDirection="column">
            <Box className="container">
                <Typography
                    align="center"
                    className="title"
                    justifyContent="center"
                    marginBottom="2em"
                    marginTop="4em"
                    variant="h1"
                >
                    The Cognitive Distortion Journal
                </Typography>
                <Typography
                    margin="2em 10em"
                    marginBottom="4em"
                    variant="body1"
                >
                    Cognitive distortions are ways in which <i>our mind convinces us of things that are not true</i>. These thoughts reinforce negative thinking or emotions. They tell us things that seem to make sense, but really only serve to keep us feeling bad about ourselves. These <i>mental filters</i>, or <i>mind traps</i>, warp our view of reality in a negative way. They become the lens we use to view the world and others around us.
                </Typography>
                <Typography
                    align="center"
                    className="quote"
                    variant="body2"
                >
                    We live in a <i>fantasy</i> world, a world of <i>illusion.</i> The great task in life is to <i>find reality.</i>
                </Typography>
            </Box>
        </Box >
    );
}