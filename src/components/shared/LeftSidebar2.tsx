import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { sidebarLinks2 } from '@/constants';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, LogIn } from 'lucide-react';

const LeftSidebar2: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignIn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate('/sign-in');
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <motion.aside
      initial={{ width: 256 }}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="leftsidebar flex flex-col justify-between h-screen bg-dark-2 border-r border-dark-4 overflow-hidden fixed left-0 top-16 shadow-xl"
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 mb-6">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 p-2 rounded-lg bg-dark-4"
              >
                <img
                  src={'/assets/icons/profile-placeholder.svg'}
                  alt="User Profile"
                  className="w-10 h-10 rounded-full object-cover shadow-md"
                />
                <div>
                  <p className="text-light-1 font-semibold">Guest</p>
                  <NavLink to="/sign-in" className="text-light-2 text-sm hover:text-light-1 transition-colors">
                    Sign In / Up
                  </NavLink>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            onClick={toggleCollapse}
            variant="ghost"
            size="icon"
            className="text-light-1 hover:bg-dark-4 focus:outline-none"
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </Button>
        </div>

        <nav className="flex-grow flex flex-col gap-2 px-4 py-2">
          {sidebarLinks2.map((link) => (
            <NavLink
              key={link.label}
              to={link.route}
              className={({ isActive }) =>
                `flex items-center gap-4 p-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'text-light-2 hover:bg-dark-4 hover:text-light-1 hover:shadow-md'
                }`
              }
            >
              <img
                src={link.icon}
                alt={link.label}
                className="w-6 h-6 filter invert brightness-0"
              />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4">
        <Button
          onClick={handleSignIn}
          variant="default"
          className="w-full flex items-center justify-center gap-2 text-white bg-green-600 hover:bg-green-700 shadow-lg transition-all duration-200 hover:scale-105"
        >
          <LogIn size={20} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                Sign In
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </motion.aside>
  );
};

export default LeftSidebar2;