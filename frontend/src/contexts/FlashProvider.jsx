import { FlashContext } from './FlashContext';
import { useState } from 'react';

export const FlashProvider = ({ children }) => {
    const [flash, setFlash] = useState([]);

    const value = {
        flash,
        setFlash
    };

    return (
        <FlashContext.Provider value={value}>{children}</FlashContext.Provider>
    );
};