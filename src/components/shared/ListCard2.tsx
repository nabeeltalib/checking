import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Share2, Trophy, Medal, Award, Send, UserPlus, UserMinus, MoreHorizontal, Flag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useUnsplashImage from '@/hooks/useUnsplashImage';
import { useToast } from '@/components/ui/use-toast';
import { useUserContext } from '@/context/AuthContext';
import {
  useGetCurrentUser,
  useGetComments,
  useLikeList,
  useSaveList,
  useDeleteSavedList,
  useCreateComment,
} from '@/lib/react-query/queries';
import {
  createNotification,
  followUser,
  getConnection,
  shareList,
  UnFollow,
  reportComment,
} from '@/lib/appwrite/api';
import { Models } from 'appwrite';
import Tooltip from '@/components/ui/Tooltip';
import Loader from '@/components/shared/Loader';
import { checkIsLiked } from '@/lib/utils';

const ListCard2 = ({ list }) => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const userId = user?.id;
  const { data: currentUser } = useGetCurrentUser();
  const { mutate: deleteSaveList } = useDeleteSavedList();
  const { mutate: saveList } = useSaveList();
  const { mutate: likeList } = useLikeList();
  const { data: comments, refetch: refetchComments } = useGetComments(list?.$id);
  const { mutate: createComment } = useCreateComment();
  const { toast } = useToast();
  const [likes, setLikes] = useState<any[]>(list?.Likes || []);
  const [isSaved, setIsSaved] = useState(
    currentUser?.save?.some((saved: any) => saved.list?.$id === list?.$id)
  );
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [connection, setConnection] = useState<any>(undefined);
  const { image, loading } = useUnsplashImage(list.Title);

  useEffect(() => {
    const fetchConnection = async () => {
      if (list.creator?.$id) {
        const resp = await getConnection(list.creator.$id);
        const conn = resp.length > 0 ? resp[0] : resp;
        setConnection(conn);
        setIsFollowing(conn?.follower?.some((follower: any) => follower.$id === userId));
      }
    };
    fetchConnection();
  }, [list.creator?.$id, userId]);

  const getRankIcon = (index) => {
    switch(index) {
      case 0: return <Trophy className="text-yellow-400" />;
      case 1: return <Medal className="text-gray-400" />;
      case 2: return <Award className="text-orange-400" />;
      default: return null;
    }
  };

  const handleFollowToggle = async () => {
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await UnFollow(userId, list.creator.$id);
      } else {
        await followUser(userId, list.creator.$id);
      }
      const resp = await getConnection(list.creator.$id);
      const conn = resp.length > 0 ? resp[0] : resp;
      setConnection(conn);
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (comment.trim() === "") return;
    try {
      await createComment({ listId: list.$id, userId, Content: comment });
      setComment('');
      toast({ title: "Comment added successfully", variant: "default" });
      refetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({ title: "Error adding comment", variant: "destructive" });
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSharing(true);
    try {
      const shareableLink = await shareList(list?.$id);
      if (navigator.share) {
        await navigator.share({
          title: list?.Title,
          text: `Check out this list: ${list?.Title}`,
          url: shareableLink,
        });
      } else {
        await navigator.clipboard.writeText(shareableLink);
        toast({ title: "Link copied to clipboard!", variant: "default" });
      }
    } catch (error) {
      console.error("Error sharing list:", error);
      toast({
        title: "Error",
        description: "Failed to share list. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleSaveList = async (e) => {
    e.stopPropagation();
    try {
      if (isSaved) {
        const savedListRecord = currentUser?.save?.find(
          (record: Models.Document) => record.list?.$id === list?.$id
        );
        if (savedListRecord) {
          await deleteSaveList(savedListRecord.$id);
        }
      } else {
        await saveList({ userId, listId: list?.$id });
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Error saving list:", error);
    }
  };

  const handleLikeList = async (e) => {
    e.stopPropagation();
    const newLikes = likes.includes(userId)
      ? likes.filter((Id) => Id !== userId)
      : [...likes, userId];
    setLikes(newLikes);
    try {
      await likeList({ listId: list?.$id, likesArray: newLikes });
    } catch (error) {
      console.error("Error liking list:", error);
    }
  };

  const isOwnProfile = userId === list.creator?.$id;

  const CommentWithActions = ({ comment }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsDropdownOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleReport = async () => {
      try {
        await reportComment({
          User: comment.user.Username,
          Content: comment.Content,
          id: comment.$id,
          Reporter: user.name,
        });
        toast({
          title: "Comment Reported",
          description: "We'll review this comment soon. Thank you for keeping our community safe.",
          duration: 5000,
        });
      } catch (error) {
        toast({
          title: "Couldn't Report Comment",
          description: "An error occurred. Please try again later.",
          variant: "destructive",
        });
      }
      setIsDropdownOpen(false);
    };

    return (
      <div className="flex items-start space-x-3 p-3 rounded-lg bg-dark-3">
        <img
          src={comment.user.ImageUrl || "/assets/default-avatar.png"}
          alt={`${comment.user.Username}'s avatar`}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-grow">
          <p className="text-primary-500 text-sm font-semibold">{comment.user.Username}</p>
          <p className="text-light-2 text-sm">{comment.Content}</p>
        </div>
        <div className="relative" ref={dropdownRef}>
          <Tooltip content="More options">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-gray-500 hover:text-gray-300 transition-colors duration-200"
              aria-label="More options"
            >
              <MoreHorizontal size={18} />
            </motion.button>
          </Tooltip>
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 mt-2 w-48 bg-dark-4 rounded-md shadow-lg z-20 overflow-hidden"
              >
                <motion.button
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  onClick={handleReport}
                  className="flex items-center w-full px-4 py-2 text-sm text-left text-light-2 hover:bg-dark-3"
                >
                  <Flag size={14} className="mr-2" />
                  Report comment
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="bg-dark-2 rounded-xl shadow-lg overflow-hidden"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Section */}
      <Link to={`/lists/${list.$id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          {loading ? (
            <div className="w-full h-full bg-dark-3 animate-pulse"></div>
          ) : (
            <img
              src={image || `https://via.placeholder.com/800x400?text=${encodeURIComponent(list.Title)}`}
              alt={list.Title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-2 to-transparent"></div>
          <h2 className="absolute bottom-4 left-4 right-4 text-2xl font-bold text-white">
            {list.Title}
          </h2>
        </div>
      </Link>

      <div className="p-6">
        {/* Creator Info and Follow Button */}
        {list.creator && (
          <div className="flex items-center justify-between mb-6">
            <Link to={`/profile/${list.creator.$id}`} className="flex items-center group">
              <img
                src={list.creator.ImageUrl || "/assets/default-avatar.png"}
                alt={`${list.creator.Name}'s profile`}
                className="w-10 h-10 rounded-full object-cover border-2 border-primary-500 group-hover:border-primary-600 transition-colors"
              />
              <div className="ml-3">
                <p className="text-white font-semibold group-hover:text-primary-500 transition-colors">
                  {list.creator.Name}
                </p>
                <p className="text-gray-400 text-sm">@{list.creator.Username}</p>
              </div>
            </Link>
            {!isOwnProfile && (
              <button
                onClick={handleFollowToggle}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isFollowing
                    ? 'bg-dark-4 text-white hover:bg-dark-3'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
                disabled={isFollowLoading}
              >
                {isFollowLoading ? (
                  <Loader />
                ) : isFollowing ? (
                  <>
                    <UserMinus size={16} className="inline mr-2" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus size={16} className="inline mr-2" />
                    Follow
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* List Items */}
        <Link to={`/lists/${list.$id}`} className="block mb-6">
          <ol className="space-y-4 mb-6">
            {list.items?.slice(0, 5).map((item, index) => (
              <li key={index} className="flex items-center bg-dark-3 p-4 rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-dark-4 mr-4">
                  {getRankIcon(index) || <span className="text-white font-bold">{index + 1}</span>}
                </div>
                <div className="flex-1">
                  <span className="text-white">{item.content || item}</span>
                </div>
              </li>
            ))}
          </ol>
          {list.items?.length > 5 && (
            <p className="text-primary-500 font-semibold text-sm mb-4 hover:underline">
              + {list.items.length - 5} more items
            </p>
          )}
        </Link>

        {/* Tags */}
        {list.Tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {list.Tags.map((tag, index) => (
              <span
                key={index}
                className="bg-dark-4 text-primary-500 px-3 py-1 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLikeList(e);
              }}
              className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Heart
                size={20}
                fill={likes.includes(userId) ? 'red' : 'none'}
                className={likes.includes(userId) ? 'text-red-500' : ''}
              />
              <span>{likes.length}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById(`comment-input-${list.$id}`)?.focus();
              }}
              className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <MessageCircle size={20} />
              <span>{comments?.length || 0}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSaveList(e);
              }}
              className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors"
            >
              <Bookmark
                size={20}
                fill={isSaved ? 'yellow' : 'none'}
                className={isSaved ? 'text-yellow-500' : ''}
              />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare(e);
            }}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isSharing}
          >
            <Share2 size={20} />
          </button>
        </div>

        {/* Comments Section */}
        <div className="mt-6 bg-dark-3 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Comments</h3>
          
          {/* Comment Input */}
          <form onSubmit={handleCommentSubmit} className="mb-4">
            <div className="flex items-center">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-grow bg-dark-4 text-white rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                id={`comment-input-${list.$id}`}
              />
              <button
                type="submit"
                className="bg-primary-500 text-white rounded-r-lg px-4 py-2 hover:bg-primary-600 transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </form>

          {/* Comments */}
          <div className="space-y-4">
            {(showAllComments ? comments : comments?.slice(0, 2))?.map((comment, index) => (
              <CommentWithActions key={index} comment={comment} />
            ))}
          </div>

          {comments?.length > 2 && (
            <button
              onClick={() => setShowAllComments(!showAllComments)}
              className="mt-4 text-primary-500 hover:underline"
            >
              {showAllComments ? 'Show less' : `View all ${comments.length} comments`}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ListCard2;
