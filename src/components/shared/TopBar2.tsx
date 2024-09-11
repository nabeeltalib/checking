import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useSignOutAccount } from "@/lib/react-query/queries";
import { Input } from "@/components/ui/input";
import { useSearchLists } from "@/lib/react-query/queries";
import { NotificationBell } from "./notifications/NotificationBell";
import { Search, Menu, X, User, HelpCircle, Mail, LogOut } from 'lucide-react';

const Topbar2: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults, refetch: searchLists } = useSearchLists(searchQuery, user?.id);
  const [isOpen, setIsOpen] = useState(false);
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const toggleOffCanvas = () => setIsOffCanvasOpen(!isOffCanvasOpen);

  const handleDialogOpen = () => setIsDialogOpen(true);

  const handleCreateList = () => {
    if (user?.isAuthenticated) {
      navigate("/create-list");
    } else {
      handleDialogOpen();
    }
  };

  const handleProfileClick = () => {
    if (user?.isAuthenticated) {
      navigate("/profile/profile");
    } else {
      handleDialogOpen();
    }
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

  const handleSearchFocus = () => {
    if (!user?.isAuthenticated) {
      handleDialogOpen();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg w-full"
    >
      <div className="container mx-auto flex p-4 gap-4 items-center justify-between">
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

       {/* <form onSubmit={handleSearch} ref={searchRef} className="flex-grow max-w-md mx-auto w-full relative">
        <div className="flex justify-center items-center gap-2">
            <Input
              type="text"
              placeholder="Search lists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              className="w-full bg-gray-800 text-white border-none rounded-lg focus:ring-2 focus:ring-purple-400 transition-all duration-300"
            />
            <Button
              type="submit"
              className="p-2 bg-purple-500 rounded-full hover:bg-purple-700 transition-all duration-300"
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-white" />
            </Button>
          </div>

          <AnimatePresence>
            {user?.isAuthenticated && searchResults?.pages?.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bg-gray-700 text-white rounded-lg shadow-lg w-full max-h-60 overflow-y-auto mt-2 z-10"
              >
                {searchResults.pages.map((page, pageIndex) =>
                  page.map((list: any, index: number) => (
                    <motion.li
                      key={`${pageIndex}-${index}`}
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                      className="border-b border-gray-600 last:border-b-0"
                    >
                      <Link
                        to={`/lists/${list.id}`}
                        className="block px-4 py-2 hover:bg-gray-600 transition-colors duration-200"
                      >
                        "{list.Title}"
                      </Link>
                    </motion.li>
                  ))
                )}
              </motion.ul>
            )}
          </AnimatePresence>
        </form>*/}

        <div className="flex items-center md:hidden">
          <Button onClick={toggleOffCanvas} className="text-white" aria-label="Open menu">
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        <div id="side-icons" className="hidden md:flex items-center gap-4">
          <Button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-300"
            onClick={handleCreateList}
          >
            Create List
          </Button>

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
                <Button
                  className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-300"
                  onClick={handleCreateList}
                >
                  {user?.isAuthenticated ? "Create List" : "Sign-In/Up"}
                </Button>

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
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 z-50 p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-lg"
            >
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700 absolute top-4 right-4"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Unlock Full Access!</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">Sign up now to search, like, comment, save, and remix lists. Create your own rankings and join the community!</p>
              </div>
              <div className="flex flex-col gap-4">
                <Button
                  type="button"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out"
                  onClick={() => navigate("/sign-up")}
                >
                  Sign Up
                </Button>
                <Button
                  className="flex items-center justify-center bg-white text-gray-700 border border-gray-300 px-4 sm:px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out hover:bg-gray-100"
                  onClick={() => navigate("/sign-in")}
                >
                  <img src="/assets/icons/google.svg" alt="Google" className="mr-2 h-5 w-5" />
                  Sign In with Google
                </Button>
                <Button
                  className="text-indigo-600 hover:text-indigo-800 font-semibold"
                  onClick={() => navigate("/sign-in")}
                >
                  Sign In with Email
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default Topbar2;