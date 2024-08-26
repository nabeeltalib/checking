import { Models } from "appwrite";
import { useState, useEffect } from "react";
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

const ListStats = ({ 
  list, 
  userId, 
  textSize = "text-base", 
  backgroundColor = "bg-dark-3" 
}: any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const likesList = list?.Likes || [];
  const [likes, setLikes] = useState<any[]>(likesList);
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

  useEffect(() => {
    setVisibleComments(() => (isExpanded ? comments : comments?.slice(0, 4)));
  }, [isExpanded, comments]);

  useEffect(() => {
    if (currentUser) {
      const savedListRecord = currentUser.save?.find(
        (record: Models.Document) => record.list.$id === list.$id
      );
      setIsSaved(!!savedListRecord);
    }
  }, [currentUser, list.$id]);

  const handleLikeList = async (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.stopPropagation();
    try {
      const newLikes = likes.includes(userId)
        ? likes.filter((Id) => Id !== userId)
        : [...likes, userId];
      setLikes(newLikes);
      likeList({ listId: list.$id, likesArray: newLikes });
    } catch (error) {
      console.error("Failed to like the list:", error);
      toast({
        title: "Error",
        description: "Failed to like the list.",
        variant: "destructive",
      });
    }
  };

  const handleSaveList = (e: any) => {
    e.stopPropagation();
    if (isSaved) {
      const savedListRecord = currentUser?.save?.find(
        (record: Models.Document) => record.list.$id === list.$id
      );
      if (savedListRecord) {
        deleteSaveList(savedListRecord.$id);
      }
    } else {
      saveList({ userId: userId, listId: list.$id });
    }
    setIsSaved(!isSaved);
  };

  const handleRemix = () => {
    navigate(`/remix/${list.$id}`);
  };

  const toggleComments = () => {
    setIsCommentsExpanded(!isCommentsExpanded);
  };

  const [newComment, setNewComment] = useState("");
  const { mutate: createComment } = useCreateComment();
  const [Reply, setReply] = useState(false);
  const [commentId, setCommentId] = useState("");

  const handleCommentSubmit = async (e: any) => {
    e.preventDefault();
    if (newComment.trim() === "") return;

    try {
      await createComment({
        listId: list.$id,
        userId: id,
        Content: newComment,
      });

      if (list.Likes) {
        for (let i of list.Likes) {
          await createNotification({
            userId: i,
            type: "list_comment",
            message: `${user.name} commented on list "${list.Title}"`,
          });
        }
      }

      for (const person of list.users) {
        await createNotification({
          userId: person.$id,
          type: "list_comment",
          message: `${user.name} commented on your list "${list.Title}"`,
        });
      }

      setNewComment("");
    } catch (error) {
      console.error("Failed to create comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment.",
        variant: "destructive",
      });
    }
  };

  const handleReply = async (e: any) => {
    e.preventDefault();
    if (newComment.trim() === "") return;

    try {
      await UpdateCommentReply({
        userId: id,
        Content: newComment,
        commentId: commentId,
      });

      if (list.Likes) {
        for (let i of list.Likes) {
          await createNotification({
            userId: i,
            type: "list_comment",
            message: `${user.name} replied on list "${list.Title}"`,
          });
        }
      }

      for (const person of list.users) {
        await createNotification({
          userId: person.$id,
          type: "list_comment",
          message: `${user.name} replied on comments of list "${list.Title}"`,
        });
      }

      setReply(false);
      setNewComment("");

      queryClient.invalidateQueries([QUERY_KEYS.GET_COMMENTS, list.$id]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reply.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`bg-dark-4 flex justify-center items-center w-full ${backgroundColor} p-1 rounded-lg shadow-md`}>
      <div className="flex flex-row flex-wrap justify-center items-center gap-3 w-full max-w-xl">
        <Button className="bg-dark-4 text-white flex flex-col items-center gap-1 py-2 px-4 rounded-lg">
          <img
            src={
              checkIsLiked(likes, userId)
                ? "/assets/icons/liked.svg"
                : "/assets/icons/like.svg"
            }
            alt="like"
            width={20}
            height={20}
            onClick={handleLikeList}
            className="cursor-pointer"
          />
          <p className={`${textSize} text-white text-center`}>{likes.length} Likes</p>
        </Button>

        <Button
          className="bg-dark-4 text-white flex flex-col items-center gap-1 py-2 px-4 rounded-lg"
          onClick={handleSaveList}>
          <img
            src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
            alt="save"
            width={20}
            height={20}
            className="cursor-pointer"
          />
          <p className={`${textSize} text-white text-center`}>
            {isSaved ? "Saved" : "Save"}
          </p>
        </Button>

        <Button
          className="bg-dark-4 text-white flex flex-col items-center gap-1 py-2 px-4 rounded-lg"
          onClick={toggleComments}>
          <img
            src="/assets/icons/chat.svg"
            alt="comment"
            width={20}
            height={20}
          />
          <p className={`${textSize} text-white text-center`}>
            {comments?.length} Comment
          </p>
        </Button>

        <Button
          className="bg-dark-4 text-white flex flex-col items-center gap-1 py-2 px-4 rounded-lg"
          onClick={handleRemix}>
          <img src="/assets/icons/remix2.svg" alt="remix" width={20} height={20} />
          <p className={`${textSize} text-white text-center`}>Remix</p>
        </Button>

        <Button
          onClick={() => navigate(`/update-list/${list?.$id}`)}
          className="bg-dark-4 text-white flex flex-col items-center gap-1 py-2 px-4 rounded-lg">
          <img
            src="/assets/icons/remix.svg"
            alt="collaborate"
            width={20}
            height={20}
          />
          <p className={`${textSize} text-white text-center`}>Collaborate</p>
        </Button>
      </div>
    </div>
  );
};

export default ListStats;
