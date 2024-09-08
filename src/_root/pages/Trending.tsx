import React, { useEffect, useState } from "react";
import { ListCard } from "@/components/shared";
import ListCard2 from "@/components/shared/ListCard2";
import { useUserContext } from "@/context/AuthContext";
import { getMostLikedLists } from "@/lib/appwrite/api";

const Trending = () => {
  const [trending, setTrending] = useState<any>([]);
  const [isContentLoaded, setIsContentLoaded] = useState(false); // Manage content loaded state

  const { user } = useUserContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMostLikedLists();
        setTrending(data);
        // After data is fetched, wait for a moment to allow the component to fully render
        setIsContentLoaded(true);
      } catch (error) {
        console.error('Failed to fetch trending lists:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isContentLoaded) {
      // Hide the main loader once content is fully loaded
      const loader = document.getElementById('loader');
      if (loader) {
        loader.style.display = 'none';
      }
    }
  }, [isContentLoaded]);

  if (!isContentLoaded) {
    // While loading, display the loader and "Loading..." text
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <div className="text-center">
          <img src="/assets/images/mobile.png" width={200} alt="Loading..." className="mx-auto mb-4" />
          <h1 className="text-2xl flashing">Loading Trending Lists...</h1>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-extralight text-2xl text-left w-full mt-8" style={{ fontFamily: "'Permanent Marker', cursive" }}>Trending List's</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 max-w-4xl mx-auto">
        {user.id
          ? trending.map((list: any, index: number) => (
              <ListCard2 list={list} key={index} />
            ))
          : trending.map((list: any, index: number) => (
              <ListCard list={list} key={index} />
            ))}
      </div>
    </div>
  );
};

export default Trending;
