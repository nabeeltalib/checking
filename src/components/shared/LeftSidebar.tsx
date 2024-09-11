import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { sidebarLinks } from '@/constants';
import { Button } from '@/components/ui/button';
import { useSignOutAccount } from '@/lib/react-query/queries';
import { useUserContext, INITIAL_USER } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

const LeftSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated, user } = useUserContext();
  const { mutate: signOut } = useSignOutAccount();
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    signOut();
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
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
      className="leftsidebar flex flex-col justify-between h-screen bg-gradient-to-r from-purple-600 to-indigo-600 border-r border-dark-4 overflow-hidden fixed left-0 top-16 shadow-xl"
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4">
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
                  src={user.imageUrl || '/assets/icons/profile-placeholder.svg'}
                  alt="User Profile"
                  className="w-10 h-10 rounded-full object-cover shadow-md"
                />
                <div>
                  <p className="text-light-1 font-semibold">{user.username || 'User'}</p>
                  <NavLink to="/profile/profile" className="text-light-2 text-sm hover:text-light-1 transition-colors">
                    View Profile
                  </NavLink>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            onClick={toggleCollapse}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-primary-400 focus:outline-none"
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </Button>
        </div>

        <nav className="flex-grow flex flex-col gap-2 px-4 py-2">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.route}
              className={({ isActive }) =>
                `flex items-center gap-4 p-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'text-white hover:bg-primary-400 hover:shadow-lg'
                }`
              }
            >
              <img
                src={link.icon}
                alt={link.label}
                className={`w-6 h-6 ${pathname === link.route ? 'invert brightness-0' : 'filter invert brightness-0'}`}
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
          onClick={handleSignOut}
          variant="destructive"
          className="w-full flex items-center justify-center gap-2 text-white bg-red-600 hover:bg-red-700 shadow-lg transition-all duration-200 hover:scale-105"
        >
          <LogOut size={20} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </motion.aside>
  );
};

export default LeftSidebar;