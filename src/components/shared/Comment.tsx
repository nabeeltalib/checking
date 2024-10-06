import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserContext } from '@/context/AuthContext';
import { useToast } from '../ui/use-toast';
import Loader from './Loader';
import { likeComment, reportComment, createReply, updateCommentWithReply } from '@/lib/appwrite/api';
import { checkIsLiked } from '@/lib/utils';
import CommentReply from './CommentReply';
import { ThumbsUp, Flag, MessageCircle, MoreVertical } from 'lucide-react';

interface CommentProps {
  comment: any;
  setReply: (value: boolean) => void;
  show: boolean;
  setCommentId: (id: string) => void;
}

const Comment: React.FC<CommentProps> = ({ comment, setReply, show, setCommentId }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUserContext();
  const [likes, setLikes] = useState<string[]>(comment?.Likes || []);
  const [isLiked, setIsLiked] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [localComment, setLocalComment] = useState(comment);
  const [showReplyField, setShowReplyField] = useState(false);
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

  const handleReport = async () => {
    setIsLoading(true);
    setIsMenuOpen(false);
    try {
      await reportComment({
        User: comment.user.Username,
        Content: comment.Content,
        id: comment.$id,
        Reporter: user.name,
      });
      toast({ title: "Comment Reported", description: "Thank you for helping keep our community safe." });
    } catch (error) {
      toast({ title: "Report Failed", description: `Unable to report comment: ${error}`, variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleReply = () => {
    setShowReplyField(!showReplyField);
    setCommentId(comment.$id);
  };

  const handleLikeComment = async () => {
    const newLikes = isLiked
      ? likes.filter((Id) => Id !== user.id)
      : [...likes, user.id];
    
    setLikes(newLikes);
    setIsLiked(!isLiked);
    try {
      await likeComment(comment.$id, newLikes);
    } catch (error) {
      toast({ title: "Like Failed", description: "Unable to like comment. Please try again.", variant: "destructive" });
      setLikes(likes);
      setIsLiked(!isLiked);
    }
  };

  const handleCreateReply = async () => {
    if (!user || !replyContent.trim()) return;

    setIsLoading(true);
    try {
      const newReply = await createReply({
        userId: user.id,
        Content: replyContent.trim(),
      });

      if (newReply) {
        await updateCommentWithReply(comment.$id, newReply.$id);
        
        setLocalComment(prev => ({
          ...prev,
          Reply: [...(prev.Reply || []), newReply]
        }));
        setReplyContent('');
        setShowReplyField(false);
        toast({ title: "Reply Posted", description: "Your reply has been added successfully." });
      }
    } catch (error) {
      console.error("Error creating reply:", error);
      toast({ title: "Reply Failed", description: "Unable to post reply. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4 bg-dark-3 rounded-lg p-4 shadow-md"
    >
      <div className="flex items-start gap-3">
        <img
          src={comment.user.ImageUrl || "/assets/icons/profile-placeholder.svg"}
          alt={`${comment.user.Username}'s avatar`}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-light-1">{comment.user.Username}</p>
            {show && (
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
                      className="absolute right-0 mt-2 w-48 bg-dark-4 rounded-md shadow-lg z-10"
                    >
                      <button
                        onClick={handleReport}
                        disabled={isLoading}
                        className="flex items-center w-full px-4 py-2 text-xs text-left text-light-2 hover:bg-dark-4 transition-colors"
                      >
                        {isLoading ? (
                          <Loader className="mr-2" />
                        ) : (
                          <Flag size={14} className="mr-2" />
                        )}
                        {isLoading ? "Reporting..." : "Report Comment"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          <p className="text-xs text-light-2 mt-1">{comment.Content}</p>
          <div className="flex items-center gap-4 mt-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLikeComment}
              className="flex items-center gap-1 text-xs text-light-3 hover:text-red-500 transition-colors"
            >
              <ThumbsUp
                size={16}
                className={`${isLiked ? 'fill-orange-500 text-orange-500' : 'text-light-3'} transition-colors`}
              />
              <span className={`${isLiked ? 'text-red-500' : 'text-light-3'}`}>{likes.length}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleReply}
              className="flex items-center gap-1 text-xs text-light-3 hover:text-blue-500 transition-colors"
            >
              <MessageCircle size={16} />
              <span>Reply</span>
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showReplyField && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 ml-12"
          >
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full p-2 bg-dark-4 text-light-1 rounded-md resize-none"
              rows={2}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateReply}
              disabled={isLoading || !replyContent.trim()}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader /> : "Post Reply"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {localComment.Reply && localComment.Reply.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="ml-12 mt-4 space-y-3"
          >
            {localComment.Reply.map((reply: any) => (
              <CommentReply reply={reply} key={reply.$id} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Comment;