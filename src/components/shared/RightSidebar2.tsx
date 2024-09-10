import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { rightSidebarLinks2 } from '@/constants';
import { Button } from '../ui/button';
import { useUserContext } from '@/context/AuthContext';

const RightSidebar2 = () => {
  const { pathname } = useLocation();
  const { user } = useUserContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const handleCollaborationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user?.isAuthenticated) {
      // Handle Collaboration click
    } else {
      handleDialogOpen();
    }
  };

  const handleFriendsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user?.isAuthenticated) {
      // Handle Friends click
    } else {
      handleDialogOpen();
    }
  };

  return (
    <>
      <aside className="rightsidebar hidden md:flex flex-col justify-between w-64 h-screen p-6 bg-black border-l border-dark-4 overflow-y-auto fixed right-0 top-20">
        <div className="flex flex-col gap-8">
          {rightSidebarLinks2.map(link => (
            <NavLink
              key={link.label}
              to={link.route}
              className={({ isActive }) =>
                `flex items-center gap-4 p-2 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-500 text-light-1'
                    : link.restricted
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-light-2 hover:bg-dark-4'
                }`
              }
              onClick={
                link.label === 'Collaboration' ? handleCollaborationClick : 
                link.label === 'Friends' ? handleFriendsClick : undefined // Handle Friends click
              }
            >
              <img
                src={link.icon}
                alt={link.label}
                className={`w-6 h-6 filter ${
                  pathname === link.route
                    ? ''
                    : link.restricted
                    ? 'brightness-50 invert'
                    : 'brightness-100'
                }`}
              />
              <span className="hidden lg:inline">{link.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="flex flex-col gap-4 mt-6 mb-28">
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
      </aside>

      {isDialogOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 z-50 p-4 sm:p-8">
          <div className="relative bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-lg">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="text-gray-500 hover:text-gray-700 absolute top-4 right-4"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Unlock Full Access!</h3>
              <p className="text-sm sm:text-sm text-gray-600 mb-6">Sign up now to like, comment, save, and remix lists. Create your own rankings and join the community!</p>
            </div>
            <div className="flex flex-col gap-4">
              <Button
                type="button"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out"
                onClick={() => setIsDialogOpen(false)}
              >
                Sign Up
              </Button>
              <Button
                className="flex items-center justify-center bg-white text-gray-700 border border-gray-300 px-4 sm:px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out hover:bg-gray-100"
                onClick={() => setIsDialogOpen(false)}
              >
                <img src="/assets/icons/google.svg" alt="Google" className="mr-2 h-5 w-5" />
                Sign In with Google
              </Button>
              <Button
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
                onClick={() => setIsDialogOpen(false)}
              >
                Sign In with Email
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RightSidebar2;
