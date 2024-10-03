import React, { useEffect, useState } from "react";
import { MessageCircle, Heart, Share2, Info, Crown } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getListById } from "@/lib/appwrite/api";
import { Button } from "../ui";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { IList } from "@/types";
import { shareList } from "@/lib/appwrite/api";

const StaticFrame: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [list, setList] = useState<IList | null>(null);
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
  }, [id, toast]);

  const handleLikeList = () => {
    toast({
      title: "Action not available",
      description: "To like this list, please visit https://topfived.com",
      variant: "default",
    });
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

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 text-black">
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
            {items.map((item: any, index: number) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center"
              >
                <div className="flex items-center space-x-3">
                  <span className={`font-bold text-xl ${index === 0 ? "text-yellow-500" : "text-indigo-600"}`}>
                    {index + 1}
                    {index === 0 && <Crown size={16} className="inline ml-1" />}
                  </span>
                  <span className="text-pretty text-indigo-900">{item.content}</span>
                </div>
              </motion.li>
            ))}
          </ul>

          <div className="mt-6 flex justify-between items-center">
            <Button
              onClick={handleLikeList}
              className="flex items-center space-x-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full transition-colors"
              disabled={isLiking}
            >
              {isLiking ? (
                <Loader />
              ) : (
                <>
                  <Heart size={22} />
                  <span>{list.Likes ? list.Likes.length : 0}</span>
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

export default StaticFrame;