import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useSignOutAccount } from "@/lib/react-query/queries";
import { NotificationBell } from "./notifications/NotificationBell";
import { 
  Menu, 
  X, 
  User, 
  HelpCircle, 
  Mail, 
  LogOut, 
  Home, 
  Telescope, 
  Award, 
  Bookmark, 
  Users, 
  PlusCircle, 
  ChevronDown, 
  List,
  Trophy 
} from 'lucide-react';
import { useTrackEngagement } from '@/lib/react-query/queries';

const CreateListButton: React.FC = () => {
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const navigate = useNavigate();
  const createMenuRef = useRef<HTMLDivElement>(null);
  const { user } = useUserContext();
  const { mutate: trackEngage } = useTrackEngagement();

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

  const handleCreateOption = (route: string) => {
    if (user?.id) {
      trackEngage({
        userId: user.id,
        action: 'create_menu_click',
        route: route,
        source: 'top_bar',
        timestamp: new Date().toISOString()
      });
    }
    setIsCreateMenuOpen(false);
    navigate(route);
  };

  return (
    <div className="relative inline-block text-left" ref={createMenuRef}>
      <Button
        onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
        className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2"
      >
        <PlusCircle className="w-5 h-5" />
        Create
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
          isCreateMenuOpen ? 'rotate-180' : ''
        }`} />
      </Button>

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
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 mt-2 w-64 bg-dark-2 rounded-xl p-4 z-50 shadow-xl"
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
                  className="w-full p-3 text-left text-white hover:bg-dark-3 rounded-lg transition-colors flex items-center space-x-3 group"
                >
                  <PlusCircle className="w-5 h-5 group-hover:text-primary transition-colors" />
                  <span className="group-hover:text-primary transition-colors">Create List</span>
                </button>
                
                <button
                  onClick={() => handleCreateOption('/create-group')}
                  className="w-full p-3 text-left text-white hover:bg-dark-3 rounded-lg transition-colors flex items-center space-x-3 group"
                >
                  <Users className="w-5 h-5 group-hover:text-primary transition-colors" />
                  <span className="group-hover:text-primary transition-colors">Create Group List</span>
                </button>
                
                <button
                  disabled
                  className="w-full p-3 text-left text-gray-400 flex items-center space-x-3 cursor-not-allowed opacity-50"
                >
                  <Trophy className="w-5 h-5" />
                  <span>Create Challenge (Coming Soon)</span>
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-dark-4">
                <p className="text-xs text-gray-400 text-center">
                  Create and share your lists with the community
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleOffCanvas = () => setIsOffCanvasOpen((prev) => !prev);

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess, navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  const mobileMenuItems = [
    { icon: Home, label: "Home", route: "/" },
    { icon: Telescope, label: "Explore", route: "/explore" },
    { icon: Award, label: "Leaderboard", route: "/comprehensive-leaderboard" },
    { icon: Users, label: "Friends", route: "/listfromfriends" },
    { icon: User, label: "Profile", route: "/profile/profile" },
    { icon: List, label: "My Rankings", route: "/my-rankings" },
    { icon: Bookmark, label: "Bookmarks", route: "/saved" },
    { icon: HelpCircle, label: "Help/FAQ", route: "/helpfaqpage" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 right-0 z-50 bg-dark-2 shadow-lg"
      >
        <div className="container mx-auto flex p-4 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/assets/images/logo3.svg"
              alt="Topfived logo"
              width={130}
              height={32}
              className="object-contain"
            />
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <CreateListButton />
            </div>
            <Link to="/notifications" className="text-white hover:text-gray-200 transition-colors duration-300">
              <NotificationBell />
            </Link>
            <Button onClick={toggleOffCanvas} className="md:hidden text-white" aria-label="Open menu">
              <Menu className="w-6 h-6" />
            </Button>
            <div className="relative hidden md:block" ref={dropdownRef}>
              <Button
                className="flex items-center p-0 bg-transparent hover:bg-transparent"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <img
                  className="w-10 h-10 rounded-full object-cover shadow-lg"
                  src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                  alt="Profile"
                />
              </Button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-52 bg-dark-2 rounded-lg shadow-xl overflow-hidden z-10"
                  >
                    {[
                      { to: "/profile/profile", icon: User, text: "Profile" },
                      { to: "/my-rankings", icon: List, text: "My Rankings" },
                      { to: "/notifications", icon: NotificationBell, text: "Notifications" },
                      { to: "/helpfaqpage", icon: HelpCircle, text: "Help/FAQ" },
                      { to: "/contactpage", icon: Mail, text: "Contact Us" },
                    ].map((item, index) => (
                      <Link
                        key={index}
                        to={item.to}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-dark-4 transition-all duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.text}
                      </Link>
                    ))}
                    <button
                      className="flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-red-600 transition-all duration-200 w-full text-left"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Off-Canvas Menu */}
      <AnimatePresence>
        {isOffCanvasOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={toggleOffCanvas}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 z-50 w-64 bg-dark-2 p-5 shadow-lg overflow-y-auto"
            >
              <Button onClick={toggleOffCanvas} className="absolute top-4 right-4 text-white" aria-label="Close menu">
                <X className="w-6 h-6" />
              </Button>

              <div className="mt-16 space-y-4">
                <CreateListButton />

                {mobileMenuItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.route}
                    className="flex items-center text-white p-2 hover:bg-dark-4 rounded-lg transition-colors duration-200"
                    onClick={toggleOffCanvas}
                  >
                    <item.icon className="w-5 h-5 mr-2" />
                    {item.label}
                  </Link>
                ))}

                <Button
                  variant="destructive"
                  className="w-full mt-4"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </Button>
              </div>

              <div className="absolute bottom-8 left-4 right-4 text-xs text-gray-400">
                <div className="flex justify-between mb-2">
                  <NavLink to="/privacypolicy" className="underline hover:text-white transition-colors duration-200">
                    Privacy Policy
                  </NavLink>
                  <NavLink to="/termsandconditions" className="underline hover:text-white transition-colors duration-200">
                    Terms & Conditions
                  </NavLink>
                </div>
                <p className="text-center">&copy; 2024 Topfived. All rights reserved.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Topbar;