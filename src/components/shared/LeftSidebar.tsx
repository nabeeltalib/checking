import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSignOutAccount } from '@/lib/react-query/queries';
import { useUserContext, INITIAL_USER } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, LogOut, Bell, Users, User, Settings, 
  Bookmark, Contact, Crown, Home, Telescope, ChevronDown, ChevronUp 
} from 'lucide-react';

const LeftSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated, user } = useUserContext();
  const { mutate: signOut } = useSignOutAccount();
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (isCollapsed) setOpenDropdown(null);
  }, [isCollapsed]);

  const handleSignOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    signOut();
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
    navigate('/sign-in');
  };

  const toggleCollapse = () => setIsCollapsed(prev => !prev);
  const toggleDropdown = (label: string) => {
    if (isCollapsed) return;
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const getIcon = (label: string) => {
    const icons = {
      Home: Home, Explore: Telescope, LeaderBoard: Crown, Bookmarks: Bookmark,
      Notifications: Bell, Friends: Contact, Collaboration: Users,
      'My Profile': User, 'Admin Panel': Settings
    };
    const IconComponent = icons[label as keyof typeof icons];
    return IconComponent ? <IconComponent size={20} /> : null;
  };

  const groupedLinks = {
    main: [
      { label: 'Home', route: '/' },
      { label: 'Explore', route: '/explore' },
      { label: 'LeaderBoard', route: '/comprehensive-leaderboard' },
    ],
    social: [
      { label: 'Friends', route: '/listfromfriends' },
      { label: 'Collaboration', route: '/userlists' },
    ],
    personal: [
      { label: 'Bookmarks', route: '/saved' },
      { label: 'My Profile', route: '/profile/profile' },
    ],
    ...(user.isAdmin ? {
      admin: [{ label: 'Admin Panel', route: '/admin-panel' }]
    } : {})
  };

  return (
    <motion.aside
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="leftsidebar flex flex-col justify-between h-screen bg-dark-2/80 backdrop-blur-md border-r border-dark-4/30 overflow-hidden fixed left-0 top-16 shadow-2xl"
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
                  src={user.imageUrl || '/assets/icons/profile-placeholder.svg'}
                  alt="User Profile"
                  className="w-10 h-10 rounded-full object-cover shadow-md"
                />
                <div>
                  <p className="text-light-1 font-semibold">{user.username || 'User'}</p>
                  <NavLink to="/profile/profile" className="text-light-2 text-sm hover:text-primary-500 transition-colors">
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
            className="text-light-1 hover:bg-dark-4/50 focus:outline-none transition-all duration-300"
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </Button>
        </div>

        <nav className="flex-grow flex flex-col gap-2 px-4 py-2 overflow-y-auto">
          {Object.entries(groupedLinks).map(([group, links]) => (
            <div key={group} className="mb-4">
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
                        to={link.route}
                        className={({ isActive }) =>
                          `flex items-center gap-4 p-2 rounded-lg transition-all duration-300 ${
                            isActive
                              ? 'bg-gradient-to-r from-primary-500/70 to-primary-600/70 text-white shadow-md'
                              : 'text-light-2 hover:bg-dark-4/50 hover:text-primary-500 hover:shadow-md'
                          } ${link.label === 'Admin Panel' ? 'text-yellow-400 font-semibold' : ''}`
                        }
                      >
                        <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
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
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </div>
           
      <div className="p-4">
        <Button
          onClick={handleSignOut}
          variant="destructive"
          className="w-full flex items-center justify-center gap-2 text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg transition-all duration-300 hover:scale-105"
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