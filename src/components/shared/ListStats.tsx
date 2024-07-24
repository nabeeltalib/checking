import { Models } from "appwrite";
import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { createNotification } from "@/lib/appwrite/api";


import { checkIsLiked } from "@/lib/utils";
import {
  useLikeList,
  useSaveList,
  useDeleteSavedList,
  useGetCurrentUser,
  useGetComments, // Assuming you have a hook to fetch comments
  useGetUserById,
  useCreateComment,
  useAnalyzeSentiment
} from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";
import { toast } from "../ui";

type ListStatsProps = {
  list: Models.Document;
  userId: string;
};

const ListStats = ({ list, userId }: any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const likesList = list?.Likes || [];
  
  const [likes, setLikes] = useState<any[]>(likesList);
  const [isSaved, setIsSaved] = useState(false);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false); 

  const { mutate: likeList } = useLikeList();
  const { mutate: saveList } = useSaveList();

  const { user } = useUserContext();
  const {id} = user;

  const { mutate: deleteSaveList } = useDeleteSavedList();
  const { data: currentUser } = useGetUserById(id);
  const { data: comments } = useGetComments(list.$id); 
  const [isExpanded, setIsExpanded] = useState(false)
  const [visibleComments, setVisibleComments] = useState<any>([])

  useEffect(() => {
    setVisibleComments(()=> isExpanded ? comments : comments?.slice(0, 4));
  }, [isExpanded,comments]);

  useEffect(() => {
    if(currentUser){
      const savedListRecord = currentUser.save?.find(
        (record: Models.Document) => record.list.$id === list.$id
      );
      setIsSaved(!!savedListRecord);
    }
  }, [currentUser, list.$id]);

  const handleLikeList = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.stopPropagation();
    let newLikes = likes.includes(userId)
      ? likes.filter((Id) => Id !== userId)
      : [...likes, userId];
    setLikes(newLikes);
    likeList({ listId: list.$id, likesArray: newLikes });
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

  const containerStyles = location.pathname.startsWith("/profile") ? "w-full" : "";

  const [newComment, setNewComment] = useState("");
  const { mutate: createComment } = useCreateComment();
  const handleCommentSubmit = async (e:any) => {
    e.preventDefault();
    if (newComment.trim() === "") return;

    try {
      await createComment({
        listId: list.$id,
        userId: id,
        Content: newComment,
      });

     const respones =  await createNotification({
        userId: list.userId,
        type: "list_comment",
        message:`${user.name} commented on your list "${list.Title}"`,
      })

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


  return (
    <div className={`flex flex-row flex-wrap w-full items-center z-20 gap-3 ${containerStyles}`}>
      <Button className="bg-dark-3 text-white flex items-center gap-2 py-2 px-4 rounded-lg">
        <img
          src={checkIsLiked(likes, userId) ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
          alt="like"
          width={20}
          height={20}
          onClick={handleLikeList}
          className="cursor-pointer"
        />
        <p className="small-medium lg:base-medium">{likes.length} Likes</p>
      </Button>
      <Button
        className="bg-dark-3 text-white flex items-center gap-2 py-2 px-4 rounded-lg"
        onClick={handleSaveList}
      >
        <img
          src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
          alt="save"
          width={20}
          height={20}
          className="cursor-pointer"
        />
        <p className="small-medium lg:base-medium">
          {isSaved ? "Saved" : "Save"}
        </p>
      </Button>
      <Button 
        className="bg-dark-3 text-white flex items-center gap-2 py-2 px-4 rounded-lg"
        onClick={toggleComments}
      >
        <img src="/assets/icons/chat.svg" alt="comment" width={20} height={20} />
        <p className="small-medium lg:base-medium">{comments?.length} Comment</p>
      </Button>
      <Button 
        className="bg-dark-3 text-white flex items-center gap-2 py-2 px-4 rounded-lg"
        onClick={handleRemix}
      >
        <img src="/assets/icons/remix.svg" alt="remix" width={20} height={20} />
        <p className="small-medium lg:base-medium">Create Alternative</p>
      </Button>
      <Button className="bg-dark-3 text-white flex items-center gap-2 py-2 px-4 rounded-lg">
        <img src="/assets/icons/people.svg" alt="collaborate" width={20} height={20} />
        <p className="small-medium lg:base-medium">Collaborate</p>
      </Button>

      {/* Collapsible Comments Section */}
      {isCommentsExpanded && (
        <div className="w-full mt-4 p-4 border-t border-gray-300">
          <h3 className="text-lg font-semibold">Comments:</h3>
          {comments?.length > 0 ? (
            <ul>
              {visibleComments?.map((comment) => (

                <li key={comment.$id} className="py-2 border-b border-gray-200 flex gap-2 items-center">
                  <img src={comment.user.ImageUrl} alt="userImage" width={30} />
                  <span>{comment.user.Name}: </span>
                  <span className="text-sm">{comment.Content}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No comments yet.</p>
          )}

          {comments?.length > 4 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-500"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
            )}

            {<form onSubmit={handleCommentSubmit} className="mt-4 mb-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-2 border rounded-lg bg-zinc-900 :text-white"
              />
              <button
                type="submit"
                className="mt-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                Add a Comment
              </button>
            </form>}
        </div>
      )}
    </div>
  );
};

export default ListStats;
