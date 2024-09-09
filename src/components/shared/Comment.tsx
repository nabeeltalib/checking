import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUserContext } from '@/context/AuthContext';
import { useToast } from '../ui/use-toast';
import { reportComment } from '@/lib/appwrite/api';
import { MoreHorizontal, MessageCircle, Heart, Flag, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import Tooltip from "@/components/ui/Tooltip";

interface CommentProps {
  comment: any;
  setReply: (value: boolean) => void;
  show: boolean;
  setCommentId: (id: string) => void;
  onLike: (commentId: string) => Promise<void>;
}

const Comment: React.FC<CommentProps> = ({ comment, setReply, show, setCommentId, onLike }) => {
  const { toast } = useToast();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes || 0);
  const { user } = useUserContext();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleReport = useCallback(async () => {
    try {
      await reportComment({
        User: comment.user.Username,
        Content: comment.Content,
        id: comment.$id,
        Reporter: user.name,
      });
      
      toast({ 
        title: "Comment Reported", 
        description: "We'll review this comment soon. Thank you for keeping our community safe.",
        duration: 5000,
      });
    } catch (error) {
      toast({ 
        title: "Couldn't Report Comment", 
        description: "An error occurred. Please try again later.",
        variant: "destructive",
      });
    }
    
    setIsDropdownOpen(false);
  }, [comment, user.name, toast]);

  const handleReply = useCallback(() => {
    setReply(true);
    setCommentId(comment.$id);
  }, [comment.$id, setReply, setCommentId]);

  const handleLike = useCallback(async () => {
    try {
      await onLike(comment.$id);
      setIsLiked(!isLiked);
      setLikeCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
    } catch (error) {
      toast({ 
        title: "Couldn't Like Comment", 
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  }, [comment.$id, isLiked, onLike, toast]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const visibleReplies = isExpanded ? comment.Reply : comment.Reply?.slice(0, 2);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4 bg-dark-3 dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start space-x-3">
        <img
          src={comment.user.ImageUrl || "/assets/default-avatar.png"}
          alt={`${comment.user.Username}'s avatar`}
          className="rounded-full w-10 h-10 object-cover"
          loading="lazy"
        />
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 dark:text-gray-100 font-semibold">
                {comment.user.Username}
              </p>
              <p className="text-gray-400 dark:text-gray-400 text-xs">
                {format(new Date(comment.$createdAt), 'MMM d, yyyy • h:mm a')}
              </p>
            </div>
            {show && (
              <div className="flex items-center space-x-2">
                <Tooltip content="Like">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLike}
                    className={`text-gray-500 hover:text-red-500 transition-colors duration-200 ${isLiked ? 'text-red-500' : ''}`}
                    aria-label={isLiked ? "Unlike comment" : "Like comment"}
                  >
                    <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                  </motion.button>
                </Tooltip>
                <span className="text-sm text-gray-500">{likeCount}</span>
                <Tooltip content="Reply">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleReply}
                    className="text-gray-500 hover:text-blue-500 transition-colors duration-200"
                    aria-label="Reply to comment"
                  >
                    <MessageCircle size={18} />
                  </motion.button>
                </Tooltip>
                <div className="relative" ref={dropdownRef}>
                  <Tooltip content="More options">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                      aria-label="More options"
                    >
                      <MoreHorizontal size={18} />
                    </motion.button>
                  </Tooltip>
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-20 overflow-hidden"
                      >
                        <motion.button
                          whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                          onClick={handleReport}
                          className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <Flag size={14} className="mr-2" />
                          Report comment
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
          <p className="text-gray-300 dark:text-gray-200 mt-2">{comment.Content}</p>
        </div>
      </div>
      
      {comment.Reply && comment.Reply.length > 0 && (
        <div className="mt-4 ml-8 space-y-3">
          {visibleReplies.map((reply: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              className="flex items-start space-x-3 bg-dar-3 rounded-lg p-3"
            >
              <img
                src={reply.userId.ImageUrl || "/assets/default-avatar.png"}
                alt={`${reply.userId.Username}'s avatar`}
                className="rounded-full w-8 h-8 object-cover"
                loading="lazy"
              />
              <div>
                <p className="text-blue-300 dark:text-gray-100 text-sm font-semibold">{reply.userId.Username}</p>
                <p className="text-gray-300 dark:text-gray-200 text-sm mt-1">{reply.Content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {comment.Reply && comment.Reply.length > 2 && (
        <motion.button
          onClick={toggleExpand}
          className="mt-2 text-blue-400 hover:text-blue-500 text-sm flex items-center transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isExpanded ? (
            <>
              <ChevronUp size={16} className="mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown size={16} className="mr-1" />
              Show {comment.Reply.length - 2} more {comment.Reply.length - 2 === 1 ? 'reply' : 'replies'}
            </>
          )}
        </motion.button>
      )}
    </motion.div>
  );
};

export default React.memo(Comment);