import React, { useState, useEffect } from "react";
import { Models } from "appwrite";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Tooltip from '@/components/ui/Tooltip';
import { createNotification, UpdateCommentReply } from "@/lib/appwrite/api";
import { useQueryClient } from "@tanstack/react-query";
import {
  useLikeList,
  useSaveList,
  useDeleteSavedList,
  useGetComments,
  useGetUserById,
  useCreateComment,
} from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";
import { toast } from "../ui";
import Comment from "./Comment";
import { QUERY_KEYS } from "@/lib/react-query/queryKeys";
import { checkIsLiked } from "@/lib/utils";

const ListStats = ({
  setIsEmbed, 
  list, 
  userId, 
  textSize = "text-sm md:text-base", 
  backgroundColor = "bg-dark-2" 
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUserContext();
  const { id } = user;

  const [likes, setLikes] = useState(list?.Likes || []);
  const [isSaved, setIsSaved] = useState(false);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleComments, setVisibleComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showLabels, setShowLabels] = useState(false);

  const { mutate: likeList } = useLikeList();
  const { mutate: saveList } = useSaveList();
  const { mutate: deleteSaveList } = useDeleteSavedList();
  const { data: currentUser } = useGetUserById(id);
  const { data: comments } = useGetComments(list?.$id);
  const { mutate: createComment } = useCreateComment();

  useEffect(() => {
    setVisibleComments(() => (isExpanded ? comments : comments?.slice(0, 3)));
  }, [isExpanded, comments]);

  useEffect(() => {
    if (currentUser) {
      const savedListRecord = currentUser.save?.find(
        (record: Models.Document) => record.list.$id === list?.$id
      );
      setIsSaved(!!savedListRecord);
    }
  }, [currentUser, list?.$id]);

  const handleLikeList = (e) => {
    e.stopPropagation();
    const newLikes = likes.includes(userId)
      ? likes.filter((Id) => Id !== userId)
      : [...likes, userId];
    setLikes(newLikes);
    likeList({ listId: list?.$id, likesArray: newLikes });
  };

  const handleSaveList = (e) => {
    e.stopPropagation();
    if (isSaved) {
      const savedListRecord = currentUser?.save?.find(
        (record: Models.Document) => record.list.$id === list?.$id
      );
      if (savedListRecord) {
        deleteSaveList(savedListRecord.$id);
      }
    } else {
      saveList({ userId: userId, listId: list?.$id });
    }
    setIsSaved(!isSaved);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim() === "") return;

    try {
      await createComment({
        listId: list?.$id,
        userId: id,
        Content: newComment,
      });
      setNewComment("");
      queryClient.invalidateQueries([QUERY_KEYS.GET_COMMENTS, list?.$id]);
    } catch (error) {
      console.error("Failed to create comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment.",
        variant: "destructive",
      });
    }
  };

  if (!list) {
    return null; // or some loading state
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full ${backgroundColor} p-4 rounded-lg shadow-lg`}
    >
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <div className="flex flex-wrap gap-2">
          <ActionIcon
            icon={checkIsLiked(likes, userId) ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
            onClick={handleLikeList}
            isActive={checkIsLiked(likes, userId)}
            label="Like"
            showLabel={showLabels}
          />
          <ActionIcon
            icon="/assets/icons/chat.svg"
            onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
            label="Comment"
            showLabel={showLabels}
          />
          <ActionIcon
            icon="/assets/icons/remix2.svg"
            onClick={() => navigate(`/remix/${list.$id}`)}
            label="Remix"
            showLabel={showLabels}
          />
          <ActionIcon
            icon="/assets/icons/remix.svg"
            onClick={() => navigate(`/update-list/${list.$id}`)}
            label="Collaborate"
            showLabel={showLabels}
          />
        </div>
        <div className="flex space-x-4">
          <ActionIcon
            icon={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
            onClick={handleSaveList}
            isActive={isSaved}
            label={isSaved ? "Saved" : "Save"}
            showLabel={showLabels}
          />
          <ActionIcon
            icon="/assets/icons/embed.svg"
            onClick={() => setIsEmbed((prev) => !prev)}
            label="Embed"
            showLabel={showLabels}
          />
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className={`${textSize} font-semibold`}>
          {likes.length} {likes.length === 1 ? 'like' : 'likes'}
        </div>
        <Button
          onClick={() => setShowLabels(!showLabels)}
          className="text-primary-500 hover:text-primary-600 text-xs"
        >
          {showLabels ? "Hide labels" : "Show labels"}
        </Button>
      </div>

      <AnimatePresence>
        {isCommentsExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            {comments?.length > 0 ? (
              <ul className="space-y-2 mb-4">
                {visibleComments?.map((comment, index) => (
                  <Comment
                    key={index}
                    setReply={() => {}}
                    show="show"
                    setCommentId={() => {}}
                    comment={comment}
                  />
                ))}
              </ul>
            ) : (
              <p className={`${textSize} text-gray-500 mb-4`}>No comments yet. Be the first to comment!</p>
            )}

            {comments?.length > 3 && (
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-primary-500 hover:text-primary-600 mb-4"
              >
                {isExpanded ? "Show less" : `View all ${comments.length} comments`}
              </Button>
            )}

            <form onSubmit={handleCommentSubmit} className="flex items-center">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-grow p-2 border-none rounded-lg bg-dark-3 text-light-1 focus:ring-2 focus:ring-primary-500"
              />
              <Button
                type="submit"
                className="ml-2 bg-primary-500 text-white hover:bg-primary-600"
              >
                Post
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ActionIcon = ({ icon, onClick, isActive = false, label, showLabel }) => (
  <div className="relative inline-flex items-center">
    <Tooltip content={label} position="top">
      <button
        onClick={onClick}
        className={`p-2 rounded-full transition-colors flex items-center ${
          isActive ? 'text-primary-500' : 'text-light-2 hover:bg-dark-3'
        }`}
      >
        <img src={icon} alt={label} width={24} height={24} className="object-contain" />
        {showLabel && (
          <span className="ml-1 text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px] sm:max-w-none">
            {label}
          </span>
        )}
      </button>
    </Tooltip>
  </div>
);

export default ListStats;