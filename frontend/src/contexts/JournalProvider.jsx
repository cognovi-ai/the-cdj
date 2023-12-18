import { JournalContext } from './JournalContext';
import { useState } from 'react';

export const JournalProvider = ({ children }) => {
    const [journalId, setJournalId] = useState('');
    const [journalTitle, setJournalTitle] = useState('');

    const value = {
        journalId,
        setJournalId,
        journalTitle,
        setJournalTitle
    };

    return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
};
