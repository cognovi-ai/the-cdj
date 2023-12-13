import { useLocation, useNavigate } from 'react-router-dom';

import Login from '../../../components/access/public/Login'

import { useAccess } from '../../../hooks/useAccess';
import { useEffect } from 'react';
import { useJournal } from '../../../context/useJournal';

export default function LoginRoute() {
    const token = localStorage.getItem('token');

    const { setJournalId, setJournalTitle } = useJournal();

    const access = useAccess();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const login = async () => {
            const data = await access(
                '/login',
                'POST',
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ token }`
                },
            );

            // Set the journal ID and title in the context
            setJournalId(data.journalId);
            setJournalTitle(data.journalTitle);

            // Navigate back to the previous page
            const previousPage = location.state?.from || '/entries';
            navigate(previousPage);
        }

        if (token) {
            login();
        }
    }, [])

    return (
        <>
            {!token && <Login />}
        </>
    );
}