import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, MessageCircle, Tag, Eye, Share2, Crown, ChevronDown } from "lucide-react";

interface Creator {
  $id: string;
  Name: string;
  ImageUrl?: string;
}

interface ListItem {
  $id: string;
  Title: string;
  items: { id: string; content: string }[];
  Tags?: string[];
  Likes?: string[];
  comments?: string[];
  creator?: Creator;
}

interface GridListListProps {
  lists: ListItem[];
  showUser?: boolean;
  showStats?: boolean;
}

const GridListList: React.FC<GridListListProps> = ({
  lists,
  showUser = true,
  showStats = true,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const filteredLists = lists.filter((item) => item && item.$id);

  if (!filteredLists || filteredLists.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center p-8 bg-gradient-to-br from-dark-4 to-dark-3 rounded-lg shadow-lg"
      >
        <p className="text-light-2 mb-4 text-lg">Your ranking journey starts here! What's your first top 5?</p>
        <Link
          to="/create-list"
          className="inline-block bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-3 rounded-full font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 transform hover:scale-105"
        >
          Create Your First List
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
      {filteredLists.map((item) => (
        <motion.div
          key={item.$id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-dark-4 to-dark-3 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          onMouseEnter={() => setHoveredItem(item.$id)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          {/*{showUser && item.creator && (
            <Link
              to={`/profile/${item.creator.$id}`}
              className="px-4 py-3 bg-dark-4 bg-opacity-50 flex items-center hover:bg-opacity-75 transition-colors duration-300"
            >
              <img
                src={item.creator.ImageUrl || "/assets/icons/profile-placeholder.svg"}
                alt={`${item.creator.Name}'s profile`}
                className="w-8 h-8 rounded-full mr-3 object-cover border-2 border-primary-500"
                loading="lazy"
              />
              <p className="text-sm text-light-1 font-semibold">{item.creator.Name}</p>
            </Link>
          )}*/}
          <Link
            to={`/lists/${item.$id}`}
            className="block p-4 hover:bg-dark-3 transition-colors duration-300 relative"
          >
            <h3 className="text-md font-bold text-yellow-200 mb-3 line-clamp-1">{item.Title}</h3>
            <ul className="mb-3 text-light-2 text-sm space-y-2">
              {(item.items || []).slice(0, expandedItem === item.$id ? undefined : 3).map((listItem, index) => (
                <motion.li 
                  key={listItem.id || index} 
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {index === 0 ? (
                    <Crown size={16} className="mr-2 text-yellow-500" />
                  ) : (
                    <span className="mr-2 text-yellow-500 font-semibold w-4 text-center">{index + 1}</span>
                  )}
                  <span className="line-clamp-1">
                    {typeof listItem === "string" ? listItem : listItem.content}
                  </span>
                </motion.li>
              ))}
            </ul>
            {item.items && item.items.length > 3 && expandedItem !== item.$id && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  setExpandedItem(expandedItem === item.$id ? null : item.$id);
                }}
                className="text-primary-500 text-sm font-semibold flex items-center"
              >
                +{item.items.length - 3} more items
                <ChevronDown size={16} className="ml-1" />
              </motion.button>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              {(item.Tags || []).slice(0, 3).map((tag, index) => (
                <motion.span
                  key={`${tag}-${index}`}
                  className="flex items-center bg-dark-2 text-light-3 rounded-full px-3 py-1 text-xs"
                  whileHover={{ scale: 1.05, backgroundColor: "#4A5568" }}
                >
                  <Tag size={12} className="mr-1" />
                  {tag}
                </motion.span>
              ))}
              {item.Tags && item.Tags.length > 3 && (
                <span className="text-light-1 rounded-full px-3 py-1 text-xs">
                  +{item.Tags.length - 3}
                </span>
              )}
            </div>
            <AnimatePresence>
              {hoveredItem === item.$id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-2 right-2 flex space-x-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: "#4A5568" }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-dark-2 rounded-full"
                    onClick={(e) => {
                      e.preventDefault();
                      // Implement view functionality
                    }}
                  >
                    <Eye size={16} className="text-light-2" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: "#4A5568" }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-dark-2 rounded-full"
                    onClick={(e) => {
                      e.preventDefault();
                      // Implement share functionality
                    }}
                  >
                    <Share2 size={16} className="text-light-2" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          {showStats && (
            <div className="px-4 py-3 bg-dark-4 bg-opacity-50 flex justify-between items-center border-t border-dark-2">
              <motion.button
                className="flex items-center text-light-2 text-sm cursor-pointer hover:text-red-500 transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  // Implement like functionality
                }}
              >
                <ThumbsUp size={18} className="mr-2" />
                {item.Likes?.length || 0}
              </motion.button>
              <motion.button
                className="flex items-center text-light-2 text-sm cursor-pointer hover:text-blue-500 transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  // Implement comment functionality
                }}
              >
                <MessageCircle size={18} className="mr-2" />
                {item.comments?.length || 0}
              </motion.button>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default React.memo(GridListList);