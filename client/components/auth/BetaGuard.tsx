import React, { useState, useEffect } from 'react';
import { isBetaSubdomain, hasBetaAccess } from '../../lib/betaUtils';
import { BetaAccessPage } from './BetaAccessPage';

interface BetaGuardProps {
    children: React.ReactNode;
}

export const BetaGuard: React.FC<BetaGuardProps> = ({ children }) => {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [isBeta, setIsBeta] = useState<boolean>(false);

    useEffect(() => {
        const betaStatus = isBetaSubdomain();
        setIsBeta(betaStatus);

        if (betaStatus) {
            setIsAuthorized(hasBetaAccess());
        } else {
            setIsAuthorized(true); // Not a beta subdomain, access granted
        }
    }, []);

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
