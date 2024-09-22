import React, { useState, useEffect, useRef } from 'react';
import { useUserContext } from '@/context/AuthContext';
import { useToast } from '../ui';
import Loader from '@/components/shared/Loader';
import { likeComment, reportComment } from '@/lib/appwrite/api';
import { checkIsLiked } from '@/lib/utils';
import { Heart, MessageCircle, ChevronRight, MoreHorizontal } from 'lucide-react'; // Import new icons

import Reply from '@/components/shared/Reply'; // Import the Reply component
import { Link } from 'react-router-dom';

interface CommentProps {
  comment: any;
  setReply: (value: boolean) => void;
  show: string;
  setCommentId: (id: string) => void;
  listId: string; // Add listId to props
}

const Comment: React.FC<CommentProps> = ({
  comment,
  setReply,
  show,
  setCommentId,
  listId,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUserContext();
  const [likes, setLikes] = useState<string[]>(comment?.Likes || []);
  const [dropdownOpen, setDropdownOpen] = useState(false); // Add state for dropdown
  const dropdownRef = useRef<HTMLDivElement>(null); // Create ref to detect outside clicks

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleReport = async () => {
    setIsLoading(true);
    try {
      await reportComment({
        User: comment.user.Username,
        Content: comment.Content,
        id: comment.$id,
        Reporter: user.name,
      });
      toast({ title: `"${comment.Content}" Reported Successfully!` });
    } catch (error) {
      toast({ title: `Cannot Report Comment because: ${error}` });
    }
    setIsLoading(false);
  };

  const handleReply = () => {
    setReply(true);
    setCommentId(comment.$id);
  };

  const handleLikeComment = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const newLikes = likes.includes(user.id)
      ? likes.filter((Id) => Id !== user.id)
      : [...likes, user.id];

    setLikes(newLikes);
    await likeComment(comment.$id, newLikes);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="bg-dark-3 rounded-lg p-4 mb-4 shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="flex items-start space-x-3">
        <img
          src={comment.user.ImageUrl || '/assets/icons/profile-placeholder.svg'}
          alt={comment.user.Username}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-light-1">
              {comment.user.Username}
            </h4>
            {/* Dropdown button */}
            <div className="relative" ref={dropdownRef}> {/* Attach ref to the dropdown container */}
              <button
                onClick={toggleDropdown}
                className="text-gray-400 hover:text-white transition-colors duration-300"
                title="Options"
              >
                <MoreHorizontal size={20} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-dark-2 border border-gray-700 rounded-md shadow-lg z-10">
                  <ul className="text-xs text-light-1">
                    <li 
                      className="px-4 py-2 hover:bg-dark-3 cursor-pointer" 
                      onClick={handleReport}
                      title="Report this comment"
                    >
                      Report
                    </li>
                    
                  </ul>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-light-2 mt-1">{comment.Content}</p>
          <div className="flex items-center space-x-4 mt-2">
            <button
              onClick={handleLikeComment}
              className={`flex items-center space-x-1 text-xs ${
                checkIsLiked(likes, user.id) ? 'text-red-500' : 'text-gray-400'
              } hover:text-red-500 transition-colors duration-300`}
              title="Like this comment"
            >
              <Heart
                size={16}
                fill={checkIsLiked(likes, user.id) ? 'currentColor' : 'none'}
              />
              <span>{likes.length}</span>
            </button>
            <button
              onClick={handleReply}
              className="flex items-center space-x-1 text-sm text-gray-400 hover:text-primary-500 transition-colors duration-300"
              title="Reply to this comment"
            >
              <MessageCircle size={16} />
              <span>Reply</span>
            </button>
          </div>
        </div>
      </div>

      {comment.Reply && comment.Reply.length > 0 && (
        <div className="mt-4">
          <div className="ml-8 mt-2 space-y-3">
            {comment.Reply.slice(0, 2).map((reply: any, index: number) => (
              <Reply key={reply.$id || index} reply={reply} />
            ))}
            {comment.Reply.length > 2 && (
              <Link
                to={`/lists/${listId}`}
                className="text-primary-500 hover:underline text-xs inline-flex items-center"
              >
                View all {comment.Reply.length} replies
                <ChevronRight size={14} className="ml-1" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Comment;
