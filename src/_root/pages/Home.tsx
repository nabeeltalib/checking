import React, { useEffect, useState } from 'react';
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
      let resp = await getConnection(user.id);
      resp.length > 0 ? setConnection(resp[0]) : setConnection(resp);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  const sortLists = (lists: Models.Document[]) => {
    return [...lists].sort((a, b) => {
      if (sortOption === "category") {
        const categoryA = a.Categories && a.Categories.length > 0 ? a.Categories[0] : '';
        const categoryB = b.Categories && b.Categories.length > 0 ? b.Categories[0] : '';
        if (!categoryA && !categoryB) return 0;
        if (!categoryA) return 1;
        if (!categoryB) return -1;
        return categoryA.localeCompare(categoryB);
      } else if (sortOption === "tags") {
        const tagA = a.Tags && a.Tags.length > 0 ? a.Tags[0] : '';
        const tagB = b.Tags && b.Tags.length > 0 ? b.Tags[0] : '';
        if (!tagA && !tagB) return 0;
        if (!tagA) return 1;
        if (!tagB) return -1;
        return tagA.localeCompare(tagB);
      }
      return 0;
    });
  };

  if (isErrorLists) {
    toast({ title: "Something went wrong.", variant: "destructive" });
    return null;
  }

  return (
    <div className="flex flex-col gap-6 p-4 w-full items-center common-container">

        <div className="text-xl md:text-2xl text-orange-400 flex items-center gap-4 mb-2 font-base" style={{ fontFamily: "'Permanent Marker', cursive" }}>
        See Recommendations From Your World {user.name || ""}        
        {user && (
          <div className="text-sm text-light-3">
            <span>{connection?.follower?.length || 0} followers</span>
            <span className="mx-2">•</span>
            <span>{connection?.following?.length || 0} following</span>
          </div>
        )}
      </div>
      
      {/*<div className="w-full max-w-5xl bg-dark-3 rounded-lg p-6 shadow-lg">
        <h2 className="font-extralight text-2xl text-left w-full mt-8" style={{ fontFamily: "'Permanent Marker', cursive" }}>
          Share Your Best
        </h2>
        <button
          onClick={handleGenerateIdea}
          className="bg-primary-500 text-light-1 px-4 py-2 rounded-md mt-2"
          disabled={isGeneratingIdea}
        >
          {isGeneratingIdea ? "Generating..." : "Generate List Idea"}
        </button>
        {isGeneratingIdea ? (
          <div className="mt-4 p-4 bg-dark-4 rounded-lg">
            <Loader />
          </div>
        ) : listIdea && (
          <div className="mt-4 p-4 bg-dark-4 rounded-lg">
            <p className="text-light-1">{listIdea.map((list: any, index: number) => (
              <p className='m' key={index}>{list}</p>
            ))}</p>
          </div>
        )}
      </div>*/}
      
      <div className="flex flex-col gap-4 max-w-5xl w-full">
        <h1 className="h3-light md:h2-light text-center w-full">What's in your top 3, 4, 5...?</h1>
        <div className="mb-2 flex justify-between">
          <select className="bg-zinc-950 w-32 p-2 rounded-md" onChange={handleSortChange} value={sortOption}>
            <option value="">All</option>
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
                  return user.id ? (
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
