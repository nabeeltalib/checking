import React, { useState, useEffect, useMemo } from 'react';
import { getPublicLists } from '@/lib/appwrite/api';
import ListCard from '@/components/shared/ListCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LampDesk, Sparkles } from 'lucide-react';
import MobileTrendingSlider from '@/components/shared/MobileTrendingSlider';
import Bottombar2 from '@/components/shared/Bottombar2';
import SignInDialog from '@/components/shared/SignInDialog';
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from '@tanstack/react-query';

interface IList {
  $id: string;
  Title: string;
  Tags?: string[];
  [key: string]: any;
}

const LISTS_PER_PAGE = 20;

// Fisher-Yates shuffle function
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 w-full animate-pulse">
    {[...Array(6)].map((_, index) => (
      <motion.div
        key={index}
        className="bg-dark-2 p-4 sm:p-6 rounded-xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        {/* Skeleton Content */}
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
        <motion.div
          className="h-6 bg-dark-3 rounded w-3/4 mb-4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
        />
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
        <div className="flex flex-wrap gap-2 mt-4">
          {[...Array(3)].map((_, tagIndex) => (
            <motion.div
              key={tagIndex}
              className="h-6 bg-dark-3 rounded-full w-16"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.1 * tagIndex }}
            />
          ))}
        </div>
        <div className="flex justify-between items-center mt-4">
          {[...Array(4)].map((_, buttonIndex) => (
            <motion.div
              key={buttonIndex}
              className="w-8 h-8 bg-dark-3 rounded-full"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.1 * buttonIndex }}
            />
          ))}
        </div>
      </motion.div>
    ))}
  </div>
);

const PreviewMode: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { ref, inView } = useInView();
  const [searchPrompt, setSearchPrompt] = useState<string>("");
  const [shuffledListIds, setShuffledListIds] = useState<string[]>([]);

  const prompts = useMemo(() => [
    "Movies that Changed my life?",
    "Best pizza in the bay area?",
    "Bucket list destinations in asia?",
    "Most influential books of this year?",
    "Athletes at Westminster high school?",
    "Concerts in Chicago?",
    "Street foods in Bangkok's night markets?",
    "Hikes in the Pacific Northwest?",
    "Artists shaping Austin's music scene?",
    "Hidden gems at the Dogwood Festival?",
  ], []);

  const {
    data: lists,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    ['publicLists'],
    async ({ pageParam = 0 }) => {
      const start = pageParam * LISTS_PER_PAGE;
      const end = start + LISTS_PER_PAGE;
      const fetchedLists = await getPublicLists(start, end);
      return fetchedLists;
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === LISTS_PER_PAGE ? allPages.length : undefined;
      },
    }
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  useEffect(() => {
    const rotatePrompts = () => {
      const randomIndex = Math.floor(Math.random() * prompts.length);
      setSearchPrompt(prompts[randomIndex]);
    };

    rotatePrompts(); // Set initial prompt
    const intervalId = setInterval(rotatePrompts, 2000); // Change every 2 seconds

    return () => clearInterval(intervalId);
  }, [prompts]);

  // Shuffle list IDs when new data is loaded
  useEffect(() => {
    if (lists?.pages) {
      const allListIds = lists.pages.flatMap(page => 
        page.map((list: IList) => list.$id)
      );
      setShuffledListIds(shuffleArray(allListIds));
    }
  }, [lists]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isSignInDialogOpen) {
      setIsSignInDialogOpen(true);
    }
  };

  const handleDialogClose = () => setIsSignInDialogOpen(false);

  // Filter and sort lists based on shuffled IDs and search term
  const filteredAndSortedLists = useMemo(() => {
    if (!lists?.pages) return [];
    
    const allLists = lists.pages.flatMap(page => page);
    return shuffledListIds
      .map(id => allLists.find((list: IList) => list.$id === id))
      .filter((list: IList | undefined): list is IList => 
        !!list && (
          list.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          list.Tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
  }, [lists, shuffledListIds, searchTerm]);

  if (isError) {
    return <div>Error loading lists</div>;
  }

  return (
    <div className="mt-4 w-full items-center bg-dark-1 min-h-screen pb-20">
      {/* Redesigned Sticky Search Bar */}
      <div className="sticky top-[calc(4rem)] z-10 w-full bg-dark-1 shadow-md my-4">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="bg-gray-800 rounded-full overflow-hidden shadow-lg mb-2">
            <div className="flex items-center px-4 py-2">
              <Search className="text-gray-800 mr-3" size={20} />
              <input
                type="text"
                placeholder="Search rankings, titles, or tags ..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-transparent text-gray-900 w-full focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
      
      <header className="w-full bg-dark-1 py-4">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="text-2xl md:text-4xl text-orange-500 font-bold mb-2 mt-6">
            <span>What's In Your Top Five?</span>
          </div>
          <p className="text-base sm:text-xl font-light text-white mt-8">Your World's Opinions, Organized</p>
          <p className="text-xs sm:text-sm font-semibold text-white mt-8 mb-5">Discover • Debate • Challenge</p>
        </div>
      </header>      

      {/* Mobile Trending Slider - Only visible on mobile */}
      <div className="md:hidden">
        <MobileTrendingSlider setIsDialogOpen={setIsSignInDialogOpen} />
      </div>     

      {/* Main Content */}
      <div className="flex flex-col gap-6 p-4 w-full items-center max-w-5xl mx-auto mt-6">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <AnimatePresence>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {filteredAndSortedLists.map((list: IList) => (
                <motion.div
                  key={list.$id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ListCard list={list} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
        
        {hasNextPage && (
          <div ref={ref} className="mt-8 w-full">
            <LoadingSkeleton />
          </div>
        )}

        <Button
          onClick={() => setIsSignInDialogOpen(true)}
          className="w-full md:w-auto mx-auto bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out"
        >
          Sign Up/Sign In to Access More Features
        </Button>
      </div>     

      {/* Sign-in Dialog */}
      <SignInDialog isOpen={isSignInDialogOpen} onClose={handleDialogClose} />
    </div>
  );
};

export default PreviewMode;