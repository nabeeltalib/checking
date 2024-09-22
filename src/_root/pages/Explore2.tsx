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

const Explore2: React.FC = () => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  // State variables
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  const [popularCategories, setPopularCategories] = useState<string[]>([]);
  const [recentListsData, setRecentListsData] = useState<any[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isRecentListsLoading, setIsRecentListsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSignUpDialogOpen, setIsSignUpDialogOpen] = useState(false);

  // Fetch AI suggestions
  const {
    data: aiSuggestions,
    isLoading: isLoadingAISuggestions,
    error: aiSuggestionsError,
  } = useGetAISuggestions(user?.id || '');

  // Fetch recent lists
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getRecentLists();
        setRecentListsData(data);
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

  // Handle AI suggestions error
  useEffect(() => {
    if (aiSuggestionsError) {
      toast({
        title: 'Error fetching AI suggestions',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  }, [aiSuggestionsError, toast]);

  // Handle protected clicks
  const handleProtectedClick = (e: React.MouseEvent) => {
    if (!user?.isAuthenticated) {
      e.preventDefault();
      setIsSignUpDialogOpen(true);
    }
  };

  const closeSignUpDialog = () => {
    setIsSignUpDialogOpen(false);
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
      {/* AI Suggested Lists 
      <motion.section
        key="ai-suggestions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 bg-gradient-to-r from-purple-900 to-blue-900 p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Sparkles className="mr-2" />
          AI Suggested Lists
        </h3>
        {isLoadingAISuggestions ? (
          <AISuggestionsSkeleton />
        ) : aiSuggestions && aiSuggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiSuggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm hover:bg-opacity-20 transition-all duration-300"
              >
                <p className="text-light-1">{suggestion}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-light-2">No AI suggestions available.</p>
        )}
      </motion.section>*/}

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
        className="w-full bg-dark-2 p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-2xl font-bold text-light-1 mb-4 flex items-center">
          <Clock className="mr-2" />
          Recent Lists
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {renderedLists}
        </div>
      </motion.section>

      {/* Sign-up Dialog */}
      {isSignUpDialogOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 z-50 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="signUpDialogTitle"
          onClick={closeSignUpDialog}
        >
          <div
            className="relative bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeSignUpDialog}
              className="text-gray-500 hover:text-gray-700 absolute top-4 right-4"
              aria-label="Close"
            >
              {/* Close icon */}
            </button>
            <div className="text-center">
              <h3
                id="signUpDialogTitle"
                className="text-xl sm:text-2xl font-bold text-gray-800 mb-2"
              >
                Unlock Full Access!
              </h3>
              <p className="text-sm sm:text-sm text-gray-600 mb-6">
                Sign up now to like, comment, save, and remix lists. Create your own rankings and join the community!
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Button
                type="button"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out"
                onClick={() => {
                  closeSignUpDialog();
                  navigate('/signup');
                }}
              >
                Sign Up
              </Button>
              <Button
                className="flex items-center justify-center bg-white text-gray-700 border border-gray-300 px-4 sm:px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out hover:bg-gray-100"
                onClick={() => {
                  closeSignUpDialog();
                  navigate('/signin');
                }}
              >
                <img
                  src="/assets/icons/google.svg"
                  alt="Google"
                  className="mr-2 h-5 w-5"
                />
                Sign In with Google
              </Button>
              <Button
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
                onClick={() => {
                  closeSignUpDialog();
                  navigate('/signin');
                }}
              >
                Sign In with Email
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore2;

// Skeleton Components
const AISuggestionsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, index) => (
      <div
        key={index}
        className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm animate-pulse"
      >
        <div className="h-6 bg-dark-4 rounded w-3/4 mb-2"></div>
      </div>
    ))}
  </div>
);

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
