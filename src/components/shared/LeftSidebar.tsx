import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSignOutAccount } from '@/lib/react-query/queries';
import { useUserContext, INITIAL_USER } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, LogOut, Bell, Users, User, Settings, 
  Bookmark, Contact, Crown, TrendingUp, Home, Telescope, ChevronDown, ChevronUp 
} from 'lucide-react';

const LeftSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated, user } = useUserContext();
  const { mutate: signOut } = useSignOutAccount();
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    // Close all dropdowns when collapsing the sidebar
    if (isCollapsed) {
      setOpenDropdown(null);
    }
  }, [isCollapsed]);

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

  const toggleDropdown = (label: string) => {
    if (isCollapsed) return; // Don't toggle dropdowns when sidebar is collapsed
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const getIcon = (label: string) => {
    switch (label) {
      case 'Home': return <Home size={20} />;
      case 'Explore': return <Telescope size={20} />;
      //case 'Trending': return <TrendingUp size={20} />;
      case 'LeaderBoard': return <Crown size={20} />;
      case 'Bookmarks': return <Bookmark size={20} />;
      case 'Notifications': return <Bell size={20} />;
      case 'Friends': return <Contact size={20} />;
      case 'Collaboration': return <Users size={20} />;
      case 'My Profile': return <User size={20} />;
      case 'Admin Panel': return <Settings size={20} />;
      default: return null;
    }
  };

  const groupedLinks = {
    main: [
      { label: 'Home', route: '/' },
      { label: 'Explore', route: '/explore' },
      { label: 'LeaderBoard', route: '/comprehensive-leaderboard' },
      //{ label: 'Trending', route: '/trending' },
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
      initial={{ width: 256 }}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="leftsidebar flex flex-col justify-between h-screen bg-dark-2 border-r border-dark-4 overflow-hidden fixed left-0 top-16 shadow-xl"
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
            className="text-light-1 hover:bg-dark-4 focus:outline-none"
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </Button>
        </div>

        <nav className="flex-grow flex flex-col gap-2 px-4 py-2 overflow-y-auto">
        {Object.entries(groupedLinks).map(([group, links]) => (
          <div key={group}>
            {group !== 'main' && !isCollapsed && (
              <button
                onClick={() => toggleDropdown(group)}
                className={`flex items-center justify-between w-full p-2 rounded-lg transition-all duration-200 ${
                  openDropdown === group ? 'bg-dark-4 text-light-1' : 'text-light-2 hover:bg-dark-4 hover:text-light-1'
                }`}
              >
                <span className="capitalize">{group}</span>
                {openDropdown === group ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
            <AnimatePresence>
              {(group === 'main' || openDropdown === group || isCollapsed) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {links.map((link) => (
                    <NavLink
                      key={link.label}
                      to={link.route}
                      className={({ isActive }) =>
                        `flex items-center gap-4 p-2 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-primary-500 text-white shadow-md'
                            : 'text-light-2 hover:bg-dark-4 hover:text-light-1 hover:shadow-md'
                        } ${link.label === 'Admin Panel' ? 'text-yellow-400 font-semibold' : ''}`
                      }
                    >
                      {getIcon(link.label)}
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
          className="absolute bottom-24 w-full flex items-center justify-center gap-2 text-white bg-red-600 hover:bg-red-700 shadow-lg transition-all duration-200 hover:scale-105"
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