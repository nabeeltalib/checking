import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useToast } from "@/components/ui/use-toast";
import { Loader } from "@/components/shared";
import { useGetInfiniteLists, useSearchLists, useGetAISuggestions } from "@/lib/react-query/queries";
import ListCard from "@/components/shared/ListCard";
import SearchBar from "@/components/shared/SearchBar";
import { useUserContext } from "@/context/AuthContext";
import { IList } from "@/types";
import { motion } from "framer-motion";
import { Models } from "appwrite";

const AllLists = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const { ref, inView } = useInView();
  const { user } = useUserContext();

  const {
    data: lists,
    isLoading,
    isError: isErrorLists,
    fetchNextPage,
    hasNextPage,
  } = useGetInfiniteLists();

  const { data: searchResults, isLoading: isSearchLoading } = useSearchLists(searchQuery, user.id);
  const { data: aiSuggestions, isLoading: isLoadingAISuggestions } = useGetAISuggestions(user.id);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

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
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-light-2">AI Suggestions</h2>
          <ul className="space-y-2">
            {aiSuggestions.map((suggestion, index) => (
              <li key={index} className="text-light-1">{suggestion}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mb-8">
        <SearchBar onSearch={handleSearch} />
      </div>

      {isLoading && !lists ? (
        <Loader />
      ) : (
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {searchQuery
            ? (isSearchLoading 
                ? <Loader /> 
                : searchResults && searchResults.length === 0 
                  ? <p className="text-light-2">No results found.</p>
                  : searchResults?.map((list: IList) => (
                      <ListCard key={list.$id} list={list} />
                    ))
              )
            : lists?.pages.map((page, pageIndex) => (
                <React.Fragment key={pageIndex}>
                  {page.documents.map((document: Models.Document) => {
                    const list = document as unknown as IList;
                    return <ListCard key={list.$id} list={list} />;
                  })}
                </React.Fragment>
              ))
          }
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