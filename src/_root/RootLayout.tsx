import { Outlet } from "react-router-dom";
import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import RightSidebar from "@/components/shared/RightSidebar";
import FAB from "@/components/shared/FAB";

const RootLayout: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row w-full">
      {/* Top Navigation Bar */}
      <Topbar />

      {/* Main Content and Sidebars */}
      <div className="flex flex-1 pt-16">
        <aside
          aria-label="Left Sidebar"
          className="hidden md:flex lg:w-[20%] md:w-[15%]"
        >
          <LeftSidebar />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full p-1 pb-16 md:pb-4">
          <Outlet />
        </main>

        <aside
          aria-label="Right Sidebar"
          className="hidden md:flex lg:w-[20%] md:w-[15%]"
        >
          <RightSidebar />
        </aside>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div aria-label="Bottom Navigation" className="fixed bottom-0 left-0 right-0 md:hidden">
        <Bottombar />
      </div>

      {/* Floating Action Button (FAB) */}
      <FAB />
    </div>
  );
};

export default RootLayout;
