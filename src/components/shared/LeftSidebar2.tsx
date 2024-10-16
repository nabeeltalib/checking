import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserContext } from '@/context/AuthContext';

// Assuming this is the structure of your sidebarLinks2
interface SidebarLink {
  icon: string;
  route: string;
  label: string;
}

// You should import this from your constants file
const sidebarLinks2: SidebarLink[] = [
  { icon: '/assets/icons/home.svg', route: '/', label: 'Home' },
  { icon: '/assets/icons/wallpaper.svg', route: '/explore2', label: 'Explore' },
  { icon: '/assets/icons/list.svg', route: '/comprehensive-leaderboard2', label: 'LeaderBoard' },
  // Add other links as needed
];

const LeftSidebar2: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useUserContext();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsCollapsed(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignIn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate('/sign-in');
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="leftsidebar flex flex-col justify-between h-screen bg-dark-2 border-r border-dark-4 overflow-hidden fixed left-0 top-16 shadow-2xl z-50"
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
                className="flex items-center gap-3 p-2 rounded-lg bg-dark-4/50 cursor-pointer hover:bg-dark-4/70 transition-all duration-300"
                onClick={() => user?.isAuthenticated ? navigate('/profile') : navigate('/sign-in')}
              >
                <img
                  src={user?.imageUrl || '/assets/icons/profile-placeholder.svg'}
                  alt="User Profile"
                  className="w-10 h-10 rounded-full object-cover shadow-md"
                />
                <div>
                  <p className="text-light-1 font-semibold">{user?.username || 'Guest'}</p>
                  <p className="text-light-2 text-sm hover:text-light-1 transition-colors">
                    {user?.isAuthenticated ? 'View Profile' : 'Sign In / Up'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isMobile && (
            <Button
              onClick={toggleCollapse}
              variant="ghost"
              size="icon"
              className="text-light-1 hover:bg-dark-4/50 focus:outline-none transition-all duration-300"
              aria-label="Toggle Sidebar"
            >
              {isCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
            </Button>
          )}
        </div>

        <nav className="flex-grow flex flex-col gap-2 px-4 py-2 overflow-y-auto text-sm">
          {sidebarLinks2.map((link) => (
            <NavLink
              key={link.label}
              to={link.route}
              className={({ isActive }) =>
                `flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-primary-500/70 text-white shadow-lg'
                    : 'text-light-2 hover:bg-dark-4/50 hover:text-light-1 hover:shadow-md'
                }`
              }
            >
              <motion.img
                src={link.icon}
                alt={link.label}
                className="w-5 h-5 filter invert brightness-0"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
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
        {!user?.isAuthenticated && (
          <Button
            onClick={handleSignIn}
            variant="default"
            className="w-full flex items-center justify-center gap-2 text-white bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 shadow-lg transition-all duration-300 hover:scale-105"
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
        )}
      </div>
    </motion.aside>
  );
};

export default LeftSidebar2;