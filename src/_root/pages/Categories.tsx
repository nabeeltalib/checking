import { Loader, SearchBar } from "@/components/shared";
import ListCard2 from "@/components/shared/ListCard2";
import { getAllLists } from "@/lib/appwrite/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Categories = () => {
  const [allLists, setAllLists] = useState<any>([]);
  const [filteredLists, setFilteredLists] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { value } = useParams();

  const isValue = value === "no-value" ? "" : value;

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
    if (isValue) {
      handleSearch(isValue);
    } else {
      setFilteredLists(allLists);
    }
  }, [isValue, allLists]);

  const handleSearch = (query: string) => {
    if (query) {
      const lowercasedQuery = query.toLowerCase().trim();
      const filtered = allLists.filter(
        (list: any) =>
          list.Categories.some((category: string) =>
            category.toLowerCase().includes(lowercasedQuery)
          ) ||
          list.Tags.some((tag: string) =>
            tag.toLowerCase().includes(lowercasedQuery)
          )
      );
      setFilteredLists(filtered);
    } else {
      setFilteredLists(allLists);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 w-full max-w-5xl mx-auto">
      <h1 className="font-extralight text-2xl text-left w-full mt-8" style={{ fontFamily: "'Permanent Marker', cursive" }}>
        Explore Lists by Categories or Tags
      </h1>
      <SearchBar onSearch={handleSearch} query={isValue || ""} />

      <div className="flex flex-col w-full gap-6 mt-5">
        {isLoading ? (
          <Loader />
        ) : filteredLists.length > 0 ? (
          filteredLists.map((list: any, index: number) => (
            <ListCard2 list={list} key={index} />
          ))
        ) : (
          <p className="text-light-2">No lists found matching your criteria.</p>
        )}
      </div>
    </div>
  );
};

export default Categories;
