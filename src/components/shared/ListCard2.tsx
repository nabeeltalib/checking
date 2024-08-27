import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { createEmbedList, followUser, getConnection, shareList, UnFollow } from "@/lib/appwrite/api";
import { Share2 } from "lucide-react";
import { useDeleteSavedList, useGetComments, useGetCurrentUser, useLikeList, useSaveList } from "@/lib/react-query/queries";
import Comment from "./Comment";
import { Button } from "../ui";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { Models } from "appwrite";
import { checkIsLiked } from "@/lib/utils";
import Loader from "./Loader";

const ListCard2: React.FC<any> = ({ list, manageList }: any) => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { id: userId } = user;
  const { data: currentUser } = useGetCurrentUser();
  const { mutate: deleteSaveList } = useDeleteSavedList();
  const { mutate: saveList } = useSaveList();
  const { mutate: likeList } = useLikeList();
  const { data: comments } = useGetComments(list.$id);

  const [isSharing, setIsSharing] = useState(false);
  const [isSaved, setIsSaved] = useState(
    currentUser?.save?.some((saved: any) => saved.list.$id === list.$id)
  );
  const [likes, setLikes] = useState<any[]>(list?.Likes || []);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [connection, setConnection] = useState<any>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      if (list?.creator?.$id) {
        let resp = await getConnection(list.creator.$id);
        resp.length > 0 ? setConnection(resp[0]) : setConnection(resp);
      }
    };

    fetchData();
  }, [list?.creator?.$id]);

  const { toast } = useToast();

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSharing(true);
    try {
      const shareableLink = await shareList(list.$id);
      if (navigator.share) {
        await navigator.share({
          title: list.title,
          text: `Check out this list: ${list.Title}`,
          url: shareableLink,
        });
      } else {
        await navigator.clipboard.writeText(shareableLink);
        toast({
          title: "Link copied to clipboard!",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error sharing list:", error);
      toast({
        title: "Error",
        description: "Failed to share list. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const renderListItems = () => {
    let items: Array<any> = [];

    if (Array.isArray(list.items)) {
      items = list.items;
    } else if (typeof list.items === "string") {
      items = list.split("\n");
    } else if (typeof list === "object" && list !== null) {
      items = Object.values(list);
    }

    return items.slice(0, 5).map((item, index) => (
      <li key={index} className="flex items-center mb-2 bg-dark-1">
        <span className="text-xs flex-shrink-0 w-8 h-8 text-blue-300 bg-dark-4 rounded-full flex items-center justify-center font-bold mr-3">
          {index + 1}
        </span>
        <span className="text-sm text-light-2 text-ellipsis">
          {typeof item === "string" ? item : item.content || ""}
        </span>
      </li>
    ));
  };

  const handleSaveList = async (e: any) => {
    e.stopPropagation();
    try {
      if (isSaved) {
        const savedListRecord = currentUser?.save?.find(
          (record: Models.Document) => record.list.$id === list.$id
        );
        if (savedListRecord) {
          await deleteSaveList(savedListRecord.$id);
        }
      } else {
        await saveList({ userId, listId: list.$id });
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Error saving list:", error);
    }
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

  const handleLikeList = async (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.stopPropagation();
    const newLikes = likes.includes(userId)
      ? likes.filter((Id) => Id !== userId)
      : [...likes, userId];
    setLikes(newLikes);
    try {
      await likeList({ listId: list.$id, likesArray: newLikes });
    } catch (error) {
      console.error("Error liking list:", error);
    }
  };

  const isOwnProfile = user.id === list?.creator?.$id || "";
  const isFollowed = connection?.follower?.some((follow: any) => follow.$id === user.id);

  const handleFollow = async () => {
    setIsFollowLoading(true);
    try {
      await followUser(user.id, list.creator.$id);
      let resp = await getConnection(list.creator.$id);
      resp.length > 0 ? setConnection(resp[0]) : setConnection(resp);
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleUnFollow = async () => {
    setIsFollowLoading(true);
    try {
      await UnFollow(user.id, list.creator.$id);
      let resp = await getConnection(list.creator.$id);
      resp.length > 0 ? setConnection(resp[0]) : setConnection(resp);
    } catch (error) {
      console.error("Error unfollowing user:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const renderFollowButton = () => {
    if (isOwnProfile) return null;

    return (
      <Button
        className={`text-xs sm:text-xs ${
          isFollowed
            ? "border-2 bg-dark-4 text-gray-400"
            : "bg-primary-500 border-white text-white"
        } px-4 py-2 rounded-xl`}
        onClick={isFollowed ? handleUnFollow : handleFollow}
        disabled={isFollowLoading}
      >
        {isFollowLoading ? <Loader /> : isFollowed ? "Unfollow" : "Follow"}
      </Button>
    );
  };

  return (
    <motion.div
      className="bg-dark-2 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 sm:p-6">
        {list?.creator?.$id && (
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <Link to={`/profile/${list.creator.$id}`} className="flex items-center">
              <img
                src={list.creator.ImageUrl || "/assets/icons/profile-placeholder.svg"}
                alt={`${list.creator.Name}'s profile`}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-1 border-primary-500"
              />
              <div className="ml-2">
                <p className="text-sm sm:text-base font-semibold text-light-1">
                  {list.creator?.Name}
                </p>
                <p className="text-blue-300 text-xs sm:text-sm">
                  @{list.creator?.Username}
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              {list.creator.Public && renderFollowButton()}
              <button
                aria-label="Share this list"
                onClick={handleShare}
                className="text-light-2 hover:text-primary-500 transition-colors p-2 rounded-full hover:bg-dark-3"
                disabled={isSharing}
              >
                <Share2 size={24} />
              </button>
            </div>
          </div>
        )}        
        <div className="bg-dark-4 text-slate-700 text-center text-2xl sm:text-xl font-thin px-4 py-1 rounded-t-lg" style={{ fontFamily: "'Racing Sans One', sans-serif" }}>
          Ranking For
        </div>

        <h2 className="tracking-tighter flex justify-between text-sm sm:text-base font-light text-gray-400 italic mb-2">
           
          <span className="text-wrap text-lg sm:text-xl font-semibold text-primary-500 ml-1 py-3">
            {list.Title}
          </span>
          <span>{manageList && <Button onClick={handleEmbed}>add to embed</Button>}</span>
        </h2>
      
        <Link to={`/lists/${list.$id}`} className="block">
          <ol className="list-none mb-6 space-y-3">{renderListItems()}</ol>

          {Array.isArray(list.items) && list.items.length > 5 && (
            <p className="text-gray-500 font-semibold text-xs sm:text-sm mb-4">
              + {list.items.length - 5} more items
            </p>
          )}
          {list.description && (
            <h4 className="text-sm sm:text-base font-thin mb-6 text-gray-100">
              {list.Description}
            </h4>
          )}
          {list.tags && list.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {list.tags.slice(0, 3).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="bg-dark-4 text-light-2 px-3 py-1 rounded-full text-xs sm:text-sm"
                >
                  #{tag}
                </span>
              ))}
              {list.tags.length > 3 && (
                <span className="bg-dark-4 text-light-2 px-3 py-1 rounded-full text-xs sm:text-sm">
                  +{list.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </Link>

        <div className="flex flex-wrap gap-2 mb-4">
          {list?.Tags?.map((tag: string, index: number) => (
            <span
              key={`${tag}${index}`}
              onClick={() => navigate(`/categories/${tag}`)}
              className="bg-blue-800 text-blue-200 px-2 py-1 rounded-full text-xs sm:text-sm cursor-pointer shadow-md"
            >
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

      <div className="bg-dark-3 px-4 sm:px-6 py-3 flex justify-between items-center text-light-2 text-xs sm:text-sm">
        <span className="bg-dark-3 text-white flex flex-col items-center gap-1 py-2 px-4 rounded-lg">
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
          <p className="text-xs sm:text-sm text-center">{likes.length} Likes</p>
        </span>

        <span
          className="flex flex-col items-center gap-1 cursor-pointer"
          onClick={handleSaveList}
        >
          <img
            src={
              isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"
            }
            alt="save"
            width={20}
            height={20}
          />
          <p className="text-xs sm:text-sm text-center">
            {isSaved ? "Saved" : "Save"}
          </p>
        </span>

        <span
          onClick={() => navigate(`/lists/${list.$id}`)}
          className="flex flex-col items-center cursor-pointer"
        >
          <img
            src="/assets/icons/comment.svg"
            alt="Comments"
            className="w-5 h-5"
          />
          <p className="text-xs sm:text-sm text-center">
            {comments?.length || 0} Comments
          </p>
        </span>
      </div>

      <div className="w-full mt-4 p-4 sm:p-6 border-t border-gray-300">
        <h3 className="text-xs sm:text-sm font-semibold">Comments</h3>
        {comments && comments?.length > 0 ? (
          <ul>
            <div className="mt-1 flex flex-col gap-2">
              {comments?.slice(0, 2).map((comment: any, index: number) => (
                <Comment comment={comment} key={index} />
              ))}
            </div>
          </ul>
        ) : (
          <p className="text-xs sm:text-sm text-gray-500">What do you think? Comment below!</p>
        )}
      </div>
    </motion.div>
  );
};

export default ListCard2;
