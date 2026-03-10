import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isBetaSubdomain, hasBetaAccess } from '../../lib/betaUtils';
import { BetaAccessPage } from './BetaAccessPage';

interface BetaGuardProps {
    children: React.ReactNode;
}

export const BetaGuard: React.FC<BetaGuardProps> = ({ children }) => {
    const location = useLocation();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [isBeta, setIsBeta] = useState<boolean>(false);

    useEffect(() => {
        const betaStatus = isBetaSubdomain();
        setIsBeta(betaStatus);

        // Public Route Exemptions
        const isPublicRoute =
            location.pathname.startsWith('/shared/') ||
            location.pathname === '/docs/widget' ||
            location.pathname === '/legal';

        if (betaStatus && !isPublicRoute) {
            setIsAuthorized(hasBetaAccess());
        } else {
            setIsAuthorized(true); // Public route or not a beta subdomain
        }
    }, [location.pathname]);

    // While checking initial state
    if (isAuthorized === null) {
        return null;
    }

    // If on beta subdomain and not authorized, show the gate
    if (isBeta && !isAuthorized) {
        return <BetaAccessPage onAuthorized={() => setIsAuthorized(true)} />;
    }

    // Otherwise, show the content
    return <>{children}</>;
};
