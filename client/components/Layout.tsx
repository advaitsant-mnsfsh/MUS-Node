import React from 'react';
import { GlobalNavbar } from './GlobalNavbar';
import { GlobalProgressBanner } from './GlobalProgressBanner';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col font-['DM_Sans']">
            <GlobalNavbar />
            <GlobalProgressBanner />
            <main className="flex-grow">
                {children}
            </main>
        </div>
    );
};
