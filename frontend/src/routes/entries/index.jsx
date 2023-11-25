import Entries from '../../components/entries/Index'

import { useEffect } from 'react';
import { useJournal } from '../../context/useJournal';
import { useNavigate } from 'react-router-dom';

export default function Index() {
    const { journalId } = useJournal();

    const navigate = useNavigate();

    useEffect(() => {
        if (!journalId) {
            navigate('/login');
        }

    }, [journalId]);

    return (
        <> {journalId && (
            <Entries />
        )}
        </>
    );
}
