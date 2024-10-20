import React, { useState, useEffect, useRef } from "react";
import { useUserContext } from "@/context/AuthContext";
import {
  ReplyLike,
  reportReply,
  createReply,
  getNestedReplies,
  updateReplyWithReply,
  addEmojiReaction,
  removeEmojiReaction,
} from "@/lib/appwrite/api";
import { checkIsLiked } from "@/lib/utils";
import { Heart, MessageCircle, MoreHorizontal, Smile, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

const MAX_VISIBLE_DEPTH = 2;
const quickEmojis = ['😂', '😢', '😮', '😍', '👏', '🔥', '👀', '😅'];

const CommentReply = ({
  reply,
  parentCommentId,
  setReply,
  setCommentId,
  setParentReplyId,
  listId,
  depth = 0,
  onReplyDeleted,
}) => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const [likes, setLikes] = useState(reply?.Likes || []);
  const [isLiked, setIsLiked] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [nestedReplies, setNestedReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [showNestedReplies, setShowNestedReplies] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [reactions, setReactions] = useState(reply?.Reactions || []);

  useEffect(() => {
    setIsLiked(checkIsLiked(likes, user.id));
    fetchNestedReplies();
  }, [likes, user.id, reply.$id]);

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
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const handleLikeReply = async () => {
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

  const handleEmojiReaction = async (emoji) => {
    try {
      const reactionString = `${emoji}:${user.id}`;
      let updatedReactions = [...reactions];
      
      if (reactions.includes(reactionString)) {
        updatedReactions = updatedReactions.filter(r => r !== reactionString);
        await removeEmojiReaction(reply.$id, emoji, user.id);
      } else {
        updatedReactions.push(reactionString);
        await addEmojiReaction(reply.$id, emoji, user.id);
      }
      
      setReactions(updatedReactions);
    } catch (error) {
      if (error.message === "Comment not found. It may have been deleted.") {
        toast({
          title: "Reply Deleted",
          description: "This reply no longer exists and will be removed from the view.",
          variant: "warning",
        });
        onReplyDeleted(reply.$id);
      } else {
        toast({
          title: "Error",
          description: "Failed to update reaction. Please try again.",
          variant: "destructive",
        });
      }
      console.error("Error handling emoji reaction:", error);
    }
  };

  const handleReplyClick = () => {
    setReply(true);
    setCommentId(parentCommentId);
    setParentReplyId(reply.$id);
    setShowReplyForm(!showReplyForm);
  };

  const handleCreateReply = async () => {
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

  const handleNestedReplyDeleted = (replyId) => {
    setNestedReplies((prevReplies) => prevReplies.filter((reply) => reply.$id !== replyId));
  };

  const parseReactions = (reactions) => {
    const emojiCounts = {};
    reactions.forEach(reaction => {
      const [emoji] = reaction.split(':');
      emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
    });
    return emojiCounts;
  };

  const renderNestedReplies = () => {
    if (nestedReplies.length === 0) return null;

    const visibleReplies = depth < MAX_VISIBLE_DEPTH || isExpanded ? nestedReplies : [];

    return (
      <div className={`ml-4 mt-2 ${depth >= MAX_VISIBLE_DEPTH ? 'border-l-2 border-gray-700 pl-2' : ''}`}>
        {visibleReplies.map((nestedReply, index) => (
          <CommentReply
            key={nestedReply.$id}
            reply={nestedReply}
            parentCommentId={parentCommentId}
            setReply={setReply}
            setCommentId={setCommentId}
            setParentReplyId={setParentReplyId}
            listId={listId}
            depth={depth + 1}
            onReplyDeleted={handleNestedReplyDeleted}
          />
        ))}
        {depth >= MAX_VISIBLE_DEPTH && nestedReplies.length > 0 && (
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            className="text-xs text-blue-500 mt-2 p-0"
          >
            {isExpanded ? 'Hide replies' : `View ${nestedReplies.length} more ${nestedReplies.length === 1 ? 'reply' : 'replies'}`}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col mb-4 ${depth > 0 ? 'ml-4' : ''}`}>
      <div className="flex items-start">
        <img
          src={reply.userId?.ImageUrl || '/assets/icons/profile-placeholder.svg'}
          alt={`${reply.userId?.Username || 'Anonymous'}'s avatar`}
          className="w-6 h-6 rounded-full object-cover mr-3"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <Link to={`/profile/${reply.userId?.$id}`} className="font-thin mr-2 text-white">
                {reply.userId?.Username || 'Anonymous'}
              </Link>
              <span className="text-gray-400 text-xs">
                {formatDate(reply.CreatedAt)}
              </span>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="default" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <Button
                  variant="default"
                  onClick={handleReportReply}
                  disabled={isReporting}
                  className="w-full justify-start"
                >
                  {isReporting ? 'Reporting...' : 'Report Reply'}
                </Button>
              </PopoverContent>
            </Popover>
          </div>
          <p className="text-white mt-1">{reply.Content}</p>
          <div className="flex items-center mt-2 space-x-4">
            <button 
              onClick={handleLikeReply} 
              className={`flex items-center ${isLiked ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'}`}
            >
              <ThumbsUp size={16} fill={isLiked ? 'currentColor' : 'none'} />
              {likes.length > 0 && (
                <span className="ml-1 text-sm">{likes.length}</span>
              )}
            </button>
            <button onClick={handleReplyClick} className="text-gray-400">
              <MessageCircle size={16} />
            </button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="p-0">
                  <Smile size={16} className="text-gray-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-1">
                <div className="flex space-x-1">
                  {quickEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiReaction(emoji)}
                      className="text-xl hover:bg-gray-200 rounded p-1"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-wrap mt-1 space-x-2">
            {Object.entries(parseReactions(reactions)).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => handleEmojiReaction(emoji)}
                className={`text-sm rounded-full px-2 py-1 ${
                  reactions.includes(`${emoji}:${user.id}`) ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {emoji} {count}
              </button>
            ))}
          </div>
        </div>
      </div>
      {showReplyForm && (
        <div className="ml-11 mt-2 flex items-center">
          <input
            type="text"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Add a reply..."
            className="flex-1 bg-transparent border-b border-gray-600 focus:outline-none focus:border-blue-500 text-white"
          />
          <Button
            onClick={handleCreateReply}
            disabled={isLoading || !replyContent.trim()}
            className="ml-2"
          >
            Post
          </Button>
        </div>
      )}
      {renderNestedReplies()}
    </div>
  );
};

export default CommentReply;