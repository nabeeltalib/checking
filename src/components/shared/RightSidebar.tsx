import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import rightSidebarLinks from '@/constants';
import { Button } from '@/components/ui/button';
import { useSignOutAccount } from '@/lib/react-query/queries';
import { useUserContext, INITIAL_USER } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Users, User, Settings } from 'lucide-react';

const RightSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useUserContext();
  const { mutate: signOut } = useSignOutAccount();
  const { pathname } = useLocation();

  const handleSignOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    signOut();
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
    navigate('/sign-in');
  };

  let rightSideBar = rightSidebarLinks();

  const getIcon = (label: string) => {
    switch (label) {
      case 'Notifications':
        return <Bell size={20} />;
      case 'Collaboration':
        return <Users size={20} />;
      case 'My Profile':
        return <User size={20} />;
      case 'Admin Panel':
        return <Settings size={20} />;
      default:
        return null;
    }
  };

  return (
    <motion.aside
      initial={{ x: 300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="rightsidebar hidden md:flex flex-col justify-between w-64 h-screen p-6 bg-dark-2 border-l border-dark-4 fixed right-0 top-20 shadow-xl"
    >
      <div className="flex flex-col gap-4 flex-grow">
        <h2 className="text-xl font-bold text-light-1 mb-4">Quick Access</h2>
        {rightSideBar.map((link) => (
          <NavLink
            key={link.label}
            to={link.route}
            className={({ isActive }) =>
              `flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-500 text-light-1 shadow-md'
                  : 'text-light-2 hover:bg-dark-3 hover:text-light-1 hover:shadow-md'
              }`
            }
          >
            {getIcon(link.label)}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>
      
      <motion.div
        className="flex flex-col gap-4 mt-6 mb-24"
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
  );
};

export default RightSidebar;