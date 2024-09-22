import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";
import { UpdateCommentReply } from "@/lib/appwrite/api";
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
import { Heart, Bookmark, MessageSquare, Wand, Code, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { checkIsLiked } from "@/lib/utils";

interface ListStatsProps {
  setIsEmbed: (value: boolean) => void;
  list: any;
  userId: string;
  textSize?: string;
  backgroundColor?: string;
  isCreator: boolean;
}

const ListStats: React.FC<ListStatsProps> = ({
  setIsEmbed,
  list,
  userId,
  textSize = "text-base",
  backgroundColor = "bg-dark-3",
  isCreator
}) => {
  const navigate = useNavigate();
  const [likes, setLikes] = useState<string[]>(list?.Likes || []);
  const [isSaved, setIsSaved] = useState(false);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(true);
  const [areAllCommentsVisible, setAreAllCommentsVisible] = useState(false);
  const { mutate: likeList } = useLikeList();
  const { mutate: saveList } = useSaveList();
  const { user } = useUserContext();
  const { id } = user;
  const { mutate: deleteSaveList } = useDeleteSavedList();
  const { data: currentUser } = useGetUserById(id);
  const { data: comments, refetch: refetchComments } = useGetComments(list.$id);
  const [visibleComments, setVisibleComments] = useState<any>([]);
  const [newComment, setNewComment] = useState("");
  const { mutate: createComment } = useCreateComment();
  const [isReply, setIsReply] = useState(false);
  const [commentId, setCommentId] = useState("");

  useEffect(() => {
    setVisibleComments(areAllCommentsVisible ? comments : (comments?.slice(0, 3) || []));
  }, [comments, areAllCommentsVisible]);

  useEffect(() => {
    if (currentUser) {
      const savedListRecord = currentUser.save?.find(
        (record: any) => record.list?.$id === list.$id
      );
      setIsSaved(!!savedListRecord);
    }
  }, [currentUser, list.$id]);

  const handleLikeList = () => {
    const newLikes = likes.includes(userId)
      ? likes.filter((Id) => Id !== userId)
      : [...likes, userId];
    setLikes(newLikes);
    likeList({ listId: list.$id, likesArray: newLikes });
  };

  const handleSaveList = () => {
    if (isSaved) {
      const savedListRecord = currentUser?.save?.find(
        (record: any) => record.list.$id === list.$id
      );
      if (savedListRecord) {
        deleteSaveList(savedListRecord.$id);
      }
    } else {
      saveList({ userId: userId, listId: list.$id });
    }
    setIsSaved(!isSaved);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === "") return;

    try {
      if (isReply) {
        await UpdateCommentReply({
          userId: id,
          Content: newComment,
          commentId: commentId,
        });
      } else {
        await createComment({
          listId: list.$id,
          userId: id,
          Content: newComment,
        });
      }

      setNewComment("");
      setIsReply(false);
      refetchComments();
      toast({
        title: "Success",
        description: isReply ? "Reply added successfully" : "Comment posted successfully",
      });
    } catch (error) {
      console.error("Failed to post comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment or reply.",
        variant: "destructive",
      });
    }
  };
  const toggleCommentVisibility = () => {
    setAreAllCommentsVisible(!areAllCommentsVisible);
  };
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${backgroundColor} p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl`}
    >
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <Button
          variant="ghost"
          className="flex-1 flex items-center justify-center space-x-2"
          onClick={handleLikeList}
        >
          <Heart
            size={20}
            className={
              checkIsLiked(likes, userId) ? "fill-yellow-500 text-yellow-500" : ""
            }
          />
          <span className={textSize}>{likes.length}</span>
        </Button>

        <Button
          variant="ghost"
          className="flex-1 flex items-center justify-center space-x-2"
          onClick={handleSaveList}
        >
          <Bookmark size={20} className={isSaved ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} />
          <span className={textSize}>{isSaved ? "Saved" : "Save"}</span>
        </Button>

        <Button
          variant="ghost"
          className="flex-1 flex items-center justify-center space-x-2"
          onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
        >
          <MessageSquare size={20} className="text-gray-400" />
          <span className={textSize}>{comments?.length || 0}</span>
        </Button>

        <Button
          variant="ghost"
          className="flex-1 flex items-center justify-center space-x-2"
          onClick={() => navigate(`/remix/${list.$id}`)}
        >
          <Wand size={20} className="text-gray-400" />
          <span className={textSize}>Remix</span>
        </Button>

        {isCreator ? (
        <Button
          variant="ghost"
          className="flex-1 flex items-center justify-center space-x-2"
          onClick={() => setIsEmbed((prev) => !prev)}
        >
          <Code size={20} className="text-gray-400" />
          <span className={textSize}>Embed</span>
        </Button>
      ) : (
        <div 
          className="flex-1 flex items-center justify-center space-x-2 opacity-50 cursor-not-allowed"
          title="Only the creator can embed this list"
        >
          <Code size={20} className="text-gray-400" />
          <span className={textSize}>Embed</span>
        </div>
      )}
      </div>

      <AnimatePresence>
        {isCommentsExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <h3 className="text-xl font-semibold mb-4">Comments</h3>
            {comments?.length > 0 ? (
              <div className="space-y-4">
                {visibleComments.map((comment: any, index: number) => (
                  <Comment
                    key={index}
                    comment={comment}
                    setReply={setIsReply}
                    show="show"
                    setCommentId={setCommentId}
                  />
                ))}
                {comments.length > 3 && (
                  <div className="flex justify-between items-center mt-2">
                    <Button
                      variant="link"
                      onClick={toggleCommentVisibility}
                      className="text-blue-300 flex items-center"
                    >
                      {areAllCommentsVisible ? (
                        <>
                          <ChevronUp className="mr-2" size={16} />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-2" size={16} />
                          View {comments.length - 3} more comments
                        </>
                      )}
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => navigate(`/lists/${list.$id}`)}
                      className="text-blue-300 flex items-center"
                    >
                      View all comments <ExternalLink className="ml-2" size={16} />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className={`${textSize} text-gray-500`}>No comments yet. Be the first to comment!</p>
            )}
            <form onSubmit={handleCommentSubmit} className="mt-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={isReply ? "Write a reply..." : "Write a comment..."}
                className="w-full p-3 rounded-lg bg-dark-4 text-light-1 focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                rows={1}
              />
              <div className="flex gap-2 mt-2">
                <Button type="submit" variant="default">
                  {isReply ? "Post Reply" : "Post Comment"}
                </Button>
                {isReply && (
                  <Button onClick={() => setIsReply(false)} variant="outline">
                    Cancel Reply
                  </Button>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ListStats;