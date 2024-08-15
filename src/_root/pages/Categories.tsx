import { SearchBar } from "@/components/shared";
import ListCard2 from "@/components/shared/ListCard2";
import { getAllLists } from "@/lib/appwrite/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Categories = () => {
  const [allLists, setAllLists] = useState<any>([]);
  const [filteredLists, setFilteredLists] = useState<any>([]);
  const {value} = useParams();

  let isValue = value === "no-value" ? false : value;

  useEffect(() => {
    const fetchData = async () => {
      const lists = await getAllLists();
      setAllLists(lists);
      if(isValue)
      {
        handleSearch(isValue)
      }
      else{
        setFilteredLists(lists);
      }
    };


    fetchData();
  }, [isValue]);

  const handleSearch = (query: string) => {
    if (query) {
      const lowercasedQuery = query.toLowerCase().trim();
      setFilteredLists(
        allLists.filter(
          (i: any) =>
            i.Categories.some((category: string) =>
              category.toLowerCase().includes(lowercasedQuery)
            ) ||
            i.Tags.some((tag: string) =>
              tag.toLowerCase().includes(lowercasedQuery)
            )
        )
      );
    } else {
      setFilteredLists(allLists);
    }
  };

  

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-lg">Search lists Using Categories or Tags</h1>
      <SearchBar onSearch={handleSearch} query={""} />

      <div className="flex flex-col w-full gap-5 mt-5">
        {filteredLists.map((list: any, index: number) => (
          <ListCard2 list={list} key={index} />
        ))}
      </div>
    </div>
  );
};

export default Categories;
