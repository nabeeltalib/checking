import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUserContext } from "@/context/AuthContext";
import { checkIsLiked } from "@/lib/utils";
import { getListById, likeList } from "@/lib/appwrite/config";
import { Button } from "@/components/ui/button";
import Tooltip from '@/components/ui/Tooltip';
import { toast } from "@/components/ui/use-toast";

const StaticFrame = () => {
  const { id } = useParams();
  const [list, setList] = useState<any>(null);
  const [refreshData, setRefreshData] = useState(false);
  const { user } = useUserContext();
  const userId = user.id;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getListById(id);
      setList(data);
    };

    fetchData();
  }, [refreshData, id]);

  const handleCTAClick = () => {
    navigate("/");
  };

  const handleLikeList = async (list: any) => {
    let likes = list.Likes;
    let newLikes = likes.includes(userId)
      ? likes.filter((Id: any) => Id !== userId)
      : [...likes, userId];
    await likeList(list.$id, newLikes);
    setRefreshData((prevState: any) => !prevState);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "The list URL has been copied to your clipboard.",
    });
  };

  if (!list) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 p-4"
    >
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-indigo-800">{list.Title}</h2>
            <div className="flex space-x-2">
              <ActionIcon
                icon="/assets/icons/share.svg"
                onClick={handleShare}
                label="Share"
              />
              <ActionIcon
                icon="/assets/icons/chat.svg"
                onClick={handleCTAClick}
                label="Join Discussion"
              />
            </div>
          </div>

          <ol className="list-decimal list-inside space-y-3">
            {list.item.map((item: any, index: number) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-indigo-50 p-3 rounded-lg shadow-sm flex justify-between items-center"
              >
                <span className="text-indigo-900">{item.content}</span>
              </motion.li>
            ))}
          </ol>

          <div className="flex justify-end mt-4">
            <ActionIcon
              icon="/assets/icons/like.svg"
              activeIcon="/assets/icons/liked.svg"
              onClick={() => handleLikeList(list)}
              isActive={checkIsLiked(list.Likes, userId)}
              label={`${list.Likes.length} Likes`}
              showLabel={true}
            />
          </div>
        </div>
        <div className="bg-indigo-50 px-6 py-3 flex justify-between items-center">
          <span className="text-sm text-indigo-600 font-medium">Powered by Topfived</span>
          <button
            onClick={handleCTAClick}
            className="text-indigo-500 hover:text-indigo-700 transition-colors flex items-center text-sm font-medium"
          >
            View on Topfived 
            <img src="/assets/icons/external-link.svg" alt="External Link" className="ml-1 w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ActionIcon = ({ icon, activeIcon, onClick, isActive = false, label, showLabel = false }) => (
  <Tooltip content={label}>
    <button
      onClick={onClick}
      className={`p-2 rounded-full transition-colors flex items-center ${
        isActive ? 'text-primary-500' : 'text-indigo-600 hover:text-indigo-800'
      }`}
    >
      <img 
        src={isActive && activeIcon ? activeIcon : icon} 
        alt={label} 
        width={24} 
        height={24} 
        className="object-contain" 
      />
      {showLabel && (
        <span className="ml-1 text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px] sm:max-w-none">
          {label}
        </span>
      )}
    </button>
  </Tooltip>
);

export default StaticFrame;