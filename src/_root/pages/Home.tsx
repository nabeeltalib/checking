import React, { useEffect, useState, useCallback } from 'react';
import { useUserContext } from "@/context/AuthContext";
import { useGenerateListIdea, useGetInfiniteLists } from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";
import ListCard2 from '@/components/shared/ListCard2';
import { useInView } from "react-intersection-observer";
import { toast } from '@/components/ui';
import { IList } from '@/types';
import { Models } from 'appwrite';
import { motion, AnimatePresence } from "framer-motion";
import { getConnection } from '@/lib/appwrite/api';
import { Search } from 'lucide-react';
import TrendingSlider from "@/components/shared/TrendingSlider";

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
          <h2 className="text-xl md:text-2xl text-gray-300 font-semibold mb-2">
           {user.name}'s Connected Opinions
          </h2>
          
          {user && (
            <div className="text-sm text-gray-300 mt-2 flex justify-center space-x-4">
              <span>{connection?.follower?.length || 0} followers</span>
              <span className="mx-2">•</span>
              <span>{connection?.following?.length || 0} following</span>
            </div>
          )}
          <h1 className="text-3xl md:text-4xl text-orange-300 font-bold mb-2 mt-6" style={{ fontFamily: "'Permanent Marker', cursive" }}>
            Is your top five better?
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 mt-6">Discover Rankings on Anything and Everything</p>
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
                placeholder="Search for better opinions..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full bg-dark-4 text-light-1 pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-3" />
            </div>
          </div>
        </div>

        {/* Trending Section */}
        <div className="my-6 sm:my-8 lg:my-12 bg-dark-3 rounded-lg shadow-lg p-4 sm:p-6">
          <TrendingSlider />
        </div>

        <h3 className="text-xl sm:text-2xl lg:text-2xl font-light text-blue-300 mb-4 sm:mb-6">
          Debate friend's rankings and find opinions to trust
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