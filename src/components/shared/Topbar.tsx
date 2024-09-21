import React, { useEffect, useState } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useSignOutAccount } from "@/lib/react-query/queries";
import { NotificationBell } from "./notifications/NotificationBell";
import { Menu, X, User, HelpCircle, Mail, LogOut, ChevronRight, Home, Compass, Award, Bookmark, Users, PlusCircle, ChevronDown } from 'lucide-react';

const DropdownMenuItem = ({ item, toggleOffCanvas }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left flex items-center justify-between text-white p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
      >
        <span className="flex items-center">
          <item.icon className="w-5 h-5 mr-2" />
          {item.label}
        </span>
        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="ml-4 mt-2 space-y-2">
          {item.subItems.map((subItem, index) => (
            <Link
              key={index}
              to={subItem.route}
              className="block text-white p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
              onClick={() => {
                toggleOffCanvas();
              }}
            >
              {subItem.label}
            </Link>
          ))}
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

  const toggleOffCanvas = () => setIsOffCanvasOpen((prev) => !prev);

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess, navigate]);

  const handleCreateList = () => {
    navigate("/create-list");
    setIsOffCanvasOpen(false);
  };

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  const mobileMenuItems = [
    { icon: Home, label: "Home", route: "/" },
    {
      icon: Compass,
      label: "Discover",
      subItems: [
        { label: "Explore", route: "/explore" },
        { label: "Trending", route: "/trending" },
        { label: "Leaderboard", route: "/comprehensive-leaderboard" },
      ]
    },
    {
      icon: Users,
      label: "Social",
      subItems: [
        { label: "Friends", route: "/listfromfriends" },
        { label: "Collaboration", route: "/userlists" },
      ]
    },
    {
      icon: User,
      label: "Personal",
      subItems: [
        { label: "Bookmarks", route: "/saved" },
        { label: "My Profile", route: "/profile/profile" },
        { label: "Notifications", route: "/notifications" },
      ]
    },
    {
      icon: HelpCircle,
      label: "Support",
      subItems: [
        { label: "Help/FAQ", route: "/helpfaqpage" },
        { label: "Contact Us", route: "/contactpage" },
      ]
    },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg backdrop-blur-sm bg-opacity-90"
      >
        <div className="container mx-auto flex p-4 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/assets/images/logo.svg"
              alt="Topfived logo"
              width={130}
              height={32}
              className="object-contain hidden md:block"
            />
            <img
              src="/assets/images/logo.svg"
              alt="Topfived logo"
              width={130}
              className="object-contain md:hidden"
            />
          </Link>

          <div className="flex items-center md:hidden">
            <Button onClick={toggleOffCanvas} className="text-white" aria-label="Open menu">
              <Menu className="w-6 h-6" />
            </Button>
          </div>

          {/* Desktop menu items */}
          <div id="side-icons" className="hidden md:flex items-center gap-4">
            <Button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-300"
              onClick={handleCreateList}
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Create List
            </Button>
            <Link to="/notifications" className="text-white hover:text-gray-200 transition-colors duration-300">
              <NotificationBell />
            </Link>
            <Button
              variant="ghost"
              className="text-white hover:text-gray-200 transition-colors duration-300"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
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
              className="fixed inset-y-0 right-0 z-50 w-64 bg-gray-800 p-5 shadow-lg md:hidden overflow-y-auto"
            >
              <Button onClick={toggleOffCanvas} className="absolute top-4 right-4 text-white" aria-label="Close menu">
                <X className="w-6 h-6" />
              </Button>

              <div className="mt-12 space-y-4">
                <Button
                  className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-300"
                  onClick={handleCreateList}
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Create List
                </Button>

                {mobileMenuItems.map((item, index) => (
                  item.subItems ? (
                    <DropdownMenuItem key={index} item={item} toggleOffCanvas={toggleOffCanvas} />
                  ) : (
                    <Link
                      key={index}
                      to={item.route}
                      className="block text-white p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                      onClick={toggleOffCanvas}
                    >
                      <span className="flex items-center">
                        <item.icon className="w-5 h-5 mr-2" />
                        {item.label}
                      </span>
                    </Link>
                  )
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
                  <NavLink to="/privacypolicy" className="hover:text-white transition-colors duration-200">
                    Privacy Policy
                  </NavLink>
                  <NavLink to="/termsandconditions" className="hover:text-white transition-colors duration-200">
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