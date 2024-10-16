import React, { useState, useEffect, useRef } from 'react';
import { useUserContext } from '@/context/AuthContext';
import { useToast } from '../ui/use-toast';
import Loader from './Loader';
import {
  likeComment,
  reportComment,
  createReply,
  updateCommentWithReply,
  updateReplyWithReply,
} from '@/lib/appwrite/api';
import { checkIsLiked } from '@/lib/utils';
import CommentReply from './CommentReply';
import { MoreVertical, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const Comment = ({
  comment,
  setReply,
  show,
  setCommentId,
  setParentReplyId,
  listId,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUserContext();
  const [likes, setLikes] = useState<string[]>(comment?.Likes || []);
  const [isLiked, setIsLiked] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [localComment, setLocalComment] = useState(comment);
  const [showReplyField, setShowReplyField] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [showAllReplies, setShowAllReplies] = useState(false);

  useEffect(() => {
    setIsLiked(checkIsLiked(likes, user.id));
  }, [likes, user.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      console.error('Invalid date:', dateString);
      return '';
    }
  };

  const generateUniqueKey = (reply, index) => {
    if (reply.$id) return reply.$id;
    const contentSnippet = reply.Content ? reply.Content.slice(0, 10) : '';
    return `reply-${index}-${contentSnippet}`;
  };

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
      toast({
        title: 'Comment Reported',
        description: 'Thank you for helping keep our community safe.',
      });
    } catch (error) {
      toast({
        title: 'Report Failed',
        description: `Unable to report comment: ${error}`,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleReply = () => {
    setShowReplyField(!showReplyField);
    setCommentId(comment.$id);
    setParentReplyId('');
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
      toast({
        title: 'Like Failed',
        description: 'Unable to like comment. Please try again.',
        variant: 'destructive',
      });
      setLikes(likes);
      setIsLiked(!isLiked);
    }
  };

  const handleCreateReply = async () => {
    if (!user || !replyContent.trim()) return;

    setIsLoading(true);
    try {
      const replyData: any = {
        userId: user.id,
        Content: replyContent.trim(),
        commentId: comment.$id,
      };

      const newReply = await createReply(replyData);

      if (newReply) {
        await updateCommentWithReply(comment.$id, newReply.$id);

        setLocalComment((prev) => ({
          ...prev,
          Reply: [...(prev.Reply || []), newReply],
        }));
        setReplyContent('');
        setShowReplyField(false);
        setParentReplyId('');
        toast({
          title: 'Reply Posted',
          description: 'Your reply has been added successfully.',
        });
      }
    } catch (error) {
      console.error('Error creating reply:', error);
      toast({
        title: 'Reply Failed',
        description: 'Unable to post reply. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMoreReplies = () => {
    navigate(`/lists/${listId}`);
  };

  const userImageUrl = comment?.user?.ImageUrl || '/assets/icons/profile-placeholder.svg';
  const username = comment?.user?.Username || 'Anonymous';

  const renderReplies = () => {
    if (!localComment.Reply || localComment.Reply.length === 0) return null;

    const visibleReplies = showAllReplies ? localComment.Reply : localComment.Reply.slice(0, 2);

    return (
      <div className="ml-4 mt-2">
        {visibleReplies.map((reply, index) => (
          <CommentReply
            key={generateUniqueKey(reply, index)}
            reply={reply}
            parentCommentId={comment.$id}
            setReply={setReply}
            setCommentId={setCommentId}
            setParentReplyId={setParentReplyId}
            listId={listId}
            depth={1}
          />
        ))}
        {localComment.Reply.length > 2 && !showAllReplies && (
          <button
            onClick={() => setShowAllReplies(true)}
            className="text-xs text-blue-500 mt-2 focus:outline-none"
          >
            View {localComment.Reply.length - 2} more replies
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-start mb-2">
      <img
        src={userImageUrl}
        alt={`${username}'s avatar`}
        className="w-6 h-6 rounded-full object-cover mr-2"
      />
      <div className="flex-1">
        <div className="bg-transparent p-1 rounded-lg">
          <span className="text-sm font-semibold mr-1">
            {username}
          </span>
          <span className="text-xs font-light">{comment?.Content || 'No content'}</span>
        </div>
        <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
          <button
            onClick={handleLikeComment}
            className="focus:outline-none flex items-center"
          >
            <ThumbsUp
              size={16}
              className={isLiked ? 'text-orange-500' : 'text-gray-500'}
              fill={isLiked ? 'currentColor' : 'none'}
            />
            {likes.length > 0 && <span className="ml-1">{likes.length}</span>}
          </button>
          <button onClick={handleReply} className="focus:outline-none">
            Reply
          </button>
          <span>
            {comment?.CreatedAt && formatDistanceToNow(new Date(comment.CreatedAt), { addSuffix: true })}
          </span>
        </div>
        {renderReplies()}
        {showReplyField && (
          <div className="flex items-center mt-2">
            <img
              src={user.ImageUrl || '/assets/icons/profile-placeholder.svg'}
              alt={`${user.Username}'s avatar`}
              className="w-6 h-6 rounded-full object-cover mr-2"
            />
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Add a reply..."
              className="flex-1 bg-transparent border-b border-gray-300 focus:outline-none text-sm"
            />
            <button
              onClick={handleCreateReply}
              disabled={isLoading || !replyContent.trim()}
              className="ml-2 text-blue-500 text-sm font-semibold focus:outline-none"
            >
              Post
            </button>
          </div>
        )}
      </div>
      {show && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="focus:outline-none ml-2"
          >
            <MoreVertical size={16} />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-black rounded-md shadow-lg z-10">
              <button
                onClick={handleReport}
                disabled={isLoading}
                className="w-full text-left px-4 py-2 text-xs hover:bg-gray-700 focus:outline-none"
              >
                {isLoading ? 'Reporting...' : 'Report Abuse'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Comment;