import Logout from '../../../components/access/private/Logout';

import { useEffect } from 'react';
import { useJournal } from '../../../context/useJournal';
import { useNavigate } from 'react-router-dom';

export default function LogoutRoute() {
    const { journalId } = useJournal();

    const navigate = useNavigate();

    useEffect(() => {
        if (!journalId) {
            navigate('/login');
        }

    }, [journalId]);

    return (
        <> {journalId && (
            <Logout />
        )}
        </>
    );
}