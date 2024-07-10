import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { IList, IListItem } from "@/types";
import { shareList } from "@/lib/appwrite/api";
import { Share2 } from "lucide-react";

type ListCardProps = {
  list: IList;
};

const ListCard: React.FC<ListCardProps> = ({ list }) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSharing(true);
    try {
      const shareableLink = await shareList(list.$id);
      if (navigator.share) {
        await navigator.share({
          title: list.title,
          text: `Check out this list: ${list.title}`,
          url: shareableLink
        });
      } else {
        await navigator.clipboard.writeText(shareableLink);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error('Error sharing list:', error);
      alert("Failed to share list. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  const renderListItems = () => {
    if (Array.isArray(list.items)) {
      return list.items.slice(0, 5).map((item, index) => (
        <li key={index} className="text-light-2">
          {typeof item === 'string' ? item : item.content}
        </li>
      ));
    } else if (typeof list.items === 'string') {
      // If items is a string, split it by newlines
      return list.items.split('\n').slice(0, 5).map((item, index) => (
        <li key={index} className="text-light-2">{item}</li>
      ));
    }
    return null;
  };

  return (
    <motion.div 
      className="bg-dark-2 rounded-lg shadow-md overflow-hidden"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/profile/${list.creator.$id}`} className="flex items-center">
            <img 
              src={list.creator?.imageUrl || "/assets/icons/profile-placeholder.svg"} 
              alt={`${list.creator?.name}'s profile`} 
              className="w-10 h-10 rounded-full mr-2"
            />
            <div>
              <p className="font-semibold text-light-1">{list.creator?.name}</p>
              <p className="text-light-3 text-sm">@{list.creator?.username}</p>
            </div>
          </Link>
          <button
            onClick={handleShare}
            className="text-light-2 hover:text-primary-500 transition-colors"
            disabled={isSharing}
          >
            <Share2 size={20} />
          </button>
        </div>

        <Link to={`/lists/${list.$id}`} className="block">
          <h3 className="text-xl font-bold mb-2 text-light-1 hover:text-primary-500 transition-colors">
            {list.title}
          </h3>
          
          <ol className="list-decimal list-inside mb-4 space-y-2">
            {renderListItems()}
          </ol>

          {list.tags && list.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {list.tags.slice(0, 3).map((tag: string, index: number) => (
                <span key={index} className="bg-dark-4 text-light-2 px-2 py-1 rounded-full text-xs">
                  #{tag}
                </span>
              ))}
              {list.tags.length > 3 && (
                <span className="bg-dark-4 text-light-2 px-2 py-1 rounded-full text-xs">
                  +{list.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </Link>
      </div>
      
      <div className="bg-dark-3 px-4 py-2 flex justify-between text-light-2 text-sm">
        <span className="flex items-center">
          <img src="/assets/icons/like.svg" alt="Likes" className="w-4 h-4 mr-1" />
          {list.likes?.length || 0}
        </span>
        <span className="flex items-center">
          <img src="/assets/icons/comment.svg" alt="Comments" className="w-4 h-4 mr-1" />
          {list.comments?.length || 0}
        </span>
      </div>
    </motion.div>
  );
};

export default ListCard;