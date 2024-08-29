import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IList } from "@/types";
import { shareList } from "@/lib/appwrite/api";
import { Share2 } from "lucide-react";
import { useGetComments, useSignInWithGoogle } from "@/lib/react-query/queries";
import Comment from "./Comment";
import { Button } from "../ui";
import Loader from "@/components/shared/Loader";

type ListCardProps = {
  list: IList;
};

const ListCard: React.FC<ListCardProps> = ({ list }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: comments } = useGetComments(list.$id);
  const navigate = useNavigate();
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
          text: `Check out this list: ${list.title}`,
          url: shareableLink,
        });
      } else {
        await navigator.clipboard.writeText(shareableLink);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing list:", error);
      alert("Failed to share list. Please try again.");
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

  const renderListItems = () => {
    const items: any[] =
      Array.isArray(list.items) ? list.items : typeof list.items === "string"
        ? list.items.split("\n")
        : list.items ? Object.values(list.items) : [];

    return items.slice(0, 5).map((item, index) => (
      <li
        key={index}
        className="flex items-center mb-2 cursor-pointer bg-dark-1"
        onClick={handleDialogOpen}
      >
        <span className="text-sm flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-dark-4 text-blue-300 rounded-full flex items-center justify-center font-light mr-3">
          {index + 1}
        </span>
        <span className="text-sm sm:text-base text-light-1 text-ellipsis">
          {typeof item === "string" ? item : item.content || ""}
        </span>
      </li>
    ));
  };

  const renderComments = () => {
    if (!comments || comments.length === 0) return null;

    return (
      <div className="mt-4">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-500 mb-2">Comments:</h4>
        <ul>
          {comments.slice(0, 2).map((comment, index) => (
            <li key={index} className="mb-2">
              <Comment comment={comment} />
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      <motion.div
        className="bg-dark-3 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer w-full max-w-2xl mx-auto"
        whileHover={{ y: -5 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleDialogOpen}
      >
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <div className="flex items-center">
              <img
                src={list.creator?.ImageUrl || "/assets/icons/profile-placeholder.svg"}
                alt={`${list.creator?.Name}'s profile`}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-1 border-primary-500 shadow-lg"
              />
              <div className="ml-3">
                <p className="text-sm sm:text-base font-semibold text-light-1">{list.creator?.Name}</p>
                <p className="text-blue-300 text-xs sm:text-sm">@{list.creator?.Username}</p>
              </div>
            </div>
            <button
              onClick={handleShare}
              className={`text-light-2 hover:text-primary-500 transition-colors p-2 rounded-full hover:bg-dark-3 ${
                isSharing ? "cursor-not-allowed" : ""
              }`}
              disabled={isSharing}
              aria-label="Share this list"
            >
              <Share2 size={24} />
            </button>
          </div>
          <div className="bg-dark-4 text-slate-700 text-center text-2xl sm:text-xl font-thin px-4 py-1 rounded-t-lg" style={{ fontFamily: "'Racing Sans One', sans-serif" }}>
          Ranking For
        </div>
        <div className="cursor-pointer py-3">
            <span className="text-wrap text-sm sm:text-base font-semibold text-blue-300 ml-1">
              {list.Title}
            </span>
          </div>
          <div className="block" aria-label={`View details of list titled ${list.Title}`}>
            <ol className="list-none mb-6 space-y-3">{renderListItems()}</ol>
            {Array.isArray(list.items) && list.items.length > 5 && (
              <p className="text-gray-500 font-semibold text-xs sm:text-sm mb-4">
                + {list.items.length - 5} more items
              </p>
            )}
            
        {list.Description && (
            <p className="text-sm sm:text-base font-thin mb-6 text-gray-100 text-center sm:text-left px-4">
              {list.Description}
            </p>
          )}
            
            
            <div className="flex flex-wrap gap-2 mb-6 text-center sm:text-left">
          {list.Tags?.map((tag: string, index: number) => (
            <span
              key={`${tag}${index}`}
              
              className="bg-blue-800 text-blue-200 px-2 py-1 rounded-full text-xs cursor-pointer shadow-md">
              #{tag}
            </span>
          ))}
        </div>
          {list.locations.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {list.locations.map((location: any, index: number) => (
            <span
              key={index}
              className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs sm:text-sm shadow-sm"
            >
              {location}
            </span>
          ))}
        </div>
)}

{list.timespans.length > 0 && (
  <div className="flex flex-wrap gap-2">
    {list.timespans.map((timespan: any, index: number) => (
      <span
        key={index}
        className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs sm:text-sm shadow-sm"
      >
        {timespan}
      </span>
    ))}
  </div>
)}

          </div>
          <div className="bg-dark-3 px-4 sm:px-6 py-1 flex justify-between items-center text-light-2 text-xs">
            <span className="flex flex-col items-center gap-1 py-2 px-2 rounded-lg">
              <img src="/assets/icons/like.svg" alt="Likes" className="w-4 h-4" />
              <p>{list.Likes?.length || 0} Likes</p>
            </span>
            <span className="flex flex-col items-center gap-1 py-2 px-2 rounded-lg">
              <img src="/assets/icons/comment.svg" alt="Comments" className="w-4 h-4" />
              <p>{comments?.length || 0} Comments</p>
            </span>
          </div>
          {renderComments()}
        </div>
      </motion.div>

      {isDialogOpen && (
        <motion.div
          className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-75 z-50 p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="relative bg-white p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-md md:max-w-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={handleDialogClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Welcome Back!</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Sign in to continue and access all features.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Button
                type="button"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out"
                onClick={() => navigate("/sign-up")}
              >
                Sign Up
              </Button>
              <Button
                className="flex items-center justify-center bg-white text-gray-700 border border-gray-300 px-4 sm:px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out hover:bg-gray-100"
                onClick={handleGoogleSignIn}
              >
                {isGoogleLoading ? <Loader /> : (
                  <>
                    <img src="/assets/icons/google.svg" alt="Google" className="mr-2 h-5 w-5" />
                    Sign In with Google
                  </>
                )}
              </Button>
              <Button
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
                onClick={() => navigate("/sign-in")}
              >
                Sign In with Email
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default ListCard;
