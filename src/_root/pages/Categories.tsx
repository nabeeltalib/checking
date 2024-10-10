import React, { useEffect, useState } from "react";
import { Loader, SearchBar } from "@/components/shared";
import ListCard2 from "@/components/shared/ListCard2";
import { getAllLists } from "@/lib/appwrite/api";
import { useParams, useNavigate } from "react-router-dom";
import { IList } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Search } from "lucide-react";

const Categories = () => {
  const [allLists, setAllLists] = useState<IList[]>([]);
  const [filteredLists, setFilteredLists] = useState<IList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { value } = useParams<{ value: string }>();
  const navigate = useNavigate();

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

  const handleBack = () => {
    navigate(-1);
  };

  const LoadingSkeleton: React.FC = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-pulse">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-dark-2 p-4 sm:p-6 rounded-xl shadow-lg">
          <motion.div
            className="h-6 bg-dark-3 rounded w-3/4 mb-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          ></motion.div>
          <div className="space-y-2">
            {[...Array(5)].map((_, rowIndex) => (
              <motion.div
                key={rowIndex}
                className="h-4 bg-dark-3 rounded w-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: 0.1 * rowIndex }}
              ></motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <motion.div
              className="h-8 bg-dark-3 rounded w-1/4"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            ></motion.div>
            <motion.div
              className="h-8 bg-dark-3 rounded w-1/4"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
            ></motion.div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col w-full items-center bg-dark-1 min-h-screen">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center text-light-2 hover:text-primary-500 transition-colors mt-4"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>

        <h1 className="font-extralight text-2xl text-left w-full mt-8" style={{ fontFamily: "'Permanent Marker', cursive" }}>
          Explore Lists by Categories or Tags
        </h1>

        {/* Sticky Search Bar */}
        <div className="sticky top-[calc(4rem)] z-10 w-full bg-dark-1 shadow-md my-4">
          <div className="max-w-3xl mx-auto px-4 py-3">
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
            <LoadingSkeleton />
          ) : (
            <AnimatePresence>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {filteredLists.length > 0 ? (
                  filteredLists.map((list) => (
                    <motion.div
                      key={list.$id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ListCard2 list={list} />
                    </motion.div>
                  ))
                ) : (
                  <p className="text-light-2 col-span-2 text-center">No lists found matching that.</p>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;