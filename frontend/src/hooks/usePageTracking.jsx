import ReactGA from 'react-ga4';

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function usePageTracking() {
    const location = useLocation();

    useEffect(() => {
        ReactGA.send({ hitType: 'pageview', page: location.pathname });
    }, [location]);
}