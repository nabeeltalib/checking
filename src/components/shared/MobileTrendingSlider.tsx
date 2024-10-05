import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getMostLikedLists } from "@/lib/appwrite/api";
import { TrendingUp, ThumbsUp, MessageSquare } from "lucide-react";
import { useGetComments } from "@/lib/react-query/queries";
import SignInDialog from '@/components/shared/SignInDialog';

interface MobileTrendingSliderProps {
  isAuthenticated: boolean;
}

const MobileTrendingSlider: React.FC<MobileTrendingSliderProps> = ({ isAuthenticated }) => {
  const [trendingLists, setTrendingLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);

  const fetchTrendingLists = useCallback(async () => {
    try {
      const data = await getMostLikedLists();
      const filteredLists = data.filter((list: any) => !list.isDeleted && list.Title && list.creator);
      setTrendingLists(filteredLists.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch trending lists:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingLists();
  }, [fetchTrendingLists]);

  const handleDialogOpen = () => {
    setIsSignInDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsSignInDialogOpen(false);
  };

  return (
    <>
      <div className="bg-dark-2 p-4 rounded-lg shadow-lg">
        <h2 className="text-lg font-bold text-light-1 flex items-center mb-4">
          <TrendingUp className="mr-2" size={20} />
          Trending
        </h2>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-3">
            {trendingLists.map((list) => (
              <TrendingCard
                key={list.$id}
                list={list}
                isAuthenticated={isAuthenticated}
                handleDialogOpen={handleDialogOpen}
              />
            ))}
          </div>
        )}
      </div>
      <SignInDialog isOpen={isSignInDialogOpen} onClose={handleDialogClose} />
    </>
  );
};

interface TrendingCardProps {
  list: any;
  isAuthenticated: boolean;
  handleDialogOpen: () => void;
}

const TrendingCard: React.FC<TrendingCardProps> = ({
  list,
  isAuthenticated,
  handleDialogOpen,
}) => {
  const navigate = useNavigate();
  const { data: comments } = useGetComments(list.$id);

  const handleClick = () => {
    if (isAuthenticated) {
      navigate(`/lists/${list.$id}`);
    } else {
      handleDialogOpen();
    }
  };

  return (
    <motion.div
      className="bg-dark-3 p-3 rounded-md cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
    >
      <h3 className="text-light-1 text-sm font-semibold truncate">{list.Title}</h3>
      <div className="flex items-center justify-between mt-2 text-xs text-light-3">
        <span>{list.creator.Name}</span>
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <ThumbsUp size={12} className="mr-1" />
            {list.Likes?.length || 0}
          </div>
          <div className="flex items-center">
            <MessageSquare size={12} className="mr-1" />
            {comments?.length || 0}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="bg-dark-3 p-3 rounded-md animate-pulse">
        <div className="h-4 bg-dark-4 rounded w-3/4 mb-2"></div>
        <div className="flex justify-between">
          <div className="h-3 bg-dark-4 rounded w-1/4"></div>
          <div className="flex space-x-3">
            <div className="h-3 bg-dark-4 rounded w-6"></div>
            <div className="h-3 bg-dark-4 rounded w-6"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default MobileTrendingSlider;