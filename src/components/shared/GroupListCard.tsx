import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  Crown,
  MessageCircle,
  ThumbsUp,
  Star,
  Plus,
  Minus,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const GroupListCard = ({
  list,
  lists,
  setLists,
  highlights,
  setHighlights,
  RemoveHighlight,
  btn,
  show,
  creator,
  noTitle,
  noAction
}: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const renderListItems = useMemo(() => {
    if (!list?.items) return null;

    let items: Array<any> = [];
    if (Array.isArray(list.items)) {
      items = list.items;
    } else if (typeof list.items === "string") {
      items = list.items.split("\n");
    } else if (typeof list.items === "object" && list.items !== null) {
      items = Object.values(list.items);
    }

    return (
      <AnimatePresence>
        {items.slice(0, isExpanded ? items.length : 5).map((item, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.2,
              delay: index * 0.05,
              ease: "easeOut"
            }}
            className="relative flex items-center p-3 mb-2 bg-dark-3 rounded-lg group hover:bg-dark-4 transition-all duration-300"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-rose-500 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-dark-2 text-orange-200 font-bold mr-3">
              {index === 0 ? (
                <Crown size={16} className="text-yellow-500" />
              ) : (
                index + 1
              )}
            </span>
            
            <span className="text-sm text-gray-200 font-medium flex-grow">
              {typeof item === "string" ? item : item.content || ""}
            </span>
          </motion.li>
        ))}
      </AnimatePresence>
    );
  }, [list?.items, isExpanded]);

  const handleAddToChallenge = (e: React.MouseEvent) => {
    e.preventDefault();
    lists?.length > 0 ? setLists([...lists, list]) : setLists([list]);
  };

  const handleRemoveFromChallenge = (e: React.MouseEvent) => {
    e.preventDefault();
    const filterLists = lists.filter((item: any) => item.$id !== list.$id);
    setLists(filterLists);
  };

  const handleAddToHighlights = (e: React.MouseEvent) => {
    e.preventDefault();
    highlights?.length > 0 ? setHighlights([...highlights, list]) : setHighlights([list]);
  };

  const handleRemoveFromHighlights = (e: React.MouseEvent) => {
    e.preventDefault();
    const filterLists = highlights.filter((item: any) => item.$id !== list.$id);
    setHighlights(filterLists);
  };

  return (
    <motion.div
      className="bg-dark-2 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Action Buttons */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex gap-2 justify-end">
          {show && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleAddToHighlights}
                    className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white"
                    size="sm"
                  >
                    <Star size={16} className="mr-2" />
                    Highlight
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add this list to highlights</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {RemoveHighlight && (
            <Button
              onClick={handleRemoveFromHighlights}
              variant="destructive"
              size="sm"
              className="bg-dark-4 hover:bg-dark-3"
            >
              <Minus size={16} className="mr-2" />
              Remove Highlight
            </Button>
          )}

          {btn && (
            <Button
              onClick={btn === "remove" ? handleRemoveFromChallenge : handleAddToChallenge}
              className={btn === "remove" 
                ? "bg-dark-4 hover:bg-dark-3" 
                : "bg-blue-500 hover:bg-blue-600"}
              size="sm"
            >
              {btn === "remove" ? (
                <Minus size={16} className="mr-2" />
              ) : (
                <Plus size={16} className="mr-2" />
              )}
              {btn === "remove" ? "Remove" : "Add to Challenge"}
            </Button>
          )}
        </div>
      </div>

      {/* Creator Info */}
      <div className="px-6 py-4">
        <div className="flex items-center mb-4">
          <div className="relative">
            <img
              src={list?.creator?.ImageUrl || creator?.ImageUrl || "/assets/icons/profile-placeholder.svg"}
              alt={`${list?.creator?.Name || creator?.Name}'s profile`}
              className="w-12 h-12 rounded-full object-cover border-2 border-dark-4 transition-all duration-300"
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 -z-10"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="ml-3">
            <p className="font-semibold text-white">
              {list?.creator?.Name || creator?.Name}
            </p>
            <p className="text-sm text-gray-400">
              @{list?.creator?.Username || creator?.Username}
            </p>
          </div>
        </div>

        {/* List Title */}
        {!noTitle && (
          <motion.h2
            className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400 mb-4"
            animate={{ opacity: isHovered ? 1 : 0.9 }}
          >
            {list.Title}
          </motion.h2>
        )}

        {/* List Items */}
        <div className="space-y-2">
          {renderListItems}
          
          {Array.isArray(list.items) && list.items.length > 5 && (
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              className="w-full mt-4 text-gray-400 hover:text-white"
            >
              {isExpanded ? (
                <ChevronUp className="mr-2" size={16} />
              ) : (
                <ChevronDown className="mr-2" size={16} />
              )}
              {isExpanded ? "Show less" : `Show ${list.items.length - 5} more`}
            </Button>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      {!noAction && (
        <div className="px-6 py-4 bg-dark-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/lists/${list.$id}`)}
            className="text-gray-400 hover:text-white"
          >
            <ThumbsUp size={16} className="mr-2" />
            {list.Likes?.length || 0}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/lists/${list.$id}`)}
            className="text-gray-400 hover:text-white"
          >
            <MessageCircle size={16} className="mr-2" />
            View Details
            <ExternalLink size={14} className="ml-2" />
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default GroupListCard;