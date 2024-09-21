import React, { useEffect, useState } from "react";
import { ListCard } from "@/components/shared";
import ListCard2 from "@/components/shared/ListCard2";
import { useUserContext } from "@/context/AuthContext";
import { getMostLikedLists } from "@/lib/appwrite/api";
import { IList } from "@/types"; // Assuming IList is the type for your list items

const Trending: React.FC = () => {
  const [trending, setTrending] = useState<IList[]>([]);
  const [isContentLoaded, setIsContentLoaded] = useState(false); // Manage content loaded state
  const { user } = useUserContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMostLikedLists();
        setTrending(data);
        setIsContentLoaded(true); // Set content loaded once data is fetched
      } catch (error) {
        console.error("Failed to fetch trending lists:", error);
      }
    };

    fetchData();
  }, []);

  if (!isContentLoaded) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <div className="text-center">
          <img
            src="/assets/images/mobile.png"
            width={200}
            alt="Loading..."
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl flashing">Loading Trending Lists...</h1>
        </div>
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
