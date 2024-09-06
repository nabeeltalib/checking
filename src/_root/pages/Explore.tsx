import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGetRecentLists } from '@/lib/react-query/queries';
import { ListCard, Loader } from '@/components/shared';
import { getTrendingTags, getPopularCategories } from '@/lib/appwrite/api';
import { useUserContext } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import ListCard2 from '@/components/shared/ListCard2';

const Explore: React.FC = () => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  const [popularCategories, setPopularCategories] = useState<{ name: string }[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    data: recentListsData,
    isLoading: isLoadingRecentLists,
    error: recentListsError
  } = useGetRecentLists();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tags, categories] = await Promise.all([
          getTrendingTags(),
          getPopularCategories()
        ]);
        setTrendingTags(tags);
        setPopularCategories(categories);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setIsTagsLoading(false);
        setIsCategoriesLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (recentListsError) {
      toast({
        title: 'Error fetching recent lists',
        description: 'Please try again later',
        variant: 'destructive'
      });
    }
  }, [recentListsError, toast]);

  if (isLoadingRecentLists) {
    return <Loader />;
  }

  if (error || recentListsError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-dark-1">
        <p className="text-red-500 text-xl mb-4">
          {error || (recentListsError as Error)?.message}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-primary-500 text-white px-6 py-2 rounded-full hover:bg-primary-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="explore-container common-container w-full max-w-7xl mx-auto px-4 py-8">
      <motion.h1 
        className="text-4xl font-bold text-light-1 mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Explore TopFived
      </motion.h1>

      <motion.section 
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-2xl font-semibold text-light-1 mb-6">Popular Categories</h3>
        <div className="flex gap-4 flex-wrap">
          {isCategoriesLoading ? (
            <Loader />
          ) : popularCategories.length > 0 ? (
            popularCategories.map((category, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={`/categories/${category.name}`}
                  className="bg-dark-4 text-light-1 px-4 py-2 rounded-full hover:bg-primary-500 transition-colors shadow-md"
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

      <motion.section 
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-2xl font-semibold text-light-1 mb-6">Trending Tags</h3>
        <div className="flex gap-4 flex-wrap">
          {isTagsLoading ? (
            <Loader />
          ) : trendingTags.length > 0 ? (
            trendingTags.map((tag, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={`/categories/${tag}`}
                  className="bg-dark-3 text-light-2 px-4 py-2 rounded-full hover:bg-primary-500 hover:text-light-1 transition-colors shadow-md"
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

      <motion.section 
        className="w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h3 className="text-2xl font-semibold text-light-1 mb-6">Recent Lists</h3>
        {recentListsData?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {recentListsData?.map((list: any) => (
              <motion.div
                key={list.$id}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {user?.id ? (
                  <ListCard2 list={list} />
                ) : (
                  <ListCard list={list} />
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-light-2 text-center text-lg">
            No recent lists available. Be the first to create one!
          </p>
        )}
      </motion.section>
    </div>
  );
};

export default Explore;