import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetListById,
  useGetRelatedLists,
  useDeleteList,
  useGetUserById,
  useGetComments,
  useCreateComment,
} from "@/lib/react-query/queries";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/shared";
import GridListList from "@/components/shared/GridListList";
import ListStats from "@/components/shared/ListStats";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { createEmbedList, followUser, getConnection, shareList, UnFollow } from "@/lib/appwrite/api";
import { motion } from "framer-motion";
import { Share2, Trophy } from "lucide-react";
import Comment from "@/components/shared/Comment";

const ListDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useUserContext();
  const { toast } = useToast();
  const { data: list, isLoading } = useGetListById(id || "");
  const { mutateAsync: deleteList, isLoading: isDeleting } = useDeleteList();
  const { data: relatedLists, isLoading: isRelatedListsLoading } = useGetRelatedLists(id || "");
  const { data: listCreator, isLoading: isCreatorLoading } = useGetUserById(list?.creator.$id || "");
  const { data: comments } = useGetComments(id || ""); 
  const { mutate: createComment, isLoading: isCreatingComment } = useCreateComment();

  const [newComment, setNewComment] = useState("");
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isEmbed, setIsEmbed] = useState(false)
  const [isStatic, setIsStatic] = useState(true)

  const [connection, setConnection] = useState<any>(undefined);
  const getRankColor = (index: number) => {
    const colors = ["text-yellow-500", "text-gray-400", "text-orange-500", "text-blue-500", "text-green-500"];
    return index < colors.length ? colors[index] : "text-purple-500";
  };
  useEffect(() => {
    const fetchConnection = async () => {
      if (listCreator?.$id) {
        const resp = await getConnection(listCreator.$id);
        setConnection(resp.length > 0 ? resp[0] : undefined);
      }
    };

    fetchConnection();
  }, [listCreator]);

  const [isExpanded, setIsExpanded] = useState(false);

  const visibleItems = useMemo(() => {
    if (!list) return [];
    return isExpanded ? list.item : list.item.slice(0, 4);
  }, [list, isExpanded]);

  const handleDeleteList = async () => {
    if (!id) return;
    try {
      await deleteList(id);
      toast({ title: "List deleted successfully!" });
      navigate(-1);
    } catch (error) {
      toast({ title: "Error deleting list", variant: "destructive" });
    }
  };

  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSharing(true);
    try {
      const shareableLink = await shareList(id);
      if (navigator.share) {
        await navigator.share({
          title: list?.Title,
          text: `Check out this list: ${list?.Title}`,
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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createComment({ listId: id!, userId: user.id, content: newComment });
      setNewComment("");
      toast({ title: "Comment added successfully", variant: "default" });
    } catch (error) {
      toast({ title: "Error adding comment", variant: "destructive" });
    }
  };

  if (isLoading || isCreatorLoading) return <Loader />;
  if (!list || !listCreator)
    return <div className="text-center text-light-1">List not found</div>;

  const isOwnProfile = user.id === list.creator.$id;
  const isFollowed = connection?.follower?.some((follow: any) => follow.$id === user.id);

  const updateConnection = async () => {
    const resp = await getConnection(list.creator.$id);
    setConnection(resp.length > 0 ? resp[0] : undefined);
  };

  const handleFollow = async () => {
    setIsFollowLoading(true);
    await followUser(user.id, list.creator.$id);
    await updateConnection();
    setIsFollowLoading(false);
  };

  const handleUnFollow = async () => {
    setIsFollowLoading(true);
    await UnFollow(user.id, list.creator.$id);
    await updateConnection();
    setIsFollowLoading(false);
  };

  const handleEmbed = async () => {
    try {
      await createEmbedList(list.$id, list.Categories[0] || "");
      toast({
        title: "Success!",
        description: `${list.Title} has been embedded successfully.`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to embed list ${list.Title}`,
        variant: "destructive",
      });
    }
  };

  const isCollaborator = list.users.some((collab: any) => collab.$id === user.id);
  
  let embedLink = isStatic ? `<iframe src="${import.meta.env.VITE_APP_DOMAIN}/staticframe/${list.$id}" width="50%" height="600"></iframe>`: `<iframe src="${import.meta.env.VITE_APP_DOMAIN}/liveframe/${list.$id}" width="50%" height="600"></iframe>`;
  
  console.log(list)

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto bg-dark-2 rounded-lg shadow-md p-4 sm:p-6">
      <div className="sticky top-0 z-10 bg-dark-3 p-4 border-b border-dark-4 rounded-t-lg flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-primary-500 font-bold text-lg">
          &larr; Back
        </button>
        <button
          onClick={handleShare}
          className="text-light-2 hover:text-primary-500 transition-colors p-2 rounded-full hover:bg-dark-3"
          disabled={isSharing}>
          <Share2 size={24} />
        </button>
      </div>

      <div className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="flex flex-col items-center sm:items-start">
            <img
              src={listCreator.ImageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="creator"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-lg"
            />
            <div className="flex flex-col items-center sm:items-start gap-1 mt-2 text-xs text-light-2">
              <span>{connection?.follower?.length || 0} Followers</span>
              <span>{connection?.following?.length || 0} Following</span>
            </div>
          </div>
          <div className="flex-grow text-center sm:text-left">
            <p className="text-lg sm:text-2xl font-semibold text-light-1">
              {listCreator.Name}
            </p>
            <p className="text-light-3 text-sm sm:text-base">@{listCreator.Username}</p>
            <Link
              to={`/profile/${listCreator.$id}`}
              className="text-primary-500 text-sm sm:text-base mt-2 block">
              View Profile
            </Link>
          </div>
          {listCreator.Public &&
            (!isFollowed && !isOwnProfile ? (
              <Button
                className="text-xs bg-primary-500 border-white text-white  px-2 sm:px-3 py-2 rounded-xl"
                onClick={handleFollow}
                disabled={isFollowLoading}>
                {isFollowLoading ? <Loader /> : <span>Follow</span>}
              </Button>
            ) : isOwnProfile ? null : (
              <Button
                className="border border-slate-300 text-xs sm:text-sm text-gray-400 px-3 py-2 rounded-xl"
                onClick={handleUnFollow}
                disabled={isFollowLoading}>
                {isFollowLoading ? <Loader /> : <span>Unfollow</span>}
              </Button>
            ))}
        </div>
        
        <div className="bg-dark-4 text-slate-700 text-center text-2xl sm:text-3xl font-thin px-4 py-1 rounded-t-lg" style={{ fontFamily: "'Racing Sans One', sans-serif" }}>
          Ranking For
        </div>
        <h1 className="text-base sm:text-2xl flex justify-between font-bold mb-4 text-center sm:text-left text-white px-1 py-3">
          <span className="text-wrap text-blue-300 ml-1">{list.Title}</span>
          
        </h1>
        


        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {visibleItems.map((item: any, index: number) => (
            <motion.li
              key={index}
              className="p-4 bg-dark-1 rounded-lg shadow-md flex items-center gap-4 hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className={`w-10 h-10 ${getRankColor(index)} rounded-full flex items-center justify-center text-xl font-bold`}>
                {index + 1}
                {index === 0 && <Trophy size={14} className="ml-1" />}
              </div>
              <span className="text-light-1 text-sm sm:text-base flex-1">{item?.content || item}</span>
            </motion.li>
          ))}
        </ul>

        {list.item.length > 4 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-500 font-semibold block mx-auto sm:mx-0">
            {isExpanded ? "Show Less" : "Show More"}
          </button>
        )}
      <div className="flex justify-between items-center">
          <div className="ml-auto relative group flex items-center">
            {(isOwnProfile || isCollaborator) && (
              <>                                
              </>
            )}
          </div>
        </div>
         <p className="text-light-3 text-sm sm:text-base mb-6 text-right">
          {formatDistanceToNow(new Date(list.$createdAt), { addSuffix: true })}
        </p> 
        {list.Description && (
            <p className="text-sm sm:text-base font-thin mb-6 text-gray-100 text-center sm:text-left px-4">
              {list.Description}
            </p>
          )}
     

      



        <div className="flex flex-wrap gap-2 mb-6 text-center sm:text-left">
          {list.Tags?.map((tag: string, index: number) => (
            <span
              key={`${tag}${index}`}
              onClick={() => navigate(`/categories/${tag}`)}
              className="bg-blue-800 text-blue-200 px-2 py-1 rounded-full text-xs cursor-pointer shadow-md">
              #{tag}
            </span>
          ))}
        </div>

        

        {list.locations.length > 0 && (
          <div className="text-sm sm:text-base mb-4">
            <strong>Locations: </strong>
            {list.locations.map((location: any, index: number) => (
              <span key={index} className="mr-2 bg-gray-800 text-white px-3 py-1 rounded-full  shadow-sm">
                {location}
              </span>
            ))}
          </div>
        )}

        {list.timespans.length > 0 && (
          <div className="text-sm sm:text-base mb-4">
            <strong>Timespans: </strong>
            {list.timespans.map((timespan: any, index: number) => (
              <span key={index} className="mr-2 bg-gray-800 text-white px-3 py-1 rounded-full  shadow-sm">
                {timespan}
              </span>
            ))}
          </div>
        )}

        <ListStats 
          list={list} 
          userId={user.id}
          setIsEmbed={setIsEmbed} 
          textSize="text-xs" // Adjust text size as needed
          backgroundColor="" // Adjust background color as needed
        />
        {isOwnProfile && (
          <div className="flex gap-4 mt-6 justify-center sm:justify-start">
            <Button
              onClick={() => navigate(`/update-list/${list?.$id}`)}
              className="text-xs border-2 border-gray-500 text-light-1 px-4 py-2 rounded-sm shadow-md">
              Edit List
            </Button>
            <Button
              onClick={handleDeleteList}
              className="text-xs bg-red-500 text-light-1 px-4 py-2 rounded-sm shadow-md"
              disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete List"}
            </Button>
          </div>
        )}
        <div className="">
        {isEmbed && <div className="flex flex-col gap-2">
          <h1 className="text-white text-xl font-bold">Embed Code</h1>
          <div className="flex justify-between">
            <div className="gap-2 flex">
            <button onClick={()=> setIsStatic(true)} className={`w-24 ${isStatic ? "bg-zinc-950 p-2 border-2 border-solid border-blue-950 rounded-xl": ""}`}>Static</button>
            <button onClick={()=> setIsStatic(false)} className={`w-24 ${!isStatic ? "bg-zinc-950 p-2 border-2 border-solid border-blue-950 rounded-xl": ""}`}>Live</button>
            </div>
            <Link to={"#"} className="text-sm underline text-blue-400" >What's the difference?</Link>
          </div>
          <div className="border-2 border-solid border-white p-2">
          {embedLink}
          </div>
          <Link to={`${import.meta.env.VITE_APP_DOMAIN}/embedpreview/${list.$id}`} className="flex justify-end text-blue-400 text-lg mr-3">See Preview</Link>
        </div>}
      </div>
        <div className="mt-6">
          {/*<h3 className="text-sm font-semibold text-gray-500 mb-2"> Comments:</h3>
          <form onSubmit={handleAddComment} className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-2  rounded-lg bg-gray-800 dark:text-white"
            />
            <button
              type="submit"
              className="mt-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              disabled={isCreatingComment}
            >
              {isCreatingComment ? <Loader /> : "Post Comment"}
            </button>
          </form>
          {comments?.map((comment, index) => (
            <div key={index} className="mb-4">
              <Comment comment={comment} />
            </div>
          ))}*/}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <h3 className="text-2xl font-bold text-light-1 mb-6 text-center sm:text-left">Related Lists</h3>
        {isRelatedListsLoading ? (
          <Loader />
        ) : relatedLists && relatedLists.length > 0 ? (
          <GridListList lists={relatedLists} />
        ) : (
          <p className="text-light-2 text-center sm:text-left">No related lists found</p>
        )}
      </div>
    </div>
  );
};

export default ListDetails;
