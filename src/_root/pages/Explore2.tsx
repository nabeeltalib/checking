import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Lollipop, Hash, Clock } from 'lucide-react';
import { useGetAISuggestions } from '@/lib/react-query/queries';
import { ListCard, Loader } from '@/components/shared';
import { getTrendingTags, getPopularCategories, getRecentLists } from '@/lib/appwrite/api';
import { useUserContext } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import ListCard2 from '@/components/shared/ListCard2';
import { Button } from '@/components/ui';
import SignInDialog from '@/components/shared/SignInDialog';
import { Models } from 'appwrite';

const Explore2: React.FC = () => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  // State variables
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  const [popularCategories, setPopularCategories] = useState<Models.Document[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isRecentListsLoading, setIsRecentListsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
  const [recentListsData, setRecentListsData] = useState<Models.Document[]>([]);

  // Scroll to top when component mounts or when user navigates to the page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // Fetch recent lists
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getRecentLists();
        setRecentListsData(Array.isArray(data) ? data : data.documents);
      } catch (error) {
        console.error('Error fetching recent lists:', error);
        setFetchError('Failed to fetch recent lists. Please try again later.');
      } finally {
        setIsRecentListsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch trending tags and popular categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tags, categories] = await Promise.all([
          getTrendingTags(),
          getPopularCategories(),
        ]);
        setTrendingTags(tags);
        setPopularCategories(categories);
      } catch (error) {
        console.error('Error fetching data:', error);
        setFetchError('Failed to fetch data. Please try again later.');
      } finally {
        setIsTagsLoading(false);
        setIsCategoriesLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle protected clicks
  const handleProtectedClick = (e: React.MouseEvent) => {
    if (!user?.isAuthenticated) {
      e.preventDefault();
      setIsSignInDialogOpen(true);
    }
  };

  const closeSignInDialog = () => {
    setIsSignInDialogOpen(false);
  };

  // Rendered lists with loading state
  const renderedLists = useMemo(() => {
    if (isRecentListsLoading) {
      return <RecentListsSkeleton />;
    }
    if (recentListsData?.length > 0) {
      return recentListsData.map((list: any) =>
        user?.id ? (
          <ListCard2
            key={list.$id}
            list={list}
            onUsernameClick={handleProtectedClick}
            onTitleClick={handleProtectedClick}
          />
        ) : (
          <ListCard key={list.$id} list={list} />
        )
      );
    } else {
      return <p className="text-light-2">No recent lists available.</p>;
    }
  }, [recentListsData, isRecentListsLoading, user?.id]);

  // Error handling
  if (fetchError) {
    return (
      <div className="text-red-500">
        {fetchError}
      </div>
    );
  }

  return (
    <div className="explore-container common-container w-full space-y-12">
      {/* Popular Categories */}
      <motion.section
        key="popular-categories"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 bg-dark-2 p-3 rounded-xl shadow-lg"
      >
        <h3 className="text-2xl font-bold text-blue-300 mb-4 flex items-center">
          <Lollipop className="mr-2" />
          Popular Categories
        </h3>
        <div className="flex gap-4 flex-wrap">
          {isCategoriesLoading ? (
            <CategoriesSkeleton />
          ) : popularCategories.length > 0 ? (
            popularCategories.map((category, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={`/categories/${category.name}`}
                  className="bg-dark-4 text-light-1 px-4 py-2 rounded-full hover:bg-primary-500 transition-all duration-300 shadow-md"
                  onClick={handleProtectedClick}
                >
                  {category.name}
                </Link>
              </motion.div>
            ))
          ) : (
            <p className="text-light-2">No categories found.</p>
          )}
        </div>
      </motion.section>

      {/* Trending Tags */}
      <motion.section
        key="trending-tags"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-4 bg-dark-2 p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-2xl font-bold text-blue-300 mb-4 flex items-center">
          <Hash className="mr-2" />
          Trending Tags
        </h3>
        <div className="flex gap-4 flex-wrap">
          {isTagsLoading ? (
            <TagsSkeleton />
          ) : trendingTags.length > 0 ? (
            trendingTags.map((tag, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={`/categories/${tag}`}
                  className="bg-dark-3 text-light-2 px-4 py-2 rounded-full hover:bg-primary-500 hover:text-light-1 transition-all duration-300 shadow-md"
                  onClick={handleProtectedClick}
                >
                  #{tag}
                </Link>
              </motion.div>
            ))
          ) : (
            <p className="text-light-2">No trending tags found.</p>
          )}
        </div>
      </motion.section>

      {/* Recent Lists */}
      <motion.section
        key="recent-lists"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="w-full bg-dark-2 rounded-xl shadow-lg"
      >
        <h3 className="text-2xl font-bold text-light-1 mb-4 flex items-center">
          <Clock className="mr-2" />
          Recent Lists
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {renderedLists}
        </div>
      </motion.section>

      {/* Sign-in Dialog */}
      <SignInDialog isOpen={isSignInDialogOpen} onClose={closeSignInDialog} />
    </div>
  );
};

export default Explore2;

// Skeleton Components
const CategoriesSkeleton: React.FC = () => (
  <div className="flex gap-4 flex-wrap">
    {[...Array(8)].map((_, index) => (
      <div
        key={index}
        className="h-8 w-24 bg-dark-4 rounded-full animate-pulse"
      ></div>
    ))}
  </div>
);

const TagsSkeleton: React.FC = () => (
  <div className="flex gap-4 flex-wrap">
    {[...Array(8)].map((_, index) => (
      <div
        key={index}
        className="h-8 w-24 bg-dark-3 rounded-full animate-pulse"
      ></div>
    ))}
  </div>
);

const RecentListsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
    {[...Array(4)].map((_, index) => (
      <div
        key={index}
        className="h-48 bg-dark-3 rounded-lg animate-pulse"
      ></div>
    ))}
  </div>
);
