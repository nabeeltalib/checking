import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserContext } from '@/context/AuthContext';
import {
  ReplyLike,
  reportReply,
  createReply,
  getNestedReplies,
  updateReplyWithReply,
} from '@/lib/appwrite/api';
import { checkIsLiked } from '@/lib/utils';
import { ThumbsUp, MoreVertical, Flag, MessageCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Loader from './Loader';

interface CommentReplyProps {
  reply: any;
  parentCommentId: string;
  setReply: (value: boolean) => void;
  setCommentId: (id: string) => void;
  setParentReplyId: (id: string) => void;
}

const CommentReply: React.FC<CommentReplyProps> = ({
  reply,
  parentCommentId,
  setReply,
  setCommentId,
  setParentReplyId,
}) => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const [likes, setLikes] = useState<string[]>(reply?.Likes || []);
  const [isLiked, setIsLiked] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [nestedReplies, setNestedReplies] = useState([]);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    fetchNestedReplies();
  }, []);

  const fetchNestedReplies = async () => {
    if (!reply.$id) return; // Ensure we have a valid reply ID
    try {
      const fetchedReplies = await getNestedReplies(reply.$id);
      setNestedReplies(fetchedReplies);
    } catch (error) {
      console.error('Error fetching nested replies:', error);
      toast({
        title: 'Error',
        description: 'Unable to fetch nested replies. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleLikeComment = async () => {
    const newLikes = isLiked
      ? likes.filter((Id) => Id !== user.id)
      : [...likes, user.id];

    setLikes(newLikes);
    setIsLiked(!isLiked);

    try {
      await ReplyLike(reply.$id, newLikes);
    } catch (error) {
      toast({
        title: 'Like Failed',
        description: 'Unable to like reply. Please try again.',
        variant: 'destructive',
      });
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
        toast({
          title: 'Reply Reported',
          description: 'Thank you for helping keep our community safe.',
        });
      } else {
        throw new Error('Failed to report reply');
      }
    } catch (error) {
      console.error('Error reporting reply:', error);
      toast({
        title: 'Report Failed',
        description: 'Unable to report reply. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsReporting(false);
    }
  };

  const handleReplyClick = () => {
    setReply(true);
    setCommentId(parentCommentId);
    setParentReplyId(reply.$id);
    setShowReplyForm(!showReplyForm);
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !reply.$id) return;

    setIsLoading(true);
    try {
      const replyData: any = {
        userId: user.id,
        Content: replyContent.trim(),
        commentId: parentCommentId,
        parentReplyId: reply.$id,
      };

      const newReply = await createReply(replyData);

      if (newReply) {
        // Update the backend reply document to include the new nested reply
        await updateReplyWithReply(reply.$id, newReply.$id);

        setNestedReplies((prev) => [newReply, ...prev]);
        setReplyContent('');
        setShowReplyForm(false);
        toast({
          title: 'Reply Posted',
          description: 'Your reply has been added successfully.',
        });
      }
    } catch (error) {
      console.error('Error creating nested reply:', error);
      toast({
        title: 'Reply Failed',
        description: 'Unable to post reply. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3 bg-dark-2 p-3 rounded-lg"
    >
      <img
        src={reply.userId?.ImageUrl || '/assets/icons/profile-placeholder.svg'}
        alt={`${reply.userId?.Username}'s avatar`}
        className="w-8 h-8 rounded-full object-cover"
      />
      <div className="flex-grow">
        <p className="text-blue-400 text-xs font-semibold">
          @{reply.userId?.Username}
        </p>
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
              className={`${
                isLiked ? 'fill-orange-500 text-orange-500' : 'text-light-3'
              } transition-colors`}
            />
            <span className={`${isLiked ? 'text-red-500' : 'text-light-3'}`}>
              {likes.length}
            </span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleReplyClick}
            className="flex items-center gap-1 text-xs text-light-3 hover:text-blue-500 transition-colors"
          >
            <MessageCircle size={14} />
            <span>Reply</span>
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
                    {isReporting ? 'Reporting...' : 'Report Reply'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <AnimatePresence>
          {showReplyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2"
            >
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2 bg-dark-3 text-light-1 rounded-md resize-none"
                rows={2}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReply}
                disabled={isLoading || !replyContent.trim()}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader /> : 'Post Reply'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Render Nested Replies */}
        <AnimatePresence>
          {nestedReplies.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-3 ml-4"
            >
              {nestedReplies.map((nestedReply) => (
                <CommentReply
                  key={nestedReply.$id}
                  reply={nestedReply}
                  parentCommentId={parentCommentId}
                  setReply={setReply}
                  setCommentId={setCommentId}
                  setParentReplyId={setParentReplyId}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CommentReply;
