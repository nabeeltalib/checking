import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Telescope, 
  Award, 
  PlusCircle, 
  User, 
  Crown, 
  ChevronDown,
  X,
  Users,
  Trophy,
  ListIcon,
  Group,
  Star,
  AppleIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEngagement } from "@/lib/appwrite/api";
import { useUserContext } from "@/context/AuthContext";
import { useTrackEngagement } from '@/lib/react-query/queries';

const Bottombar: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const { user } = useUserContext();
  const { mutate: trackEngage } = useTrackEngagement();

  const bottombarLinks = [
    { icon: Home, label: "Home", route: "/" },
    { icon: Telescope, label: "Explore", route: "/explore" },
    { icon: Crown, label: "Leaderboard", route: "/comprehensive-leaderboard" },
    { icon: User, label: "Profile", route: "/profile/profile" },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setIsCreateMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close menu when navigating
  useEffect(() => {
    setIsCreateMenuOpen(false);
  }, [pathname]);

  const handleCreateOption = (route: string) => {
    if (user?.id) {
      trackEngage({
        userId: user.id,
        action: 'create_menu_click',
        route: route,
        source: 'bottom_bar',
        timestamp: new Date().toISOString()
      });
    }
    setIsCreateMenuOpen(false);
    navigate(route);
  };

  return (
    <>
      {/* Create Menu Overlay */}
      <AnimatePresence>
        {isCreateMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsCreateMenuOpen(false)}
            />
            <motion.div
              ref={createMenuRef}
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="fixed bottom-24 left-4 right-4 bg-dark-2 rounded-xl p-4 z-50 shadow-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Create</h3>
                <button 
                  onClick={() => setIsCreateMenuOpen(false)}
                  className="p-1 hover:bg-dark-3 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleCreateOption('/create-list')}
                  className="w-full p-3 text-left text-white hover:bg-dark-3 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Create List</span>
                </button>
                
                <button
                  onClick={() => handleCreateOption('/create-group')}
                  className="w-full p-3 text-left text-white hover:bg-dark-3 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <Users className="w-5 h-5" />
                  <span>Create Group List</span>
                </button>
                
                <button
                  disabled
                  className="w-full p-3 text-left text-gray-400 flex items-center space-x-3 cursor-not-allowed"
                >
                  <Trophy className="w-5 h-5" />
                  <span>Create Challenge (Coming Soon)</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav className="bottom-bar flex justify-around items-center bg-dark-2 py-2 px-4 fixed bottom-0 left-0 right-0 w-full z-30 border-t border-dark-4">
        {bottombarLinks.map((link, index) => {
          const isActive = pathname === link.route;
          return (
            <Link
              key={`bottombar-${link.label}`}
              to={link.route}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${
                isActive
                  ? "rounded-xl text-white shadow-lg scale-110"
                  : "rounded-xl text-light-2 hover:bg-dark-3"
              }`}
            >
              <link.icon size={18} className={isActive ? "stroke-blue-500" : "stroke-light-2"} />
              <p className={`text-xs mt-1 ${isActive ? "text-blue-500 font-medium" : "text-light-2"}`}>
                {link.label}
              </p>
            </Link>
          );
        })}
        
        {/* Create Button */}
        <button
          onClick={() => setIsCreateMenuOpen(true)}
          className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${
            isCreateMenuOpen
              ? "rounded-xl text-blue-500 shadow-lg scale-110"
              : "rounded-xl text-light-2 hover:bg-dark-3"
          }`}
        >
          <PlusCircle 
            size={18} 
            className={isCreateMenuOpen ? "stroke-blue-500" : "stroke-light-2"} 
          />
          <p className={`text-xs mt-1 ${
            isCreateMenuOpen ? "text-blue-500 font-medium" : "text-light-2"
          }`}>
            Create
          </p>
        </button>
      </nav>
    </>
  );
};

export default Bottombar;