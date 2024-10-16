import React, { useState, useEffect } from 'react';
import { Outlet } from "react-router-dom";
import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import RightSidebar from "@/components/shared/RightSidebar";
import FAB from "@/components/shared/FAB";

const RootLayout: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-dark-1">
      <Topbar />

      <div className="flex flex-1 pt-16">
        {!isMobile && (
          <aside className="hidden md:block w-1/5 min-w-[200px] max-w-[300px]">
            <LeftSidebar />
          </aside>
        )}

        <main className="flex-1 w-full p-4 pb-20 md:pb-4">
          <Outlet />
        </main>

        {!isMobile && (
          <aside className="hidden md:block w-1/5 min-w-[200px] max-w-[300px]">
            <RightSidebar />
          </aside>
        )}
      </div>

      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-dark-2">
          <Bottombar />
        </div>
      )}

      <FAB className="fixed right-4 bottom-20 md:bottom-4 z-50" />
    </div>
  );
};

export default RootLayout;