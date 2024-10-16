import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';
import { getMostLikedLists, getPopularCategories } from '@/lib/appwrite/api';
import { useGetComments } from '@/lib/react-query/queries';
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import SignInDialog from '@/components/shared/SignInDialog';

interface TrendingListItemProps {
  list: any;
  onClick: () => void;
}

const TrendingListItem: React.FC<TrendingListItemProps> = ({ list, onClick }) => {
  const { data: comments } = useGetComments(list.$id);

  return (
    <motion.li
      className="bg-dark-3 rounded-lg p-2 shadow hover:bg-dark-4 transition-all cursor-pointer"
      whileHover={{ y: -3 }}
      onClick={onClick}
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
      <div key={index} className="h-8 w-24 bg-dark-3 rounded-full animate-pulse"></div>
    ))}
  </div>
);

const RightSidebar2: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [allTrendingLists, setAllTrendingLists] = useState<any[]>([]);
  const [displayedLists, setDisplayedLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularCategories, setPopularCategories] = useState<any[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);

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

  const handleAuthenticatedAction = (action: () => void) => {
    if (user?.isAuthenticated) {
      action();
    } else {
      setIsSignInDialogOpen(true);
    }
  };

  const handleListClick = (listId: string) => {
    handleAuthenticatedAction(() => navigate(`/lists/${listId}`));
  };

  const handleCategoryClick = (categoryName: string) => {
    handleAuthenticatedAction(() => navigate(`/categories/${categoryName}`));
  };

  const handleViewMoreTrending = () => {
    handleAuthenticatedAction(() => navigate('/trending'));
  };

  const handleExploreAllCategories = () => {
    handleAuthenticatedAction(() => navigate('/categories'));
  };

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex flex-col h-full bg-dark-2 border-l border-dark-4 overflow-hidden shadow-2xl"
      >
        <Button
          onClick={toggleCollapse}
          variant="ghost"
          size="icon"
          className="self-start m-4 text-light-1 hover:bg-dark-4/50 focus:outline-none transition-all duration-300"
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </Button>

        <div className="flex-grow overflow-y-auto px-4">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Trending Lists Section */}
                <div className="mb-8">
                  <h2 className="text-lg font-bold text-light-1 mb-4">
                    Trending Near You
                  </h2>
                  {loading ? (
                    <LoadingSkeleton />
                  ) : (
                    <ul className="space-y-4">
                      {displayedLists.map((list) => (
                        <TrendingListItem
                          key={list.$id}
                          list={list}
                          onClick={() => handleListClick(list.$id)}
                        />
                      ))}
                    </ul>
                  )}
                  <Button
                    className="w-full mt-4 text-blue-500 hover:bg-dark-4"
                    onClick={handleViewMoreTrending}
                  >
                    View More Trending
                  </Button>
                </div>

                {/* Popular Categories Section */}
                <div>
                  <h2 className="text-lg font-bold text-light-1 mb-4">
                    Popular Categories
                  </h2>
                  {isCategoriesLoading ? (
                    <CategoriesSkeleton />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {popularCategories.slice(0, 5).map((category, index) => (
                        <Button
                          key={index}
                          className="text-[11px] bg-dark-3 text-light-2 hover:bg-primary-500 hover:text-light-1"
                          onClick={() => handleCategoryClick(category.name)}
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  )}
                  <Button
                    className="w-full mt-4 text-blue-500 hover:bg-dark-4"
                    onClick={handleExploreAllCategories}
                  >
                    Explore All Categories
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 text-xs text-gray-400 text-center">
          <NavLink to="/privacypolicy" className="underline hover:text-white transition-colors duration-200">
            Privacy Policy
          </NavLink>
          <span className="mx-2">|</span>
          <NavLink to="/termsandconditions" className="underline hover:text-white transition-colors duration-200">
            Terms & Conditions
          </NavLink>
          <p className="mt-2">&copy; 2024 Topfived. All rights reserved.</p>
        </div>
      </motion.aside>

      <SignInDialog 
        isOpen={isSignInDialogOpen} 
        onClose={() => setIsSignInDialogOpen(false)}
      />
    </>
  );
};

export default RightSidebar2;