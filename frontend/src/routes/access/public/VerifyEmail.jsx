import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAccess } from '../../../hooks/useAccess';
import { useEffect } from 'react';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();

    const access = useAccess();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    useEffect(() => {
        const verifyEmail = async () => {

            await access(
                '/verify-email',
                'POST',
                { 'Content-Type': 'application/json' },
                { token },
            )
                .catch((error) => {
                    console.error(error);
                });
        }

        if (token) {
            verifyEmail();
        }

        navigate('/login', { replace: true });
    }, [])
}