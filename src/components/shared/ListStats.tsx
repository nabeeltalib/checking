import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { Heart, Bookmark, MessageSquare, GitBranch, Users, Code } from "lucide-react";

interface ListStatsProps {
  setIsEmbed: (value: boolean) => void;
  list: any;
  userId: string;
  textSize?: string;
  backgroundColor?: string;
}

const ListStats: React.FC<ListStatsProps> = ({
  setIsEmbed,
  list,
  userId,
  textSize = "text-base",
  backgroundColor = "bg-dark-3"
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [likes, setLikes] = useState<string[]>(list?.Likes || []);
  const [isSaved, setIsSaved] = useState(false);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const { mutate: likeList } = useLikeList();
  const { mutate: saveList } = useSaveList();
  const { user } = useUserContext();
  const { id } = user;
  const { mutate: deleteSaveList } = useDeleteSavedList();
  const { data: currentUser } = useGetUserById(id);
  const { data: comments } = useGetComments(list.$id);
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleComments, setVisibleComments] = useState<any>([]);
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const { mutate: createComment } = useCreateComment();
  const [isReply, setIsReply] = useState(false);
  const [commentId, setCommentId] = useState("");

  useEffect(() => {
    setVisibleComments(isExpanded ? comments : comments?.slice(0, 4));
  }, [isExpanded, comments]);

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

      // Notification logic...

      setNewComment("");
      setIsReply(false);
      queryClient.invalidateQueries([QUERY_KEYS.GET_COMMENTS, list.$id]);
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

  return (
    <div className={`${backgroundColor} p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl`}>
      <div className="flex flex-wrap gap-4 mb-6">
        <Button
          variant="ghost"
          className="flex items-center space-x-2"
          onClick={handleLikeList}
        >
          <Heart
            size={20}
            className={checkIsLiked(likes, userId) ? "text-red-500 fill-red-500" : ""}
          />
          <span className={textSize}>{likes.length} Likes</span>
        </Button>

        <Button
          variant="ghost"
          className="flex items-center space-x-2"
          onClick={handleSaveList}
        >
          <Bookmark size={20} className={isSaved ? "text-yellow-500 fill-yellow-500" : ""} />
          <span className={textSize}>{isSaved ? "Saved" : "Save"}</span>
        </Button>

        <Button
          variant="ghost"
          className="flex items-center space-x-2"
          onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
        >
          <MessageSquare size={20} />
          <span className={textSize}>{comments?.length} Comments</span>
        </Button>

        <Button
          variant="ghost"
          className="flex items-center space-x-2"
          onClick={() => navigate(`/remix/${list.$id}`)}
        >
          <GitBranch size={20} />
          <span className={textSize}>Remix</span>
        </Button>

        <Button
          variant="ghost"
          className="flex items-center space-x-2"
          onClick={() => navigate(`/update-list/${list?.$id}`)}
        >
          <Users size={20} />
          <span className={textSize}>Collaborate</span>
        </Button>

        <Button
          variant="ghost"
          className="flex items-center space-x-2"
          onClick={() => setIsEmbed((prev) => !prev)}
        >
          <Code size={20} />
          <span className={textSize}>Embed</span>
        </Button>
      </div>

      {isCommentsExpanded && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Comments</h3>
          {comments?.length > 0 ? (
            <div className="space-y-4">
              {visibleComments?.map((comment: any, index: number) => (
                <Comment
                  key={index}
                  comment={comment}
                  setReply={setIsReply}
                  show="show"
                  setCommentId={setCommentId}
                />
              ))}
              {comments?.length > 4 && (
                <Button
                  variant="link"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2"
                >
                  {isExpanded ? "Show Less" : "Show More"}
                </Button>
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
              rows={3}
            />
            <Button type="submit" className="mt-2" variant="default">
              {isReply ? "Post Reply" : "Post Comment"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ListStats;