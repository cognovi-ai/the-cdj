import { Box, Button, Container, Paper, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import Config from './Forms/Config';
import MenuLink from '../../../nav/menus/MenuLink';
import Password from './Forms/Password';
import Profile from './Forms/Profile';
import Review from './Forms/Review';

import { useAccess } from '../../../../hooks/useAccess';
import { useJournal } from '../../../../context/useJournal';

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

const steps = ['Profile', 'Password', 'Config'];

export default function Account() {
    const [activeStep, setActiveStep] = useState(0);
    const [updating, setUpdating] = useState(false);
    const [profile, setProfile] = useState({})
    const [password, setPassword] = useState({})
    const [config, setConfig] = useState({})

    const { journalId } = useJournal();
    const access = useAccess();

    useEffect(() => {
        const makeRequest = async () => {
            try {
                // Get the account data
                const data = await access(`/${ journalId }/account`, 'GET');

                // Set the profile data
                setProfile({
                    fname: data.user.fname,
                    lname: data.user.lname,
                    email: data.user.email,
                });

                // Set the config data
                setConfig({
                    model: data.config.model,
                    apiKey: data.config.apiKey,
                });

            } catch (error) {
                console.error(error);
            }
        };

        makeRequest();
    }, []);


    function getStepContent(step) {
        switch (step) {
            case 0:
                return <Profile profile={profile} setProfile={setProfile} />;
            case 1:
                return <Password password={password} setPassword={setPassword} />;
            case 2:
                return <Config config={config} setConfig={setConfig} />;
            case 3:
                return <Review account={{ ...profile, ...password, ...config }} />;
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
        setActiveStep(steps.length);
    };

    const handleUpdate = () => {
        console.log('Updating account', { ...profile, ...password, ...config });

        setUpdating(true);
        setTimeout(() => {
            setActiveStep(0);
            setUpdating(false);
            setPassword({});
        }, 3000);
    }

    return (
        <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
            <Paper sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }} variant="outlined">
                <Typography align="center" component="h1" variant="h4">
                    Account
                </Typography>
                <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
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
                                <Button onClick={handleUpdate} sx={{ ml: 1 }} variant="contained">
                                    Update
                                </Button>
                            ) :
                                <Button onClick={handleReview} variant="contained">
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