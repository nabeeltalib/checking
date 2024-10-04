import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IList } from "@/types";
import { shareList } from "@/lib/appwrite/api";
import {
  Share2,
  MessageCircle,
  Bookmark,
  Redo2,
  MapPin, 
  Clock,
  Crown,
  ThumbsUp,
  ThumbsDown, 
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  useGetComments,
  useSignInWithGoogle,
} from "@/lib/react-query/queries";
import Comment from "./Comment";
import { Button } from "../ui";
import Tooltip from "@/components/ui/Tooltip";
import { useToast } from "@/components/ui/use-toast";
import SignInDialog from '@/components/shared/SignInDialog';
import { useShareDialog } from '@/components/shared/ShareDialogContext';

type ListCardProps = {
  list: IList;
};

const ListCard: React.FC<ListCardProps> = ({ list }) => {
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: comments } = useGetComments(list.$id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    mutateAsync: signInWithGoogle,
    isLoading: isGoogleLoading,
  } = useSignInWithGoogle();
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };
  // Assume the user is not authenticated for this example
  const isAuthenticated = false;

  // Since the user is not authenticated, isFollowed is false
  const isFollowed = false;
  const isFollowLoading = false;

  const { openShareDialog } = useShareDialog();

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const shareableLink = await shareList(list.$id);
      if (isMobile() && navigator.share) {
        await navigator.share({
          title: list.Title,
          text: `Check out this list: ${list.Title}`,
          url: shareableLink,
        });
      } else {
        openShareDialog(shareableLink, list.Title);
      }
    } catch (error) {
      console.error("Error sharing list:", error);
      toast({
        title: "Error",
        description: "Failed to share list. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDialogOpen = () => {
    setIsSignInDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsSignInDialogOpen(false);
  };

  const handleGoogleSignIn = () => {
    signInWithGoogle();
  };

  // Since the user is not authenticated, clicking follow opens the dialog
  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleDialogOpen();
  };

  const handleUnFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleDialogOpen();
  };

  const getRankColor = (index: number) => {
    const colors = [
      "text-yellow-300",
      "text-gray-400",
      "text-orange-500",
      "text-blue-500",
      "text-green-500",
    ];
    return index < colors.length ? colors[index] : "text-purple-500";
  };

  const renderListItems = () => {
    const items: any[] = Array.isArray(list.items)
      ? list.items
      : typeof list.items === "string"
      ? list.items.split("\n")
      : list.items
      ? Object.values(list.items)
      : [];

    const displayItems = isExpanded ? items : items.slice(0, 5);

    return displayItems.map((item, index) => (
      <motion.li
        key={index}
        className="flex items-center mb-2 bg-gray-900 rounded-md p-0 hover:bg-gray-700 transition-colors duration-300"
        onClick={() => {
          if (!isAuthenticated) {
            handleDialogOpen();
          } else {
            navigate(`/lists/${list.$id}`);
          }
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <div
          className={`flex-shrink-0 w-8 h-8 ${getRankColor(
            index
          )} flex items-center justify-center font-bold mr-3`}
        >
          <span className="text-sm">{index + 1}</span>
          {index === 0 && <Crown size={12} className="ml-1" />}
        </div>
        <span className="text-sm text-white truncate">
          {typeof item === "string" ? item : item.content || ""}
        </span>
      </motion.li>
    ));
  };

  const ActionButton = ({ icon, label, count, onClick }) => (
    <Tooltip content={label}>
      <Button
        onClick={onClick}
        className="flex items-center gap-2 bg-transparent hover:bg-dark-4 transition-colors text-light-2 px-3 py-2 rounded-lg"
      >
        {icon}
        {count !== undefined && <span className="text-xs">{count}</span>}
      </Button>
    </Tooltip>
  );

  return (
    <motion.div
      className="bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 mb-4"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
        {/* Creator Info */}
        <div className="flex justify-between items-center mb-6">
          {/* Left side: Creator info */}
          <div
            className="flex items-center cursor-pointer group"
            onClick={handleDialogOpen}
          >
            <img
              src={
                list.creator?.ImageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt={`${list.creator?.Name}'s profile`}
              className="w-10 h-10 rounded-full mr-3 border-2 border-transparent group-hover:border-primary-500 transition-all duration-300"
            />
            <div className="ml-3">
              <p className="text-white font-semibold group-hover:text-primary-500 transition-colors duration-300">
                {list.creator?.Name}
              </p>
              <p className="text-gray-400 text-sm">@{list.creator?.Username}</p>
            </div>
          </div>
          {/* Right side: Follow and Share buttons */}
          <div className="flex items-center">
            <Button
              className={`text-sm px-4 py-2 rounded-full transition-colors duration-300 ${
                isFollowed
                  ? "text-gray-400 hover:text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1 rounded-full mr-2"
              }`}
              onClick={isFollowed ? handleUnFollow : handleFollow}
              disabled={isFollowLoading}
            >
              {isFollowed ? "Following" : "Follow"}
            </Button>
            <Tooltip content="Share this list">
              <button
                onClick={handleShare}
                className="text-light-2 hover:text-primary-500 transition-colors p-2 rounded-full hover:bg-dark-3"
                aria-label="Share this list"
              >
                <Share2 size={24} />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* List Title */}
        <div className="mb-4">
          <div
            className="text-slate-700 text-center text-xl sm:text-xl font-thin px-4 py-2 rounded-t-lg"
            style={{ fontFamily: "'Racing Sans One', sans-serif" }}
          >
            Ranking For
          </div>
          <h2 className="text-yellow-200 text-xl font-bold mb-2">
            {list.Title}
          </h2>
        </div>
        {/* Description */}
        {list.Description && (
          <p className="text-light-2 text-sm mb-4">{list.Description}</p>
        )}
        {/* List Items */}
        <div onClick={handleDialogOpen} className="mb-4">
          <ol className="list-none space-y-2">{renderListItems()}</ol>
          {list.items && list.items.length > 3 && (
            <motion.button
              className="w-full text-primary-500 font-semibold text-sm mt-2 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isExpanded ? (
                <>
                  Show Less <ChevronUp size={16} className="ml-1" />
                </>
              ) : (
                <>
                  Show More <ChevronDown size={16} className="ml-1" />
                </>
              )}
            </motion.button>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {list.Tags?.slice(0, 3).map((tag: string, index: number) => (
            <motion.span
              key={`${tag}${index}`}
              className="bg-gray-800 text-blue-200 px-3 py-1 rounded-full text-xs cursor-pointer shadow-md hover:bg-blue-700 transition-colors"
              onClick={handleDialogOpen}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              #{tag}
            </motion.span>
          ))}
          {list.Tags && list.Tags.length > 3 && (
            <motion.span
              className="text-primary-500 text-xs cursor-pointer"
              onClick={handleDialogOpen}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              +{list.Tags.length - 3} more tags
            </motion.span>
          )}
          
        </div>
        <div>
          {/* Locations and Timespans */}
          {list.locations && list.locations.length > 0 && (
            <div className="flex items-center text-light-3 text-sm mb-2">
              <MapPin size={16} className="mr-2" />
              {list.locations.join(", ")}
            </div>
          )}

          {list.timespans && list.timespans.length > 0 && (
            <div className="flex items-center text-light-3 text-sm">
              <Clock size={16} className="mr-2" />
              {list.timespans.join(", ")}
            </div>
          )}
        </div>
        {/* Action Buttons */}
        <div className="px-6 py-4 flex justify-center items-center text-light-2 text-xs">
          <div className="flex space-x-2">
          <div className="flex items-center space-x-1">
          <ActionButton
              icon={<ThumbsUp size={20} />}
              label="Love it"
              count={list.Likes?.length || 0}
              onClick={handleDialogOpen}
            />
            <ActionButton
              icon={<ThumbsDown size={20} />}
              label="Boo"
              onClick={handleDialogOpen}
            />
            </div>
            <ActionButton
              icon={<MessageCircle size={20} />}
              label="Comment on this list"
              count={comments?.length || 0}
              onClick={handleDialogOpen}
            />
            <ActionButton
              icon={<Bookmark size={20} />}
              label="Save this list"
              onClick={handleDialogOpen}
            />
            <Tooltip content="Remix this list">
              <Button
                onClick={handleDialogOpen}
                className="flex items-center gap-2 bg-transparent hover:bg-dark-4 transition-colors text-light-2 px-3 py-2 rounded-lg"
              >
                <Redo2 size={20} />
                <span>Remix</span>
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Comment Section with Clickable Overlay */}
        {comments && comments.length > 0 && (
          <div
            className="mb-4 p-4 rounded-lg cursor-pointer"
            onClick={handleDialogOpen}
          >
            <h3 className="text-sm font-semibold text-light-1 mb-2">
              Latest Comment:
            </h3>
            <Comment comment={comments[0]} />
            {comments.length > 1 && (
              <p className="text-xs text-primary-500 mt-2 cursor-pointer hover:underline">
                View all {comments.length} comments
              </p>
            )}
          </div>
        )}
      </div>

      {/* Sign-in Dialog */}
      <SignInDialog isOpen={isSignInDialogOpen} onClose={handleDialogClose} />
    </motion.div>
  );
};

export default ListCard;