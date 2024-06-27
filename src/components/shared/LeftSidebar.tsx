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
    <div className="fixed top-0 left-0 flex flex-col justify-between w-16 lg:w-64 h-full p-6 bg-dark-3 border-r-2 border-dark-4/80 z-10">
      <div className="flex flex-col gap-8">
        {sidebarLinks.map((link: INavLink, index: number) => (
          <NavLink
            key={index}
            to={link.route}
            className="text-light-3 hover:text-primary-500 flex items-center gap-4 text-xl transition-colors duration-200"
          >
            <img src={link.icon} alt={link.label} className="w-6 h-6" />
            <span className="hidden lg:inline">{link.label}</span>
          </NavLink>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        <Button
          onClick={handleSignOut}
          className="bg-red-500 text-white flex items-center justify-center py-2 px-4 rounded-md"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default LeftSidebar;