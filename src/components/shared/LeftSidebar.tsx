import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { INavLink } from "@/types";
import { sidebarLinks } from "@/constants";
import { Loader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useSignOutAccount } from "@/lib/react-query/queries";
import { useUserContext, INITIAL_USER } from "@/context/AuthContext";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, setUser, setIsAuthenticated, isLoading } = useUserContext();

  const { mutate: signOut } = useSignOutAccount();

  const handleSignOut = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    signOut();
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
    navigate("/sign-in");
  };

  return (
    <div className="flex fixed flex-col overflow-hidden  justify-between gap-6 lg:w-64 w-16 p-6  h-full border-r-2 border-dark-4/80 z-10 bg-black py-10">
      <div className="flex flex-col gap-8">
        {sidebarLinks.map((link: INavLink, index: number) => (
          <NavLink
            key={index}
            to={link.route}
            className="text-light-3 text-white flex items-center gap-4 text-xl">
            <img src={link.icon} alt={link.label} />
            {link.label} 
          </NavLink>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        <Button onClick={handleSignOut} className="bg-red-500 text-white">
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default LeftSidebar;