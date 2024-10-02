import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, MessageSquare, Lollipop } from 'lucide-react';
import { getMostLikedLists, getPopularCategories } from "@/lib/appwrite/api";
import { useGetComments } from "@/lib/react-query/queries";
import { Button } from "@/components/ui/button";

const RightSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [allTrendingLists, setAllTrendingLists] = useState<any[]>([]);
  const [displayedLists, setDisplayedLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularCategories, setPopularCategories] = useState<any[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  const fetchTrendingLists = useCallback(async () => {
    try {
      const data = await getMostLikedLists();
      const filteredLists = data.filter((list: any) => !list.isDeleted && list.Title && list.creator);
      setAllTrendingLists(filteredLists);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch trending lists:", error);
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

  return (
    <motion.aside
      initial={{ x: 300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="rightsidebar hidden lg:flex flex-col justify-between w-64 h-screen p-6 bg-dark-2 border-l border-dark-4 fixed right-0 top-20 shadow-xl overflow-y-auto"
    >
      <div className="flex flex-col gap-4">
        {/* Trending Lists Section */}
        <div>
          <h2 className="text-lg font-bold text-light-1 flex items-center mb-4">
            Trending Near You
          </h2>
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <AnimatePresence mode="wait">
              <motion.ul
                key={displayedLists.map(list => list.$id).join(',')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                {displayedLists.map((list) => (
                  <TrendingListItem key={list.$id} list={list} navigate={navigate} />
                ))}
              </motion.ul>
            </AnimatePresence>
          )}
          <button
            className="text-sm text-blue-500 py-2 rounded-lg shadow-lg hover:bg-dark-4 transition-all w-full text-left"
            onClick={() => navigate('/trending')}
          >
            View More Trending
          </button>
        </div>

        {/* Popular Categories Section */}
        <div className="mt-14">
          <h2 className="text-lg font-bold text-light-1 flex items-center mb-4">
            Popular Categories
          </h2>
          {isCategoriesLoading ? (
            <CategoriesSkeleton />
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-wrap gap-2"
              >
                {popularCategories.slice(0, 5).map((category, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      className="text-[10px] bg-dark-2 text-light-2 hover:bg-primary-500 hover:text-light-1 transition-all duration-300"
                      onClick={() => navigate(`/categories/${category.name}`)}
                    >
                      {category.name}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
          <button
            className="text-sm text-blue-500 py-2rounded-lg shadow-lg hover:bg-dark-4 transition-all w-full text-left mt-4"
            onClick={() => navigate('/explore')}
          >
            Explore More 
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-400 text-center absolute bottom-24 left-0 right-0 p-4">
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
  );
};

const TrendingListItem: React.FC<{ list: any; navigate: Function }> = ({ list, navigate }) => {
  const { data: comments } = useGetComments(list.$id);

  return (
    <motion.li
      className="bg-dark-3 rounded-lg p-1 shadow hover:bg-dark-4 transition-all cursor-pointer"
      whileHover={{ y: -3 }}
      onClick={() => navigate(`/lists/${list.$id}`)}
    >
      <h3 className="text-yellow-200 text-xs font-semibold truncate">{list.Title}</h3>
      <p className="text-[10px] text-gray-400 truncate">by {list.creator.Name}</p>
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