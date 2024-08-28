import { Outlet } from "react-router-dom";
import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import RightSidebar from "@/components/shared/RightSidebar";

const RootLayout = () => {
  return (
    <div className="flex flex-col md:flex-row w-full">
      <Topbar />
      <div className="flex flex-1 pt-16">
        <aside
          aria-label="Left Sidebar"
          className="hidden md:flex lg:w-[20%] md:w-[15%]"
        >
          <LeftSidebar />
        </aside>
        <main className="flex-1 w-full p-4 pb-16 md:pb-4">
          <Outlet />
        </main>
        <aside
          aria-label="Right Sidebar"
          className="hidden md:flex lg:w-[20%] md:w-[15%]"
        >
          <RightSidebar />
        </aside>
      </div>
      <div aria-label="Bottom Navigation" className="fixed bottom-0 left-0 right-0 md:hidden">
        <Bottombar />
      </div>
    </div>
  );
};

export default RootLayout;
