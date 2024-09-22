import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Tag, Eye, Share2 } from "lucide-react";

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

  if (!lists || lists.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center p-8 bg-dark-4 rounded-lg shadow-md"
      >
        <p className="text-light-2 mb-4">
          You haven't created any lists yet.
        </p>
        <Link
          to="/create-list"
          className="inline-block bg-primary-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-600 transition-colors duration-300"
        >
          Create Your First List
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {lists.map((item) => (
        <motion.div
          key={item.$id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-dark-4 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
          onMouseEnter={() => setHoveredItem(item.$id)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          {showUser && item.creator && (
            <Link
              to={`/profile/${item.creator.$id}`}
              className="px-4 py-3 bg-dark-4 flex items-center hover:bg-dark-2 transition-colors duration-300"
            >
              <img
                src={
                  item.creator.ImageUrl ||
                  "/assets/icons/profile-placeholder.svg"
                }
                alt={`${item.creator.Name}'s profile`}
                className="w-6 h-6 rounded-full mr-3 object-cover border-2 border-primary-500"
                loading="lazy"
              />
              <p className="text-sm text-light-1 font-semibold">
                {item.creator.Name}
              </p>
            </Link>
          )}
          <Link
            to={`/lists/${item.$id}`}
            className="block p-4 hover:bg-dark-3 transition-colors duration-300 relative"
          >
            <h3 className="text-md font-bold text-yellow-500 mb-2 line-clamp-1">
              {item.Title}
            </h3>
            <ul className="mb-3 text-light-2 text-xs space-y-1">
              {item.items.slice(0, 3).map((listItem, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2 text-yellow-500 font-semibold">
                    {index + 1}
                  </span>
                  <span className="line-clamp-1">
                    {typeof listItem === "string" ? listItem : listItem.content}
                  </span>
                </li>
              ))}
            </ul>
            {item.items.length > 3 && (
              <p className="text-primary-500 text-xs font-semibold">
                +{item.items.length - 3} more items
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-3 ">
              {item.Tags &&
                item.Tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="flex items-center text-blue-300 rounded-full px-3 py-1 text-xs"
                  >
                    <Tag size={12} className="mr-1" />
                    {tag}
                  </span>
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-2 right-2 flex space-x-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
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
                    whileHover={{ scale: 1.1 }}
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
            <div className="px-4 py-3 bg-dark-4 flex justify-between items-center border-t border-dark-2">
              <motion.button
                className="flex items-center text-light-2 text-sm cursor-pointer hover:text-red-500"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  // Implement like functionality
                }}
              >
                <Heart size={18} className="mr-2" />
                {item.Likes?.length || 0}
              </motion.button>
              <motion.button
                className="flex items-center text-light-2 text-sm cursor-pointer hover:text-blue-500"
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