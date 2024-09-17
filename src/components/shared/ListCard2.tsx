import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Share2, Heart, MessageCircle, Bookmark, User, MapPin, Clock } from "lucide-react";
import {
  createEmbedList,
  followUser,
  getConnection,
  shareList,
  UnFollow,
} from "@/lib/appwrite/api";
import {
  useDeleteSavedList,
  useGetComments,
  useGetCurrentUser,
  useLikeList,
  useSaveList,
} from "@/lib/react-query/queries";
import Comment from "./Comment";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { Models } from "appwrite";
import { checkIsLiked } from "@/lib/utils";
import Loader from "./Loader";

interface User {
  id: string;
  name: string;
  Username: string;
  ImageUrl?: string;
  Public?: boolean; // Assuming 'Public' is a boolean
  // Add other relevant fields
}

interface Comment {
  $id: string;
  user: User;
  Content: string;
  // Add other relevant fields
}

interface List {
  $id: string;
  Title: string;
  Description?: string;
  creator: User;
  items: Array<any> | string;
  Tags: string[];
  tags: string[];
  Categories: string[];
  locations: string[];
  timespans: string[];
  Likes: string[];
  // Add other relevant fields
}

interface ListCard2Props {
  list: List | null; // Allowing null to handle cases when list is not yet loaded
  manageList?: boolean;
}

