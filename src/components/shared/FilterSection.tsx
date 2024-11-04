import React, { memo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Calendar,
  Star,
  MessageSquare,
  ChevronDown,
  X,
  Search,
  Sliders,
  Clock,
} from 'lucide-react';
import { useTrackEngagement } from '@/lib/react-query/queries';
import { useUserContext } from '@/context/AuthContext';

// Types
type Category = string;

interface FilterOption {
  id: string;
  name: string;
  icon?: string;
  count?: number;
  color?: string;
}

interface SortOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface FilterSectionProps {
  selectedCategory: Category;
  setSelectedCategory: (category: Category) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    count: number;
  }>;
  timeRange: string;
  setTimeRange: (range: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showAdvancedFilters: boolean;
}

const SORT_OPTIONS: SortOption[] = [
  {
    value: 'trending',
    label: 'Trending',
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    value: 'recent',
    label: 'Most Recent',
    icon: <Clock className="w-4 h-4" />,
  },
  {
    value: 'discussed',
    label: 'Most Discussed',
    icon: <MessageSquare className="w-4 h-4" />,
  },
  {
    value: 'rated',
    label: 'Highest Rated',
    icon: <Star className="w-4 h-4" />,
  },
];

const TIME_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

// Custom hook to detect mobile view
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

const FilterSection: React.FC<FilterSectionProps> = ({
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  categories,
  timeRange,
  setTimeRange,
  searchTerm,
  setSearchTerm,
  showAdvancedFilters
}) => {
  const isMobile = useIsMobile();
  const { user } = useUserContext();
  const { mutate: trackEngage } = useTrackEngagement();
  const [isFilterExpanded, setIsFilterExpanded] = useState(!isMobile);

  useEffect(() => {
    setIsFilterExpanded(!isMobile);
  }, [isMobile]);

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
  }, [user?.$id, setSelectedCategory, trackEngage]);

  const handleSortChange = useCallback((sort: string) => {
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
  }, [user?.$id, setSortBy, trackEngage]);

  const handleTimeRangeChange = useCallback((range: string) => {
    setTimeRange(range);
    if (user?.$id) {
      trackEngage({
        userId: user.$id,
        action: 'change_time_range',
        route: '/home',
        source: 'time_filter',
        timestamp: new Date().toISOString()
      });
    }
  }, [user?.$id, setTimeRange, trackEngage]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (user?.$id) {
      trackEngage({
        userId: user.$id,
        action: 'search',
        route: '/home',
        source: 'search_bar',
        timestamp: new Date().toISOString()
      });
    }
  }, [user?.$id, setSearchTerm, trackEngage]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    if (user?.$id) {
      trackEngage({
        userId: user.$id,
        action: 'clear_search',
        route: '/home',
        source: 'search_bar',
        timestamp: new Date().toISOString()
      });
    }
  }, [user?.$id, setSearchTerm, trackEngage]);

  return (
    <div className="sticky top-[calc(4rem)] z-20 w-full bg-dark-1 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Main Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search rankings, titles, or tags..."
              className="w-full bg-dark-3 text-white pl-10 pr-4 py-2 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 
                  text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="text-xs relative">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="appearance-none bg-dark-3 text-white px-4 py-2 pr-10 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          {/* Time Range Dropdown */}
          <div className="text-xs relative">
            <select
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className="appearance-none bg-dark-3 text-white px-4 py-2 pr-10 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            >
              {TIME_RANGES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          {/* Filters Toggle Button */}
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="text-xs flex items-center space-x-2 px-4 py-2 bg-dark-3 rounded-lg
              hover:bg-dark-4 transition-colors"
          >
            <Sliders className="w-4 h-4 text-gray-400" />
            <span className="text-white">Filters</span>
            <motion.div
              animate={{ rotate: isFilterExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </motion.div>
          </button>
        </div>

        {/* Category Pills */}
        <AnimatePresence>
          {isFilterExpanded && (
            <motion.div
              key="category-pills"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-xs mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full
                      transition-all ${
                        selectedCategory === category.id
                          ? 'bg-primary-500 text-white'
                          : 'bg-dark-3 text-gray-400 hover:bg-dark-4'
                      }`}
                  >
                    {category.icon && (
                      <span className="text-lg">{category.icon}</span>
                    )}
                    <span>{category.name}</span>
                    {category.count !== undefined && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          selectedCategory === category.id
                            ? 'bg-white/20'
                            : 'bg-dark-4'
                        }`}
                      >
                        {category.count}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <AnimatePresence>
            {isFilterExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-2 py-2 border-t border-dark-4"
              >
                {/* Additional filter options can be added here */}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default memo(FilterSection);