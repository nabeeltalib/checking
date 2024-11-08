import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';
import { getMostLikedLists, getPopularCategories } from '@/lib/appwrite/api';
import { useGetComments } from '@/lib/react-query/queries';
import { Button } from "@/components/ui/button";
import SignInDialog from '@/components/shared/SignInDialog';
import { useUserContext } from '@/context/AuthContext'; // Assume this exists

const RightSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUserContext(); // Assume this context exists
  const [allTrendingLists, setAllTrendingLists] = useState<any[]>([]);
  const [displayedLists, setDisplayedLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
  const [popularCategories, setPopularCategories] = useState<any[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'groups' | 'your-groups'>('groups');

  const fetchTrendingLists = useCallback(async () => {
    try {
      const data = await getMostLikedLists();
      const filteredLists = data.filter(
        (list: any) => !list.isDeleted && list.Title && list.creator
      );
      setAllTrendingLists(filteredLists);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch trending lists:', error);
      setLoading(false);
    }
  }, []);

  const fetchPopularCategories = useCallback(async () => {
    try {
      const categories = await getPopularCategories();
      setPopularCategories(categories);
      setIsCategoriesLoading(false);
    } catch (error) {
      console.error('Failed to fetch popular categories:', error);
      setIsCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingLists();
    fetchPopularCategories();
  }, [fetchTrendingLists, fetchPopularCategories]);

  useEffect(() => {
    if (allTrendingLists.length > 0) {
      const updateDisplayedLists = () => {
        const shuffled = [...allTrendingLists].sort(() => 0.5 - Math.random());
        setDisplayedLists(shuffled.slice(0, 3));
      };

      updateDisplayedLists();
      const intervalId = setInterval(updateDisplayedLists, 10000); // Rotate every 10 seconds

      return () => clearInterval(intervalId);
    }
  }, [allTrendingLists]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDialogOpen = () => setIsSignInDialogOpen(true);
  const handleDialogClose = () => setIsSignInDialogOpen(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <AnimatePresence>
        {(isOpen || !isMobile) && (
          <motion.aside
            initial={{ x: isMobile ? '100%' : 0 }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`rightsidebar flex flex-col justify-between p-6 bg-dark-2 border-l border-dark-4 fixed top-20 shadow-xl overflow-y-auto ${
              isMobile ? 'w-full max-w-[300px] h-[calc(100vh-5rem)] z-50' : 'w-64 h-[calc(100vh-5rem)] right-0'
            }`}
          >
            <div className="flex flex-col gap-4">
              {/* Groups Tabs Section */}
              <div className="flex border-b border-dark-4">
                <button
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'groups' 
                      ? 'text-primary-500 border-b-2 border-primary-500' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('groups')}
                >
                  Groups
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'your-groups' 
                      ? 'text-primary-500 border-b-2 border-primary-500' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('your-groups')}
                >
                  Your Groups
                </button>
              </div>

              {/* Groups Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'groups' ? (
                  <motion.div
                    key="groups"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-3"
                  >
                    {/* Replace with your groups list */}
                    <div className="bg-dark-3 p-3 rounded-lg hover:bg-dark-4 transition-all cursor-pointer">
                      <h3 className="text-sm font-medium text-white">Marvel Fans</h3>
                      <p className="text-xs text-gray-400 mt-1">125 members</p>
                    </div>
                    {/* Add more groups */}
                  </motion.div>
                ) : (
                  <motion.div
                    key="your-groups"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-3"
                  >
                    {isAuthenticated ? (
                      <>
                        {/* Replace with user's groups */}
                        <div className="bg-dark-3 p-3 rounded-lg hover:bg-dark-4 transition-all cursor-pointer">
                          <h3 className="text-sm font-medium text-white">Movie Buffs</h3>
                          <p className="text-xs text-gray-400 mt-1">You + 45 others</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-400 mb-2">Sign in to see your groups</p>
                        <Button
                          onClick={handleDialogOpen}
                          className="bg-primary-500 text-white hover:bg-primary-600"
                        >
                          Sign In
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Create Group Button */}
              <Button
                onClick={() => {
                  if (isAuthenticated) {
                    navigate('/create-group');
                  } else {
                    handleDialogOpen();
                  }
                }}
                className="text-sm w-full bg-primary-500 text-white hover:bg-primary-600 mt-2"
              >
                Create Group
              </Button>

              {/* Trending Lists Section */}
              <div className="mt-6 mb-6">
                <h2 className="text-lg font-bold text-light-1 flex items-center mb-4">
                  Trending Near You
                </h2>
                {loading ? (
                  <LoadingSkeleton />
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.ul
                      key={displayedLists.map((list) => list.$id).join(',')}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-4"
                    >
                      {displayedLists.map((list) => (
                        <TrendingListItem
                          key={list.$id}
                          list={list}
                          navigate={navigate}
                          isAuthenticated={isAuthenticated}
                          handleDialogOpen={handleDialogOpen}
                        />
                      ))}
                    </motion.ul>
                  </AnimatePresence>
                )}
                <button
                  className="text-sm text-blue-500 py-2 rounded-lg shadow-lg hover:bg-dark-4 transition-all w-full text-left"
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate('/trending');
                    } else {
                      handleDialogOpen();
                    }
                  }}
                >
                  View More Trending
                </button>
              </div>

              {/* Popular Categories Section */}
              <div className="mt-14">
                
              </div>
            </div>

            <div className="text-xs text-gray-400 text-center mt-8">
              <NavLink to="/privacypolicy" className="underline hover:text-white transition-colors duration-200">
                Privacy Policy
              </NavLink>
              <span className="mx-2">|</span>
              <NavLink
                to="/termsandconditions"
                className="underline hover:text-white transition-colors duration-200"
              >
                Terms & Conditions
              </NavLink>
              <p className="mt-2">&copy; 2024 Topfived. All rights reserved.</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile toggle button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed bottom-4 right-4 bg-primary-500 text-white p-3 rounded-full shadow-lg z-50"
        >
          {isOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
      )}

      {/* Sign-in Dialog */}
      <SignInDialog isOpen={isSignInDialogOpen} onClose={handleDialogClose} />
    </>
  );
};

