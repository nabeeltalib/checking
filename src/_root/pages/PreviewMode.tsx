import React, { useState } from 'react';
import { getPublicLists } from '@/lib/appwrite/api';
import ListCard from '@/components/shared/ListCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LampDesk } from 'lucide-react';
import MobileTrendingSlider from '@/components/shared/MobileTrendingSlider';
import Bottombar2 from '@/components/shared/Bottombar2';
import SignInDialog from '@/components/shared/SignInDialog';
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from '@tanstack/react-query';

interface IList {
  $id: string;
  [key: string]: any;
}

const LISTS_PER_PAGE = 10;

const PreviewMode: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { ref, inView } = useInView();

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

  React.useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isSignInDialogOpen) {
      setIsSignInDialogOpen(true);
    }
  };

  const handleDialogClose = () => setIsSignInDialogOpen(false);

  const LoadingSkeleton: React.FC = () => (
    <div className="space-y-8">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-dark-2 p-4 sm:p-6 rounded-xl shadow-lg">
          <motion.div
            className="h-8 bg-dark-3 rounded w-1/2 mb-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          ></motion.div>
          <div className="space-y-4">
            {[...Array(3)].map((_, rowIndex) => (
              <div key={rowIndex} className="flex items-center space-x-4">
                <motion.div
                  className="h-6 bg-dark-3 rounded w-1/4"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.1 * rowIndex }}
                ></motion.div>
                <motion.div
                  className="h-6 bg-dark-3 rounded w-1/2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.1 * rowIndex + 0.05 }}
                ></motion.div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (isError) {
    return <div>Error loading lists</div>;
  }

  return (
    <div className="mt-4 w-full items-center bg-dark-1 min-h-screen pb-20">
      <header className="w-full bg-dark-1 py-4">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="text-2xl md:text-3xl text-blue-300 font-bold mb-2 mt-6" style={{ fontFamily: "'Permanent Marker', cursive" }}>
            <span>What's in Your Top Five??</span>
          </div>
          <p className="text-base sm:text-xl font-thin text-blue-200 mt-8">Your World's Recommendations On Everything • Discover/Debate The Best</p>
        </div>
      </header>

      {/* Sticky Search Bar */}
      <div className="sticky top-[calc(4rem)] z-10 w-full bg-dark-1 shadow-md my-4">
        <div className="max-w-2xl mx-auto px-4 py-3 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search for better opinions..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-gray-700 text-gray-200 pl-10 pr-4 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-3" />
          </div>
        </div>
      </div>

      {/* Mobile Trending Slider */}
      <MobileTrendingSlider setIsDialogOpen={setIsSignInDialogOpen} />

      <h3 className="text-2xl font-bold text-light-1 mb-4 flex items-center mt-8">
        <LampDesk className="mr-2" />
        Home Feed
      </h3>

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
              {lists?.pages.map((page, pageIndex) => (
                <React.Fragment key={pageIndex}>
                  {page.map((list: IList) => (
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
                </React.Fragment>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
        
        {hasNextPage && (
          <div ref={ref} className="mt-8 flex justify-center">
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

      {/* Bottombar2 Component */}
      <Bottombar2 />

      {/* Sign-in Dialog */}
      <SignInDialog isOpen={isSignInDialogOpen} onClose={handleDialogClose} />
    </div>
  );
};

export default PreviewMode;