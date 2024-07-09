import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { IList, IListItem } from "@/types";
import { shareList } from "@/lib/appwrite/api";

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
      navigator.clipboard.writeText(shareableLink);
      alert("Link copied to clipboard!");
    } catch (error) {
      console.error('Error sharing list:', error);
      alert("Failed to share list. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <motion.div 
      className="social-card"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="social-card-header">
        <img 
          src={list.creator?.imageUrl || "/assets/icons/profile-placeholder.svg"} 
          alt={`${list.creator?.name}'s profile`} 
          className="social-avatar"
        />
        <div>
          <Link to={`/profile/${list.creator.$id}`} className="social-username">{list.creator?.name}</Link>
          <p className="social-text-secondary">@{list.creator?.username}</p>
        </div>
      </div>

      <div className="social-card-content">
        <Link to={`/lists/${list.$id}`} className="block">
          <h3 className="text-xl font-bold mb-2 text-light-1 hover:text-primary-500 transition-colors">
            {list?.title || list?.Title}
          </h3>
          
          <ol className="list-decimal list-inside mb-4 space-y-2">
            {list.items.slice(0, 5).map((item: IListItem, index: number) => (
              <li key={index} className="social-text-primary">
                {item?.content || item}
              </li>
            ))}
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
      
      <div className="social-card-footer">
        <div className="flex space-x-4 text-light-2">
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-label="Likes">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            {list.likes?.length || 0}
          </span>
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-label="Comments">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
            </svg>
            {list.comments?.length || 0}
          </span>
        </div>
        <button
          onClick={handleShare}
          className="bg-primary-500 text-light-1 px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-600 transition-colors"
          disabled={isSharing}
        >
          {isSharing ? "Sharing..." : "Share"}
        </button>
      </div>
    </motion.div>
  );
};

export default ListCard;