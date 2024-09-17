import React, { useState } from 'react';
import { useUserContext } from '@/context/AuthContext';
import { useToast } from '../ui';
import Loader from './Loader';
import { likeComment, reportComment } from '@/lib/appwrite/api';
import { checkIsLiked } from '@/lib/utils';
import { Heart, Flag, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface CommentProps {
  comment: any;
  setReply: (value: boolean) => void;
  show: string;
  setCommentId: (id: string) => void;
}

const Comment: React.FC<CommentProps> = ({ comment, setReply, show, setCommentId }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUserContext();
  const [likes, setLikes] = useState<string[]>(comment?.Likes || []);
  const [showReplies, setShowReplies] = useState(false);

  const handleReport = async () => {
    setIsLoading(true);
    try {
      await reportComment({
        User: comment?.user?.Username || 'Unknown User',
        Content: comment?.Content || 'No content',
        id: comment.$id,
        Reporter: user.name,
      });
      toast({ title: `Comment reported successfully`, description: "We'll review it shortly." });
    } catch (error) {
      toast({ title: "Report failed", description: `Error: ${error.message || error}` });
    }
    setIsLoading(false);
  };

  const handleReply = () => {
    setReply(true);
    setCommentId(comment.$id);
  };

  const handleLikeComment = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    const newLikes = likes.includes(user.id)
      ? likes.filter((Id) => Id !== user.id)
      : [...likes, user.id];

    setLikes(newLikes);
    await likeComment(comment.$id, newLikes);
  };

  return (
    <div className="bg-dark-3 rounded-lg p-4 mb-4 shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="flex items-start space-x-3">
        <img
          src={comment?.user?.ImageUrl || "/assets/icons/profile-placeholder.svg"}
          alt={comment?.user?.Username || "Unknown User"}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-light-1">{comment?.user?.Username || "Unknown User"}</h4>
            {show && (
              <button
                onClick={handleReport}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors duration-300"
              >
                {isLoading ? <Loader /> : <Flag size={16} />}
              </button>
            )}
          </div>
          <p className="text-light-2 mt-1">{comment?.Content || "No content"}</p>
          <div className="flex items-center space-x-4 mt-2">
            <button
              onClick={handleLikeComment}
              className={`flex items-center space-x-1 text-sm ${
                checkIsLiked(likes, user.id) ? 'text-primary-500' : 'text-gray-400'
              } hover:text-primary-500 transition-colors duration-300`}
            >
              <Heart size={16} fill={checkIsLiked(likes, user.id) ? 'currentColor' : 'none'} />
              <span>{likes.length}</span>
            </button>
            <button
              onClick={handleReply}
              className="flex items-center space-x-1 text-sm text-gray-400 hover:text-primary-500 transition-colors duration-300"
            >
              <MessageCircle size={16} />
              <span>Reply</span>
            </button>
          </div>
        </div>
      </div>

      {comment?.Reply && comment.Reply.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center text-sm text-primary-500 hover:text-primary-600 transition-colors duration-300"
          >
            {showReplies ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            <span className="ml-1">{showReplies ? 'Hide' : 'Show'} {comment.Reply.length} replies</span>
          </button>
          {showReplies && (
            <div className="ml-8 mt-2 space-y-3">
              {comment.Reply.map((reply: any, index: number) => (
                <div key={index} className="flex items-start space-x-3 bg-dark-4 rounded-lg p-3">
                  <img
                    src={reply?.userId?.ImageUrl || "/assets/icons/profile-placeholder.svg"}
                    alt={reply?.userId?.Username || "Unknown User"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <h5 className="font-semibold text-light-1 text-sm">
                      {reply?.userId?.Username || "Unknown User"}
                    </h5>
                    <p className="text-light-2 text-sm mt-1">{reply?.Content || "No content"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Comment;