import React, { useState, useEffect, useRef } from "react";
import { useUserContext } from "@/context/AuthContext";
import {
  ReplyLike,
  reportReply,
  createReply,
  getNestedReplies,
  updateReplyWithReply,
} from "@/lib/appwrite/api";
import { checkIsLiked } from "@/lib/utils";
import { MoreVertical, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

const CommentReply = ({
  reply,
  parentCommentId,
  setReply,
  setCommentId,
  setParentReplyId,
  listId,
}) => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [likes, setLikes] = useState(reply?.Likes || []);
  const [isLiked, setIsLiked] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [nestedReplies, setNestedReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setIsLiked(checkIsLiked(likes, user.id));
    fetchNestedReplies();
  }, [likes, user.id, reply.$id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNestedReplies = async () => {
    if (!reply.$id) return;
    try {
      const fetchedReplies = await getNestedReplies(reply.$id);
      setNestedReplies(fetchedReplies);
    } catch (error) {
      console.error('Error fetching nested replies:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      console.error('Invalid date:', dateString);
      return '';
    }
  };

  const generateUniqueKey = (nestedReply, index) => {
    if (nestedReply.$id) return nestedReply.$id;
    const contentSnippet = nestedReply.Content ? nestedReply.Content.slice(0, 10) : '';
    return `nested-reply-${index}-${contentSnippet}`;
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
      const replyData = {
        userId: user.id,
        Content: replyContent.trim(),
        commentId: parentCommentId,
        parentReplyId: reply.$id,
      };

      const newReply = await createReply(replyData);

      if (newReply) {
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

  const handleViewMoreReplies = () => {
    navigate(`/lists/${listId}`);
  };

   return (
    <div className="flex items-start mb-2 ml-4">
      <img
        src={reply.userId?.ImageUrl || '/assets/icons/profile-placeholder.svg'}
        alt={`${reply.userId?.Username || 'Anonymous'}'s avatar`}
        className="w-6 h-6 rounded-full object-cover mr-2"
      />
      <div className="flex-1">
        <div className="bg-transparent p-1 rounded-lg">
          <span className="text-sm font-semibold mr-1">
            @{reply.userId?.Username || 'Anonymous'}
          </span>
          <span className="text-xs font-light">{reply.Content || ''}</span>
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
          <button onClick={handleReplyClick} className="focus:outline-none">
            Reply
          </button>
          <span>
            {formatDate(reply.CreatedAt)}
          </span>
        </div>

         {/* Nested Replies */}
      {nestedReplies.length > 0 && (
        <div className="ml-4 mt-2">
          {nestedReplies.slice(0, 1).map((nestedReply, index) => (
            <CommentReply
              key={generateUniqueKey(nestedReply, index)}
              reply={nestedReply}
              parentCommentId={parentCommentId}
              setReply={setReply}
              setCommentId={setCommentId}
              setParentReplyId={setParentReplyId}
              listId={listId}
            />
          ))}
          {nestedReplies.length > 1 && (
            <button
              onClick={handleViewMoreReplies}
              className="text-xs text-blue-500 mt-2 focus:outline-none"
            >
              View {nestedReplies.length - 1} more {nestedReplies.length - 1 === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>
        )}

        {/* Reply Input */}
        {showReplyForm && (
          <div className="flex items-center mt-2">
            <img
              src={user.ImageUrl || '/assets/icons/profile-placeholder.svg'}
              alt={`${user.Username}'s avatar`}
              className="w-6 h-6 rounded-full mr-2"
            />
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Add a reply..."
              className="flex-1 bg-transparent border-b border-gray-300 focus:outline-none text-sm"
            />
            <button
              onClick={handleReply}
              disabled={isLoading || !replyContent.trim()}
              className="ml-2 text-blue-500 text-sm font-semibold focus:outline-none"
            >
              Post
            </button>
          </div>
        )}
      </div>
      {/* More Options */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="focus:outline-none absolute right-0"
        >
          <MoreVertical size={16} />
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-black rounded-md shadow-lg z-10">
            <button
              onClick={handleReportReply}
              disabled={isReporting}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 focus:outline-none"
            >
              {isReporting ? 'Reporting...' : 'Report Abuse'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentReply;