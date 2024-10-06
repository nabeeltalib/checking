import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserContext } from '@/context/AuthContext';
import { ReplyLike, reportReply } from '@/lib/appwrite/api';
import { checkIsLiked } from '@/lib/utils';
import { ThumbsUp, MoreVertical, Flag } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Loader from './Loader';

interface CommentReplyProps {
  reply: any;
}

const CommentReply: React.FC<CommentReplyProps> = ({ reply }) => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const [likes, setLikes] = useState<string[]>(reply?.Likes || []);
  const [isLiked, setIsLiked] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLiked(checkIsLiked(likes, user.id));
  }, [likes, user.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLikeComment = async () => {
    const newLikes = isLiked
      ? likes.filter((Id) => Id !== user.id)
      : [...likes, user.id];
    
    setLikes(newLikes);
    setIsLiked(!isLiked);
    
    try {
      await ReplyLike(reply.$id, newLikes);
    } catch (error) {
      toast({ title: "Like Failed", description: "Unable to like reply. Please try again.", variant: "destructive" });
      setLikes(likes);
      setIsLiked(!isLiked);
    }
  };

  const handleReportReply = async () => {
    setIsReporting(true);
    setIsMenuOpen(false);
    try {
      const reportData = {
        Content: reply.Content,
        id: reply.$id,
        User: reply.userId.Username,
        Reporter: user.name,
      };
      const result = await reportReply(reportData);
      if (result) {
        toast({ title: "Reply Reported", description: "Thank you for helping keep our community safe." });
      } else {
        throw new Error("Failed to report reply");
      }
    } catch (error) {
      console.error('Error reporting reply:', error);
      toast({ title: "Report Failed", description: "Unable to report reply. Please try again.", variant: "destructive" });
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3 bg-dark-4 p-3 rounded-lg"
    >
      <img
        src={reply.userId.ImageUrl || "/assets/icons/profile-placeholder.svg"}
        alt={`${reply.userId.Username}'s avatar`}
        className="w-8 h-8 rounded-full object-cover"
      />
      <div className="flex-grow">
        <p className="text-blue-400 text-xs font-semibold">@{reply.userId.Username}</p>
        <p className="text-sm text-light-2 mt-1">{reply.Content}</p>
        <div className="flex items-center justify-between mt-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLikeComment}
            className="flex items-center gap-1 text-xs text-light-3 hover:text-red-500 transition-colors"
          >
            <ThumbsUp
              size={14}
              className={`${isLiked ? 'fill-orange-500 text-orange-500' : 'text-light-3'} transition-colors`}
            />
            <span className={`${isLiked ? 'text-red-500' : 'text-light-3'}`}>{likes.length}</span>
          </motion.button>
          <div className="relative" ref={menuRef}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-light-3 hover:text-light-1 transition-colors"
            >
              <MoreVertical size={16} />
            </motion.button>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 mt-2 w-48 bg-dark-1 rounded-md shadow-lg z-10"
                >
                  <button
                    onClick={handleReportReply}
                    disabled={isReporting}
                    className="flex items-center w-full px-4 py-2 text-xs text-left text-light-2 hover:bg-dark-3 transition-colors"
                  >
                    {isReporting ? (
                      <Loader className="mr-2" />
                    ) : (
                      <Flag size={14} className="mr-2" />
                    )}
                    {isReporting ? "Reporting..." : "Report Reply"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CommentReply;