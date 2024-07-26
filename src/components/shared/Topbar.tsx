import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const { data: searchResults, refetch: searchLists } = useSearchLists(
    searchQuery,
    user.id
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);


  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleOffCanvas = () => {
    setIsOffCanvasOpen(!isOffCanvasOpen);
  };

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess, navigate]);

  const handleSearch = (e:any) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchLists();
    }
  };

  const handleCreateList = () => {
    navigate("/create-list");
  };

  return (
    <section className="fixed top-0 left-0 right-0 z-50 bg-dark-1 shadow-md w-full">
      <div className="container mx-auto flex p-5 gap-8 w-full">
        <Link to="/" className="items-center gap-3 w-full hidden md:flex ">
          <img
            src="/assets/images/logo.svg"
            alt="Topfived logo"
            width={130}
            height={32}
            className="object-contain"
          />
        </Link>
        <Link to="/" className="items-center gap-3 flex md:hidden ">
          <img
            src="/assets/images/mobile.png"
            alt="Topfived logo"
            width={40}
            className="object-contain"
          />
        </Link>

        <form onSubmit={handleSearch} className="flex-grow max-w-md mx-auto w-full">
          <div className="flex justify-center items-center gap-3">
            <Input
              type="text"
              placeholder="Search lists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-dark-4 text-light-1 border-none focus:ring-2 focus:ring-primary-500  ${isSearch ? "visible" : "hidden"}`}
            />

            <button onClick={() => { setIsSearch(true); }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
          </div>

          <ul>
           {searchResults &&
           searchResults?.pages.map((item:any)=>(
            item.map((list:any, index:number)=>(
              <div key={index} className="flex flex-col ml-1">
              <Link className="mt-2" to={`${import.meta.env.VITE_APP_DOMAIN}/lists/${list.id}`} >Query Matches with list: "{list.Title}"</Link>
              <hr style={{width:"26vw"}}/>
              </div>
            ))
           ))}
          </ul>
        </form>

        <button className="md:hidden" onClick={toggleOffCanvas}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 7.5h16.5m-16.5 7.5h16.5" />
          </svg>
        </button>

        <div id="side-icons" className="hidden md:flex w-full items-center justify-evenly">
          <Button className="shad-button_primary" onClick={handleCreateList}>
            Create List
          </Button>

          <Button
            variant="ghost"
            className="shad-button_ghost p-2"
            onClick={() => signOut()}
            aria-label="Sign out"
          >
            <img src="/assets/icons/logout.svg" alt="Sign out" className="h-8 w-8" />
          </Button>

          <Link to="/notifications" className="hidden md:block">
            <NotificationBell />
          </Link>

          <div className="relative">
            <div className="flex items-center cursor-pointer" onClick={toggleDropdown}>
              <img
                className="w-8 h-8 rounded-full object-cover"
                src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                alt="Profile"
              />
            </div>

            {/* Profile Dropdown */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden z-10 visible">
                <Link
                  to={`/profile/profile`}
                  className="block px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100"
                >
                  Profile
                </Link>
                <button
                  className="block px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100"
                  onClick={() => signOut()}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Off-canvas menu */}
        <div className={`fixed inset-0 z-50 bg-black bg-opacity-50 transform ${isOffCanvasOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out md:hidden`}>
          <div className="absolute right-0 bg-dark-1 w-64 h-full p-5">
            <button className="mb-5" onClick={toggleOffCanvas}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <Button className="shad-button_primary w-full mb-4" onClick={handleCreateList}>
              Create List
            </Button>

            <Button
              variant="ghost"
              className="shad-button_ghost p-2 w-full mb-4"
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
                  className="w-8 h-8 rounded-full object-cover mx-auto"
                  src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                  alt="Profile"
                />
              </div>

              {/* Profile Dropdown */}
              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden z-10 visible">
                  <Link
                    to={`/profile/profile`}
                    className="block px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <button
                    className="block px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100"
                    onClick={() => signOut()}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Topbar;
