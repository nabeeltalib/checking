import { useEffect, useState } from "react";
import ListCard2 from "@/components/shared/ListCard2";
import { getAllLists } from "@/lib/appwrite/api";
import { useParams, useNavigate } from "react-router-dom";
import { IList } from "@/types";
import { Search } from "lucide-react";
import Loader, { Loader2 } from "./Loader";
import GroupListCard from "./GroupListCard";

const AddGroupLists = ({btn, setLists, lists, highlights, setHighlights}:any) => {
  const [allLists, setAllLists] = useState<IList[]>([]);
  const [filteredLists, setFilteredLists] = useState<IList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lists = await getAllLists();
        setAllLists(lists);
        setFilteredLists(lists);
      } catch (error) {
        console.error("Error fetching lists:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchValue) {
      handleSearch(searchValue);
    } else {
      setFilteredLists(allLists);
    }
  }, [searchValue, allLists]);

  const handleSearch = (query: string) => {
    setSearchValue(query);
    const lowercasedQuery = query.toLowerCase().trim();
    if (lowercasedQuery) {
      const filtered = allLists.filter(
        (list) =>
          list.Categories?.some((category) =>
            category.toLowerCase().includes(lowercasedQuery)
          ) ||
          list.Tags?.some((tag) => tag.toLowerCase().includes(lowercasedQuery))
      );
      setFilteredLists(filtered);
    } else {
      setFilteredLists(allLists);
    }
  };

  return (
    <div className="flex flex-col w-full items-center bg-dark-1 min-h-screen">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          className="font-extralight text-2xl text-left w-full mt-8"
          style={{ fontFamily: "'Permanent Marker', cursive" }}>
          Add Lists to Group
        </h1>
        {/* Sticky Search Bar */}
        <div className="sticky top-[calc(4rem)] z-10 w-full bg-dark-1 shadow-md my-4">
          <div className="max-w-xl mx-auto px-4 py-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search categories or tags ..."
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-gray-700 text-gray-200 pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-3" />
            </div>
          </div>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <Loader />
          ) : (
            <div>
              {filteredLists.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  {filteredLists.slice(0,6).map((list, index) => (
                    <GroupListCard key={index} list={list} show={"show"} setHighlights={setHighlights} highlights={highlights} btn={btn} lists={lists} setLists={setLists} />
                  ))}
                </div>
              ) : (
                <p className="text-light-2 col-span-2 text-center">
                  No lists found matching that.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddGroupLists;