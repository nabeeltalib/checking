import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, MessageCircle, Bookmark, Tag, MapPin, Clock, Trophy, MoreHorizontal, Flag } from "lucide-react";
import { createEmbedList, followUser, getConnection, shareList, UnFollow, reportComment } from "@/lib/appwrite/api";
import { useDeleteSavedList, useGetComments, useGetCurrentUser, useLikeList, useSaveList } from "@/lib/react-query/queries";
import { Button } from "../ui";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import Tooltip from "@/components/ui/Tooltip";
import { Models } from "appwrite";
import { checkIsLiked } from "@/lib/utils";
import Loader from "./Loader";

const ListCard2: React.FC<any> = ({ list, manageList }: any) => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { id: userId } = user || {};
  const { data: currentUser } = useGetCurrentUser();
  const { mutate: deleteSaveList } = useDeleteSavedList();
  const { mutate: saveList } = useSaveList();
  const { mutate: likeList } = useLikeList();
  const { data: comments } = useGetComments(list?.$id);

  // Define the getRankColor function to return color classes based on the rank
  const getRankColor = (index: number) => {
    const colors = ["text-yellow-500", "text-gray-400", "text-orange-500", "text-blue-500", "text-green-500"];
    return index < colors.length ? colors[index] : "text-purple-500";
  };

  const CommentWithActions = ({ comment }: { comment: any }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user } = useUserContext();
    const { toast } = useToast();

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
      <li className="flex items-start space-x-3 p-3 rounded-lg">
        <img
          src={comment.user.ImageUrl || "/assets/default-avatar.png"}
          alt={`${comment.user.Username}'s avatar`}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-grow">
          <p className="text-blue-300 text-xs font-semibold">{comment.user.Username}</p>
          <p className="text-light-2 text-xs">{comment.Content}</p>
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
                  className="flex items-center w-full px-4 py-2 text-xs text-left text-light-2 hover:bg-dark-3"
                >
                  <Flag size={14} className="mr-2" />
                  Report comment
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </li>
    );
  };

  const [isSharing, setIsSharing] = useState(false);
  const [isSaved, setIsSaved] = useState(
    currentUser?.save?.some((saved: any) => saved.list?.$id === list?.$id)
  );
  const [likes, setLikes] = useState<any[]>(list?.Likes || []);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [connection, setConnection] = useState<any>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      if (list?.creator?.$id) {
        const resp = await getConnection(list.creator.$id);
        resp.length > 0 ? setConnection(resp[0]) : setConnection(resp);
      }      
    };

    fetchData();
  }, [list?.creator?.$id]);

  const { toast } = useToast();

  const handleShare = async (e: React.MouseEvent) => {
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
        toast({
          title: "Link copied to clipboard!",
          variant: "default",
        });
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

  const handleSaveList = async (e: any) => {
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

  const handleLikeList = async (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
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

  const isOwnProfile = user?.id === list?.creator?.$id;
  const isFollowed = connection?.follower?.some((follow: any) => follow.$id === user?.id);

  const handleFollow = async () => {
    setIsFollowLoading(true);
    try {
      await followUser(user?.id, list.creator?.$id);
      const resp = await getConnection(list.creator?.$id);
      resp.length > 0 ? setConnection(resp[0]) : setConnection(resp);
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleUnFollow = async () => {
    setIsFollowLoading(true);
    try {
      await UnFollow(user?.id, list.creator?.$id);
      const resp = await getConnection(list.creator?.$id);
      resp.length > 0 ? setConnection(resp[0]) : setConnection(resp);
    } catch (error) {
      console.error("Error unfollowing user:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const renderFollowButton = () => {
    if (isOwnProfile) return null;

    return (
      <Button
        className={`flex items-center gap-4 ${
          isFollowed
            ? "bg-gray-700 text-white hover:bg-gray-600"
            : "bg-blue-500 text-white hover:bg-blue-600"
        } flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors`}
        onClick={isFollowed ? handleUnFollow : handleFollow}
        disabled={isFollowLoading}
      >
        {isFollowLoading ? <Loader /> : isFollowed ? "Unfollow" : "Follow"}
      </Button>
    );
  };

  return (
    <motion.div
      className="bg-gray-900 rounded-xl shadow-lg overflow-hidden"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6">
        {/* Creator Info */}
        {list?.creator?.$id && (
          <div className="flex items-center justify-between mb-6">
            <Link to={`/profile/${list.creator?.$id}`} className="flex items-center group">
              <img
                src={list.creator?.ImageUrl || "/assets/icons/profile-placeholder.svg"}
                alt={`${list.creator?.Name}'s profile`}
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 group-hover:border-blue-400 transition-colors"
              />
              <div className="ml-3">
                <p className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                  {list.creator?.Name}
                </p>
                <p className="text-gray-400 text-sm">
                  @{list.creator?.Username}
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              {list.creator?.Public && renderFollowButton()}
              <Button
                onClick={handleShare}
                disabled={isSharing}
                className="p-2 rounded-full bg-dark-3 hover:bg-dark-4 transition-colors"
              >
                <Share2 size={20} className="text-light-2" />
              </Button>
            </div>
          </div>
        )}

        {/* List Title */}
        <div className="mb-6">
          <div className=" text-slate-700 text-center text-xl sm:text-xl font-thin px-4 py-4 rounded-t-lg" style={{ fontFamily: "'Racing Sans One', sans-serif" }}>
            Ranking For
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 hover:text-blue-400 transition-colors">
            {list?.Title}
          </h2>
          
        </div>

        {/* List Items */}
        <Link to={`/lists/${list?.$id}`} className="block mb-6">
          <ol className="space-y-4 mb-6">
            {list?.items?.slice(0, 5).map((item: any, index: number) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center bg-gray-800 p-4 rounded-lg"
              >
                <div className={`flex-shrink-0 w-8 h-8 ${getRankColor(index)} font-bold text-2xl mr-4 w-8 text-center`}>
                  <span className="text-md">{index + 1}</span>
                </div>
                <span className="text-pretty text-white flex-1">
                  {typeof item === "string" ? item : item?.content || ""}
                </span>
              </motion.li>
            ))}
          </ol>
          {list?.items?.length > 5 && (
            <p className="text-blue-400 font-semibold text-sm mb-4 hover:underline">
              + {list.items.length - 5} more items
            </p>
          )}
        </Link>

        {/* Description */}
        {list?.Description && (
          <p className="text-light-2 mb-6">
            {list?.Description}
          </p>
        )}

        {/* Tags */}
        {list?.tags?.length > 0 && (
          <div className="lex flex-wrap gap-2 mb-4">
            {list?.tags?.slice(0, 3).map((tag: string, index: number) => (
              <span key={index} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs hover:bg-gray-600 transition-colors">
                <Tag size={12} className="mr-1" /> {tag}
              </span>
            ))}
            {list?.tags?.length > 3 && (
              <span className="bg-dark-4 text-light-2 px-3 py-1 rounded-full text-xs">
                +{list?.tags?.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {list?.Tags?.map((tag: string, index: number) => (
            <span
              key={`${tag}${index}`}
              onClick={() => navigate(`/categories/${tag}`)}
              className="bg-blue-800 text-blue-200 px-3 py-1 rounded-full text-xs cursor-pointer hover:bg-blue-700 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Locations */}
        {list?.locations?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {list?.locations?.map((location: any, index: number) => (
              <span key={index} className="flex items-center bg-gray-800 text-white px-3 py-1 rounded-full text-xs">
                <MapPin size={12} className="mr-1" /> {location}
              </span>
            ))}
          </div>
        )}

        {/* Timespans */}
        {list?.timespans?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {list?.timespans?.map((timespan: any, index: number) => (
              <span key={index} className="flex items-center bg-gray-800 text-white px-3 py-1 rounded-full text-xs">
                <Clock size={12} className="mr-1" /> {timespan}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
        <Button
          onClick={handleLikeList}
          className="flex items-center gap-2 bg-transparent hover:bg-dark-4 transition-colors"
        >
          <img
            src={checkIsLiked(likes, userId) ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
            alt="like"
            width={20}
            height={20}
            className="cursor-pointer"
          />
          <span className="text-light-2">{likes.length}</span>
        </Button>

        <Button
          onClick={handleSaveList}
          className="flex items-center gap-2 bg-transparent hover:bg-dark-4 transition-colors"
        >
          <Bookmark size={20} className={isSaved ? "text-primary-500 fill-primary-500" : "text-light-2"} />
          <span className="text-light-2">{isSaved ? "Saved" : "Save"}</span>
        </Button>

        <Button
          onClick={() => navigate(`/lists/${list?.$id}`)}
          className="flex items-center gap-2 bg-transparent hover:bg-dark-4 transition-colors"
        >
          <MessageCircle size={20} className="text-light-2" />
          <span className="text-light-2">{comments?.length || 0}</span>
        </Button>
      </div>

      {/* Comments */}
      <div className="p-6 border-t border-dark-4">
        <h3 className="text-lg font-semibold text-light-1 mb-4">Comments</h3>
        {comments && comments?.length > 0 ? (
          <ul className="space-y-4">
            {comments?.slice(0, 2).map((comment: any, index: number) => (
              <CommentWithActions key={index} comment={comment} />
            ))}
          </ul>
        ) : (
          <p className="text-light-3">What do you think? Comment below!</p>
        )}
        <Button
          onClick={() => navigate(`/lists/${list?.$id}`)}
          className="mt-4 text-blue-400 hover:underline"
        >
          View All Comments
        </Button>
      </div>
    </motion.div>
  );
};

export default ListCard2;
