import { FlashContext } from './FlashContext';
import { useContext } from 'react';

export const useFlash = () => {
    const context = useContext(FlashContext);
    if (context === undefined) {
        throw new Error('useFlash must be used within a FlashProvider');
    }
    return context;
};
