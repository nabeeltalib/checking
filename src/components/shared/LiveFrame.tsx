import React, { useEffect, useState } from "react";
import { ExternalLink, MessageCircle, Heart, Share2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserContext } from "@/context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { getListById } from "@/lib/appwrite/config";
import { VoteOnItem } from "@/lib/appwrite/api";
import { Button } from "../ui";

const LiveFrame = () => {
  const { id } = useParams();
  const [list, setList] = useState<any>(null);
  const [refreshData, setRefreshData] = useState(false);
  const { user } = useUserContext();
  const [showTooltip, setShowTooltip] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getListById(id);
      setList(data);
    };
    fetchData();
  }, [refreshData, id]);

  const handleVote = async (itemId: string) => {
    await VoteOnItem(user.id, itemId);
    setRefreshData((prevState) => !prevState);
  };

  const handleCTAClick = () => {
    navigate("/");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  if (!list) return null;

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
              onClick={handleShare}
              className="text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <Share2 size={20} />
            </motion.button>
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
              <p>Created by: {list.creator.name}</p>
              <p>Date: {new Date(list.createdAt).toLocaleDateString()}</p>
              <p>Category: {list.category}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <ul className="space-y-3">
          {list.item.map((item: any, index: number) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center"
            >
              <div className="flex items-center space-x-3">
                <span className={`font-bold text-xl text-indigo-500`}>
                  {index + 1}
                </span>
                <span className="text-indigo-900">{item.content}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-indigo-600">{item.vote.length * 5 || 0} pts</span>
                <Button
                  onClick={() => handleVote(item.$id)}
                  className="p-1 rounded-full bg-pink-100 hover:bg-pink-200"
                >
                  <Heart 
                    size={16} 
                    color={item.vote.some((v: any) => v.$id === user.id) ? 'hotpink' : 'gray'} 
                  />
                </Button>
              </div>
            </motion.li>
          ))}
        </ul>

        <div className="mt-6 flex justify-end">
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
        <span className="text-sm text-indigo-600 font-medium">Powered by Topfived</span>
        <button
          onClick={handleCTAClick}
          className="text-indigo-500 hover:text-indigo-700 transition-colors flex items-center text-sm font-medium"
        >
          View on Topfived <ExternalLink size={14} className="ml-1" />
        </button>
      </div>
    </motion.div>
  );
};

export default LiveFrame;