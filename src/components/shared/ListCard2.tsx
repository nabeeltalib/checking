import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  Heart,
  MessageCircle,
  Bookmark,
  MapPin,
  Crown, 
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Wand,
} from "lucide-react";
import {
  followUser,
  getConnection,
  shareList,
  UnFollow,
  UpdateCommentReply,
} from "@/lib/appwrite/api";
import {
  useDeleteSavedList,
  useGetComments,
  useGetCurrentUser,
  useLikeList,
  useSaveList,
  useCreateComment,
} from "@/lib/react-query/queries";
import Comment from "./Comment";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { Models } from "appwrite";
import { checkIsLiked } from "@/lib/utils";
import Loader from "./Loader";
interface User {
  $id: string;
  Name: string;
  Username: string;
  ImageUrl?: string;
  Public?: boolean;
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
}

interface ListCard2Props {
  list: List | null;
}

const ListCard2: React.FC<ListCard2Props> = ({ list }) => {
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
  const [likes, setLikes] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [animatingButton, setAnimatingButton] = useState<string | null>(null);

  const [newComment, setNewComment] = useState("");
  const [isReply, setIsReply] = useState(false);
  const [commentId, setCommentId] = useState("");
  const { data: comments } = useGetComments(list?.$id);
  const { mutate: createComment } = useCreateComment();

  useEffect(() => {
    if (list) {
      setLikes(list.Likes || []);
    }
  }, [list]);

  useEffect(() => {
    if (currentUser && list) {
      setIsSaved(
        currentUser.save?.some(
          (saved: any) => saved.list?.$id === list.$id
        ) || false
      );
    }
  }, [currentUser, list]);

  useEffect(() => {
    const fetchData = async () => {
      if (list?.creator?.$id) {
        try {
          const [ProfileConnection, ProfileViewerConnection] =
            await Promise.all([
              getConnection(list.creator.$id),
              getConnection(user.id),
            ]);
          setConnection(ProfileConnection[0] || undefined);

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
            displayConnection = [
              ...commonConnection,
              ...remainingConnection,
            ];
          } else {
            displayConnection =
              ProfileConnection.length > 0
                ? ProfileConnection[0].follower
                : [];
          }

          setFollowdBy(displayConnection);
        } catch (error) {
          console.error("Error fetching connections:", error);
        }
      }
    };

    fetchData();
  }, [list?.creator?.$id, user.id]);

  const isOwnProfile = user.id === list?.creator?.$id;
  const isFollowed = connection?.follower?.some(
    (follow: any) => follow.$id === user.id
  );

  const handleLikeList = useCallback(async () => {
    setAnimatingButton('like');
    if (!list) return;
    const previousLikes = likes; // Store previous state in case of failure
    let newLikes = likes.includes(id)
      ? likes.filter((Id) => Id !== id)
      : [...likes, id];
    setLikes(newLikes);
    try {
      await likeList({ listId: list.$id, likesArray: newLikes });
    } catch (error) {
      console.error("Error liking list:", error);
      setLikes(previousLikes); // Revert to previous likes if there's an error
      toast({
        title: "Error",
        description: "Failed to like the list. Please try again.",
        variant: "destructive",
      });
    }
    setTimeout(() => setAnimatingButton(null), 300);
  }, [likes, id, likeList, list, toast]);  

  const handleSaveList = useCallback(async () => {
    setAnimatingButton('save');
    if (!list || !currentUser) return;
    try {
      if (isSaved) {
        const savedListRecord = currentUser.save?.find(
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
    setTimeout(() => setAnimatingButton(null), 300);
  }, [isSaved, currentUser, list, deleteSaveList, saveList, id, toast]);

  const handleRemix = () => {
    setAnimatingButton('remix');
    navigate(`/remix/${list.$id}`);
    setTimeout(() => setAnimatingButton(null), 300);
  };

  const handleCommentNavigate = () => {
    setAnimatingButton('comment');
    navigate(`/lists/${list.$id}`);
    setTimeout(() => setAnimatingButton(null), 300);
  };
  
  const handleFollow = useCallback(async () => {
    if (!list?.creator?.$id) return;
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
  }, [list?.creator, user.id, toast]);

  const handleUnFollow = useCallback(async () => {
    if (!list?.creator?.$id) return;
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
  }, [list?.creator, user.id, toast]);

  const handleShare = async (e: React.MouseEvent) => {
    if (!list) return;
    e.preventDefault();
    e.stopPropagation();
    setIsSharing(true);
    try {
      const shareableLink = await shareList(list.$id);
      if (navigator.share) {
        await navigator.share({
          title: list.Title,
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

  const renderListItems = useMemo(() => {
    if (!list || !list.items) return null;
  
    let items: Array<any> = [];
  
    if (Array.isArray(list.items)) {
      items = list.items;
    } else if (typeof list.items === "string") {
      items = list.items.split("\n");
    } else if (typeof list.items === "object" && list.items !== null) {
      items = Object.values(list.items);
    }

    return items
    .slice(0, isExpanded ? items.length : 5)
    .map((item, index) => (
      <motion.li
        key={index}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="flex items-center mb-2 bg-gray-800 rounded-md p-3 hover:bg-gray-700 transition-colors duration-300"
      >
        <span className="text-lg font-bold text-yellow-500 mr-4">
          {index === 0 ? <Crown size={20} className="text-yellow-500" /> : index + 1}
        </span>
        <span className="text-sm text-white truncate">
          {typeof item === "string" ? item : item.content || ""}
        </span>
      </motion.li>
    ));
}, [list?.items, isExpanded]);

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

      setNewComment("");
      setIsReply(false);
      toast({
        title: "Success",
        description: isReply
          ? "Reply added successfully"
          : "Comment posted successfully",
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

  const renderComments = () => {
    if (!comments || comments.length === 0) {
      return (
        <p className="text-light-3 text-xs">
          No comments yet. Be the first to comment!
        </p>
      );
    }

    const visibleComment = comments[0];

    return (
      <>
        <ul className="space-y-4 text-xs">
          <Comment
            comment={visibleComment}
            key={visibleComment.$id}
            setReply={setIsReply}
            show="show"
            setCommentId={setCommentId}
            listId={list.$id}
          />
        </ul>
        {comments.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={() => navigate(`/lists/${list.$id}`)}
              className="mt-4 text-primary-500 hover:text-primary-600 transition-colors duration-300 flex items-center"
            >
              View all {comments.length} comments
              <ChevronRight size={16} className="ml-2" />
            </Button>
          </motion.div>
        )}
      </>
    );
  };
  if (!list) return null;

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
        {list.creator && (
          <div className="flex justify-between items-center mb-4">
            <Link
              to={`/profile/${list.creator.$id}`}
              className="flex items-center group"
            >
              <img
                src={
                  list.creator.ImageUrl ||
                  "/assets/icons/profile-placeholder.svg"
                }
                alt={`${list.creator.Name}'s profile`}
                className="w-10 h-10 rounded-full mr-3 border-2 border-transparent group-hover:border-primary-500 transition-all duration-300"
              />
              <div>
                <p className="text-white font-semibold group-hover:text-primary-500 transition-colors duration-300">
                  {list.creator.Name}
                </p>
                <p className="text-gray-400 text-sm">
                  @{list.creator.Username}
                </p>
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
                  {isFollowLoading ? (
                    <Loader />
                  ) : isFollowed ? (
                    "Unfollow"
                  ) : (
                    "Follow"
                  )}
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
          <h2 className="text-yellow-500 text-xl font-bold mb-2">
            {list.Title}
          </h2>
          {list.Description && (
            <p className="text-light-2 text-sm">{list.Description}</p>
          )}
        </div>

        {/* List Items */}
        <Link to={`/lists/${list.$id}`} className="block mb-6">
          <AnimatePresence>
            <motion.ol className="list-none space-y-3">
              {renderListItems}
            </motion.ol>
          </AnimatePresence>

          {Array.isArray(list.items) && list.items.length > 5 && (
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary-500 font-semibold text-sm mt-3 hover:underline flex items-center"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="mr-1" size={16} />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1" size={16} />
                  + {list.items.length - 5} more items
                </>
              )}
            </Button>
          )}
        </Link>

        {/* Tags and Categories */}
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
          {list.Tags &&
            list.Tags.map((tag: string, index: number) => (
              <span
                key={`${tag}${index}`}
                onClick={() => navigate(`/categories/${tag}`)}
                className="bg-primary-500 text-white px-3 py-1 rounded-full text-xs cursor-pointer hover:bg-primary-600 transition-colors duration-300"
              >
                #{tag}
              </span>
            ))}
        </div>

        {/* Locations and Timespans */}
        {list.locations && list.locations.length > 0 && (
          <div className="flex items-center text-light-3 text-sm mb-2">
            <MapPin size={16} className="mr-2" />
            {list.locations.join(", ")}
          </div>
        )}

        {list.timespans && list.timespans.length > 0 && (
          <div className="flex items-center text-light-3 text-sm">
            <Clock size={16} className="mr-2" />
            {list.timespans.join(", ")}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-dark-3 px-6 py-4 flex justify-between items-center text-light-2 text-xs">
        <Button
          onClick={handleLikeList}
          className="flex items-center gap-2 hover:text-primary-500 transition-colors duration-300"
        >
          <Heart
            size={20}
            className={
              checkIsLiked(likes, id) ? "fill-primary-500 text-primary-500" : ""
            }
          />
          <span>{likes.length} </span>
        </Button>

        <Button
          onClick={handleSaveList}
          className="flex items-center gap-2 hover:text-primary-500 transition-colors duration-300"
        >
          <Bookmark
            size={20}
            className={isSaved ? "fill-primary-500 text-primary-500" : ""}
          />
          <span>{isSaved ? " " : " "}</span>
        </Button>
        <Button
          onClick={() => navigate(`/lists/${list.$id}`)}
          className="flex items-center gap-2 hover:text-primary-500 transition-colors duration-300"
        >
          <MessageCircle size={20} />
          <span>{comments?.length || 0} </span>
        </Button>
        <Button
          onClick={() => navigate(`/remix/${list.$id}`)}
          className="flex items-center gap-2 hover:text-primary-500 transition-colors duration-300"
        >
          <Wand size={20} />
          <span>Remix</span>
        </Button>

        
      </div>

      {/* Comments Section */}
      <div className="p-6 border-t border-dark-4">
        <h3 className="text-xs font-semibold mb-4">Comments</h3>
        {renderComments()}

        {/* Comment Input Field */}
        <form onSubmit={handleCommentSubmit} className="text-xs mt-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              isReply ? "Write a reply..." : "Write a comment..."
            }
            className="w-full p-3 rounded-lg bg-dark-4 text-light-1 focus:ring-2 focus:ring-primary-500 transition-all duration-300"
            rows={1}
          />
          <div className="mt-2 flex items-center">
            <Button type="submit" variant="default">
              {isReply ? "Post Reply" : "Post Comment"}
            </Button>
            {isReply && (
              <Button
                onClick={() => setIsReply(false)}
                variant="ghost"
                className="ml-2"
              >
                Cancel Reply
              </Button>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ListCard2;