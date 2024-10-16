import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useSignOutAccount } from "@/lib/react-query/queries";
import { Input } from "@/components/ui/input";
import { useSearchLists } from "@/lib/react-query/queries";
import { NotificationBell } from "./notifications/NotificationBell";
import { Search, Menu, X, User, HelpCircle, Mail, LogOut, PlusCircle, ChevronDown } from 'lucide-react';
import SignInDialog from '@/components/shared/SignInDialog';

const Topbar2: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults, refetch: searchLists } = useSearchLists(searchQuery, user?.id);
  const [isOpen, setIsOpen] = useState(false);
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const createDropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const toggleOffCanvas = () => setIsOffCanvasOpen(!isOffCanvasOpen);

  const handleDialogOpen = () => setIsSignInDialogOpen(true);
  const handleDialogClose = () => setIsSignInDialogOpen(false);

  const handleProfileClick = () => {
    if (user?.isAuthenticated) {
      navigate("/profile/profile");
    } else {
      handleDialogOpen();
    }
  };

  const handleAuthenticatedAction = (action: () => void) => {
    if (user?.isAuthenticated) {
      action();
    } else {
      setIsSignInDialogOpen(true);
    }
  };

  const handleCreateList = () => {
    handleAuthenticatedAction(() => navigate("/create-list"));
    setIsCreateDropdownOpen(false);
  };

  const handleCreateGroupList = () => {
    // Restricted for now
  };

  const handleCreateChallenge = () => {
    // Restricted for now
  };

  useEffect(() => {
    if (isSuccess) navigate("/");
  }, [isSuccess, navigate]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.isAuthenticated) {
      handleDialogOpen();
      return;
    }
    if (searchQuery.trim()) {
      searchLists();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (createDropdownRef.current && !createDropdownRef.current.contains(event.target as Node)) {
        setIsCreateDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.section
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 right-0 z-50 bg-dark-2 shadow-lg"
    >
      <div className="container mx-auto flex p-4 gap-4 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/assets/images/logo3.svg"
            alt="Topfived logo"
            width={130}
            height={32}
            className="object-contain hidden md:block"
          />
          <img
            src="/assets/images/logo3.svg"
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

        <div id="side-icons" className="hidden md:flex items-center gap-4">
          <div className="relative inline-block text-left" ref={createDropdownRef}>
            <Button
              onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg flex items-center"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Create
              <ChevronDown className="ml-2 w-4 h-4" />
            </Button>

            {isCreateDropdownOpen && (
              <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-dark-4 ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <button
                    onClick={handleCreateList}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-dark-4 transition-colors duration-200"
                  >
                    Create List
                  </button>
                  <button
                    onClick={handleCreateGroupList}
                    className="w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                    disabled
                  >
                    Create Group List (Coming Soon)
                  </button>
                  <button
                    onClick={handleCreateChallenge}
                    className="w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                    disabled
                  >
                    Create Challenge (Coming Soon)
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={dropdownRef}>
            <Button
              className="flex items-center p-0 bg-transparent hover:bg-transparent"
              onClick={toggleDropdown}
            >
              <img
                className="w-10 h-10 rounded-full object-cover shadow-lg"
                src={user?.imageUrl || "/assets/icons/profile-placeholder.svg"}
                alt="Profile"
              />
            </Button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl overflow-hidden z-10"
                >
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200 w-full text-left"
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </button>
                  <Link
                    to="/helpfaqpage"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200"
                  >
                    <HelpCircle className="w-5 h-5" />
                    Help/FAQ
                  </Link>
                  <Link
                    to="/contactpage"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200"
                  >
                    <Mail className="w-5 h-5" />
                    Contact Us
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {isOffCanvasOpen && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 z-50 w-64 bg-gray-800 p-5 shadow-lg md:hidden"
            >
              <Button onClick={toggleOffCanvas} className="mb-5 text-white" aria-label="Close menu">
                <X className="w-6 h-6" />
              </Button>

              <div className="space-y-4">
                <div className="relative inline-block text-left w-full">
                  <Button
                    onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg flex items-center w-full"
                  >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Create
                    <ChevronDown className="ml-2 w-4 h-4" />
                  </Button>

                  {isCreateDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-full rounded-md shadow-lg bg-dark-4 ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <button
                          onClick={handleCreateList}
                          className="w-full text-left px-4 py-2 text-sm text-white hover:bg-dark-4 transition-colors duration-200"
                        >
                          Create List
                        </button>
                        <button
                          onClick={handleCreateGroupList}
                          className="w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                          disabled
                        >
                          Create Group List (Coming Soon)
                        </button>
                        <button
                          onClick={handleCreateChallenge}
                          className="w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                          disabled
                        >
                          Create Challenge (Coming Soon)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/helpfaqpage"
                  className="block px-4 py-2 text-sm text-white hover:bg-gray-700 rounded transition-colors duration-200"
                >
                  Help/FAQ
                </Link>
                <Link
                  to="/contactpage"
                  className="block px-4 py-2 text-sm text-white hover:bg-gray-700 rounded transition-colors duration-200"
                >
                  Contact Us
                </Link>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-xs text-gray-400">
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
          )}
        </AnimatePresence>
      </div>

      <SignInDialog isOpen={isSignInDialogOpen} onClose={handleDialogClose} />
    </motion.section>
  );
};

export default Topbar2;