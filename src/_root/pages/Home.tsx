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
import { Search, Zap, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      <header className="w-full bg-dark-1 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl text-white font-bold mb-2" style={{ fontFamily: "'Permanent Marker', cursive" }}>
            Where Your World Ranks {user.name}
          </h1>
          <p className="text-xl text-gray-200">Explore Opinions on Anything and Everything</p>
          {user && (
            <div className="text-sm text-gray-400 mt-2">
              <span>{connection?.follower?.length || 0} followers</span>
              <span className="mx-2">•</span>
              <span>{connection?.following?.length || 0} following</span>
            </div>
          )}
        </div>
      </header>

      <div className="w-full max-w-5xl mx-auto px-4">
       {/* Sticky Search Bar */}
      <div className="sticky top-20 z-10 w-full bg-dark-1 shadow-md mt-2">
        <div className="max-w-3xl mx-auto px-4 py-3 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search for better opinions..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-dark-4 text-light-1 pl-10 pr-4 py-2 rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-3" />
          </div>
          {/*<div className="text-xs flex items-center gap-2">
            <Filter className="text-light-3" />
            <select 
              className="bg-dark-3 text-light-1 p-2 rounded-md"
              onChange={handleSortChange}
              value={sortOption}
            >
              <option value="">Filter Lists</option>
              <option value="category">Category</option>
              <option value="tags">Tags</option>
            </select>
          </div>*/}
        </div>
      </div>

        <div className="bg-dark-1 p-6 rounded-lg shadow-lg mb-8 mt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
            <Zap className="text-yellow-400" />
            Featured List Idea
          </h2>
          {isGeneratingIdea ? (
            <Loader />
          ) : listIdea ? (
            <p className="text-light-2">{listIdea}</p>
          ) : (
            <button 
              onClick={handleGenerateIdea}
              className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors"
            >
              Generate List Idea
            </button>
          )}
        </div>

        {isLoading && !lists ? (
          <Loader />
        ) : (
          <AnimatePresence>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
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