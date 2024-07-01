import { Outlet } from "react-router-dom";
import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import RightSidebar from "@/components/shared/RightSidebar";

const RootLayout = () => {
  return (
    <div className="flex flex-col md:flex-row w-full pt-16">
      <Topbar />
      <div className="flex flex-1 pt-16">
        <div className="hidden md:flex lg:w-[25%] md:w-[15%]">
          <LeftSidebar />
        </div>
        <div className="flex-1 w-full p-4 pb-16 md:pb-4">
          <Outlet />
        </div>
        <div className="hidden md:flex lg:w-[25%] md:w-[15%]">
          <RightSidebar />
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 md:hidden">
        <Bottombar />
      </div>
    </div>
  );
};

export default RootLayout;