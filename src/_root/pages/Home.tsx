import React, { useEffect, useState, useCallback } from 'react';
import { useUserContext } from "@/context/AuthContext";
import { useGenerateListIdea, useGetInfiniteLists } from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";
import ListCard2 from '@/components/shared/ListCard2';
import { useInView } from "react-intersection-observer";
import { toast } from '@/components/ui';
import { IList } from '@/types';
import { Models } from 'appwrite';
import { motion } from "framer-motion";
import ListCard from '@/components/shared/ListCard';
import { getConnection } from '@/lib/appwrite/api';

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
  const [listIdea, setListIdea] = useState<any>([]);
  const [sortOption, setSortOption] = useState<string>("");

  const handleGenerateIdea = () => {
    setListIdea(null);
    generateListIdea("Generate a random list idea", {
      onSuccess: (idea) => setListIdea(idea),
    });
  };

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

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  const sortLists = useCallback((lists: Models.Document[]) => {
    return [...lists].sort((a, b) => {
      const getCategoryOrTag = (item: Models.Document, field: 'Categories' | 'Tags') => {
        return item[field] && item[field].length > 0 ? item[field][0] : '';
      };

      const aValue = sortOption === 'category' ? getCategoryOrTag(a, 'Categories') : getCategoryOrTag(a, 'Tags');
      const bValue = sortOption === 'category' ? getCategoryOrTag(b, 'Categories') : getCategoryOrTag(b, 'Tags');

      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;
      return aValue.localeCompare(bValue);
    });
  }, [sortOption]);

  if (isErrorLists) {
    toast({ title: "Something went wrong.", variant: "destructive" });
    return null;
  }

  return (
    <div className="flex flex-col gap-6 p-4 w-full items-center common-container">
      <div className="text-wrap text-lg md:text-2xl text-orange-300 flex flex-col md:flex-row items-center gap-2 md:gap-4 mb-2 font-base" style={{ fontFamily: "'Permanent Marker', cursive" }}>
        Where Your World Ranks {user.name || ""}        
        {user && (
          <div className="text-xs text-light-3 flex flex-col md:flex-row items-center">
            <span>{connection?.follower?.length || 0} followers</span>
            <span className="hidden md:inline mx-2">•</span>
            <span>{connection?.following?.length || 0} following</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 max-w-5xl w-full">
        <h1 className="h3-light md:h2-light text-center w-full">Explore Rankings on Anything and Everything</h1>
        <div className="mb-2 flex justify-between">
          <select className="bg-zinc-950 w-32 p-2 rounded-md" onChange={handleSortChange} value={sortOption}>
            <option value="">Filter Lists</option>
            <option value="category">Category</option>
            <option value="tags">Tags</option>
          </select>
        </div>
        {isLoading && !lists ? (
          <Loader />
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {lists?.pages.map((page, pageIndex) => (
              <React.Fragment key={pageIndex}>
                {sortLists(page.documents).map((document: Models.Document) => {
                  const list = document as unknown as IList;
                  return user?.id ? (
                    <ListCard2 key={list.$id} list={list} />
                  ) : (
                    <ListCard key={list.$id} list={list} />
                  );
                })}
              </React.Fragment>
            ))}
          </motion.div>
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
