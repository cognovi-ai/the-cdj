import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Connect from './Forms/Connect';
import Container from '@mui/material/Container';
import MenuLink from '../../../nav/menus/MenuLink';
import Paper from '@mui/material/Paper';
import Password from './Forms/Password';
import Profile from './Forms/Profile';
import Review from './Forms/Review';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';

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

function getStepContent(step) {
    switch (step) {
        case 0:
            return <Profile />;
        case 1:
            return <Password />;
        case 2:
            return <Connect />;
        case 3:
            return <Review />;
        default:
            throw new Error('Unknown step');
    }
}

export default function Account() {
    const [activeStep, setActiveStep] = React.useState(0);
    const [updating, setUpdating] = React.useState(false);

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

    const returnToAccount = () => {
        setUpdating(true);
        setTimeout(() => {
            setActiveStep(0);
            setUpdating(false);
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
                                <Button onClick={returnToAccount} sx={{ ml: 1 }} variant="contained">
                                    Update
                                </Button>
                            ) :
                                <Button onClick={handleReview} variant="contained">
                                    Review
                                </Button>}
                        </Box>
                    </Box>
                )}
            </Paper>
            <Copyright />
        </Container>
    );
}