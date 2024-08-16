import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetListById,
  useGetRelatedLists,
  useDeleteList,
  useGetUserById,
} from "@/lib/react-query/queries";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/shared";
import GridListList from "@/components/shared/GridListList";
import ListStats from "@/components/shared/ListStats";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { followUser, getConnection, shareList, UnFollow } from "@/lib/appwrite/api";
import { Share2 } from "lucide-react";
import { getListById } from "@/lib/appwrite/config";

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

  const [connection, setConnection] = useState<any>(undefined)
  useEffect(()=>{
    const fetchData =async ()=>{
      let list = await getListById(id)
      let resp = await getConnection(list.creator.$id)
      resp.length > 0 ? setConnection(resp[0]) : setConnection(resp) 
    }

    fetchData()
  },[])

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
  let isFollowed = connection?.follower?.some((follow:any) => follow.$id === user.id);

  const handleFollow = async () =>{
    await followUser(user.id,list.creator.$id)
    let resp = await getConnection(user.id)
    resp.length > 0 ? setConnection(resp[0]) : setConnection(resp)
    isFollowed = connection?.following?.some((follow:any) => follow.$id === id)
}

const handleUnFollow = async ()=>{
  await UnFollow(user.id, list.creator.$id)
  isFollowed = false
}

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 bg-dark-1 p-4 border-b border-dark-4">
        <button
          onClick={() => navigate(-1)}
          className="text-primary-500 font-bold">
          &larr; Back
        </button>
      </div>

      <div className="p-4 border-b border-dark-4">
        <h1 className="text-3xl font-bold text-primary-500 mb-4">
          {list.Title}
        </h1>

        <div className="flex items-start gap-4 mb-4">
            <div className="flex flex-col items-center">
              <img
                src={
                  listCreator.ImageUrl ||
                  "/assets/icons/profile-placeholder.svg"
                }
                alt="creator"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex gap-4 mt-2 text-sm text-light-2">
              <span>{connection?.follower?.length || 0} followers</span>
              <span>{connection?.following?.length || 0} following</span>
              </div>
            </div>
          <div className="w-full">
            <p className="font-bold text-light-1">{listCreator.Name}</p>
            <p className="text-light-3">@{listCreator.Username}</p>
            <Link
              to={`/profile/${listCreator.$id}`}
              className="text-primary-500 text-sm mt-1 block">
              View Profile
            </Link>
          </div>
          {listCreator.Public && (!isFollowed && !isOwnProfile ? <Button
                className="bg-primary-500 text-white px-4 sm:px-6 py-2 rounded-full"
                onClick={handleFollow}
                disabled={isFollowed}>
                Follow
              </Button>: isOwnProfile? "" : <Button
                className="bg-primary-500 text-white px-4 sm:px-6 py-2 rounded-full"
                onClick={handleUnFollow}
                >
                UnFollow
              </Button>)}
          <button
            onClick={handleShare}
            className="text-light-2 hover:text-primary-500 transition-colors p-2 rounded-full hover:bg-dark-3"
            disabled={isSharing}>
            <Share2 size={24} />
          </button>
        </div>

        {list.Description && (
          <p className="text-light-2 mb-4">{list.Description}</p>
        )}

        <ul className="mb-4">
          {visibleItems?.map((item: any, index: number) => (
            <li key={index} className="mb-2 text-light-1 flex justify-between">
              <p className="flex items-center">
                <span className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center mr-3 text-light-1 font-bold">
                  {index + 1}
                </span>
                <span>{item?.content || item}</span>
              </p>
              <p className="flex gap-2 items-center">
                <img
                  src={item.creator.ImageUrl}
                  alt="item.creator.Name"
                  width={30}
                  className="rounded-full"
                />
              </p>
            </li>
          ))}
        </ul>
        {list.item.length > 4 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-500">
            {isExpanded ? "Show Less" : "Show More"}
          </button>
        )}

          <div className="flex flex-wrap gap-2 mb-4">
            {list?.Tags?.map((tag: string, index: number) => (
              <span key={`${tag}${index}`} onClick={()=> navigate(`/categories/${tag}`)} className="text-primary-500 cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>

        <p className="text-light-3 text-sm mb-4">
          {formatDistanceToNow(new Date(list.$createdAt), { addSuffix: true })}
        </p>

        {list.locations.length > 0 && (
          <div className="text-blue-500">
            {list.locations.map((location: any, index: number) => (
              <span key={index}>{location}</span>
            ))}
          </div>
        )}

        {list.timespans.length > 0 && (
          <div className="text-blue-500">
            {list.timespans.map((timespan: any, index: number) => (
              <span key={index}>{timespan}</span>
            ))}
          </div>
        )}

        <ListStats list={list} userId={user.id} />

        {list?.creator?.$id === user.id && (
          <div className="flex gap-4 mt-4">
            <Button
              onClick={() => navigate(`/update-list/${list?.$id}`)}
              className="bg-primary-500 text-light-1 px-4 py-2 rounded-full">
              Edit List
            </Button>
            <Button
              onClick={handleDeleteList}
              className="bg-red-500 text-light-1 px-4 py-2 rounded-full"
              disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete List"}
            </Button>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-light-1 mb-4">Related Lists</h3>
        {isRelatedListsLoading ? (
          <Loader />
        ) : relatedLists && relatedLists.length > 0 ? (
          <GridListList lists={relatedLists} />
        ) : (
          <p className="text-light-2">No related lists found</p>
        )}
      </div>
    </div>
  );
};

export default ListDetails;
