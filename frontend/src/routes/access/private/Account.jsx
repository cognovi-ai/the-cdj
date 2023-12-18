import Account from '../../../components/access/private/Account/Account';

import { AccountProvider } from '../../../contexts/AccountProvider';

import { useEffect } from 'react';
import { useJournal } from '../../../contexts/useJournal';
import { useNavigate } from 'react-router-dom';

export default function AccountRoute() {
    const { journalId } = useJournal();

    const navigate = useNavigate();

    useEffect(() => {
        if (!journalId) {
            navigate('/login', { state: { from: '/account' } });
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