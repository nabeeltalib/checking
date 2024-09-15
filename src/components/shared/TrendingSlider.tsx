import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getMostLikedLists } from "@/lib/appwrite/api";
import Loader from "@/components/shared/Loader";
import { Locate, ChevronLeft, ChevronRight } from "lucide-react";

const TrendingSlider: React.FC = () => {
  const [trendingLists, setTrendingLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTrendingLists = async () => {
      try {
        const data = await getMostLikedLists();
        setTrendingLists(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch trending lists:", error);
        setLoading(false);
      }
    };
    fetchTrendingLists();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.offsetWidth / 2;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="relative">
      <h2 className="font-normal text-xl md:text-xl text-left w-full flex items-center mb-4 text-gray-300">
        <Locate className="mr-2" />
        Trending In Your Area
      </h2>
      <div className="relative overflow-hidden">
        <motion.div 
          ref={sliderRef}
          className="flex overflow-x-scroll space-x-4 pb-2 custom-scrollbar"
          whileTap={{ cursor: "grabbing" }}
        >
          {trendingLists.map((list) => (
            <motion.div
              key={list.$id}
              className="flex-shrink-0 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/lists/${list.$id}`)}
            >
              <div className="bg-dark-4 p-2 rounded-lg shadow-lg hover:bg-dark-3 transition-colors duration-300 w-48 sm:w-56 md:w-64">
                <h3 className="text-blue-500 font-bold truncate">{list.Title}</h3>
                <p className="text-gray-400 text-sm mt-1 truncate">by {list.creator?.Name}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-dark-4 p-2 rounded-full opacity-75 hover:opacity-100 transition-opacity hidden sm:block"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="text-white" />
        </button>
        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-dark-4 p-2 rounded-full opacity-75 hover:opacity-100 transition-opacity hidden sm:block"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default TrendingSlider;
