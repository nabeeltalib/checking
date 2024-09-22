import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGetAISuggestions } from '@/lib/react-query/queries';
import { ListCard, Loader } from '@/components/shared';
import { getTrendingTags, getPopularCategories, getRecentLists } from '@/lib/appwrite/api';
import { useUserContext } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import ListCard2 from '@/components/shared/ListCard2';
import { Sparkles, Lollipop, Hash, Clock } from 'lucide-react';

const Explore: React.FC = () => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const [trendingTags, setTrendingTags] = useState<any[]>([]);
  const [popularCategories, setPopularCategories] = useState<any[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isRecentListsLoading, setIsRecentListsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentListsData, setRecentListsData] = useState<any>([]);

  const {
    data: aiSuggestions,
    isLoading: isLoadingAISuggestions,
    error: aiSuggestionsError
  } = useGetAISuggestions(user.id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tags, categories, recentLists] = await Promise.all([
          getTrendingTags(),
          getPopularCategories(),
          getRecentLists()
        ]);
        setTrendingTags(tags);
        setPopularCategories(categories);
        setRecentListsData(recentLists);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setIsTagsLoading(false);
        setIsCategoriesLoading(false);
        setIsRecentListsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (aiSuggestionsError) {
      toast({
        title: 'Error fetching AI suggestions',
        description: 'Please try again later',
        variant: 'destructive'
      });
    }
  }, [aiSuggestionsError, toast]);

  if (error || aiSuggestionsError) {
    return (
      <div className="text-red-500 text-center p-4 bg-dark-2 rounded-lg">
        {error || (aiSuggestionsError as Error)?.message}
      </div>
    );
  }

  return (
    <div className="explore-container common-container w-full space-y-12">
      {/* AI Suggested Lists */}
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
          // Show LoadingSkeleton while AI suggestions are loading
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
      </motion.section>

      {/* Popular Categories */}
      <motion.section
        key="popular-categories"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 bg-dark-2 p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-2xl font-bold text-light-1 mb-4 flex items-center">
          <Lollipop className="mr-2" />
          Popular Categories
        </h3>
        <div className="flex gap-4 flex-wrap">
          {isCategoriesLoading ? (
            // Show LoadingSkeleton while categories are loading
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
        className="mb-8 bg-dark-2 p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-2xl font-bold text-light-1 mb-4 flex items-center">
          <Hash className="mr-2" />
          Trending Tags
        </h3>
        <div className="flex gap-4 flex-wrap">
          {isTagsLoading ? (
            // Show LoadingSkeleton while tags are loading
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
        {isRecentListsLoading ? (
          // Show LoadingSkeleton while recent lists are loading
          <RecentListsSkeleton />
        ) : recentListsData?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {recentListsData?.map((list: any, index: number) => (
              <motion.div
                key={list.$id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {user.id ? (
                  <ListCard2 list={list} />
                ) : (
                  <ListCard list={list} />
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-light-2">No recent lists found.</p>
        )}
      </motion.section>
    </div>
  );
};

// LoadingSkeleton components
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
        className="h-8 w-24 bg-dark-3 rounded-full animate-pulse"
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

export default Explore;
