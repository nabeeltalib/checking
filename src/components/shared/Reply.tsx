import React, { useState, useEffect, useRef } from 'react';
import { Heart, MoreHorizontal } from 'lucide-react';
import { useUserContext } from '@/context/AuthContext';
import { useToast } from '../ui';
import { checkIsLiked } from '@/lib/utils';
import { likeReply, reportReply } from '@/lib/appwrite/api';
import Loader from './Loader';

interface ReplyProps {
  reply: any;
}

const Reply: React.FC<ReplyProps> = ({ reply }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUserContext();
  const [likes, setLikes] = useState<string[]>(reply?.Likes || []);
  const [dropdownOpen, setDropdownOpen] = useState(false); // State to manage dropdown visibility
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for detecting outside clicks

  // Close the dropdown when clicking outside
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

  const handleLikeReply = async () => {
    const userId = user.id;
    const newLikes = likes.includes(userId)
      ? likes.filter((id) => id !== userId)
      : [...likes, userId];

    setLikes(newLikes);

    try {
      await likeReply(reply.$id, newLikes);
    } catch (error) {
      console.error('Error liking reply:', error);
    }
  };

  const handleReport = async () => {
    setIsLoading(true);
    try {
      await reportReply({
        User: reply.userId.Username,
        Content: reply.Content,
        id: reply.$id,
        Reporter: user.name,
      });
      toast({ title: `"${reply.Content}" Reported Successfully!` });
    } catch (error) {
      toast({ title: `Cannot Report Reply because: ${error}` });
    }
    setIsLoading(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="flex items-start space-x-3 bg-dark-2 rounded-lg p-3">
      <img
        src={reply.userId.ImageUrl || '/assets/icons/profile-placeholder.svg'}
        alt={reply.userId.Username}
        className="w-6 h-6 rounded-full object-cover"
      />
      <div className="flex-1">
        <h5 className="font-semibold text-light-1 text-xs">
          @{reply.userId.Username}
        </h5>
        <p className="text-light-2 text-xs mt-1">{reply.Content}</p>
        <div className="flex items-center space-x-4 mt-2">
          {/* Like Button */}
          <button
            onClick={handleLikeReply}
            className={`flex items-center space-x-1 text-sm ${
              checkIsLiked(likes, user.id) ? 'text-red-500' : 'text-gray-400'
            } hover:text-red-500 transition-colors duration-300`}
            title="Like this reply"
          >
            <Heart
              size={16}
              fill={checkIsLiked(likes, user.id) ? 'currentColor' : 'none'}
            />
            <span>{likes.length}</span>
          </button>

          {/* Dropdown button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="text-gray-400 hover:text-white transition-colors duration-300"
              title="Options"
            >
              <MoreHorizontal size={20} />
            </button>
            {dropdownOpen && (
              <div className="absolute left-0 w-32 bg-dark-2 border border-gray-700 rounded-md shadow-lg z-10">
                <ul className="text-sm text-light-1">
                  
                  <li 
                    className="text-xs px-4 py-2 hover:bg-dark-3 cursor-pointer" 
                    onClick={handleReport}
                    title="Report this reply"
                  >
                    Report
                  </li>
                  
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reply;
