import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getMostLikedLists } from "@/lib/appwrite/api";
import { Locate, ChevronLeft, ChevronRight, Heart, MessageSquare } from "lucide-react";

const TrendingSlider: React.FC = () => {
  const [trendingLists, setTrendingLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const fetchTrendingLists = useCallback(async () => {
    try {
      const data = await getMostLikedLists();
      const filteredLists = data.filter((list: any) => !list.isDeleted);
      setTrendingLists(filteredLists);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch trending lists:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingLists();
  }, [fetchTrendingLists]);

  const checkScrollPosition = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', checkScrollPosition);
      return () => slider.removeEventListener('scroll', checkScrollPosition);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.8;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative border-2 border-blue-900 p-6 rounded-lg shadow-lg">
      <h2 className="font-bold text-2xl md:text-3xl text-left w-full flex items-center mb-6 text-white">
        <Locate className="mr-2" />
        Trending In Your Area
      </h2>
      <div className="relative overflow-hidden">
        <AnimatePresence>
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <motion.div
              ref={sliderRef}
              className="flex space-x-4 pb-4 overflow-x-auto custom-scrollbar"
              whileTap={{ cursor: "grabbing" }}
              onScroll={checkScrollPosition}
            >
              {trendingLists.map((list, index) => (
                <TrendingCard key={list.$id || index} list={list} navigate={navigate} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {showLeftArrow && <ScrollButton direction="left" onClick={() => scroll('left')} />}
        {showRightArrow && <ScrollButton direction="right" onClick={() => scroll('right')} />}
      </div>

    </div>
  );
};

const TrendingCard: React.FC<{ list: any; navigate: Function }> = ({ list, navigate }) => (
  <motion.div
    className="flex-shrink-0 cursor-pointer"
    whileHover={{ scale: 1.05, y: -5 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => navigate(`/lists/${list.$id}`)}
  >
    <div className="bg-white bg-opacity-10 p-4 rounded-lg shadow-lg hover:bg-opacity-20 transition-all duration-300 w-64 h-28 flex flex-col justify-between backdrop-blur-sm">
      <div>
        <h3 className="text-white font-bold text-lg truncate">{list.Title}</h3>
        <p className="text-gray-300 text-sm mt-1 truncate">by {list.creator?.Name}</p>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          <Heart className="text-red-500" size={16} />
          <span className="text-gray-300 text-sm">{list.Likes?.length || 0}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MessageSquare className="text-blue-400" size={16} />
          <span className="text-gray-300 text-sm">{list.commentCount || 0}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

const ScrollButton: React.FC<{ direction: 'left' | 'right'; onClick: () => void }> = ({ direction, onClick }) => (
  <button
    className={`absolute ${direction === 'left' ? 'left-0' : 'right-0'} top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 p-2 rounded-full opacity-75 hover:opacity-100 transition-all duration-300 z-10 backdrop-blur-sm`}
    onClick={onClick}
  >
    {direction === 'left' ? <ChevronLeft className="text-white" /> : <ChevronRight className="text-white" />}
  </button>
);

const LoadingSkeleton: React.FC = () => (
  <div className="flex space-x-4">
    {[...Array(4)].map((_, index) => (
      <div key={index} className="bg-white bg-opacity-10 p-4 rounded-lg shadow-lg w-64 h-48 animate-pulse">
        <div className="h-6 bg-white bg-opacity-20 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-white bg-opacity-20 rounded w-1/2 mb-4"></div>
        <div className="h-20 bg-white bg-opacity-20 rounded"></div>
      </div>
    ))}
  </div>
);

export default TrendingSlider;