interface TrendingListItemProps {
  list: any;
  navigate: Function;
  isAuthenticated: boolean;
  handleDialogOpen: Function;
}

const TrendingListItem: React.FC<TrendingListItemProps> = ({
  list,
  navigate,
  isAuthenticated,
  handleDialogOpen,
}) => {
  const { data: comments } = useGetComments(list.$id);

  const handleClick = () => {
    if (isAuthenticated) {
      navigate(`/lists/${list.$id}`);
    } else {
      handleDialogOpen();
    }
  };

  return (
    <motion.li
      className="bg-dark-3 rounded-lg p-2 shadow hover:bg-dark-4 transition-all cursor-pointer"
      whileHover={{ y: -3 }}
      onClick={handleClick}
    >
      <h3 className="text-orange-200 text-xs font-semibold truncate">{list.Title}</h3>
      <div className="flex items-center mt-1">
        <img
          src={list.creator.ImageUrl || "/assets/icons/profile-placeholder.svg"}
          className="w-6 h-6 rounded-full mr-2 object-cover border-2 border-primary-500"
          loading="lazy"
          alt={list.creator.Name}
        />
        <p className="text-[11px] text-gray-400 truncate">by {list.creator.Name}</p>
      </div>
      <div className="flex items-center mt-2 space-x-4">
        <div className="flex items-center text-xs text-gray-400">
          <ThumbsUp size={14} className="mr-1 text-red-500" />
          {list.Likes?.length || 0}
        </div>
        <div className="flex items-center text-xs text-gray-400">
          <MessageSquare size={14} className="mr-1 text-blue-500" />
          {comments?.length || 0}
        </div>
      </div>
    </motion.li>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, index) => (
      <div key={index} className="bg-dark-3 rounded-lg p-4 shadow animate-pulse">
        <div className="h-4 bg-dark-4 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-dark-4 rounded w-1/2 mb-3"></div>
        <div className="flex items-center space-x-4">
          <div className="h-3 bg-dark-4 rounded w-1/4"></div>
          <div className="h-3 bg-dark-4 rounded w-1/4"></div>
        </div>
      </div>
    ))}
  </div>
);

const CategoriesSkeleton: React.FC = () => (
  <div className="flex flex-wrap gap-2">
    {[...Array(4)].map((_, index) => (
      <div
        key={index}
        className="h-8 w-24 bg-dark-3 rounded-full animate-pulse"
      ></div>
    ))}
  </div>
);

export default RightSidebar;