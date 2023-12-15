import './Account.css';

import { Box, Button, Container, LinearProgress, Paper, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import Config from './Forms/Config';
import MenuLink from '../../../nav/menus/MenuLink';
import Password from './Forms/Password';
import Profile from './Forms/Profile';
import Review from './Forms/Review';

import { useAccess } from '../../../../hooks/useAccess';
import { useAccount } from '../../../../context/useAccount';
import { useJournal } from '../../../../context/useJournal';

import { useNavigate } from 'react-router-dom';

const steps = ['Profile', 'Password', 'Config'];

function buildRequestBody(account) {
    return Object.keys(account).reduce((requestBody, key) => {
        // Filter out undefined values
        const subObject = Object.entries(account[key])
            .filter(([, subValue]) => subValue !== undefined)
            .reduce((obj, [subKey, subValue]) => ({ ...obj, [subKey]: subValue }), {});

        return Object.keys(subObject).length ? { ...requestBody, [key]: subObject } : requestBody;
    }, null);
}

/**
 * Used to remove values from Account context if they match pre-filled form 
 * values retrieved from the server to prevent unnecessary updates.
 */
const removeMatchingProperties = (source, reference) => {
    if (source && reference) {
        Object.keys(source).forEach(key => {
            if (source[key] && reference[key] && typeof source[key] === 'object' && typeof reference[key] === 'object') {
                removeMatchingProperties(source[key], reference[key]);
            } else if (source[key] === reference[key]) {
                delete source[key];
            }
        });
    }
};


function Copyright(props) {
    return (
        <Typography align="center" color="text.secondary" variant="body2" {...props}>
            {'© 2023 '}
            <MenuLink
                page={{
                    label: 'The Cognitive Distortion Journal',
                    name: '',
                    visibility: ''
                }} />
        </Typography>
    );
}

export default function Account() {
    const [activeStep, setActiveStep] = useState(0);
    const [updating, setUpdating] = useState(false);

    // New state for each form
    const [savedProfile, setSavedProfile] = useState({})
    const [savedConfig, setSavedConfig] = useState({})

    // Contains data to update from each form
    const { profile, setProfile, password, setPassword, config, setConfig } = useAccount();

    const { journalId } = useJournal();
    const access = useAccess();
    const navigate = useNavigate();

    useEffect(() => {
        const makeRequest = async () => {
            try {
                // Get the account data
                const data = await access(`/${ journalId }/account`, 'GET');

                // Set the profile data
                setSavedProfile({
                    fname: data.user.fname,
                    lname: data.user.lname,
                    email: data.user.email,
                });

                // Set the config data
                if (data.config)
                    setSavedConfig({
                        model: data.config.model,
                        apiKey: data.config.apiKey,
                    });

            } catch (error) {
                console.error(error);
            }
        };

        makeRequest();
    }, [updating]);


    function getStepContent(step) {
        switch (step) {
            case 0:
                return <Profile savedProfile={savedProfile} />;
            case 1:
                return <Password />;
            case 2:
                return <Config savedConfig={savedConfig} setSavedConfig={setSavedConfig} />;
            case 3:
                return <Review />;
            default:
                throw new Error('Unknown step');
        }
    }

    const handleStepClick = (step) => () => {
        setActiveStep(step);
    };

    const handleNext = () => {
        if (activeStep < steps.length - 1) {
            setActiveStep(activeStep + 1);
        }
    };

    const handleBack = () => {
        if (activeStep > 0) {
            setActiveStep(activeStep - 1);
        }
    };

    const handleReview = () => {
        // Remove matching properties from account
        removeMatchingProperties(profile, savedProfile);
        removeMatchingProperties(config, savedConfig);

        // Go to review step
        setActiveStep(steps.length);
    };

    const handleUpdate = async () => {
        let requireReauth = false;
        try {
            // Build body based on accountMapping
            const body = buildRequestBody({ profile, password, config });

            // If no body, do not update
            if (!body) {
                return;
            }

            setUpdating(true);

            // Update the account
            if (body) {
                await access(
                    `/${ journalId }/account`,
                    'PUT',
                    { 'Content-Type': 'application/json' },
                    body
                );

                if (profile.email || password) {
                    requireReauth = true;
                }

                setProfile({});
                setPassword({});
                setConfig({});
                setActiveStep(0);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setTimeout(() => {
                setUpdating(false);

                if (requireReauth) {
                    navigate('/login', { state: { from: '/account' } });
                }
            }, 3000);
        }
    }

    return (
        <Container className="account" component="main" maxWidth="sm" sx={{ mb: 4 }}>
            <Paper className="tab" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }} variant="outlined">
                <Typography align="center" component="h1" variant="h4">
                    Account
                </Typography>
                <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5, overflowX: 'auto' }}>
                    {steps.map((label, index) => (
                        <Step key={label} onClick={handleStepClick(index)}>
                            <StepLabel>
                                <Button>
                                    {label}
                                </Button>
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
                {updating && (
                    <Box sx={{ mb: 2, ml: 2 }}>
                        <Typography gutterBottom variant="h5">
                            Please wait
                        </Typography>
                        <Typography variant="subtitle1">
                            Your account is being updated...
                        </Typography>
                        <LinearProgress color="edit" sx={{ mt: 2 }} />
                    </Box>
                )}
                {!updating && (
                    <Box>
                        {getStepContent(activeStep)}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5, mb: 1, ml: -1 }}>
                            <Box>
                                {activeStep !== 0 && (
                                    <Button onClick={handleBack} sx={{ ml: 1 }} variant="outlined">
                                        Back
                                    </Button>
                                )}
                                {activeStep < steps.length && activeStep !== steps.length - 1 && (
                                    <Button
                                        onClick={handleNext}
                                        sx={{ ml: 1 }}
                                        variant="outlined"
                                    >
                                        Next
                                    </Button>
                                )}
                            </Box>
                            {activeStep === steps.length ? (
                                <Button
                                    onClick={handleUpdate}
                                    sx={{ ml: 1 }}
                                    variant="contained"
                                >
                                    Update
                                </Button>
                            ) :
                                <Button
                                    onClick={handleReview}
                                    variant="contained"
                                >
                                    Finish
                                </Button>}
                        </Box>
                    </Box>
                )}
            </Paper>
            <Copyright />
        </Container>
    );
}