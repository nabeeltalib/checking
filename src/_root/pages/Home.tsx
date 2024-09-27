import React, { useEffect, useState, useCallback } from 'react';
import { useUserContext } from "@/context/AuthContext";
import { useGenerateListIdea, useGetInfiniteLists } from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";
import ListCard2 from '@/components/shared/ListCard2';
import MobileTrendingSlider from '@/components/shared/MobileTrendingSlider';
import { useInView } from "react-intersection-observer";
import { toast } from '@/components/ui';
import { IList } from '@/types';
import { Models } from 'appwrite';
import { motion, AnimatePresence } from "framer-motion";
import { getConnection } from '@/lib/appwrite/api';
import { Search, LampDesk } from 'lucide-react';
import { NavLink } from 'react-router-dom';

// Fisher-Yates Shuffle function
function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const Home: React.FC = () => {
  const { user } = useUserContext();
  const { ref, inView } = useInView();

  const {
    data: lists,
    isLoading,
    isError: isErrorLists,
    fetchNextPage,
    hasNextPage,
  } = useGetInfiniteLists();

  const { mutate: generateListIdea, isLoading: isGeneratingIdea } = useGenerateListIdea(user?.id || "");
  const [listIdea, setListIdea] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [connection, setConnection] = useState<any>(undefined);

  // Scroll to top when component mounts or when user navigates to the page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch user connection data
  useEffect(() => {
    const fetchData = async () => {
      try {
        let resp = await getConnection(user.id);
        setConnection(resp.length > 0 ? resp[0] : undefined);
      } catch (error) {
        console.error('Error fetching connection:', error);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  // Infinite scroll logic
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  // Shuffle lists before displaying them
  const filterLists = useCallback((lists: Models.Document[]) => {
    // Randomize the lists before rendering
    return shuffleArray(lists).filter((list: IList) =>
      list.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      list.Tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm]);

  if (isErrorLists) {
    toast({ title: "Something went wrong.", variant: "destructive" });
    return null;
  }

  const LoadingSkeleton: React.FC = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-dark-2 p-4 sm:p-6 rounded-xl shadow-lg">
          <motion.div
            className="h-6 bg-dark-3 rounded w-3/4 mb-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          ></motion.div>
          <div className="space-y-2">
            {[...Array(5)].map((_, rowIndex) => (
              <motion.div
                key={rowIndex}
                className="h-4 bg-dark-3 rounded w-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: 0.1 * rowIndex }}
              ></motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <motion.div
              className="h-8 bg-dark-3 rounded w-1/4"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            ></motion.div>
            <motion.div
              className="h-8 bg-dark-3 rounded w-1/4"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
            ></motion.div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col w-full items-center bg-dark-1 min-h-screen">
      {/* Header Section */}
      <header className="w-full bg-dark-1 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-4xl text-yellow-300 font-bold mb-8 mt-6">
           What's In your Top Five?
          </h2>
          <div>
            <NavLink to={`/profile/profile`} className="text-3xl md:text-3xl text-blue-500 font-semibold mb-2 mt-6 hover:text-blue-700 transition-colors" style={{ fontFamily: "'Permanent Marker', cursive" }}>
              @{user.username}
            </NavLink>
          </div>

          {user && (
            <div className="text-sm text-gray-300 mt-5 flex justify-center space-x-4">
              <span>{connection?.follower?.length || 0} followers</span>
              <span className="mx-2">|</span>
              <span>{connection?.following?.length || 0} following</span>
            </div>
          )}
          
          <p className="text-base sm:text-xl font-light text-white mt-8">Where your world's opinions get organized and challenged.</p>
          <p className="text-base sm:text-xl font-semibold text-white mt-8">Connect • Debate • Create</p>          
          </div>
      </header>      

      {/* Content Wrapper */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sticky Search Bar */}
        <div className="sticky top-[calc(4rem)] z-10 w-full bg-dark-1 shadow-md my-4">
        <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search rankings, titles, or tags ..."
                value={searchTerm}
                spellCheck={true} // Enable spellcheck here
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 text-gray-200 pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-3" />
            </div>
          </div>
        </div>        
        {/* Mobile Trending Slider */}
        <MobileTrendingSlider />
        <h3 className="text-2xl font-bold text-light-1 mb-4 flex items-center ml-4 mt-8">
          <LampDesk className="mr-2" />
          Home Feed
        </h3>

        {/* List Cards Section */}
        {isLoading && !lists ? (
          <LoadingSkeleton />
        ) : (
          <AnimatePresence>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {lists?.pages.map((page, pageIndex) => (
                <React.Fragment key={pageIndex}>
                  {filterLists(page.documents).map((list: IList) => (
                    <motion.div
                      key={list.$id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ListCard2 list={list} />
                    </motion.div>
                  ))}
                </React.Fragment>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
        
        {/* Loader for Infinite Scroll */}
        {hasNextPage && (
          <div ref={ref} className="mt-8 flex justify-center">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
