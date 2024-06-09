import { Outlet } from "react-router-dom";

import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import RightSidebar from "@/components/shared/RightSidebar";

const RootLayout = () => {
  return (
    <div className="flex flex-col md:flex-row w-full pt-16">
      <Topbar />
      <div className="md:hidden">
        <Bottombar />
      </div>
      <div className="flex flex-1">
        <div className="hidden md:flex lg:w-[25%] md:w-[15%]">
          <LeftSidebar />
        </div>
        <div className="flex-1 w-full p-4">
          <Outlet />
        </div>
        <div className="hidden md:flex lg:w-[25%] md:w-[15%]">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default RootLayout;
