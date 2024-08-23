import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { IList } from "@/types";
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
          url: shareableLink,
        });
      } else {
        await navigator.clipboard.writeText(shareableLink);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing list:", error);
      alert("Failed to share list. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  const renderListItems = () => {
    const items: any[] =
      Array.isArray(list.items) ? list.items : typeof list.items === "string"
        ? list.items.split("\n")
        : list.items ? Object.values(list.items) : [];

    return items.slice(0, 5).map((item, index) => (
      <li key={index} className="flex items-center mb-2">
        <span className="flex-shrink-0 w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
          {index + 1}
        </span>
        <span className="text-light-1 truncate">
          {typeof item === "string" ? item : item.content || ""}
        </span>
      </li>
    ));
  };

  return (
    <motion.div
      className="bg-dark-2 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-transform duration-300 transform hover:scale-105 focus-within:shadow-xl focus-within:scale-105"
      whileHover={{ y: -5 }}
      whileFocus={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      tabIndex={0} // Allows keyboard focus
      aria-label={`List titled ${list.title} by ${list.creator?.name}`}
    >
      <div className="p-6">
        <h2 className="text-3xl font-bold mb-6 text-primary-500 truncate">
          {list.title}
        </h2>

        <div className="flex justify-between items-start mb-4">
          <Link to={`/profile/${list.creator.$id}`} className="flex items-center" aria-label={`View profile of ${list.creator?.name}`}>
            <img
              src={list.creator?.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt={`${list.creator?.name}'s profile`}
              className="w-12 h-12 rounded-full mr-3 border-2 border-primary-500 shadow-lg"
            />
            <div>
              <p className="font-semibold text-light-1">{list.creator?.name}</p>
              <p className="text-light-3 text-sm">@{list.creator?.username}</p>
            </div>
          </Link>
          <button
            onClick={handleShare}
            className={`text-light-2 hover:text-primary-500 transition-colors p-2 rounded-full hover:bg-dark-3 ${
              isSharing ? "cursor-not-allowed" : ""
            }`}
            disabled={isSharing}
            aria-label="Share this list"
          >
            <Share2 size={24} />
          </button>
        </div>

        <Link to={`/lists/${list.$id}`} className="block" aria-label={`View details of list titled ${list.title}`}>
          <ol className="list-none mb-6 space-y-3">{renderListItems()}</ol>

          {Array.isArray(list.items) && list.items.length > 5 && (
            <p className="text-primary-500 font-semibold text-sm mb-4">
              + {list.items.length - 5} more items
            </p>
          )}

          {list.tags && list.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {list.tags.slice(0, 3).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="bg-dark-4 text-light-2 px-3 py-1 rounded-full text-xs shadow-sm"
                >
                  #{tag}
                </span>
              ))}
              {list.tags.length > 3 && (
                <span className="bg-dark-4 text-light-2 px-3 py-1 rounded-full text-xs shadow-sm">
                  +{list.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </Link>
      </div>

      <div className="bg-dark-3 px-6 py-3 flex justify-between items-center text-light-2 text-sm">
        <span className="flex items-center">
          <img src="/assets/icons/like.svg" alt="Likes" className="w-5 h-5 mr-2" />
          {list.likes?.length || 0} Likes
        </span>
        <span className="flex items-center">
          <img src="/assets/icons/comment.svg" alt="Comments" className="w-5 h-5 mr-2" />
          {list.comments?.length || 0} Comments
        </span>
      </div>
    </motion.div>
  );
};

export default ListCard;
