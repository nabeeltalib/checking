import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Telescope, Award, PlusCircle, User, Crown } from "lucide-react";

const Bottombar: React.FC = () => {
  const { pathname } = useLocation();

  const bottombarLinks = [
    { icon: Home, label: "Home", route: "/" },
    { icon: Telescope, label: "Explore", route: "/explore" },
    { icon: PlusCircle, label: "Create", route: "/create-list" },
    { icon: Crown, label: "Leaderboard", route: "/comprehensive-leaderboard" },
    { icon: User, label: "Profile", route: "/profile/profile" },
  ];

  return (
    <nav className="bottom-bar flex justify-around items-center bg-dark-2 py-2 px-4 fixed bottom-0 left-0 right-0 w-full z-50 border-t border-dark-4">
      {bottombarLinks.map((link) => {
        const isActive = pathname === link.route;
        return (
          <Link
            key={`bottombar-${link.label}`}
            to={link.route}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${
              isActive
                ? "bg-dark-4 text-white shadow-lg scale-110"
                : "text-light-2 hover:bg-dark-4"
            }`}
          >
            <link.icon size={24} className={isActive ? "stroke-blue-500" : "stroke-light-2"} />
            <p className={`text-xs mt-1 ${isActive ? "text-blue-500 font-medium" : "text-light-2"}`}>
              {link.label}
            </p>
          </Link>
        );
      })}
    </nav>
  );
};

export default Bottombar;