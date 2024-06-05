import { Outlet } from "react-router-dom";

import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import RightSidebar from "@/components/shared/RightSidebar";

const RootLayout = () => {
  return (
    <div className="w-full md:flex pt-16">
      <Topbar />
      <div className="md:flex hidden lg:w-[25%] md:w-[5%]">
        <LeftSidebar />
      </div>
      <div className="w-full">
      <Outlet />
      </div>
      <div className="md:flex hidden lg:w-[25%] md:w-[5%]">
        <RightSidebar />
      </div>
      <Bottombar />
    </div>
  );
};

export default RootLayout;