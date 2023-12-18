import Entries from '../../components/entries/Index'

import { useEffect } from 'react';
import { useJournal } from '../../contexts/useJournal';
import { useNavigate } from 'react-router-dom';

export default function Index() {
    const { journalId } = useJournal();

    const navigate = useNavigate();

    useEffect(() => {
        if (!journalId) {
            navigate('/login', { state: { from: '/entries' } });
        }

    }, [journalId]);

    return (
        <> {journalId && (
            <Entries />
        )}
        </>
    );
}
