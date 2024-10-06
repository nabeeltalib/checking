import React, { useEffect, useState } from "react";
import { MessageCircle, Heart, Share2, Info, Crown } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getListById, VoteOnItem } from "@/lib/appwrite/api";
import { Button } from "../ui";
import Loader from "./Loader";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { IList, IListItem } from "@/types";
import { shareList } from "@/lib/appwrite/api";

const LiveFrame: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [list, setList] = useState<IList | null>(null);
  const [refreshData, setRefreshData] = useState(false);
  const [isVoting, setIsVoting] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const data = await getListById(id);
        setList(data);
      } catch (error) {
        console.error("Error fetching list:", error);
        toast({
          title: "Error",
          description: "Failed to fetch list data. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [refreshData, id, toast]);

  const handleVote = async (itemId: string) => {
    setIsVoting(itemId);
    const uniqueId = `user${Date.now()}:${Math.random().toString(36).substring(2, 15)}`;
    try {
      await VoteOnItem(uniqueId, itemId);
      setRefreshData(prev => !prev);
      toast({
        title: "Vote recorded",
        description: "Your vote has been successfully recorded.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(null);
    }
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

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 text-black shadow-md overflow-hidden">
      {list && (
        <div className="p-6">
          <div className="text-slate-300 text-center text-xl sm:text-xl font-thin px-4 rounded-t-lg mb-4"
               style={{ fontFamily: "'Racing Sans One', sans-serif" }}>
            Ranking For
          </div>
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
            {items.map((item: any, index: number) => {
              let isDisabled = hasVoted?.includes(item.$id);
              return (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center"
                >
                  <div className="flex items-center space-x-3">
                    <span className={`font-bold text-xl ${index === 0 ? "text-orange-500" : "text-indigo-600"}`}>
                      {index + 1}
                      {index === 0 && <Crown size={16} className="inline ml-1" />}
                    </span>
                    <span className="text-pretty text-indigo-900">{item.content}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-indigo-600">{item.vote.length * 5 || 0} pts</span>
                    <Button
                      onClick={() => handleVote(item.$id)}
                      className="p-1 rounded-full bg-pink-100 hover:bg-pink-200"
                      disabled={isDisabled || isVoting === item.$id}
                    >
                      {isVoting === item.$id ? <Loader /> : <Heart size={16} color={isDisabled ? 'hotpink' : 'gray'} />}
                    </Button>
                  </div>
                </motion.li>
              );
            })}
          </ul>

          <div className="mt-6 flex justify-between items-center">
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
                <div className="absolute left-0 w-48 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg mt-2">
                  Join the discussion on Topfived
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="bg-indigo-50 px-6 py-3 flex justify-between items-center fixed bottom-0 w-full">
        <button
          onClick={handleCTAClick}
          className="text-indigo-500 hover:text-indigo-700 transition-colors flex items-center text-sm font-medium"
        >
          Powered by Topfived <Crown size={14} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default LiveFrame;