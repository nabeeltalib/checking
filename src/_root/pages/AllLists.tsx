import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useToast } from "@/components/ui/use-toast";
import { Loader } from "@/components/shared";
import { useGetInfiniteLists, useGetAISuggestions } from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";
import { IList } from "@/types";
import { motion } from "framer-motion";
import { Models } from "appwrite";
import ListCard2 from "@/components/shared/ListCard2";

const AllLists: React.FC = () => {
  const { toast } = useToast();
  const { ref, inView } = useInView();
  const { user } = useUserContext();

  const {
    data: lists,
    isLoading,
    isError: isErrorLists,
    fetchNextPage,
    hasNextPage,
  } = useGetInfiniteLists();

  const { data: aiSuggestions, isLoading: isLoadingAISuggestions } = useGetAISuggestions(user.id);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isErrorLists) {
    toast({ title: "Something went wrong.", variant: "destructive" });
    return null;
  }

  return (
    <div className="flex-1 max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-light-1">Top 5 Lists</h1>
      
      {isLoadingAISuggestions ? (
        <Loader />
      ) : aiSuggestions && aiSuggestions.length > 0 ? (
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-light-2">AI Suggestions</h2>
          <ul className="space-y-2">
            {aiSuggestions.map((suggestion, index) => (
              <motion.li 
                key={index} 
                className="text-light-1 bg-dark-3 p-3 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {suggestion}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      ) : null}

      {isLoading && !lists ? (
        <Loader />
      ) : (
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {lists?.pages.map((page, pageIndex) => (
            <React.Fragment key={pageIndex}>
              {page?.documents.map((document: Models.Document) => {
                const list = document as unknown as IList;
                return <ListCard2 key={list.$id} list={list} />;
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
  );
};

export default AllLists;