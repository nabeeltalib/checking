import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, NavLink} from "react-router-dom";
import { Button } from "../ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useSignOutAccount } from "@/lib/react-query/queries";
import { Input } from "@/components/ui/input";
import { useSearchLists } from "@/lib/react-query/queries";
import { NotificationBell } from "./notifications/NotificationBell";

const Topbar = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults, refetch: searchLists } = useSearchLists(searchQuery, user.id);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);

  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleOffCanvas = () => {
    setIsOffCanvasOpen(!isOffCanvasOpen);
  };

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchLists();
    }
  };

  const handleCreateList = () => {
    navigate("/create-list");
  };

  return (
    <section className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg w-full">
      <div className="container mx-auto flex p-4 gap-4 items-center justify-between">
        <Link to="/" className="items-center gap-3 hidden md:flex">
          <img
            src="/assets/images/logo.svg"
            alt="Topfived logo"
            width={130}
            height={32}
            className="object-contain"
          />
        </Link>
        <Link to="/" className="items-center gap-3 flex md:hidden">
          <img
            src="/assets/images/mobile.png"
            alt="Topfived logo"
            width={40}
            className="object-contain"
          />
        </Link>

        <form onSubmit={handleSearch} className="flex-grow max-w-md mx-auto w-full">
          <div className="flex justify-center items-center gap-2">
            <Input
              type="text"
              placeholder="Search lists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-gray-800 text-white border-none rounded-lg focus:ring-2 focus:ring-purple-400 transition-all duration-300 ${
                isSearch ? "block" : "hidden md:block"
              }`}
            />
            <button
              type="submit"
              className="p-2 bg-purple-500 rounded-full hover:bg-purple-700 transition-all duration-300"
              onClick={() => setIsSearch(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-6 w-6 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>
          </div>

          {searchResults && (
            <ul className="absolute bg-white text-black mt-2 rounded-lg shadow-lg w-full max-h-60 overflow-y-auto">
              {searchResults.pages.map((item) =>
                item.map((list, index) => (
                  <li key={index} className="border-b last:border-b-0">
                    <Link
                      to={`/lists/${list.id}`}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      "{list.Title}"
                    </Link>
                  </li>
                ))
              )}
            </ul>
          )}
        </form>

        <div className="flex items-center md:hidden">
          <button onClick={toggleOffCanvas} className="text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 7.5h16.5m-16.5 7.5h16.5" />
            </svg>
          </button>
        </div>

        <div id="side-icons" className="hidden md:flex items-center gap-4">
          <Button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
            onClick={handleCreateList}
          >
            Create List
          </Button>

          <Button
            variant="ghost"
            className="p-2 rounded-full hover:bg-gray-700 transition-all duration-300"
            onClick={() => {
              signOut();
              navigate("/");
            }}
            aria-label="Sign out"
          >
            <img src="/assets/icons/logout.svg" alt="Sign out" className="h-8 w-8" />
          </Button>

          <Link to="/notifications" className="hidden md:block">
            <NotificationBell />
          </Link>

          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center cursor-pointer" onClick={toggleDropdown}>
              <img
                className="w-10 h-10 rounded-full object-cover shadow-lg"
                src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                alt="Profile"
              />
            </div>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-gray-200 rounded-lg shadow-xl overflow-hidden z-10">
                <Link
                  to="/profile/profile"
                  className="flex items-center gap-2 px-4 py-3 text-sm text-black hover:bg-gray-100 transition-all duration-200"
                >
                  <img
                    src="/assets/icons/profile.svg"
                    alt="Profile Icon"
                    className="w-5 h-5 filter invert-0 brightness-0"
                  />
                  Profile
                </Link>
                <Link
                  to="/notifications"
                  className="flex items-center gap-2 px-4 py-3 text-sm text-black hover:bg-gray-100 transition-all duration-200"
                >
                  <img
                    src="/assets/icons/notification.svg"
                    alt="Notifications Icon"
                    className="w-5 h-5 filter invert-0 brightness-0"
                  />
                  Notifications
                </Link>
                <Link
                  to="/helpfaqpage"
                  className="flex items-center gap-2 px-4 py-3 text-sm text-black hover:bg-gray-100 transition-all duration-200"
                >
                  <img
                    src="/assets/icons/help.svg"
                    alt="Help Icon"
                    className="w-5 h-5 filter invert-0 brightness-0"
                  />
                  Help/FAQ
                </Link>
                <Link
                  to="/contactpage"
                  className="flex items-center gap-2 px-4 py-3 text-sm text-black hover:bg-gray-100 transition-all duration-200"
                >
                  <img
                    src="/assets/icons/contact.svg"
                    alt="Contact Icon"
                    className="w-5 h-5 filter invert-0 brightness-0"
                  />
                  Contact Us
                </Link>
                <button
                  className="flex items-center gap-2 px-4 py-3 text-sm text-black hover:bg-red-50 transition-all duration-200 w-full text-left"
                  onClick={() => {
                    signOut();
                    navigate("/");
                  }}
                >
                  <img
                    src="/assets/icons/logout.svg"
                    alt="Logout Icon"
                    className="w-5 h-5 filter invert-0 brightness-0"
                  />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div
          className={`fixed inset-0 z-50 bg-black bg-opacity-50 transform ${
            isOffCanvasOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out md:hidden`}
        >
          <div className="absolute right-0 bg-gray-800 text-white w-64 h-full p-5">
            <button className="mb-5 text-white" onClick={toggleOffCanvas}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <Button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg w-full mb-4"
              onClick={handleCreateList}
            >
              Create List
            </Button>

            <Button
              variant="ghost"
              className="p-2 w-full mb-4 rounded-full hover:bg-gray-700 transition-all duration-300"
              onClick={() => signOut()}
              aria-label="Sign out"
            >
              <img src="/assets/icons/logout.svg" alt="Sign out" className="h-8 w-8 mx-auto" />
            </Button>

            <Link to="/notifications" className="block mb-4">
              <img src="/assets/icons/notification.svg" alt="notifications" width={27} height={22} className="mx-auto" />
            </Link>

            <div className="relative">
              <div className="flex items-center cursor-pointer" onClick={toggleDropdown}>
                <img
                  className="w-10 h-10 rounded-full object-cover mx-auto shadow-lg"
                  src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                  alt="Profile"
                />
              </div>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden z-10">
                  <Link
                    to={`/profile/profile`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <button
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    onClick={() => signOut()}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>   
            <Link
                  to="/helpfaqpage"
                  className="flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-gray-700 transition-all duration-200"
                >
                  Help/FAQ
                </Link>
                <Link
                  to="/contactpage"
                  className="flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-gray-700 transition-all duration-200"
                >
                  Contact Us
                </Link>
              {/* Insert the provided snippet here */}
              <div className="flex flex-col gap-4 mt-6 mb-14">
                <div className="text-xs text-gray-400 text-center mt-4">
                  <NavLink to="/privacypolicy" className="hover:text-white">
                    Privacy Policy
                  </NavLink>
                  <span className="mx-2">|</span>
                  <NavLink to="/termsandconditions" className="hover:text-white">
                    Terms & Conditions
                  </NavLink>
                  <p className="mt-2">&copy; 2024 Topfived. All rights reserved.</p>
                </div>
              </div>
          </div>          
        </div>        
      </div>      
    </section>
  );
};

export default Topbar;
