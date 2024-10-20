import React, { useState, useEffect, useRef } from 'react';
import { useUserContext } from '@/context/AuthContext';
import { useToast } from '../ui/use-toast';
import {
  likeComment,
  reportComment,
  createReply,
  updateCommentWithReply,
  addEmojiReaction,
  removeEmojiReaction,
} from '@/lib/appwrite/api';
import { checkIsLiked } from '@/lib/utils';
import { ThumbsUp, MessageCircle, MoreHorizontal, Smile } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/Popover';
import CommentReply from './CommentReply';

const quickEmojis = ['😂', '😢', '😮', '😍', '👏', '🔥', '👀', '😅'];

const Comment = ({
  comment,
  setReply,
  setCommentId,
  setParentReplyId,
  listId,
  onCommentDeleted,
}) => {
  const { toast } = useToast();
  const { user } = useUserContext();
  const [likes, setLikes] = useState(comment?.Likes || []);
  const [isLiked, setIsLiked] = useState(false);
  const [reactions, setReactions] = useState(comment?.Reactions || []);
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [showReplyField, setShowReplyField] = useState(false);

  useEffect(() => {
    setIsLiked(checkIsLiked(likes, user.id));
  }, [likes, user.id]);

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

  const handleEmojiReaction = async (emoji) => {
    try {
      const reactionString = `${emoji}:${user.id}`;
      let updatedReactions = [...reactions];
      
      if (reactions.includes(reactionString)) {
        updatedReactions = updatedReactions.filter(r => r !== reactionString);
        await removeEmojiReaction(comment.$id, emoji, user.id);
      } else {
        updatedReactions.push(reactionString);
        await addEmojiReaction(comment.$id, emoji, user.id);
      }
      
      setReactions(updatedReactions);
    } catch (error) {
      if (error.message === "Comment not found. It may have been deleted.") {
        toast({
          title: "Comment Deleted",
          description: "This comment no longer exists and will be removed from the view.",
          variant: "warning",
        });
        onCommentDeleted(comment.$id);
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

  const handleReply = () => {
    setShowReplyField(!showReplyField);
    setCommentId(comment.$id);
    setParentReplyId('');
  };

  const handleCreateReply = async () => {
    if (!user || !replyContent.trim()) return;

    try {
      const replyData = {
        userId: user.id,
        Content: replyContent.trim(),
        commentId: comment.$id,
      };

      const newReply = await createReply(replyData);

      if (newReply) {
        await updateCommentWithReply(comment.$id, newReply.$id);
        setReplyContent('');
        setShowReplyField(false);
        setShowReplies(true);
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
    }
  };

  const handleReport = async () => {
    setIsReporting(true);
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
    setIsReporting(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const parseReactions = (reactions) => {
    const emojiCounts = {};
    reactions.forEach(reaction => {
      const [emoji] = reaction.split(':');
      emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
    });
    return emojiCounts;
  };

  return (
    <div className="flex flex-col mb-4">
      <div className="flex items-start">
        <img
          src={comment.user?.ImageUrl || '/assets/icons/profile-placeholder.svg'}
          alt={`${comment.user?.Username}'s avatar`}
          className="w-6 h-6 rounded-full object-cover mr-3"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <Link to={`/profile/${comment.user?.$id}`} className="font-thin mr-2 text-white">
                {comment.user?.Username || 'Anonymous'}
              </Link>
              <span className="text-gray-400 text-xs">
                {formatDate(comment.CreatedAt)}
              </span>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <Button
                  variant="ghost"
                  onClick={handleReport}
                  disabled={isReporting}
                  className="w-full justify-start"
                >
                  {isReporting ? 'Reporting...' : 'Report Comment'}
                </Button>
              </PopoverContent>
            </Popover>
          </div>
          <p className="text-white mt-1">{comment.Content}</p>
          <div className="flex items-center mt-2 space-x-4">
            <button 
              onClick={handleLikeComment} 
              className={`flex items-center ${isLiked ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'}`}
            >
              <ThumbsUp size={16} fill={isLiked ? 'currentColor' : 'none'} />
              {likes.length > 0 && (
                <span className="ml-1 text-sm">{likes.length}</span>
              )}
            </button>
            <button onClick={handleReply} className="text-gray-400">
              <MessageCircle size={16} />
            </button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="default" className="p-0">
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
      {showReplyField && (
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
            disabled={!replyContent.trim()}
            className="ml-2"
          >
            Post
          </Button>
        </div>
      )}
      {comment.Reply && comment.Reply.length > 0 && (
        <div className="ml-11 mt-2">
          <button 
            onClick={() => setShowReplies(!showReplies)}
            className="text-blue-500 text-xs"
          >
            {showReplies ? 'Hide replies' : `View ${comment.Reply.length} ${comment.Reply.length === 1 ? 'reply' : 'replies'}`}
          </button>
          {showReplies && (
            <div className="mt-2">
              {comment.Reply.map((reply) => (
                <CommentReply
                  key={reply.$id}
                  reply={reply}
                  parentCommentId={comment.$id}
                  setReply={setReply}
                  setCommentId={setCommentId}
                  setParentReplyId={setParentReplyId}
                  listId={listId}
                  depth={1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Comment;