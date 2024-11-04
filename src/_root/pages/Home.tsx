import React, { memo, useEffect, useState, useCallback, useMemo } from "react";
import { useUserContext } from "@/context/AuthContext";
import { 
  useGenerateListIdea, 
  useGetInfiniteLists,
  useGetTrendingDebates,
  useTrackEngagement,
  useGetUserStats
} from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";
import TrendingDebatesSection from "@/components/shared/TrendingDebatesSection";
import FilterSection from "@/components/shared/FilterSection";
import AnimatedListCard from "@/components/shared/ListCard2";
import { useInView } from "react-intersection-observer";
import { toast } from "@/components/ui";
import { IList } from "@/types";
import { Models } from 'appwrite';
import { motion, AnimatePresence } from "framer-motion";
import { getConnection } from "@/lib/appwrite/api";
import { MessageSquare, Search } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

// Constants
const CATEGORIES = [
  { id: 'all', name: 'All', icon: '🌟', count: 0 },
  { id: 'movies', name: 'Movies', icon: '🎬', count: 0 },
  { id: 'music', name: 'Music', icon: '🎵', count: 0 },
  { id: 'sports', name: 'Sports', icon: '⚽', count: 0 },
  { id: 'food', name: 'Food', icon: '🍔', count: 0 },
  { id: 'tech', name: 'Technology', icon: '💻', count: 0 }
] as const;

const SORT_OPTIONS = [
  { value: 'trending', label: '🔥 Most Trending' },
  { value: 'debated', label: '💬 Most Debated' },
  { value: 'recent', label: '⏰ Most Recent' },
  { value: 'ranked', label: '🏆 Highest Ranked' }
] as const;

// Types
type Category = typeof CATEGORIES[number]['id'];
type SortOption = typeof SORT_OPTIONS[number]['value'];

interface HomeProps {
  className?: string;
}

// Helper functions
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Loading Skeleton Component
const LoadingSkeleton = memo(() => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 w-full">
    {[...Array(6)].map((_, index) => (
      <motion.div
        key={index}
        className="bg-dark-2 p-4 sm:p-6 rounded-xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        layout
      >
        <div className="flex items-center mb-4">
          <motion.div
            className="w-10 h-10 rounded-full bg-dark-3"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
          <div className="ml-3">
            <motion.div
              className="h-4 bg-dark-3 rounded w-24 mb-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.1 }}
            />
            <motion.div
              className="h-3 bg-dark-3 rounded w-20"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
            />
          </div>
        </div>
        {[...Array(5)].map((_, itemIndex) => (
          <div key={itemIndex} className="flex items-center mb-2">
            <motion.div
              className="w-6 h-6 rounded-full bg-dark-3 mr-3"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.1 * itemIndex }}
            />
            <motion.div
              className="h-4 bg-dark-3 rounded w-full"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.1 * itemIndex + 0.05 }}
            />
          </div>
        ))}
      </motion.div>
    ))}
  </div>
));

// Main Home Component
const Home: React.FC<HomeProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { ref, inView } = useInView();
  const userId = user?.$id || user?.id;

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [connection, setConnection] = useState<any>(undefined);
  const [shuffledListIds, setShuffledListIds] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<string>('all');

 // Queries
 const {
  data: lists,
  isLoading: isLoadingLists,
  isError: isErrorLists,
  fetchNextPage,
  hasNextPage,
} = useGetInfiniteLists();

const {
  data: trendingDebates,
  isLoading: isLoadingDebates
} = useGetTrendingDebates();

const { 
  data: userStats, 
  isLoading: isLoadingStats,
  refetch: refetchUserStats 
} = useGetUserStats(userId, {
  enabled: !!userId,
  onSuccess: (data) => {
    console.log('User stats loaded:', data);
  },
  onError: (error) => {
    console.error('Error loading user stats:', error);
  }
});

