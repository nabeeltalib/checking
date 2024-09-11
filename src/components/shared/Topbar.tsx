import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useSignOutAccount, useSearchLists, useGetInfiniteLists } from "@/lib/react-query/queries";
import { Input } from "@/components/ui/input";
import { NotificationBell } from "./notifications/NotificationBell";
import { Search, Menu, X, User, HelpCircle, Mail, LogOut, ChevronRight, Filter } from 'lucide-react';
import { IList } from '@/types';
import { Models } from 'appwrite';

const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { data: searchResults, refetch: searchLists } = useSearchLists(searchQuery, user.id);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const [sortOption, setSortOption] = useState<string>("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);
  const searchResultsRef = useRef<HTMLUListElement>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const toggleOffCanvas = () => setIsOffCanvasOpen((prev) => !prev);

  const { data: lists } = useGetInfiniteLists();

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess, navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        searchResultsRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        !searchResultsRef.current.contains(event.target as Node)
      ) {
        setIsSearch(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchLists();
      setIsSearch(true);
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  const sortAndFilterLists = useCallback((lists: Models.Document[]) => {
    return [...lists]
      .filter((list: IList) => 
        list.Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        list.Tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => {
        const getCategoryOrTag = (item: Models.Document, field: 'Categories' | 'Tags') => {
          return item[field] && item[field].length > 0 ? item[field][0] : '';
        };

        const aValue = sortOption === 'category' ? getCategoryOrTag(a, 'Categories') : getCategoryOrTag(a, 'Tags');
        const bValue = sortOption === 'category' ? getCategoryOrTag(b, 'Categories') : getCategoryOrTag(b, 'Tags');

        if (!aValue && !bValue) return 0;
        if (!aValue) return 1;
        if (!bValue) return -1;
        return aValue.localeCompare(bValue);
      });
  }, [sortOption, searchQuery]);

  const handleCreateList = () => navigate("/create-list");
  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  return (
    <motion.section
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg w-full"
    >
      <div className="container mx-auto flex p-4 gap-1 items-center justify-between">
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

        {/*<form onSubmit={handleSearch} ref={searchRef} className="flex-grow max-w-md mx-auto w-full relative">
          <div className="flex justify-center items-center gap-2">
            <Input
              type="text"
              placeholder="Search lists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              spellCheck={true}
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
            {isSearch && searchResults?.pages?.length > 0 && (
              <motion.ul
                ref={searchResultsRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bg-gray-700 text-white rounded-lg shadow-lg w-full max-h-60 overflow-y-auto mt-2"
              >
                {searchResults.pages.map((page) =>
                  page.map((list: any) => (
                    <motion.li
                      key={list.id}
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                      className="border-b border-gray-600 last:border-b-0"
                    >
                      <Link
                        to={`/lists/${list.id}`}
                        className="block px-4 py-2 hover:bg-gray-600 transition-colors duration-200"
                      >
                        {list.Title}
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

          <Button
            variant="ghost"
            className="p-2 rounded-full hover:bg-gray-700 transition-all duration-300"
            onClick={handleSignOut}
            aria-label="Sign out"
          >
            <LogOut className="h-6 w-6 text-white" />
          </Button>

          <Link to="/notifications" className="hidden md:block">
            <NotificationBell />
          </Link>

          <div className="relative" ref={dropdownRef}>
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
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl overflow-hidden z-10"
                >
                  {[
                    { to: "/profile/profile", icon: User, text: "Profile" },
                    { to: "/notifications", icon: NotificationBell, text: "Notifications" },
                    { to: "/helpfaqpage", icon: HelpCircle, text: "Help/FAQ" },
                    { to: "/contactpage", icon: Mail, text: "Contact Us" },
                  ].map((item, index) => (
                    <Link
                      key={index}
                      to={item.to}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200"
                    >
                      <item.icon className="w-5 h-5" />
                      {item.text}
                    </Link>
                  ))}
                  <button
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 transition-all duration-200 w-full text-left"
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
                  Create List
                </Button>

                <Link to="/notifications" className="block">
                  <Button className="w-full text-left flex items-center justify-between">
                    Notifications
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </Link>

                <Link to="/profile/profile" className="block">
                  <Button className="w-full text-left flex items-center justify-between">
                    Profile
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </Link>

                <Link to="/helpfaqpage" className="block">
                  <Button className="w-full text-left flex items-center justify-between">
                    Help/FAQ
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </Link>

                <Link to="/contactpage" className="block">
                  <Button className="w-full text-left flex items-center justify-between">
                    Contact Us
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </Link>

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  Logout
                </Button>
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
    </motion.section>
  );
};

export default Topbar;