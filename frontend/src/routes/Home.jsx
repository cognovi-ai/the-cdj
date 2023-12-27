import './Home.css'

import { Box, Fade, Grid, Grow, Typography } from '@mui/material';
import { createRef, useEffect, useRef, useState } from 'react';

const cds = [
    { example: 'If I can\'t get this perfectly, then I must not be good enough.', label: 'All-or-Nothing Thinking', reframing: 'I don\'t have to be perfect to be good enough.' },
    { example: 'Why does this always happen to me?', label: 'Overgeneralization', reframing: 'This is just one bad thing that happened.' },
    { example: 'What good can come from that?', label: 'Mental Filter', reframing: 'There are good things that can come from this.' },
    { example: 'It doesn\'t matter, anyone could have done it.', label: 'Disqualifying the Positive', reframing: 'I did a good job and I should be proud of myself.' },
    { example: 'I know you dont\'t think I can do this.', label: 'Mind Reading', reframing: 'You may or may not think I know how to do this, but I know I can do it and that\'s what matters.' },
    { example: 'I\'m going to embarrass myself.', label: 'Fortune Telling', reframing: 'I don\'t know what will happen, but I\'ll be okay.' },
    { example: 'What if it ruins everything?', label: 'Catastrophizing', reframing: 'It might not be as bad as I think.' },
    { example: 'There\'s nothing significant about my achievements.', label: 'Minimization', reframing: 'I have achieved a lot and I should be proud of myself.' },
    { example: 'I feel like a failure so I guess that makes me one.', label: 'Emotional Reasoning', reframing: 'I feel like a failure, but that doesn\'t mean I am one.' },
    { example: 'I should be doing much better than I am.', label: 'Should Statements', reframing: 'I\'m doing the best I can and that\'s enough.' },
    { example: 'They didn\'t have a good time because of me.', label: 'Personalization', reframing: 'They seemed like they didn\'t have a good time, I hope they\'re okay.' },
]

export default function Home() {
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
                        variant="h1"
                    >
                        The Cognitive Distortion Journal
                    </Typography>
                </Grid>
                <Grid item md={7} xs={12}>
                    <Typography
                        m="2em"
                        overflow={'wrap'}
                        variant="body1"
                    >
                        Cognitive distortions are ways in which our mind convinces us of things that are not true. They do us a disservice by reinforcing negative thinking and unpleasant emotions. These mental filters, or mind traps, detrimentally warp our view of reality. They become the lens we use to view the world and others around us.
                    </Typography>
                </Grid>
                <Grid item md={5} xs={12}>
                    <Box className="container">
                        <Box className="box" ref={boxRef}>
                            {cds.map((cd, index) => (
                                <Box
                                    className="cd"
                                    data-label={cd.label}
                                    key={index}
                                    m={2}
                                    marginBottom="4em"
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
                <Grid item md={7} xs={12}>
                    <Typography
                        m="2em"
                        overflow={'wrap'}
                        variant="body1"
                    >
                        In cognitive behavioral therapy, cognitive distortions are addressed, first, through identification, then through a reframing. This journal is designed to help you identify and reframe such thinking. It is a tool that can help you become more aware of your thoughts and feelings, and help you achieve a more positive and optimistic outlook on life.
                    </Typography>
                </Grid>
                <Grid item md={5} xs={12}>
                    <Box className="container">
                        <Box className="box">
                            {cds.map((cd, index) => (
                                <Box
                                    className="cd"
                                    key={index}
                                    m={2}
                                    marginBottom="1em"
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