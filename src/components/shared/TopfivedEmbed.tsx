import React, { useState, useEffect } from "react";
import { Crown, MessageCircle, Heart, Share2, Info, ThumbsUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui";
import { useUserContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { checkIsLiked } from "@/lib/utils";
import { likeList } from "@/lib/appwrite/api";
import Loader from "./Loader";
import { useToast } from "@/components/ui/use-toast";
import { IList, IListItem } from "@/types";
import { shareList } from "@/lib/appwrite/api";

interface TopfivedEmbedProps {
  type: 'top5' | 'leaderboard';
  items: IListItem[];
  handleVote: (itemId: string) => void;
  isVoting: string | null;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  list: IList;
}

export const TopfivedEmbed: React.FC<TopfivedEmbedProps> = ({ type, items, handleVote, isVoting, setRefresh, list }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedHearts, setSelectedHearts] = useState<string[]>([]);
  const [isLiking, setIsLiking] = useState(false);
  const { user } = useUserContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && user.id) {
      const initialSelectedHearts = items
  .filter((item) => item.vote?.some((v) => v.$id === user.id)) // Use optional chaining here
  .map((item) => item.$id);

      setSelectedHearts(initialSelectedHearts);
    }
  }, [items, user]);

  const handleLikeList = async () => {
    if (!user || !user.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like lists.",
        variant: "destructive",
      });
      return;
    }
    setIsLiking(true);
    try {
      const newLikes = checkIsLiked(list.Likes, user.id)
        ? list.Likes.filter((id) => id !== user.id)
        : [...list.Likes, user.id];
      await likeList(list.$id, newLikes);
      setRefresh((prev) => !prev);
      toast({
        title: "Success",
        description: checkIsLiked(list.Likes, user.id) ? "List unliked." : "List liked!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error liking list:", error);
      toast({
        title: "Error",
        description: "Failed to update list like status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleHeartClick = (itemId: string) => {
    handleVote(itemId);
    setSelectedHearts(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId]
    );
  };
  const handleCTAClick = async () => {
    if (list?.$id) {
      try {
        const shareableLink = await shareList(list.$id); // Reusing the same function from ListCard
        window.open(shareableLink, '_blank'); // Opens the shareable link in a new tab
      } catch (err) {
        console.error("Error generating shareable link:", err);
      }
    } else {
      console.error("List ID not found");
    }
  };
  
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "The list link has been copied to your clipboard.",
      variant: "default",
    });
  };
  const getRankColor = (index: number) => {
    const colors = [
      "text-orange-500",
      "text-gray-400",
      "text-orange-500",
      "text-blue-500",
      "text-green-500",
    ];
    return index < colors.length ? colors[index] : "text-purple-500";
  };
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl shadow-lg overflow-hidden border border-purple-200"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-indigo-800">{list.Title}</h2>
          <div className="flex space-x-2">
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowInfo(!showInfo)}
              className="text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <Info size={20} />
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-4 rounded-lg mb-4 text-sm text-gray-700"
            >
              <p>Created by: {list.creator ? list.creator.Name : 'Unknown'}</p>
              <p>Date: {new Date(list.$createdAt).toLocaleDateString()}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <ul className="space-y-3">
          {items.map((item, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center"
            >
              <div className="flex items-center space-x-3">
                <span className={`font-bold text-xl ${getRankColor(index)}`}>
                  {index + 1}
                  {index === 0 && <Crown size={16} className="inline ml-1" />}
                </span>
                <span className="text-pretty text-indigo-900">{item.content}</span>
              </div>
              {type !== "top5" && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-indigo-600">{item.vote.length * 5 || 0} pts</span>
                  <Button
                    onClick={() => handleHeartClick(item.$id)}
                    className="p-1 rounded-full bg-pink-100 hover:bg-pink-200"
                    disabled={isVoting === item.$id}
                  >
                    {isVoting === item.$id ? (
                      <Loader />
                    ) : (
                      <Heart 
                        size={16} 
                        color={selectedHearts.includes(item.$id) ? 'hotpink' : 'gray'} 
                      />
                    )}
                  </Button>
                </div>
              )}
            </motion.li>
          ))}
        </ul>

        <div className="mt-6 flex justify-between items-center">
        <Button
          onClick={handleLikeList}
          className={`flex items-center space-x-1 ${
            checkIsLiked(list.Likes, user?.id) ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'
          } px-3 py-1 rounded-full transition-colors`}
          disabled={isLiking}
        >
          {isLiking ? (
            <Loader />
          ) : (
            <>
              <ThumbsUp size={22} />
              <span>{list.Likes.length}</span>
            </>
          )}
        </Button>
          <div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
           <Button
            onClick={handleCTAClick}
            className="bg-indigo-500 text-white px-4 py-2 rounded-full hover:bg-indigo-600 transition-colors flex items-center space-x-1"
          >
            <MessageCircle size={16} />
            <span>Join Discussion</span>
          </Button>

            {showTooltip && (
              <div className="absolute right-0 w-48 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg mt-2">
                Join the discussion on Topfived
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="bg-indigo-50 px-6 py-3 flex justify-between items-center">
        <button
          onClick={handleCTAClick}
          className="text-indigo-500 hover:text-indigo-700 transition-colors flex items-center text-sm font-medium"
        >
          Powered by Topfived <Crown size={14} className="ml-1" />
        </button>
      </div>
    </motion.div>
  );
};