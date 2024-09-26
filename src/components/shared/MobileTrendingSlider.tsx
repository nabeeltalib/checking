import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getMostLikedLists } from "@/lib/appwrite/api";
import { LocateFixed, ThumbsUp, MessageSquare } from "lucide-react";
import { useGetComments } from "@/lib/react-query/queries";

interface MobileTrendingSliderProps {
  isAuthenticated: boolean; // New prop to check authentication
  setIsDialogOpen: (open: boolean) => void; // Function to open the popup
}

const MobileTrendingSlider: React.FC<MobileTrendingSliderProps> = ({ isAuthenticated, setIsDialogOpen }) => {
  const [trendingLists, setTrendingLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const sliderRef = useRef<HTMLDivElement>(null);

  const fetchTrendingLists = useCallback(async () => {
    try {
      const data = await getMostLikedLists();
      const filteredLists = data.filter((list: any) => !list.isDeleted && list.Title && list.creator);
      setTrendingLists(filteredLists.slice(0, 7));
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch trending lists:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingLists();
  }, [fetchTrendingLists]);

  const handleScroll = () => {
    if (sliderRef.current) {
      const scrollPosition = sliderRef.current.scrollLeft;
      const cardWidth = sliderRef.current.offsetWidth;
      const newIndex = Math.round(scrollPosition / cardWidth);
      setCurrentIndex(newIndex);
    }
  };

  const scrollToCard = (index: number) => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.offsetWidth;
      sliderRef.current.scrollTo({
        left: cardWidth * index,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="lg:hidden bg-dark-3 p-4 shadow-lg">
      <h2 className="text-xl font-bold text-light-1 flex items-center mb-4">
        <LocateFixed className="mr-2" />
        Trending In Your Area
      </h2>
      <div className="relative w-full overflow-hidden">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div
            ref={sliderRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
            onScroll={handleScroll}
          >
            {trendingLists.map((list, index) => (
              <TrendingCard
                key={list.$id || index}
                list={list}
                navigate={navigate}
                isAuthenticated={isAuthenticated}
                setIsDialogOpen={setIsDialogOpen}
              />
            ))}
          </div>
        )}
      </div>
      {!loading && (
        <SliderIndicator total={trendingLists.length} current={currentIndex} onIndicatorClick={scrollToCard} />
      )}
    </div>
  );
};

const TrendingCard: React.FC<{ list: any; navigate: Function; isAuthenticated: boolean; setIsDialogOpen: (open: boolean) => void }> = ({
  list,
  navigate,
  isAuthenticated,
  setIsDialogOpen,
}) => {
  const { data: comments } = useGetComments(list.$id);

  const handleClick = () => {
    if (!isAuthenticated) {
      setIsDialogOpen(true); // Open the popup for unauthenticated users
    } else {
      navigate(`/lists/${list.$id}`); // Navigate if the user is authenticated
    }
  };

  return (
    <motion.div
      className="bg-opacity-10 p-4 rounded-lg shadow-lg hover:bg-opacity-20 transition-all duration-300 w-full flex flex-col justify-between backdrop-blur-sm"
      style={{ minWidth: "60%", scrollSnapAlign: "start" }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
    >
      <h3 className="text-yellow-200 text-sm font-semibold truncate">{list.Title}</h3>
      <p className="text-xs text-gray-400 truncate">by {list.creator.Name}</p>
      <div className="flex items-center mt-2 space-x-4">
        <div className="flex items-center text-xs text-gray-400">
          <ThumbsUp size={14} className="mr-1 text-red-500" />
          {list.Likes?.length || 0}
        </div>
        <div className="flex items-center text-xs text-gray-400">
          <MessageSquare size={14} className="mr-1 text-blue-500" />
          {comments?.length || 0}
        </div>
      </div>
    </motion.div>
  );
};

const SliderIndicator: React.FC<{ total: number; current: number; onIndicatorClick: (index: number) => void }> = ({
  total,
  current,
  onIndicatorClick,
}) => {
  return (
    <div className="flex justify-center space-x-2 mt-4">
      {[...Array(total)].map((_, index) => (
        <div
          key={index}
          className={`h-2 w-2 rounded-full ${index === current ? "bg-primary-500" : "bg-gray-400"} cursor-pointer`}
          onClick={() => onIndicatorClick(index)}
        />
      ))}
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="flex overflow-x-auto">
    {[...Array(3)].map((_, index) => (
      <div key={index} className="flex-shrink-0 bg-dark-3 rounded-lg p-4 shadow animate-pulse w-full">
        <div className="h-4 bg-dark-4 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-dark-4 rounded w-1/2 mb-3"></div>
        <div className="flex items-center space-x-4">
          <div className="h-3 bg-dark-4 rounded w-1/4"></div>
          <div className="h-3 bg-dark-4 rounded w-1/4"></div>
        </div>
      </div>
    ))}
  </div>
);

export default MobileTrendingSlider;
