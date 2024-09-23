import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IList } from "@/types";
import { shareList } from "@/lib/appwrite/api";
import {
  Share2,
  MessageCircle,
  Bookmark,
  Wand,
  X,
  Crown,
  Heart,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  useGetComments,
  useSignInWithGoogle,
} from "@/lib/react-query/queries";
import Comment from "./Comment";
import { Button } from "../ui";
import Loader from "@/components/shared/Loader";
import Tooltip from "@/components/ui/Tooltip";
import { useToast } from "@/components/ui/use-toast";

type ListCardProps = {
  list: IList;
};

const ListCard: React.FC<ListCardProps> = ({ list }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: comments } = useGetComments(list.$id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    mutateAsync: signInWithGoogle,
    isLoading: isGoogleLoading,
  } = useSignInWithGoogle();

  // Assume the user is not authenticated for this example
  const isAuthenticated = false;

  // Since the user is not authenticated, isFollowed is false
  const isFollowed = false;
  const isFollowLoading = false;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSharing(true);
    try {
      const shareableLink = await shareList(list.$id);
      if (navigator.share) {
        await navigator.share({
          title: list.Title,
          text: `Check out this list: ${list.Title}`,
          url: shareableLink,
        });
      } else {
        await navigator.clipboard.writeText(shareableLink);
        toast({
          title: "Link copied",
          description: "The shareable link has been copied to your clipboard.",
          variant: "success",
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

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
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
        className="flex items-center mb-2 bg-gray-800 rounded-md p-3 hover:bg-gray-700 transition-colors duration-300"
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
                disabled={isSharing}
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
          <h2 className="text-yellow-500 text-xl font-bold mb-2">
            {list.Title}
          </h2>
        </div>
        {/* Description */}
        {list.Description && (
          <p className="text-light-2 text-sm mb-4">{list.Description}</p>
        )}
        {/* List Items */}
        <div onClick={handleDialogOpen} className="mb-4">
          <ol className="list-none space-y-3">{renderListItems()}</ol>
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
              className="bg-blue-800 text-blue-200 px-3 py-1 rounded-full text-xs cursor-pointer shadow-md hover:bg-blue-700 transition-colors"
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

        {/* Action Buttons */}
        <div className="px-6 py-4 flex justify-center items-center text-light-2 text-xs">
          <div className="flex space-x-2">
            <ActionButton
              icon={<Heart size={20} />}
              label="Like this list"
              count={list.Likes?.length || 0}
              onClick={handleDialogOpen}
            />
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
                <Wand size={20} />
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

      {/* Sign-up Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <motion.div
            className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-75 z-50 p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
          >
            <motion.div
              className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-md relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <button
                onClick={handleDialogClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>
              <h3
                id="dialog-title"
                className="text-2xl font-bold text-gray-800 mb-4 text-center"
              >
                Unlock Full Access!
              </h3>
              <p className="text-gray-600 mb-6 text-center">
                Sign up now to like, comment, save, and collaborate on lists.
                Create your own rankings and join the community!
              </p>
              <div className="space-y-4">
                <Button
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg transition-colors"
                  onClick={() => navigate("/sign-up")}
                >
                  Sign Up for Free
                </Button>
                <Button
                  className="w-full flex items-center justify-center bg-white text-gray-700 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <Loader />
                  ) : (
                    <>
                      <img
                        src="/assets/icons/google.svg"
                        alt="Google"
                        className="mr-2 h-5 w-5"
                      />
                      Continue with Google
                    </>
                  )}
                </Button>
                <p className="text-center text-sm text-gray-500">
                  Already have an account?{" "}
                  <button
                    className="text-primary-500 hover:underline font-semibold"
                    onClick={() => navigate("/sign-in")}
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ListCard;
