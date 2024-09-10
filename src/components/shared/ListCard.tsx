import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IList } from "@/types";
import { shareList } from "@/lib/appwrite/api";
import { Share2, ThumbsUp, MessageCircle, Bookmark, Lightbulb, X, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { useGetComments, useSignInWithGoogle } from "@/lib/react-query/queries";
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
  const { mutateAsync: signInWithGoogle, isLoading: isGoogleLoading } = useSignInWithGoogle();

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSharing(true);
    try {
      const shareableLink = await shareList(list.$id);
      if (navigator.share) {
        await navigator.share({
          title: list.title,
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
  const getRankColor = (index: number) => {
    const colors = ["text-yellow-500", "text-gray-400", "text-orange-500", "text-blue-500", "text-green-500"];
    return index < colors.length ? colors[index] : "text-purple-500";
  };

  const renderListItems = () => {
    const items: any[] =
      Array.isArray(list.items) ? list.items : typeof list.items === "string"
        ? list.items.split("\n")
        : list.items ? Object.values(list.items) : [];

    const displayItems = isExpanded ? items : items.slice(0, 3);

    return displayItems.map((item, index) => (
      <motion.li
        key={index}
        className="flex items-center mb-3 cursor-pointer bg-dark-3 p-3 rounded-lg hover:bg-dark-4 transition-colors duration-200"
        onClick={() => {
          if (!list.isAuthenticated) {
            handleDialogOpen();
          } else {
            navigate(`/lists/${list.$id}`);
          }
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <div className={`flex-shrink-0 w-8 h-8 ${getRankColor(index)} bg-dark-2 rounded-full flex items-center justify-center font-bold mr-3`}>
          <span className="text-sm">{index + 1}</span>
          {index === 0 && <Trophy size={12} className="ml-1" />}
        </div>
        <span className="text-sm sm:text-base text-light-1 text-ellipsis">
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
      className="bg-dark-2 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
        {/* Creator Info */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center cursor-pointer group" onClick={handleDialogOpen}>
            <img
              src={list.creator?.ImageUrl || "/assets/icons/profile-placeholder.svg"}
              alt={`${list.creator?.Name}'s profile`}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-primary-500 shadow-lg group-hover:border-primary-600 transition-colors"
            />
            <div className="ml-3">
              <p className="text-sm sm:text-base font-semibold text-light-1 group-hover:text-primary-500 transition-colors">{list.creator?.Name}</p>
              <p className="text-blue-300 text-xs sm:text-sm">@{list.creator?.Username}</p>
            </div>
          </div>
          <Tooltip content="Share this list">
            <button
              onClick={handleShare}
              className="text-light-2 hover:text-primary-500 transition-colors p-2 rounded-full hover:bg-dark-4"
              disabled={isSharing}
              aria-label="Share this list"
            >
              <Share2 size={24} />
            </button>
          </Tooltip>
        </div>

        {/* List Title */}
        <div className="text-center mb-4">
          <div className="text-slate-700 text-center text-xl sm:text-xl font-thin px-4 py-2 rounded-t-lg" style={{ fontFamily: "'Racing Sans One', sans-serif" }}>
            Ranking For
          </div>
          <h2 className="text-blue-300 text-lg sm:text-xl font-bold mt-2">
            {list.Title}
          </h2>
        </div>

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

        {/* Description */}
        {list.Description && (
          <p className="text-sm sm:text-base text-light-2 mb-4 line-clamp-2 hover:line-clamp-none transition-all duration-300">
            {list.Description}
          </p>
        )}

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

        {/* First Comment */}
        {comments && comments.length > 0 && (
          <div className="mb-4 bg-dark-3 p-4 rounded-lg hover:bg-dark-4 transition-colors duration-200">
            <h3 className="text-sm font-semibold text-light-1 mb-2">Latest Comment:</h3>
            <Comment comment={comments[0]} />
            {comments.length > 1 && (
              <p className="text-xs text-primary-500 mt-2 cursor-pointer hover:underline" onClick={handleDialogOpen}>
                View all {comments.length} comments
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-dark-3 px-4 sm:px-6 py-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <ActionButton
            icon={<ThumbsUp size={20} />}
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
          <ActionButton
            icon={<Lightbulb size={20} />}
            label="Remix this list"
            onClick={handleDialogOpen}
          />
        </div>
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
              <h3 id="dialog-title" className="text-2xl font-bold text-gray-800 mb-4 text-center">
                Unlock Full Access!
              </h3>
              <p className="text-gray-600 mb-6 text-center">
                Sign up now to like, comment, save, and collaborate on lists. Create your own rankings and join the community!
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
                      <img src="/assets/icons/google.svg" alt="Google" className="mr-2 h-5 w-5" />
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