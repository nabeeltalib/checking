import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetListById,
  useGetRelatedLists,
  useDeleteList,
  useGetUserById,
  useGetComments,
} from "@/lib/react-query/queries";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/shared";
import GridListList from "@/components/shared/GridListList";
import ListStats from "@/components/shared/ListStats";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { createEmbedList, followUser, getConnection, shareList, UnFollow } from "@/lib/appwrite/api";
import { Share2 } from "lucide-react";
import Comment from "@/components/shared/Comment"; // Assuming you have a Comment component

const ListDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useUserContext();
  const { toast } = useToast();
  const { data: list, isLoading } = useGetListById(id || "");
  const { mutateAsync: deleteList, isLoading: isDeleting } = useDeleteList();
  const { data: relatedLists, isLoading: isRelatedListsLoading } =
    useGetRelatedLists(id || "");
  const { data: listCreator, isLoading: isCreatorLoading } = useGetUserById(
    list?.creator.$id || ""
  );
  const { data: comments } = useGetComments(id || ""); // Fetch comments for the list
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const [connection, setConnection] = useState<any>(undefined);
  useEffect(() => {
    const fetchData = async () => {
      let list = await getListById(id);
      let resp = await getConnection(list.creator.$id);
      resp.length > 0 ? setConnection(resp[0]) : setConnection(resp);
    };

    fetchData();
  }, []);

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

  if (isLoading || isCreatorLoading) return <Loader />;
  if (!list || !listCreator)
    return <div className="text-center text-light-1">List not found</div>;

  let isOwnProfile = user.id === list.creator.$id;
  let isFollowed = connection?.follower?.some(
    (follow: any) => follow.$id === user.id
  );

  const handleFollow = async () => {
    setIsFollowLoading(true);
    await followUser(user.id, list.creator.$id);
    let resp = await getConnection(list.creator.$id);
    resp.length > 0 ? setConnection(resp[0]) : setConnection(resp);
    isFollowed = connection?.following?.some(
      (follow: any) => follow.$id === id
    );
    setIsFollowLoading(false);
  };

  const handleUnFollow = async () => {
    setIsFollowLoading(true);
    await UnFollow(user.id, list.creator.$id);
    let resp = await getConnection(list.creator.$id);
    resp.length > 0 ? setConnection(resp[0]) : setConnection(resp);
    isFollowed = connection?.following?.some(
      (follow: any) => follow.$id === id
    );
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

  let isCollaborator = list.users.some((collab:any) => collab.$id === user.id)

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
              src={
                listCreator.ImageUrl || "/assets/icons/profile-placeholder.svg"
              }
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
                className="text-xs border-2 border-white text-white  px-2 sm:px-3 py-2 rounded-xl"
                onClick={handleFollow}
                disabled={isFollowLoading}>
                {isFollowLoading ? (
                  <Loader />
                ) : (
                  <span>Follow</span>
                )}
              </Button>
            ) : isOwnProfile ? (
              ""
            ) : (
              <Button
                className="text-xs sm:text-sm bg-dark-4 text-gray-400 px-3 py-2 rounded-full"
                onClick={handleUnFollow}
                disabled={isFollowLoading}>
                {isFollowLoading ? (
                  <Loader />
                ) : (
                  <span>Unfollow</span>
                )}
              </Button>
            ))}
        </div>
        
        <h1 className="text-xl sm:text-3xl flex justify-between font-bold mb-4 text-center sm:text-left">

          <span className="text-wrap text-primary-500 ml-2">{list.Title}</span>
          <span>
                {(isOwnProfile || isCollaborator) && <Button onClick={handleEmbed}>add to embed</Button>}
          </span>
        </h1>
        {list.Description && (
          <p className="text-sm sm:text-base font-thin mb-6 text-gray-100 text-center sm:text-left">
            {list.Description}
          </p>
        )}

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {visibleItems?.map((item: any, index: number) => (
            <li
              key={index}
              className="p-4 bg-dark-3 rounded-lg shadow-md flex justify-between items-center hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <span className="w-8 h-6 sm:w-10 sm:h-8 bg-gray-800 rounded-full flex items-center justify-center text-light-1 font-light text-xs">
                  {index + 1}
                </span>
                <span className="text-light-1 text-sm sm:text-base">{item?.content || item}</span>
              </div>              
            </li>
          ))}
        </ul>

        {list.item.length > 4 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-500 font-semibold block mx-auto sm:mx-0">
            {isExpanded ? "Show Less" : "Show More"}
          </button>
        )}

        <div className="flex flex-wrap gap-2 mb-6 text-center sm:text-left">
          {list?.Tags?.map((tag: string, index: number) => (
            <span
              key={`${tag}${index}`}
              onClick={() => navigate(`/categories/${tag}`)}
              className="bg-gray-800 text-white px-2 py-1 rounded-full text-xs cursor-pointer shadow-md">
              #{tag}
            </span>
          ))}
        </div>

        <p className="text-light-3 text-sm sm:text-base mb-6">
          {formatDistanceToNow(new Date(list.$createdAt), { addSuffix: true })}
        </p>

        {list.locations.length > 0 && (
          <div className="text-sm sm:text-base text-blue-200 mb-4">
            <strong>Locations: </strong>
            {list.locations.map((location: any, index: number) => (
              <span key={index} className="mr-2">
                {location}
              </span>
            ))}
          </div>
        )}

        {list.timespans.length > 0 && (
          <div className="text-sm sm:text-base text-blue-200 mb-4">
            <strong>Timespans: </strong>
            {list.timespans.map((timespan: any, index: number) => (
              <span key={index} className="mr-2">
                {timespan}
              </span>
            ))}
          </div>
        )}

        <ListStats 
          list={list} 
          userId={user.id} 
          textSize="text-xs" // Adjust text size as needed
          backgroundColor="" // Adjust background color as needed
        />
        {list?.creator?.$id === user.id && (
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
        {/* Render the first two comments */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-2"> Comments:</h3>
          {comments && comments.slice(0, 2).map((comment, index) => (
            <div key={index} className="mb-4">
              <Comment comment={comment} />
            </div>
          ))}
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
