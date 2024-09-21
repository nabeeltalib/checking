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

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const handleGenerateIdea = () => {
    setListIdea("");
    generateListIdea("Generate a random list idea", {
      onSuccess: (idea) => setListIdea(idea),
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filterLists = useCallback((lists: Models.Document[]) => {
    return lists.filter((list: IList) => 
      list.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      list.Tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm]);

  if (isErrorLists) {
    toast({ title: "Something went wrong.", variant: "destructive" });
    return null;
  }

  return (
    <div className="flex flex-col w-full items-center bg-dark-1 min-h-screen">
      {/* Header Section */}
      <header className="w-full bg-dark-1 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl md:text-2xl text-blue-300 font-bold mb-2 mt-6" style={{ fontFamily: "'Permanent Marker', cursive" }}>
           What's in your Top Five?
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
          
          <p className="text-base sm:text-xl text-thin text-blue-200 mt-8">Your World's Recommendations On Everything • Debate The Best</p>
        </div>
      </header>      

      {/* Content Wrapper */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sticky Search Bar */}
        <div className="sticky top-20 z-10 w-full bg-dark-1 shadow-md my-4">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search rankings, titles, or tags ..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full bg-dark-4 text-light-1 pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-3" />
            </div>
          </div>
        </div>        
        {/* Mobile Trending Slider */}
        <MobileTrendingSlider />
        <h3 className="text-2xl font-bold text-light-1 mb-4 flex items-center mt-8">
          <LampDesk className="mr-2" />
          Home Feed
        </h3>

        {/* List Cards Section */}
        {isLoading && !lists ? (
          <Loader />
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