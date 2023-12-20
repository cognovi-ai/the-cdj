import './Home.css'

import { Box, Typography, useMediaQuery } from '@mui/material';
import { createRef, useEffect, useRef } from 'react';

const cds = [
    { example: 'If I can\'t get this perfectly, then I must not be good enough.', distortion: 'All-or-Nothing Thinking' },
    { example: 'Why does this always happen to me?', distortion: 'Overgeneralization' },
    { example: 'What good can come from that?', distortion: 'Mental Filter' },
    { example: 'It doesn\'t matter, anyone could have done it.', distortion: 'Disqualifying the Positive' },
    { example: 'I know you dont\'t think I can do this.', distortion: 'Mind Reading' },
    { example: 'I\'m going to embarrass myself.', distortion: 'Fortune Telling' },
    { example: 'What if it ruins everything?', distortion: 'Catastrophizing' },
    { example: 'There\'s nothing significant about my achievements.', distortion: 'Minimization' },
    { example: 'I feel like a failure so I guess that makes me one.', distortion: 'Emotional Reasoning' },
    { example: 'I should be doing much better than I am.', distortion: 'Should Statements' },
    { example: 'They didn\'t have a good time because of me.', distortion: 'Personalization' },
]

export default function Home() {
    const boxRef = useRef(null);
    const cdRefs = cds.map(() => ({ example: createRef(), distortion: createRef() }));

    // Check if the screen size matches the 'md' breakpoint or larger
    const matches = useMediaQuery(theme => theme.breakpoints.up('sm'));

    useEffect(() => {
        const scrollInterval = setInterval(() => {
            if (boxRef.current) {
                boxRef.current.scrollTop += 1;
            }
        }, 50);

        const observer = new IntersectionObserver((entries) => {
            if (matches) {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('grow');
                        entry.target.previousSibling.classList.add('shrink');
                    } else {
                        entry.target.classList.remove('grow');
                        entry.target.previousSibling.classList.remove('shrink');
                    }
                });
            }
        }, { threshold: 0.5 });

        cdRefs.forEach((ref) => {
            if (ref.distortion.current) {
                observer.observe(ref.distortion.current);
            }
        });

        return () => {
            clearInterval(scrollInterval);
            cdRefs.forEach((ref) => {
                if (ref.distortion.current) {
                    observer.unobserve(ref.distortion.current);
                }
            });
        };
    }, []);


    return (
        <Box className="home">
            <Typography
                align="center"
                className="title"
                justifyContent="center"
                marginBottom="2em"
                variant="h1"
            >
                The Cognitive Distortion Journal
            </Typography>
            <Typography
                m="2em"
                overflow={'wrap'}
                variant="body1"
            >
                Cognitive distortions are ways in which our mind convinces us of things that are not true. These thoughts reinforce negative thinking or emotions. They tell us things that seem to make sense, but really only serve to keep us feeling bad about ourselves. These mental filters, or mind traps, can warp our view of reality in a negative way. They become the lens we use to view the world and others around us.
            </Typography>
            <Box className="container">
                <Box className="box" ref={boxRef}>
                    {cds.map((cd, index) => (
                        <Box
                            className="cd"
                            key={index}
                            margin="2em"
                            padding="1em"
                        >
                            <Typography
                                align="center"
                                className="cd-example"
                                ref={cdRefs[index].example}
                                variant="body1"
                            >
                                {cd.example}
                            </Typography>
                            <Typography
                                align="center"
                                className="cd-distortion"
                                ref={cdRefs[index].distortion}
                                variant="body2"
                            >
                                {cd.distortion}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box >
    );
}