import { createContext, useContext, useState } from 'react';

// Create the context
const JournalContext = createContext();

// Provider component
export const JournalProvider = ({ children }) => {
    const [journalId, setJournalId] = useState('');
    const [journalTitle, setJournalTitle] = useState('');

    // The value that will be given to the context
    const value = {
        journalId,
        setJournalId,
        journalTitle,
        setJournalTitle
    };

    return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
};

// Hook to use the journal context
export const useJournal = () => {
    const context = useContext(JournalContext);
    if (context === undefined) {
        throw new Error('useJournal must be used within a JournalProvider');
    }
    return context;
};
