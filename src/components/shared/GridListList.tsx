import React from 'react';
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Tag } from 'lucide-react';

interface Creator {
  $id: string;
  Name: string;
  ImageUrl?: string;
}

interface ListItem {
  $id: string;
  Title: string;
  items: string[];
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

const GridListList: React.FC<GridListListProps> = ({ lists, showUser = true, showStats = true }) => {
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
      {lists.map((item, index) => (
        <motion.div
          key={item.$id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-dark-4 rounded-lg shadow-md overflow-hidden"
        >
          <Link to={`/lists/${item.$id}`} className="block p-4 hover:bg-dark-3 transition-colors duration-300">
            <h3 className="text-xl font-bold text-light-1 mb-3 line-clamp-1">{item.Title}</h3>
            <ul className="mb-4 text-light-2 text-sm space-y-2">
              {item.items.slice(0, 3).map((listItem, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2 text-primary-500 font-semibold">{index + 1}.</span>
                  <span className="line-clamp-1">{listItem}</span>
                </li>
              ))}
            </ul>
            {item.items.length > 3 && (
              <p className="text-primary-500 text-sm font-semibold">+{item.items.length - 3} more items</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {item.Tags && item.Tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="flex items-center bg-dark-3 text-light-4 rounded-full px-3 py-1 text-xs">
                  <Tag size={12} className="mr-1" />
                  {tag}
                </span>
              ))}
              {item.Tags && item.Tags.length > 3 && (
                <span className="bg-dark-3 text-light-4 rounded-full px-3 py-1 text-xs">
                  +{item.Tags.length - 3}
                </span>
              )}
            </div>
          </Link>
          {showUser && item.creator && (
            <Link
              to={`/profile/${item.creator.$id}`}
              className="px-4 py-3 bg-dark-3 flex items-center hover:bg-dark-2 transition-colors duration-300"
            >
              <img
                src={item.creator.ImageUrl || "/assets/icons/profile-placeholder.svg"}
                alt={`${item.creator.Name}'s profile`}
                className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-primary-500"
                loading="lazy"
              />
              <p className="text-light-1 font-semibold">{item.creator.Name}</p>
            </Link>
          )}
          {showStats && (
            <div className="px-4 py-3 bg-dark-3 flex justify-between items-center border-t border-dark-2">
              <motion.span 
                className="flex items-center text-light-2 text-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart size={18} className="mr-2 text-red-500" />
                {item.Likes?.length || 0}
              </motion.span>
              <motion.span 
                className="flex items-center text-light-2 text-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MessageCircle size={18} className="mr-2 text-blue-500" />
                {item.comments?.length || 0}
              </motion.span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default React.memo(GridListList);