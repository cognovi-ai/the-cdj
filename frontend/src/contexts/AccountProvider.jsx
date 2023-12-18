import { AccountContext } from './AccountContext';
import { useState } from 'react';

export const AccountProvider = ({ children }) => {
    const [profile, setProfile] = useState('');
    const [password, setPassword] = useState('');
    const [config, setConfig] = useState('');

    const value = {
        profile,
        setProfile,
        password,
        setPassword,
        config,
        setConfig
    };

    return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};