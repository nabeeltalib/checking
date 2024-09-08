import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Share2, MessageCircle, Bookmark, Tag, MapPin, Clock, Trophy } from "lucide-react";
import { createEmbedList, followUser, getConnection, shareList, UnFollow } from "@/lib/appwrite/api";
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
      if(list?.creator?.$id)
      {
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
  const getRankColor = (index: number) => {
    const colors = ["text-yellow-500", "text-gray-400", "text-orange-500", "text-blue-500", "text-green-500"];
    return index < colors.length ? colors[index] : "text-purple-500";
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
      <motion.li
        key={index}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex items-center mb-3 bg-dark-3 p-3 rounded-lg"
      >
        <div className={`flex-shrink-0 w-8 h-8 ${getRankColor(index)} rounded-full flex items-center justify-center font-bold mr-3`}>
          <span className="text-sm">{index + 1}</span>
          {index === 0 && <Trophy size={12} className="ml-1" />}
        </div>
        <span className="text-sm text-light-2 text-ellipsis">
          {typeof item === "string" ? item : item.content || ""}
        </span>
      </motion.li>
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
            ? "border border-slate-300 text-gray-400"
            : "bg-primary-500 border-white text-white"
        } px-3 py-2 rounded-xl`}
        onClick={isFollowed ? handleUnFollow : handleFollow}
        disabled={isFollowLoading}
      >
        {isFollowLoading ? <Loader /> : isFollowed ? "Unfollow" : "Follow"}
      </Button>
    );
  };

  return (
    <motion.div
      className="bg-dark-2 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6">
        {/* Creator Info */}
        {list?.creator?.$id && (
          <div className="flex justify-between items-center mb-6">
            <Link to={`/profile/${list.creator.$id}`} className="flex items-center group">
              <img
                src={list.creator.ImageUrl || "/assets/icons/profile-placeholder.svg"}
                alt={`${list.creator.Name}'s profile`}
                className="w-12 h-12 rounded-full border-2 border-primary-500 group-hover:border-primary-600 transition-colors"
              />
              <div className="ml-3">
                <p className="text-light-1 font-semibold group-hover:text-primary-500 transition-colors">
                  {list.creator?.Name}
                </p>
                <p className="text-blue-300 text-sm">
                  @{list.creator?.Username}
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              {list.creator.Public && renderFollowButton()}
              <Button
                onClick={handleShare}
                disabled={isSharing}
                className="p-2 rounded-full bg-dark-3 hover:bg-dark-4 transition-colors"
              >
                <Share2 size={20} className="text-light-2" />
              </Button>
            </div>
          </div>
        )}

        {/* List Title */}
        <div className="mb-6">
          <div className="bg-dark-4 text-slate-600 text-center text-sm font-semibold px-4 py-2 rounded-t-lg">
            Ranking For
          </div>
          <h2 className="text-2xl font-bold text-light-1 mt-2 mb-1">
            {list.Title}
          </h2>
          {manageList && (
            <Button onClick={handleEmbed} className="mt-2 text-sm">
              Add to embed
            </Button>
          )}
        </div>

        {/* List Items */}
        <Link to={`/lists/${list.$id}`} className="block mb-6">
          <ol className="list-none space-y-3 px-6">
            {renderListItems()}
          </ol>
          {Array.isArray(list.items) && list.items.length > 5 && (
            <p className="text-primary-500 font-semibold text-sm mt-2 px-6">
              + {list.items.length - 5} more items
            </p>
          )}
        </Link>

        {/* Description */}
        {list.description && (
          <p className="text-light-2 mb-6">
            {list.Description}
          </p>
        )}

        {/* Tags */}
        {list.tags && list.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {list.tags.slice(0, 3).map((tag: string, index: number) => (
              <span key={index} className="flex items-center bg-dark-4 text-light-2 px-3 py-1 rounded-full text-xs">
                <Tag size={12} className="mr-1" /> {tag}
              </span>
            ))}
            {list.tags.length > 3 && (
              <span className="bg-dark-4 text-light-2 px-3 py-1 rounded-full text-xs">
                +{list.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {list?.Tags?.map((tag: string, index: number) => (
            <span
              key={`${tag}${index}`}
              onClick={() => navigate(`/categories/${tag}`)}
              className="bg-blue-800 text-blue-200 px-3 py-1 rounded-full text-xs cursor-pointer hover:bg-blue-700 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Locations */}
        {list.locations.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {list.locations.map((location: any, index: number) => (
              <span key={index} className="flex items-center bg-gray-800 text-white px-3 py-1 rounded-full text-xs">
                <MapPin size={12} className="mr-1" /> {location}
              </span>
            ))}
          </div>
        )}

        {/* Timespans */}
        {list.timespans.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {list.timespans.map((timespan: any, index: number) => (
              <span key={index} className="flex items-center bg-gray-800 text-white px-3 py-1 rounded-full text-xs">
                <Clock size={12} className="mr-1" /> {timespan}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-dark-3 px-6 py-4 flex justify-between items-center">
        <Button
          onClick={handleLikeList}
          className="flex items-center gap-2 bg-transparent hover:bg-dark-4 transition-colors"
        >
          <img
            src={checkIsLiked(likes, userId) ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
            alt="like"
            width={20}
            height={20}
            className="cursor-pointer"
          />
          <span className="text-light-2">{likes.length}</span>
        </Button>

        <Button
          onClick={handleSaveList}
          className="flex items-center gap-2 bg-transparent hover:bg-dark-4 transition-colors"
        >
          <Bookmark size={20} className={isSaved ? "text-primary-500 fill-primary-500" : "text-light-2"} />
          <span className="text-light-2">{isSaved ? "Saved" : "Save"}</span>
        </Button>

        <Button
          onClick={() => navigate(`/lists/${list.$id}`)}
          className="flex items-center gap-2 bg-transparent hover:bg-dark-4 transition-colors"
        >
          <MessageCircle size={20} className="text-light-2" />
          <span className="text-light-2">{comments?.length || 0}</span>
        </Button>
      </div>

      {/* Comments */}
      <div className="p-6 border-t border-dark-4">
        <h3 className="text-lg font-semibold text-light-1 mb-4">Comments</h3>
        {comments && comments?.length > 0 ? (
          <ul className="space-y-4">
            {comments?.slice(0, 2).map((comment: any, index: number) => (
              <Comment comment={comment} key={index} />
            ))}
          </ul>
        ) : (
          <p className="text-light-3">What do you think? Comment below!</p>
        )}
        <Button
          onClick={() => navigate(`/lists/${list.$id}`)}
          className="mt-4 w-full bg-primary-500 hover:bg-primary-600 text-white transition-colors"
        >
          View All Comments
        </Button>
      </div>
    </motion.div>
  );
};

export default ListCard2;