import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useToast } from "@/components/ui/use-toast";
import { ListCard, Loader } from "@/components/shared";
import { useGetInfiniteLists, useGetAISuggestions } from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";
import { IList } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import ListCard2 from "@/components/shared/ListCard2";
import { Lightbulb, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const AllLists: React.FC = () => {
  const { toast } = useToast();
  const { ref, inView } = useInView();
  const { user } = useUserContext();
  const [showSuggestions, setShowSuggestions] = useState(true);

  const {
    data: lists,
    isLoading,
    isError: isErrorLists,
    fetchNextPage,
    hasNextPage,
  } = useGetInfiniteLists();

  const { data: aiSuggestions, refetch: refetchSuggestions } = useGetAISuggestions(user.id);

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
    <div className="flex-1 max-w-6xl mx-auto px-4 py-8">
      <motion.h1 
        className="text-orange-300 font-extralight text-3xl md:text-4xl text-center w-full mt-8 mb-12"
        style={{ fontFamily: "'Permanent Marker', cursive" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        What's in your Top Five?
      </motion.h1>
      
      {aiSuggestions && aiSuggestions.length > 0 && (
        <motion.div 
          className="mb-12 bg-dark-3 rounded-lg p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-light-1 flex items-center">
              <Lightbulb className="mr-2 text-yellow-400" />
              List Ideas for You
            </h2>
            <div className="flex items-center">
              <Button
                onClick={() => refetchSuggestions()}
                className="mr-2 p-2 bg-dark-4 hover:bg-dark-2 rounded-full transition-colors duration-200"
                title="Refresh suggestions"
              >
                <RefreshCw size={20} className="text-light-2" />
              </Button>
              <Button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="p-2 bg-dark-4 hover:bg-dark-2 rounded-full transition-colors duration-200"
              >
                {showSuggestions ? <ChevronUp size={20} className="text-light-2" /> : <ChevronDown size={20} className="text-light-2" />}
              </Button>
            </div>
          </div>
          <AnimatePresence>
            {showSuggestions && (
              <motion.ul 
                className="space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {aiSuggestions.map((suggestion, index) => (
                  <motion.li 
                    key={index} 
                    className="text-light-1 bg-dark-2 p-4 rounded-lg hover:bg-dark-4 transition-colors duration-200 cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {suggestion}
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {isLoading && !lists ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        <>
          <motion.h2 
            className="text-2xl font-semibold text-light-1 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Discover & Engage
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {lists?.pages.map((page, pageIndex) => (
              <React.Fragment key={pageIndex}>
                {page?.documents.map((document: Models.Document) => {
                  const list = document as unknown as IList;
                  return user.id ? (
                    <motion.div
                      key={list.$id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: pageIndex * 0.1 }}
                    >
                      <ListCard2 list={list} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={list.$id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: pageIndex * 0.1 }}
                    >
                      <ListCard list={list} />
                    </motion.div>
                  );
                })}
              </React.Fragment>
            ))}
          </motion.div>
        </>
      )}
      
      {hasNextPage && (
        <div ref={ref} className="mt-12 flex justify-center">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default AllLists;