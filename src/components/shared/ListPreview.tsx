import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Crown, 
  User, 
  Clock, 
  MapPin, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Bookmark,
  ChevronDown,
  ChevronUp,
  Tag
} from "lucide-react";

interface ListPreviewProps {
  title: string;
  description?: string;
  items: Array<{ content: string; isVisible: boolean }>;
  categories: string[];
  tags: string[];
  timespans: string[];
  locations: string[];
  userImageUrl?: string;
  username: string;
  engagementStats: {
    bookmarkCount: number;
    sharesCount: number;
    views: number;
    likesCount: number;
    dislikesCount: number;
    debateCount: number;
  };
}

const ListPreview: React.FC<ListPreviewProps> = ({ 
  title, 
  description, 
  items, 
  categories, 
  tags, 
  timespans, 
  locations, 
  userImageUrl, 
  username,
  engagementStats 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleItems = isExpanded ? items : items.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700"
    >
      {/* Header Section */}
      <div className="p-6">
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center">
            <div className="relative">
              {userImageUrl ? (
                <motion.img 
                  src={userImageUrl} 
                  alt={`${username}'s profile`}
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary-500"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <User className="text-gray-400" size={24} />
                </div>
              )}
              <motion.div 
                className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-gray-900"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
            <div className="ml-3">
              <span className="text-sm text-light-1 font-medium">@{username}</span>
              <div className="text-xs text-gray-400">Preview Mode</div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <Clock size={14} />
            <span>Just now</span>
          </div>
        </motion.div>

        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center mb-4">
            <div className="text-sm text-gray-400 uppercase tracking-wider">Ranking For</div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-200 to-orange-400 bg-clip-text text-transparent">
              {title || "Your Title Here"}
            </h2>
          </div>

          {description && (
            <p className="text-gray-300 text-sm mb-6 text-center">
              {description.length > 100 ? description.substring(0, 100) + '...' : description}
            </p>
          )}
        </motion.div>

        {/* List Items */}
        <motion.ul 
          className="space-y-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {visibleItems.filter(item => item.isVisible).map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                className="group relative flex items-center bg-gray-800/50 rounded-lg p-4 hover:bg-gray-700/50 
                  transition-all duration-300 border border-gray-700/50 hover:border-primary-500/50"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500/50 
                  to-transparent rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-4">
                  {index === 0 ? (
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Crown size={24} className="text-yellow-500" />
                    </motion.div>
                  ) : (
                    <span className="text-xl font-bold text-primary-500">{index + 1}</span>
                  )}
                </span>
                <span className="flex-grow text-gray-200">{item.content || "Item"}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        {items.length > 5 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-2 px-4 text-sm text-primary-500 hover:text-primary-400 
              transition-colors duration-300 flex items-center justify-center gap-2"
          >
            {isExpanded ? (
              <>Show Less <ChevronUp size={16} /></>
            ) : (
              <>Show More <ChevronDown size={16} /></>
            )}
          </motion.button>
        )}

        {/* Tags and Categories */}
        <div className="mt-6 space-y-4">
          {tags && tags.length > 0 && (
            <motion.div 
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {tags.map((tag, index) => (
                <motion.span
                  key={index}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-r from-blue-600/20 to-blue-400/20 text-blue-300 px-3 py-1 
                    rounded-full text-xs cursor-pointer border border-blue-500/20 hover:border-blue-500/50 
                    transition-colors duration-300 flex items-center gap-1"
                >
                  <Tag size={12} />
                  {tag}
                </motion.span>
              ))}
            </motion.div>
          )}

          {/* Metadata Section */}
          <motion.div 
            className="flex flex-wrap gap-4 text-xs text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {timespans.length > 0 && (
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-primary-500" />
                <span>{timespans.join(", ")}</span>
              </div>
            )}
            {locations.length > 0 && (
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-primary-500" />
                <span>{locations.join(", ")}</span>
              </div>
            )}
          </motion.div>

          {/* Engagement Stats */}
          <motion.div
            className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex gap-4">
              <span className="flex items-center gap-1 text-gray-400 text-xs">
                <ThumbsUp size={14} /> {engagementStats?.likesCount || 0}
              </span>
              <span className="flex items-center gap-1 text-gray-400 text-xs">
                <MessageSquare size={14} /> {engagementStats?.debateCount || 0}
              </span>
              <span className="flex items-center gap-1 text-gray-400 text-xs">
                <Share2 size={14} /> {engagementStats?.sharesCount || 0}
              </span>
            </div>
            <span className="flex items-center gap-1 text-gray-400 text-xs">
              <Bookmark size={14} /> {engagementStats?.bookmarkCount || 0}
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ListPreview;