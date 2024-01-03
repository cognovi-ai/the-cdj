import './Home.css'

import { Box, Fade, Grid, Grow, Typography } from '@mui/material';
import { createRef, useEffect, useRef, useState } from 'react';

export default function Home({ data }) {
    const { cds } = data;
    const boxRef = useRef(null);
    const cdRefs = cds.map(() => ({ example: createRef(), distortion: createRef() }));
    const [isVisible, setIsVisible] = useState(cds.map(() => false));

    useEffect(() => {
        // Set initial scroll position to the bottom
        if (boxRef.current) {
            boxRef.current.scrollTop = boxRef.current.scrollHeight;
        }

        const scrollInterval = setInterval(() => {
            if (boxRef.current) {
                boxRef.current.scrollTop -= 1;
            }
        }, 40);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const index = cds.findIndex(cd => cd.label === entry.target.getAttribute('data-label'));
                const isEntryVisible = entry.isIntersecting;
                setIsVisible(prev => {
                    const newVisibility = [...prev];
                    newVisibility[index] = isEntryVisible;
                    return newVisibility;
                });
            });


        }, { threshold: 1 });

        cdRefs.forEach((ref) => {
            if (ref.distortion.current) {
                observer.observe(ref.distortion.current);
            }
        });

        return () => {
            clearInterval(scrollInterval);
        };
    }, []);

    return (
        <Box className="home">
            <Grid container>
                <Grid item xs={12}>
                    <Typography
                        align="center"
                        className="title"
                        justifyContent="center"
                        mb="1em"
                        variant="h1"
                    >
                        The Cognitive Distortion Journal
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography
                        align="center"
                        className="header"
                        variant="h3"
                    >
                        I. Cognitive Distortions
                    </Typography>
                </Grid>
                <Grid item md={8} xs={12}>
                    <Typography
                        m="2em"
                        overflow={'wrap'}
                        variant="body1"
                    >
                        Cognitive distortions are ways in which our mind convinces us of things that are not true. They do us a disservice by reinforcing negative thinking and unpleasant emotions. These mental filters, or mind traps, detrimentally warp our view of reality. They become the lens we use to view the world and others around us.
                    </Typography>
                </Grid>
                <Grid item md={4} xs={12}>
                    <Box className="container">
                        <Box className="box" ref={boxRef}>
                            {cds.map((cd, index) => (
                                <Box
                                    className="cd"
                                    data-label={cd.label}
                                    key={index}
                                    mb="4em"
                                    ml="2em"
                                    mr="2em"
                                    ref={cdRefs[index].distortion}>
                                    <Typography
                                        align="center"
                                        ref={cdRefs[index].example}
                                        sx={{ fontSize: '1em' }}
                                        variant="body1"
                                    >
                                        {cd.example}
                                    </Typography>
                                    <Grow
                                        in={isVisible[index]}
                                        style={{ fontSize: '0.85em' }}
                                        timeout={1000}>
                                        <Typography
                                            align="center"
                                            ref={cdRefs[index].label}
                                            variant="body2"
                                        >
                                            {cd.label}
                                        </Typography>
                                    </Grow>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Typography
                        align="center"
                        className="header"
                        variant="h3"
                    >
                        II. Addressing the Mental Filter
                    </Typography>
                </Grid>
                <Grid item md={8} xs={12}>
                    <Typography
                        m="2em"
                        overflow={'wrap'}
                        variant="body1"
                    >
                        In cognitive behavioral therapy, cognitive distortions are addressed, first, through identification, then through a reframing. This journal is designed to help you identify and reframe such thinking. It is a tool that can help you become more aware of your thoughts and feelings, and help you achieve a more positive and optimistic outlook on life.
                    </Typography>
                </Grid>
                <Grid item md={4} xs={12}>
                    <Box className="container">
                        <Box className="box">
                            {cds.map((cd, index) => (
                                <Box
                                    className="cd"
                                    key={index}
                                    ml="2em"
                                    mr="2em"
                                >
                                    <Fade
                                        hidden={!isVisible[index]}
                                        in={isVisible[index]}
                                        style={{ fontSize: '1em', fontStyle: 'italic' }}
                                        timeout={1000}>
                                        <Typography
                                            align="center"
                                            sx={{ fontSize: '1em' }}
                                            variant="body2"
                                        >
                                            {cd.reframing}
                                        </Typography>
                                    </Fade>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}