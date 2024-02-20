import './Dashboard.css';
import { Box, Button, Card, Typography } from '@mui/material';

import { useReports } from '../../hooks/useReports';
import { useState } from 'react';

export default function Dashboard() {
    const [report, setReport] = useState();

    const reports = useReports();

    const getReport = async () => {
        try {
            const data = await reports('/weekly', 'GET');
            setReport(data);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Box className="dashboard">
            <Typography mb={4} textAlign="center" variant="h1">
                Reports Dashboard
            </Typography>
            <Box className="report">
                <Typography variant="h2">
                    Weekly Report
                </Typography>
                <Button color="primary" onClick={getReport} variant="contained">
                    View
                </Button>
                {report && <Card className="card" sx={{ p: '1em 2em', m: '2em 0em' }}>
                    <Typography variant="h3">
                        Summary
                    </Typography>
                    <Typography>
                        {report.summary}
                    </Typography>
                </Card>}
            </Box>
        </Box>
    );
}
