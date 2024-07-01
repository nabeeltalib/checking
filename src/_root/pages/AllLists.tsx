import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useToast } from "@/components/ui/use-toast";
import { Loader } from "@/components/shared";
import { useGetInfiniteLists, useSearchLists } from "@/lib/react-query/queries";
import ListCard from "@/components/shared/ListCard";
import SearchBar from "@/components/shared/SearchBar";
import { useGetAISuggestions } from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";
import { IList } from "@/types";

const AllLists = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const { ref, inView } = useInView();
  const { user } = useUserContext();
  const { data: aiSuggestions, isLoading: isLoadingAISuggestions } = useGetAISuggestions(user.id);

  const {
    data: lists,
    isLoading,
    isError: isErrorLists,
    fetchNextPage,
    hasNextPage,
  } = useGetInfiniteLists();

  const { data: searchResults, isLoading: isSearchLoading } = useSearchLists(searchQuery);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (isErrorLists) {
    toast({ title: "Something went wrong." });
    return null;
  }

  return (
    <div className="common-container">
      <div className="list-container">
        <div className="mb-8">
          <h3 className="h3-bold md:h2-bold text-left w-full">AI Recommended Lists</h3>
          {isLoadingAISuggestions ? (
            <Loader />
          ) : aiSuggestions && aiSuggestions.length > 0 ? (
            <ul className="list-grid">
              {aiSuggestions.map((suggestion, index) => (
                <li key={index} className="flex-1 min-w-[200px] w-full">
                  <div className="bg-dark-3 p-4 rounded-lg">
                    <p className="text-light-1">{suggestion}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-light-2">No AI suggestions available.</p>
          )}
        </div>
        <h2 className="h3-bold md:h2-bold text-left w-full">All Lists</h2>
        <SearchBar onSearch={handleSearch} />
        {isLoading && !lists ? (
          <Loader />
        ) : (
          <>
            {searchQuery ? (
              <ul className="list-grid">
                {isSearchLoading ? (
                  <Loader />
                ) : searchResults && searchResults.length === 0 ? (
                  <p>No results found.</p>
                ) : (
                  searchResults?.map((list: IList) => (
                    <li key={list.$id} className="flex-1 min-w-[200px] w-full">
                      <ListCard list={list} />
                    </li>
                  ))
                )}
              </ul>
            ) : (
              <>
                {lists?.pages.map((page, index) => (
                  <ul key={index} className="list-grid">
                    {page.documents.map((list: IList) => (
                      <li key={list.$id} className="flex-1 min-w-[200px] w-full">
                        <ListCard list={list} />
                      </li>
                    ))}
                  </ul>
                ))}
                {hasNextPage && (
                  <div ref={ref}>
                    <Loader />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllLists;