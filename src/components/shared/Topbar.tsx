import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useSignOutAccount } from "@/lib/react-query/queries";
import { NotificationBell } from "./notifications/NotificationBell";
import { 
  Menu, X, User, HelpCircle, Mail, LogOut, ChevronRight, Home, 
  Telescope, Award, Bookmark, Users, PlusCircle, ChevronDown, List 
} from 'lucide-react';

const DropdownMenuItem = ({ item, toggleOffCanvas }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left flex items-center justify-between text-white p-2 hover:bg-dark-4 rounded-lg transition-colors duration-200 ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={item.disabled}
      >
        <span className="flex items-center">
          <item.icon className="w-5 h-5 mr-2" />
          {item.label}
          {item.disabled && " (Coming Soon)"}
        </span>
        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="ml-4 mt-2 space-y-2">
          {item.subItems.map((subItem, index) => (
            <Link
              key={index}
              to={subItem.disabled ? '#' : subItem.route}
              className={`block text-white p-2 hover:bg-dark-4 rounded-lg transition-colors duration-200 ${subItem.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={(e) => {
                if (subItem.disabled) {
                  e.preventDefault();
                } else {
                  toggleOffCanvas();
                }
              }}
            >
              {subItem.label}
              {subItem.disabled && " (Coming Soon)"}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const CreateListButton: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleCreateList = () => {
    navigate("/create-list");
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <Button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg flex items-center"
      >
        <PlusCircle className="w-5 h-5 mr-2" />
        Create
        <ChevronDown className="ml-2 w-4 h-4" />
      </Button>

      {isDropdownOpen && (
        <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-dark-2 ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <button
              onClick={handleCreateList}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-dark-4 transition-colors duration-200"
            >
              Create List
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
              disabled
            >
              Create Group List (Coming Soon)
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
              disabled
            >
              Create Challenge (Coming Soon)
            </button>
          </div>
        </div>
      )}
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
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

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
                onClick={toggleDropdown}
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