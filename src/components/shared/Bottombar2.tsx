import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Telescope, Crown, PlusCircle } from "lucide-react";
import SignInDialog from "@/components/shared/SignInDialog"; // Adjust the path if needed

const Bottombar2: React.FC = () => {
  const { pathname } = useLocation();
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);

  const handleCreateClick = () => {
    setIsSignInDialogOpen(true); // Open the dialog when "Create" is clicked
  };

  const handleDialogClose = () => {
    setIsSignInDialogOpen(false); // Close the dialog
  };

  const bottombarLinks = [
    { icon: Home, label: "Home", route: "/" },
    { icon: Telescope, label: "Explore", route: "/explore2" },
    { icon: PlusCircle, label: "Create", onClick: handleCreateClick }, // Use onClick instead of route for the "Create" tab
    { icon: Crown, label: "Leaderboard", route: "/comprehensive-leaderboard2" },
  ];

  return (
    <nav className="bottom-bar flex justify-around items-center bg-dark-2 py-2 px-4 fixed bottom-0 left-0 right-0 w-full z-50 border-t border-dark-4 lg:hidden">
      {bottombarLinks.map((link) => {
        const isActive = pathname === link.route;

        // For Create tab, handle onClick; for others, use Link
        if (link.label === "Create") {
          return (
            <div
              key={`bottombar-${link.label}`}
              onClick={link.onClick ? link.onClick : undefined}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-dark-4 rounded-xl text-white shadow-lg scale-110"
                  : "rounded-xl text-light-2 hover:bg-dark-3"
              }`}
            >
              <link.icon size={24} className={isActive ? "stroke-blue-500" : "stroke-light-2"} />
              <p className={`text-xs mt-1 ${isActive ? "text-blue-500 font-medium" : "text-light-2"}`}>
                {link.label}
              </p>
            </div>
          );
        }

        // For other tabs, use the standard Link for navigation
        return (
          <Link
            key={`bottombar-${link.label}`}
            to={link.route}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${
              isActive
                ? "bg-dark-4 rounded-xl text-white shadow-lg scale-110"
                : "rounded-xl text-light-2 hover:bg-dark-3"
            }`}
          >
            <link.icon size={24} className={isActive ? "stroke-blue-500" : "stroke-light-2"} />
            <p className={`text-xs mt-1 ${isActive ? "text-blue-500 font-medium" : "text-light-2"}`}>
              {link.label}
            </p>
          </Link>
        );
      })}

      {/* Sign-in Dialog */}
      <SignInDialog isOpen={isSignInDialogOpen} onClose={handleDialogClose} />
    </nav>
  );
};

export default Bottombar2;
