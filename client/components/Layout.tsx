import React from "react";
import { GlobalNavbar } from "./GlobalNavbar";
import { GlobalProgressBanner } from "./GlobalProgressBanner";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden font-['DM_Sans']">
      <GlobalNavbar />
      <GlobalProgressBanner />
      {/* Page bg on main so full scroll height is tinted (children min-h-full only matches one viewport) */}
      <main
        data-app-scroll-root
        className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-page-bg"
      >
        {children}
      </main>
    </div>
  );
};
