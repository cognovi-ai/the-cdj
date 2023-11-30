import Account from '../../../components/access/private/Account/Account';

import { AccountProvider } from '../../../context/AccountProvider';

import { useEffect } from 'react';
import { useJournal } from '../../../context/useJournal';
import { useNavigate } from 'react-router-dom';

export default function AccountRoute() {
    const { journalId } = useJournal();

    const navigate = useNavigate();

    useEffect(() => {
        if (!journalId) {
            navigate('/login');
        }

    }, [journalId]);

    return (
        <> {journalId && (
            <AccountProvider>
                <Account />
            </AccountProvider>
        )}
        </>
    );
}