const { mutate: trackEngage } = useTrackEngagement();



  // Handlers
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (user?.$id) {
      trackEngage({
        userId: user.$id,
        action: 'search',
        route: '/home',
        source: 'search_bar',
        timestamp: new Date().toISOString()
      });
    }
  }, [user?.$id, trackEngage]);

  const handleCategoryChange = useCallback((category: Category) => {
    setSelectedCategory(category);
    if (user?.$id) {
      trackEngage({
        userId: user.$id,
        action: 'filter_category',
        route: '/home',
        source: 'category_filter',
        timestamp: new Date().toISOString()
      });
    }
  }, [user?.$id, trackEngage]);

  const handleSortChange = useCallback((sort: SortOption) => {
    setSortBy(sort);
    if (user?.$id) {
      trackEngage({
        userId: user.$id,
        action: 'change_sort',
        route: '/home',
        source: 'sort_filter',
        timestamp: new Date().toISOString()
      });
    }
  }, [user?.$id, trackEngage]);

  // Effects
  useEffect(() => {
    const fetchConnection = async () => {
      if (!userId) {
        console.log('No user ID available, user object:', user);
        return;
      }

      try {
        console.log('Fetching connection for user:', userId);
        const resp = await getConnection(userId);
        console.log('Connection response:', resp);
        
        if (resp && resp.length > 0) {
          setConnection(resp[0]);
        } else {
          console.log('No connection data found');
        }
      } catch (error) {
        console.error('Error fetching connection:', error);
        toast({
          title: "Error fetching connection data",
          description: "Please try refreshing the page",
          variant: "destructive"
        });
      }
    };

    fetchConnection();
  }, [userId]);

  useEffect(() => {
    if (user?.$id) {
      trackEngage({
        userId: user.$id,
        action: 'page_view',
        route: '/home',
        source: 'web',
        timestamp: new Date().toISOString()
      });
    }
  }, [user?.$id, trackEngage]);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  // Memoized values
  const filteredAndSortedLists = useMemo(() => {
    if (!lists?.pages) return [];
    
    const allLists = lists.pages.flatMap(page => page?.documents ?? []);
    let filtered = allLists.filter((list): list is IList => 
      !!list && 'Title' in list && 'Tags' in list && (
        list.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        list.Tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(list => list.Categories?.includes(selectedCategory));
    }

    switch (sortBy) {
      case 'trending':
        return filtered.sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));
      case 'debated':
        return filtered.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
      case 'recent':
        return filtered.sort((a, b) => 
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
        );
      case 'ranked':
        return filtered.sort((a, b) => (b.rankingPosition || 0) - (a.rankingPosition || 0));
      default:
        return filtered;
    }
  }, [lists, searchTerm, selectedCategory, sortBy]);

  // Render Header Section
  const renderHeader = () => {
    if (!user) return null;

    return (
      <header className="w-full bg-dark-1 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">         

          <motion.h2 
            className="text-2xl md:text-4xl text-orange-500 font-bold mb-4 mt-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            What's In Your Top Five?
          </motion.h2>
          
          <motion.p 
            className="text-base sm:text-xl font-light text-white mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Your World's Opinions, Organized
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <NavLink 
              to={`/profile/${user.$id}`} 
              className="text-xl md:text-xl text-blue-500 font-light mb-4 mt-6 hover:text-blue-700 transition-colors"
            >
              @{user.username}
            </NavLink>
          </motion.div>

          <motion.div 
            className="text-sm text-gray-400 mt-2 flex justify-center space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span data-testid="follower-count">
              {connection?.follower?.length?.toLocaleString() || '0'} followers
            </span>
            <span className="mx-2">|</span>
            <span data-testid="following-count">
              {connection?.following?.length?.toLocaleString() || '0'} following
            </span>
          </motion.div>

          {!isLoadingStats && userStats && (
            <motion.div 
              className="text-sm text-gray-400 mt-2 flex justify-center space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              data-testid="user-stats"
            >
              <span>{Number(userStats.totalLists).toLocaleString()} lists</span>
              <span className="mx-2">|</span>
              <span>{Number(userStats.totalLikes).toLocaleString()} likes</span>
              <span className="mx-2">|</span>
              <span>{Number(userStats.engagementScore).toLocaleString()}% engagement</span>
            </motion.div>
          )}
        </div>
      </header>
    );
  };

  if (isErrorLists) {
    toast({ title: "Error loading lists", variant: "destructive" });
    return null;
  }

  return (
    <div className={`flex flex-col w-full items-center bg-dark-1 min-h-screen ${className}`}>
      {renderHeader()}

      <div className="w-full max-w-5xl mx-auto px-4">
        <TrendingDebatesSection 
          debates={trendingDebates} 
          isLoading={isLoadingDebates}
        />

        <FilterSection
          selectedCategory={selectedCategory}
          setSelectedCategory={handleCategoryChange}
          sortBy={sortBy}
          setSortBy={handleSortChange}
          categories={CATEGORIES}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showAdvancedFilters={true}
        />
        
        {isLoadingLists ? (
          <LoadingSkeleton />
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
            >
              {filteredAndSortedLists.map((list: IList, index) => (
                <AnimatedListCard 
                  key={list.$id} 
                  list={list} 
                  index={index}
                  onListUpdated={() => {
                    // Refetch user stats when a list is updated
                    refetchUserStats();
                  }}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
        
        {/* Empty State */}
        {filteredAndSortedLists.length === 0 && !isLoadingLists && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-200 mb-2">
              No lists found
            </h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your filters or create a new list
            </p>
            <button
              onClick={() => navigate('/create-list')}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg
                hover:bg-primary-600 transition-colors"
            >
              Create New List
            </button>
          </motion.div>
        )}
        
        {/* Infinite Scroll Loading Indicator */}
        {hasNextPage && (
          <motion.div 
            ref={ref} 
            className="mt-8 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader />
          </motion.div>
        )}

        
      </div>
    </div>
  );
};

export default memo(Home);