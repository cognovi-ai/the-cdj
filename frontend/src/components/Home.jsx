import './Home.css'

import { Box, Fade, Grid, Grow, LinearProgress, TextField, Typography } from '@mui/material';
import { createRef, useEffect, useRef, useState } from 'react';

import typeWriter from '../../public/scripts/typeWriter';

export default function Home({ data }) {
    const { cds } = data;

    const [isVisible, setIsVisible] = useState(cds.map(() => false));
    const [typedThought, setTypedThought] = useState('');
    const [typedAnalysis, setTypedAnalysis] = useState('');
    const [isTypingDone, setIsTypingDone] = useState(false);
    const [isAnalysisTypingDone, setIsAnalysisTypingDone] = useState(false);

    const boxRef = useRef(null);
    const cdRefs = cds.map(() => ({ example: createRef(), distortion: createRef() }));

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
    }, [isAnalysisTypingDone]);

    useEffect(() => {
        return () => {
            setTypedThought('');
            setIsTypingDone(false);

            setTimeout(() => {
                typeWriter(cds[0].example, setTypedThought, 60)
                    .then(() => {
                        setIsTypingDone(true);
                        setTypedAnalysis('');
                        typeWriter(cds[0].analysis, setTypedAnalysis, 10)
                            .then(() => {
                                setIsTypingDone(false);
                                setIsAnalysisTypingDone(true)
                            });
                    }
                    );
            }, 1000);
        }
    }, []);

    return (
        <Box className="home">
            <Grid container>
                <Grid item xs={12}>
                    <Typography
                        align="center"
                        className="title"
                        justifyContent="center"
                        // Mb="1em"
                        variant="h1"
                    >
                        The Cognitive Distortion Journal
                    </Typography>
                </Grid>
                <Box sx={{ ml: '2em', mr: '2em', mb: '2em', width: '100%' }}>
                    {!typedAnalysis && <Fade in={true} timeout={2000}>
                        <Typography mb="1em" variant="h2">Check your thought.</Typography>
                    </Fade>}
                    {typedAnalysis && <Fade in={true} timeout={2000}>
                        <Typography mb="1em" variant="h2">Is it a cognitive distortion?</Typography>
                    </Fade>}
                    <TextField
                        InputProps={{
                            readOnly: true,
                            style: { color: 'black' }
                        }}
                        autoFocus
                        disabled={isTypingDone}
                        id="new-entry"
                        label="Enter your thought."
                        maxRows={6}
                        minRows={3}
                        multiline
                        sx={{ width: '100%' }}
                        value={typedThought}
                        variant="outlined"
                    />
                    {isTypingDone && <LinearProgress />}
                    {typedAnalysis &&
                        <Fade in={true} timeout={1000}>
                            <Typography ml="0.9em" mt="1em" variant="h3">{cds[0].label}</Typography>
                        </Fade>
                    }
                    {typedAnalysis &&
                        <Fade in={true} timeout={2000}>
                            <Typography mb="1em" ml="1em" mr="1em" variant="body2">{typedAnalysis}</Typography>
                        </Fade>
                    }
                </Box>
                <Grid item md={6} xs={12}>
                    {isAnalysisTypingDone &&
                        <>
                            <Fade in={true} timeout={1000}>
                                <Typography mb="-1em" ml="1.3em" variant="h2">Cognitive distortions</Typography>
                            </Fade>
                            <Fade in={true} timeout={2000}>
                                <Typography
                                    ml="1em"
                                    mr="1em"
                                    overflow={'wrap'}
                                    p="1em"
                                    variant="body1"
                                >
                                    are ways in which our mind convinces us of things that are not true. They do us a disservice by reinforcing negative thinking and unpleasant emotions. These mental filters, or mind traps, detrimentally warp our view of reality. They become the lens we use to view the world and others around us.
                                </Typography>
                            </Fade>
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
                        </>
                    }
                </Grid>
                <Grid item md={6} xs={12}>
                    {isAnalysisTypingDone &&
                        <>
                            <Fade in={true} timeout={1000}>
                                <Typography mb="-1em" ml="1.3em" variant="h2">In cognitive behavioral therapy</Typography>
                            </Fade>
                            <Fade in={true} timeout={2000}>
                                <Typography
                                    ml="1em"
                                    mr="1em"
                                    overflow={'wrap'}
                                    p="1em"
                                    variant="body1"
                                >
                                    cognitive distortions are addressed through identification and then a reframing. This journal is designed to help you identify and reframe such thinking. It is a tool that can help you become more aware of your thoughts and feelings, and help you achieve a more positive and optimistic outlook on life.
                                </Typography>
                            </Fade>
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
                        </>
                    }
                </Grid>
            </Grid >
        </Box >
    );
}