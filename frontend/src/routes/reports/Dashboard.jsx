import Dashboard from '../../components/reports/Dashboard';

import { useEffect } from 'react';
import { useJournal } from '../../contexts/useJournal';
import { useNavigate } from 'react-router-dom';

export default function DashboardRoute() {
    const { journalId } = useJournal();

    const navigate = useNavigate();

    useEffect(() => {
        if (!journalId) {
            navigate('/login', { state: { from: '/entries' } });
        }

    }, [journalId]);

    return (
        <> {journalId && (
            <Dashboard />
        )}
        </>
    );
}
