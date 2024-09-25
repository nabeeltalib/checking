import React, { useEffect, useState } from "react";
import { ListCard } from "@/components/shared";
import ListCard2 from "@/components/shared/ListCard2";
import { useUserContext } from "@/context/AuthContext";
import { getMostLikedLists } from "@/lib/appwrite/api";
import { IList } from "@/types";
import { motion } from "framer-motion";

const Trending: React.FC = () => {
  const [trending, setTrending] = useState<IList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUserContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMostLikedLists();
        setTrending(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch trending lists:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const LoadingSkeleton: React.FC = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 max-w-4xl mx-auto mt-5">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-dark-2 p-4 rounded-xl shadow-lg">
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

  if (isLoading) {
    return (
      <div>
        <h1
          className="font-extralight text-2xl text-left w-full mt-8"
          style={{ fontFamily: "'Permanent Marker', cursive" }}
        >
          Trending Lists
        </h1>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div>
      <h1
        className="font-extralight text-2xl text-left w-full mt-8"
        style={{ fontFamily: "'Permanent Marker', cursive" }}
      >
        Trending Lists
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 max-w-4xl mx-auto mt-5">
        {trending.map((list: IList) =>
          user.id ? (
            <ListCard2 list={list} key={list.$id} />
          ) : (
            <ListCard list={list} key={list.$id} />
          )
        )}
      </div>
    </div>
  );
};

export default Trending;