import { Models } from "appwrite";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { shareList } from "@/lib/appwrite/api";


import { checkIsLiked } from "@/lib/utils";
import {
  useLikeList,
  useSaveList,
  useDeleteSavedList,
  useGetCurrentUser,
  useGetComments, // Assuming you have a hook to fetch comments
  useGetUserById
} from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";
import { Share2 } from "lucide-react";

type ListStatsProps = {
  list: Models.Document;
  userId: string;
};

const ListStats = ({ list, userId }: ListStatsProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const likesList = list?.likes?.map((user: Models.Document) => user.$id) || [];

  const [likes, setLikes] = useState<string[]>(likesList);
  const [isSaved, setIsSaved] = useState(false);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false); 

  const { mutate: likeList } = useLikeList();
  const { mutate: saveList } = useSaveList();

  const { user } = useUserContext();
  const {id} = user;

  const { mutate: deleteSaveList } = useDeleteSavedList();
  const { data: currentUser } = useGetUserById(id);
  const { data: comments } = useGetComments(list.$id); 



  // useEffect(() => {
  //   if(currentUser){
  //     const savedListRecord = currentUser.save?.find(
  //       (record: Models.Document) => record.list.$id === list.$id
  //     );
  //     setIsSaved(!!savedListRecord);
  //   }
  // }, [currentUser, list.$id]);

  const handleLikeList = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.stopPropagation();
    let newLikes = likes.includes(userId)
      ? likes.filter((Id) => Id !== userId)
      : [...likes, userId];
    setLikes(newLikes);
    likeList({ listId: list.$id, likesArray: newLikes });
  };

  const handleSaveList = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    // if (isSaved) {
    //   const savedListRecord = currentUser?.save?.find(
    //     (record: Models.Document) => record.list.$id === list.$id
    //   );
    //   if (savedListRecord) {
    //     deleteSaveList(savedListRecord.$id);
    //   }
    // } else {
    //   saveList({ userId: userId, listId: list.$id });
    // }
    // setIsSaved(!isSaved);
  };

  const handleRemix = () => {
    navigate(`/remix/${list.$id}`);
  };

  const toggleComments = () => {
    setIsCommentsExpanded(!isCommentsExpanded);
  };

  const containerStyles = location.pathname.startsWith("/profile") ? "w-full" : "";

  const [isSharing, setIsSharing] = useState(false);
  

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
          url: shareableLink
        });
      } else {
        await navigator.clipboard.writeText(shareableLink);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error('Error sharing list:', error);
      alert("Failed to share list. Please try again.");
    } finally {
      setIsSharing(false);
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
      <button
              onClick={handleShare}
              className="text-light-2 hover:text-primary-500 transition-colors p-2 rounded-full hover:bg-dark-3"
              disabled={isSharing}
            >
              <Share2 size={24} />
      </button>
      <Button 
        className="bg-dark-3 text-white flex items-center gap-2 py-2 px-4 rounded-lg"
        onClick={handleRemix}
      >
        <img src="/assets/icons/remix.svg" alt="remix" width={20} height={20} />
        <p className="small-medium lg:base-medium">Remix</p>
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
              {comments.map((comment) => (

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
        </div>
      )}
    </div>
  );
};

export default ListStats;
