import { Loader, SearchBar } from "@/components/shared";
import ListCard2 from "@/components/shared/ListCard2";
import { getAllLists } from "@/lib/appwrite/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IList } from "@/types"; // Assuming you have a proper IList type defined

const Categories = () => {
  const [allLists, setAllLists] = useState<IList[]>([]);
  const [filteredLists, setFilteredLists] = useState<IList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { value } = useParams<{ value: string }>();

  const searchValue = value === "no-value" ? "" : value || "";

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
    const lowercasedQuery = query.toLowerCase().trim();
    if (lowercasedQuery) {
      const filtered = allLists.filter(
        (list) =>
          list.Categories?.some((category) =>
            category.toLowerCase().includes(lowercasedQuery)
          ) ||
          list.Tags?.some((tag) =>
            tag.toLowerCase().includes(lowercasedQuery)
          )
      );
      setFilteredLists(filtered);
    } else {
      setFilteredLists(allLists);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 w-full max-w-2xl mx-auto">
      <h1 className="font-extralight text-2xl text-left w-full mt-8" style={{ fontFamily: "'Permanent Marker', cursive" }}>
        Explore Lists by Categories or Tags
      </h1>
      <SearchBar onSearch={handleSearch} query={searchValue} />

      <div className="flex flex-col w-full gap-6 mt-5">
        {isLoading ? (
          <Loader />
        ) : filteredLists.length > 0 ? (
          filteredLists.map((list) => (
            <ListCard2 list={list} key={list.$id} />
          ))
        ) : (
          <p className="text-light-2">No lists found matching your criteria.</p>
        )}
      </div>
    </div>
  );
};

export default Categories;