const ListCard2: React.FC<ListCard2Props> = ({ list, manageList }) => {
  const [isSharing, setIsSharing] = useState(false);
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { id } = user;
  const { data: currentUser } = useGetCurrentUser();
  const { mutate: deleteSaveList } = useDeleteSavedList();
  const { mutate: saveList } = useSaveList();
  const { mutate: likeList } = useLikeList();
  const { toast } = useToast();

  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [connection, setConnection] = useState<any>(undefined);
  const [followdBy, setFollowdBy] = useState<any>([]);
  const [likes, setLikes] = useState<string[]>(list?.Likes || []);
  const [isSaved, setIsSaved] = useState(
    currentUser?.save?.some((saved: any) => saved.list?.$id === list?.$id) || false
  );

  // Early return if list is null
  if (!list) {
    return <Loader />; // Or any fallback UI you prefer
  }

  useEffect(() => {
    const fetchData = async () => {
      if (list?.creator?.$id) {
        let ProfileConnection = await getConnection(list.creator.$id);
        let ProfileViewerConnection = await getConnection(user.id);

        if (ProfileConnection.length > 0) {
          setConnection(ProfileConnection[0]);
        }

        let commonConnection: any[] = [],
          remainingConnection: any[] = [],
          displayConnection: any[] = [];

        if (
          ProfileConnection?.length > 0 &&
          ProfileViewerConnection?.length > 0
        ) {
          commonConnection = ProfileConnection[0]?.follower.filter(
            (user: any) =>
              ProfileViewerConnection[0]?.following.includes(user.$id)
          );
          remainingConnection = ProfileConnection[0]?.follower.filter(
            (user: any) =>
              !ProfileViewerConnection[0]?.following.includes(user.$id)
          );
        }

        if (commonConnection.length > 0) {
          displayConnection = [...commonConnection, ...remainingConnection];
        } else {
          displayConnection =
            ProfileConnection.length > 0 ? ProfileConnection[0].follower : [];
        }

        setFollowdBy(displayConnection);
      }
    };

    fetchData();
  }, [list.creator?.$id, user.id]);

  const { data: comments } = useGetComments(list.$id);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSharing(true);
    try {
      const shareableLink = await shareList(list.$id);
      if (navigator.share) {
        await navigator.share({
          title: list.Title, // Use consistent property
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
      items = list.items.split("\n");
    } else if (typeof list.items === "object" && list.items !== null) {
      items = Object.values(list.items);
    }
  
    return items.slice(0, 5).map((item, index) => (
      <li key={index} className="flex items-center mb-2 bg-gray-800 rounded-md p-3">
        <span className="text-lg font-bold text-yellow-500 mr-4">
          {index + 1}
        </span>
        <span className="text-sm text-white truncate">
          {typeof item === "string" ? item : item.content || ""}
        </span>
      </li>
    ));
  };
  

  const handleSaveList = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isSaved) {
        const savedListRecord = currentUser?.save?.find(
          (record: Models.Document) => record.list?.$id === list.$id
        );
        if (savedListRecord) {
          await deleteSaveList(savedListRecord.$id);
        }
      } else {
        await saveList({ userId: id, listId: list.$id });
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Error saving list:", error);
      toast({
        title: "Error",
        description: "Failed to save list. Please try again.",
        variant: "destructive",
      });
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

  const handleLikeList = async (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();
    let newLikes = likes.includes(id)
      ? likes.filter((Id) => Id !== id)
      : [...likes, id];
    setLikes(newLikes);
    try {
      await likeList({ listId: list.$id, likesArray: newLikes });
    } catch (error) {
      console.error("Error liking list:", error);
      toast({
        title: "Error",
        description: "Failed to like the list. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isOwnProfile = user.id === list.creator?.$id;
  const isFollowed = connection?.follower?.some(
    (follow: any) => follow.$id === user.id
  );

  const handleFollow = async () => {
    setIsFollowLoading(true);
    try {
      await followUser(user.id, list.creator.$id);
      let resp = await getConnection(list.creator.$id);
      setConnection(resp.length > 0 ? resp[0] : resp);
      toast({
        title: "Followed",
        description: `You are now following ${list.creator.Name}.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error following user:", error);
      toast({
        title: "Error",
        description: "Failed to follow user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleUnFollow = async () => {
    setIsFollowLoading(true);
    try {
      await UnFollow(user.id, list.creator.$id);
      let resp = await getConnection(list.creator.$id);
      setConnection(resp.length > 0 ? resp[0] : resp);
      toast({
        title: "Unfollowed",
        description: `You have unfollowed ${list.creator.Name}.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast({
        title: "Error",
        description: "Failed to unfollow user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <motion.div
      className="bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 mb-4"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6">
        {/* Creator Info */}
        {list.creator?.$id && (
          <div className="flex justify-between items-center mb-4">
            <Link to={`/profile/${list.creator.$id}`} className="flex items-center">
              <img
                src={list.creator.ImageUrl || "/assets/icons/profile-placeholder.svg"}
                alt={`${list.creator.Name}'s profile`}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div className="ml-3">
                <p className="text-white font-semibold">{list.creator?.Name}</p>
                <p className="text-gray-400 text-sm">@{list.creator?.Username}</p>
              </div>
            </Link>

            <div className="flex items-center">
              {list.creator.Public && !isOwnProfile && (
                <Button
                  className={`text-sm px-4 py-2 rounded-full transition-colors duration-300 ${
                    isFollowed
                      ? "text-gray-400 hover:text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1 rounded-full mr-2"
                  }`}
                  onClick={isFollowed ? handleUnFollow : handleFollow}
                  disabled={isFollowLoading}
                >
                  {isFollowLoading ? <Loader /> : (isFollowed ? "Unfollow" : "Follow")}
                </Button>
              )}

              <button
                onClick={handleShare}
                className="text-light-2 hover:text-primary-500 transition-colors p-2 rounded-full hover:bg-dark-3"
                disabled={isSharing}
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Followed By */}
        {followdBy.length > 0 && (
          <div className="mb-4 text-xs text-light-3">
            {followdBy.length > 2 ? (
              <span>
                Followed by{" "}
                {followdBy.slice(0, 2).map((user: any, index: number) => (
                  <React.Fragment key={user.$id}>
                    <Link
                      to={`/profile/${user.$id}`}
                      className="font-semibold hover:text-primary-500 transition-colors duration-300"
                    >
                      {user.Name}
                    </Link>
                    {index === 0 && ", "}
                  </React.Fragment>
                ))}{" "}
                and {connection?.follower?.length - 2} others
              </span>
            ) : (
              <span>
                Followed by{" "}
                {followdBy.map((user: any, index: number) => (
                  <React.Fragment key={user.$id}>
                    <Link
                      to={`/profile/${user.$id}`}
                      className="font-semibold hover:text-primary-500 transition-colors duration-300"
                    >
                      {user.Name}
                    </Link>
                    {index === 0 && followdBy.length > 1 && " and "}
                  </React.Fragment>
                ))}
              </span>
            )}
          </div>
        )}

        {/* List Title and Description */}
        <div className="mb-6">
          <h2 className="text-yellow-500 text-base">{list.Title}</h2>
          {list.Description && (
            <p className="text-light-2 text-xs">{list.Description}</p>
          )}
        </div>

        {/* List Items */}
        <Link to={`/lists/${list.$id}`} className="block mb-6">
          <ol className="list-none space-y-3">
            {renderListItems()}
          </ol>

          {Array.isArray(list.items) && list.items.length > 5 && (
            <p className="text-primary-500 font-semibold text-sm mt-3 hover:underline">
              + {list.items.length - 5} more items
            </p>
          )}
        </Link>

        {/* Tags, Categories, Locations, Timespans */}
        <div className="flex flex-wrap gap-2 mb-4">
          {list.tags && list.tags.length > 0 && (
            <>
              {list.tags.slice(0, 3).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="bg-dark-4 text-light-2 px-3 py-1 rounded-full text-xs"
                >
                  #{tag}
                </span>
              ))}
              {list.tags.length > 3 && (
                <span className="bg-dark-4 text-light-2 px-3 py-1 rounded-full text-xs">
                  +{list.tags.length - 3} more
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {list.Tags.map((tag: string, index: number) => (
            <span
              key={`${tag}${index}`}
              onClick={() => navigate(`/categories/${tag}`)}
              className="bg-primary-500 text-white px-3 py-1 rounded-full text-xs cursor-pointer hover:bg-primary-600 transition-colors duration-300"
            >
              #{tag}
            </span>
          ))}
        </div>

        {list.locations.length > 0 && (
          <div className="flex items-center text-light-3 text-sm mb-2">
            <MapPin size={16} className="mr-2" />
            {list.locations.join(", ")}
          </div>
        )}

        {list.timespans.length > 0 && (
          <div className="flex items-center text-light-3 text-sm">
            <Clock size={16} className="mr-2" />
            {list.timespans.join(", ")}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-dark-3 px-6 py-4 flex justify-between items-center text-light-2 text-xs">
        <button
          onClick={handleLikeList}
          className="flex items-center gap-2 hover:text-primary-500 transition-colors duration-300"
        >
          <Heart size={20} className={checkIsLiked(likes, id) ? "fill-primary-500 text-primary-500" : ""} />
          <span>{likes.length} Likes</span>
        </button>

        <button
          onClick={handleSaveList}
          className="flex items-center gap-2 hover:text-primary-500 transition-colors duration-300"
        >
          <Bookmark size={20} className={isSaved ? "fill-primary-500 text-primary-500" : ""} />
          <span>{isSaved ? "Saved" : "Save"}</span>
        </button>

        <button
          onClick={() => navigate(`/lists/${list.$id}`)}
          className="flex items-center gap-2 hover:text-primary-500 transition-colors duration-300"
        >
          <MessageCircle size={20} />
          <span>{comments?.length || 0} Comments</span>
        </button>        
      </div>

      {/* Comments Section */}
      <div className="p-6 border-t border-dark-4">
        <h3 className="text-sm font-semibold mb-4">Recent Comments</h3>
        {comments && comments.length > 0 ? (
          <ul className="space-y-4 text-xs">
            {comments.slice(0, 2).map((comment: any, index: number) => (
              <Comment comment={comment} key={comment.$id || index} />
            ))}
            {comments.length > 2 && (
              <Link
                to={`/lists/${list.$id}`}
                className="text-primary-500 hover:underline text-xs"
              >
                View all {comments.length} comments
              </Link>
            )}
          </ul>
        ) : (
          <p className="text-light-3 text-xs">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </motion.div>
  );
};

export default ListCard2;