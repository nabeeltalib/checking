import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { rightSidebarLinks2 } from '@/constants';
import { Button } from '../ui/button';
import { useUserContext } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Users, User, Settings, X, LogIn } from 'lucide-react';

const RightSidebar2: React.FC = () => {
  const { pathname } = useLocation();
  const { user } = useUserContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDialogOpen = () => setIsDialogOpen(true);
  const handleDialogClose = () => setIsDialogOpen(false);

  const handleRestrictedClick = (e: React.MouseEvent, label: string) => {
    e.preventDefault();
    if (!user?.isAuthenticated) {
      handleDialogOpen();
    }
    // Handle authenticated user actions here
  };

  const getIcon = (label: string) => {
    switch (label) {
      case 'Notifications': return <Bell size={20} />;
      case 'Collaboration': return <Users size={20} />;
      case 'Friends': return <Users size={20} />;
      case 'My Profile': return <User size={20} />;
      case 'Admin Panel': return <Settings size={20} />;
      default: return null;
    }
  };

  return (
    <>
      <motion.aside
        initial={{ x: 300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="rightsidebar hidden md:flex flex-col justify-between w-64 h-screen p-6 bg-dark-2 border-l border-dark-4 overflow-y-auto fixed right-0 top-20 shadow-xl"
      >
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-light-1 mb-2">Quick Access</h2>
          {rightSidebarLinks2.map(link => (
            <NavLink
              key={link.label}
              to={link.route}
              className={({ isActive }) =>
                `flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500 text-light-1 shadow-md'
                    : link.restricted
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-light-2 hover:bg-dark-3 hover:text-light-1 hover:shadow-md'
                }`
              }
              onClick={link.restricted ? (e) => handleRestrictedClick(e, link.label) : undefined}
            >
              {getIcon(link.label)}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>

        <motion.div
          className="flex flex-col gap-4 mt-6 mb-28"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-xs text-gray-400 text-center mt-4">
            <NavLink to="/privacypolicy" className="hover:text-white transition-colors duration-200">
              Privacy Policy
            </NavLink>
            <span className="mx-2">|</span>
            <NavLink to="/termsandconditions" className="hover:text-white transition-colors duration-200">
              Terms & Conditions
            </NavLink>
            <p className="mt-2">&copy; 2024 Topfived. All rights reserved.</p>
          </div>
        </motion.div>
      </motion.aside>

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
              className="relative bg-dark-2 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-lg"
            >
              <button
                onClick={handleDialogClose}
                className="text-gray-400 hover:text-gray-200 absolute top-4 right-4 transition-colors duration-200"
                aria-label="Close"
              >
                <X size={24} />
              </button>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-light-1 mb-2">Unlock Full Access!</h3>
                <p className="text-sm text-light-2 mb-6">Sign up now to like, comment, save, and remix lists. Create your own rankings and join the community!</p>
              </div>
              <div className="flex flex-col gap-4">
                <Button
                  type="button"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out"
                  onClick={handleDialogClose}
                >
                  Sign Up
                </Button>
                <Button
                  className="flex items-center justify-center bg-dark-3 text-light-1 border border-dark-4 px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out hover:bg-dark-4"
                  onClick={handleDialogClose}
                >
                  <img src="/assets/icons/google.svg" alt="Google" className="mr-2 h-5 w-5" />
                  Sign In with Google
                </Button>
                <Button
                  className="text-primary-500 hover:text-primary-600 font-semibold transition-colors duration-200"
                  onClick={handleDialogClose}
                >
                  Sign In with Email
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RightSidebar2;