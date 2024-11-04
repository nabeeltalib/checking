import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useSignOutAccount } from '@/lib/react-query/queries';
import { useUserContext } from '@/context/AuthContext';
import { 
  ChevronLeft, ChevronRight, LogOut, Bell, Users, User, Settings, 
  Bookmark, Contact, Crown, Home, Telescope, ChevronDown, ChevronUp, List, LogIn
} from 'lucide-react';

const LeftSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, setUser, isAuthenticated, setIsAuthenticated } = useUserContext();
  const { mutate: signOut } = useSignOutAccount();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isCollapsed) setOpenDropdown(null);
  }, [isCollapsed]);

  const handleSignOut = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    signOut();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/sign-in');
  }, [signOut, setIsAuthenticated, setUser, navigate]);

  const handleSignIn = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate('/sign-in');
  }, [navigate]);

  const toggleCollapse = () => setIsCollapsed(prev => !prev);
  
  const toggleDropdown = (label: string) => {
    if (isCollapsed) return;
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const getIcon = (label: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      Home: <Home size={16} />,
      Explore: <Telescope size={16} />,
      LeaderBoard: <Crown size={16} />,
      Bookmarks: <Bookmark size={16} />,
      Notifications: <Bell size={16} />,
      Friends: <Contact size={16} />,
      Collaboration: <Users size={16} />,
      'My Profile': <User size={16} />,
      'My Lists': <List size={16} />,
      'Admin Panel': <Settings size={16} />
    };
    return icons[label] || null;
  };

  const groupedLinks = {
    main: [
      { label: 'Home', route: '/' },
      { label: 'Explore', route: '/explore' },
      { label: 'LeaderBoard', route: '/comprehensive-leaderboard' },
      { label: 'Your Groups', route: '/your-groups' },
      { label: 'Groups', route: '/groups' },
    ],
    social: [
      { label: 'Friends', route: '/listfromfriends' },
      { label: 'Collaboration', route: '/userlists', disabled: true },
    ],
    personal: [      
      { label: 'My Profile', route: '/profile/profile' },
      { label: 'My Lists', route: '/my-rankings' },
      { label: 'Bookmarks', route: '/saved' },
    ],
    ...(user?.isAdmin ? {
      admin: [{ label: 'Admin Panel', route: '/admin-panel' }]
    } : {})
  };

  const sidebarLinks2 = [
    { label: 'Home', route: '/', icon: '/assets/icons/home.svg' },
    { label: 'Explore', route: '/explore', icon: '/assets/icons/wallpaper.svg' },
    { label: 'LeaderBoard', route: '/comprehensive-leaderboard', icon: '/assets/icons/ranking.svg' },
  ];

  return (
    <motion.aside
      initial={{ width: isMobile ? 0 : 280 }}
      animate={{ width: isCollapsed ? (isMobile ? 0 : 80) : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`leftsidebar flex flex-col justify-between h-screen bg-dark-2/80 backdrop-blur-md border-r border-dark-4/30 overflow-hidden fixed left-0 top-16 shadow-2xl z-50 ${
        isMobile ? 'w-full max-w-[280px]' : ''
      }`}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 mb-7">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 p-2 rounded-lg bg-dark-4/50 hover:bg-dark-4/70 transition-all duration-300"
              >
                <img
                  src={isAuthenticated ? (user?.imageUrl || "/assets/icons/profile-placeholder.svg") : "/assets/icons/profile-placeholder.svg"}
                  alt="User Profile"
                  className="w-10 h-10 rounded-full object-cover shadow-md"
                />
                <div>
                  <p className="text-light-1 font-semibold">{isAuthenticated ? (user?.username || 'User') : 'Guest'}</p>
                  {isAuthenticated ? (
                    <NavLink to="/profile/profile" className="text-light-2 text-sm hover:text-primary-500 transition-colors">
                      View Profile
                    </NavLink>
                  ) : (
                    <NavLink to="/sign-in" className="text-light-2 text-sm hover:text-primary-500 transition-colors">
                      Sign In / Up
                    </NavLink>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            onClick={toggleCollapse}
            variant="default"
            size="icon"
            className="text-light-1 hover:bg-dark-4/50 focus:outline-none transition-all duration-300"
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </Button>
        </div>

        <nav className="flex-grow flex flex-col gap-2 px-4 py-2 overflow-y-auto">
          {isAuthenticated ? (
            Object.entries(groupedLinks).map(([group, links]) => (
              <div key={group} className="mb-4 text-sm">
                {group !== 'main' && !isCollapsed && (
                  <button
                    onClick={() => toggleDropdown(group)}
                    className={`flex items-center justify-between w-full p-2 rounded-lg transition-all duration-300 ${
                      openDropdown === group ? 'bg-dark-4/70 text-primary-500' : 'text-light-2 hover:bg-dark-4/50 hover:text-light-1'
                    }`}
                  >
                    <span className="capitalize font-medium">{group}</span>
                    {openDropdown === group ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                )}
                <AnimatePresence>
                  {(group === 'main' || openDropdown === group || isCollapsed) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {links.map((link) => (
                        <NavLink
                          key={link.label}
                          to={link.disabled ? '#' : link.route}
                          className={({ isActive }) =>
                            `flex items-center gap-4 p-2 rounded-lg transition-all duration-300 ${
                              link.disabled
                                ? 'opacity-50 cursor-not-allowed'
                                : isActive
                                ? 'bg-gradient-to-r from-primary-500/70 to-primary-600/70 text-white shadow-md'
                                : 'text-light-2 hover:bg-dark-4/50 hover:text-primary-500 hover:shadow-md'
                            } ${link.label === 'Admin Panel' ? 'text-orange-400 font-semibold' : ''}`
                          }
                          onClick={(e) => link.disabled && e.preventDefault()}
                        >
                          <motion.div whileHover={{ scale: link.disabled ? 1 : 1.1 }} transition={{ duration: 0.2 }}>
                            {getIcon(link.label)}
                          </motion.div>
                          <AnimatePresence>
                            {!isCollapsed && (
                              <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                {link.label}
                                {link.disabled && " (Coming Soon)"}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          ) : (
            sidebarLinks2.map((link) => (
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
                  className="w-6 h-6 filter invert brightness-0"
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
            ))
          )}
        </nav>
      </div>
           
      <div className="p-4">
        <Button
          onClick={isAuthenticated ? handleSignOut : handleSignIn}
          variant={isAuthenticated ? "destructive" : "default"}
          className={`w-full flex items-center justify-center gap-2 text-white ${
            isAuthenticated 
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
              : 'bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600'
          } shadow-lg transition-all duration-300 hover:scale-105`}
        >
          {isAuthenticated ? <LogOut size={20} /> : <LogIn size={20} />}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isAuthenticated ? 'Sign Out' : 'Sign In'}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </motion.aside>
  );
};

export default LeftSidebar;