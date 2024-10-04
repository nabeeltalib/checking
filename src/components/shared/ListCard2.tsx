import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  ThumbsUp,
  ThumbsDown,
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
  updateCommentWithReply, 
  likeList as likeListAPI,
} from "@/lib/appwrite/api";
import {
  useDeleteSavedList,
  useGetComments,
  useGetCurrentUser,
  useSaveList,
  useCreateComment,
} from "@/lib/react-query/queries";
import Comment from "./Comment";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import Loader from "./Loader";
import Tooltip from "@/components/ui/Tooltip";
import { useShareDialog } from '@/components/shared/ShareDialogContext';

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
  Dislikes: string[];
}

interface ListCard2Props {
  list: List | null;
}

const ListCard2: React.FC<ListCard2Props> = ({ list }) => {
  const navigate = useNavigate();
  const { data: currentUser } = useGetCurrentUser();
  const { mutate: deleteSaveList } = useDeleteSavedList();
  const { mutate: saveList } = useSaveList();
  const { toast } = useToast();

  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [connection, setConnection] = useState<any>(undefined);
  const [followdBy, setFollowdBy] = useState<any>([]);
  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [isReply, setIsReply] = useState(false);
  const [commentId, setCommentId] = useState("");
  const { data: comments } = useGetComments(list?.$id);
  const { mutate: createComment, isLoading: isSubmittingComment } = useCreateComment();
  const { openShareDialog } = useShareDialog();

  const { user } = useUserContext();
  const { id } = user;

  useEffect(() => {
    if (list) {
      setLikes(list.Likes || []);
      setDislikes(list.Dislikes || []);
    }
  }, [list]);

  const hasLiked = useMemo(() => likes.includes(id), [likes, id]);
  const hasDisliked = useMemo(() => dislikes.includes(id), [dislikes, id]);

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
          const [ProfileConnection, ProfileViewerConnection] = await Promise.all([
            getConnection(list.creator.$id),
            getConnection(user.id),
          ]);
          setConnection(ProfileConnection[0] || undefined);

          let commonConnection: any[] = [],
              remainingConnection: any[] = [],
              displayConnection: any[] = [];

          if (ProfileConnection?.length > 0 && ProfileViewerConnection?.length > 0) {
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
            displayConnection = ProfileConnection.length > 0
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
    if (!list) return;

    let updatedLikes = [...likes];
    let updatedDislikes = [...dislikes];

    if (hasLiked) {
      updatedLikes = updatedLikes.filter((userId) => userId !== id);
    } else {
      updatedLikes.push(id);
      if (hasDisliked) {
        updatedDislikes = updatedDislikes.filter((userId) => userId !== id);
      }
    }

    setLikes(updatedLikes);
    setDislikes(updatedDislikes);

    try {
      await likeListAPI(list.$id, {
        Likes: updatedLikes,
        Dislikes: updatedDislikes,
      });
    } catch (error) {
      console.error("Error liking list:", error);
      setLikes(likes);
      setDislikes(dislikes);
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
    }
  }, [likes, dislikes, id, list, hasLiked, hasDisliked, toast]);

  const handleDislikeList = useCallback(async () => {
    if (!list) return;

    let updatedLikes = [...likes];
    let updatedDislikes = [...dislikes];

    if (hasDisliked) {
      updatedDislikes = updatedDislikes.filter((userId) => userId !== id);
    } else {
      updatedDislikes.push(id);
      if (hasLiked) {
        updatedLikes = updatedLikes.filter((userId) => userId !== id);
      }
    }

    setLikes(updatedLikes);
    setDislikes(updatedDislikes);

    try {
      await likeListAPI(list.$id, {
        Likes: updatedLikes,
        Dislikes: updatedDislikes,
      });
    } catch (error) {
      console.error("Error disliking list:", error);
      setLikes(likes);
      setDislikes(dislikes);
      toast({
        title: "Error",
        description: "Failed to update dislike status. Please try again.",
        variant: "destructive",
      });
    }
  }, [likes, dislikes, id, list, hasLiked, hasDisliked, toast]);

  const handleSaveList = useCallback(async () => {
    if (!list || !currentUser) return;
    try {
      if (isSaved) {
        const savedListRecord = currentUser.save?.find(
          (record: any) => record.list?.$id === list.$id
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
  }, [isSaved, currentUser, list, deleteSaveList, saveList, id, toast]);

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
  try {
    const shareableLink = await shareList(list.$id);
    openShareDialog(shareableLink, list.Title);
  } catch (error) {
    console.error("Error sharing list:", error);
    toast({
      title: "Error",
      description: "Failed to generate shareable link. Please try again.",
      variant: "destructive",
    });
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
          className="flex items-center mb-1 bg-gray-900 rounded-md p-1 hover:bg-gray-700 transition-colors duration-300"
        >
          <span className="text-lg font-bold text-yellow-200 mr-4">
            {index === 0 ? <Crown size={20} className="text-yellow-200" /> : index + 1}
          </span>
          <span className="text-sm text-white truncate">
            {typeof item === "string" ? item : item.content || ""}
          </span>
        </motion.li>
      ));
  }, [list?.items, isExpanded]);

  const handleCommentSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === "") return;

    try {
      const newCommentData = await createComment({
        listId: list.$id,
        userId: user.id,
        Content: newComment,
      });

      if (newCommentData) {
        // Optionally, you can optimistically update comments if desired
        setNewComment("");
        toast({
          title: "Comment Posted",
          description: "Your comment has been added successfully.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
      toast({
        title: "Comment Failed",
        description: "Unable to post comment. Please try again.",
        variant: "destructive",
      });
    }
  }, [createComment, list.$id, user.id, newComment, toast]);

  const renderComments = useCallback(() => {
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
  }, [comments, navigate, list.$id]);

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
                aria-label="Share this list"
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
          <div
            className="text-slate-700 text-center text-xl sm:text-xl font-thin px-4 py-2 rounded-t-lg"
            style={{ fontFamily: "'Racing Sans One', sans-serif" }}
          >
            Ranking For
          </div>

          <h2 className="text-yellow-200 text-xl font-bold mb-2">
            {list.Title}
          </h2>
          {list.Description && (
            <p className="text-light-2 text-sm">{list.Description}</p>
          )}
        </div>

        {/* List Items */}
        <Link to={`/lists/${list.$id}`} className="block mb-6">
          <AnimatePresence>
            <motion.ol className="list-none space-y-2">
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
                className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs cursor-pointer hover:bg-primary-600 transition-colors duration-300"
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
      <div className="px-6 py-4 flex justify-between items-center text-light-2 text-xs">
        <div className="flex items-center space-x-1">
        <Tooltip content={hasLiked ? "Love it" : "Love it"}>
            <Button
              onClick={handleLikeList}
              className={`p-1 rounded-full transition-colors duration-300 ${
                hasLiked ? "bg" : "hover:bg-gray-700"
              }`}
            >
              <ThumbsUp
                size={20}
                className={hasLiked ? "fill-yellow-500 text-yellow-500" : "text-white"}
              />
            </Button>
          </Tooltip>
          <span className="mx-1">{likes.length}</span>
          <Tooltip content={hasDisliked ? "Boo anonymously" : "Boo anonymously"}>
            <Button
              onClick={handleDislikeList}
              className={`p-3 rounded-full transition-colors duration-300 ${
                hasDisliked ? "bg-" : "hover:bg-gray-700"
              }`}
            >
              <ThumbsDown
                size={20}
                className={hasDisliked ? "fill-yellow-500 text-yellow-500" : "text-white"}
              />
            </Button>
          </Tooltip>
        </div>

        <Button
          onClick={handleSaveList}
          className="text-xs flex items-center gap-2 hover:text-primary-500 transition-colors duration-300"
        >
          <Bookmark
            size={20}
            className={isSaved ? "fill-yellow-500 text-yellow-500" : ""}
          />
          <span>{isSaved ? "Saved" : "Save"}</span>
        </Button>
        <Button
          onClick={() => navigate(`/lists/${list.$id}`)}
          className="flex items-center gap-2 hover:text-primary-500 transition-colors duration-300"
        >
          <MessageCircle size={20} />
          <span>{comments?.length || 0}</span>
        </Button>
        <Button
          onClick={() => navigate(`/remix/${list.$id}`)}
          className="text-xs flex items-center gap-2 hover:text-primary-500 transition-colors duration-300"
        >
          <Wand size={20} />
          <span>Remix</span>
        </Button>
      </div>

      {/* Comments Section */}
      <div className="bg-gray-900 p-6 border-t border-dark-4">
        <h3 className="text-xs font-semibold mb-4">Comments</h3>
        {renderComments()}

        {/* Comment Input Field */}
        <form onSubmit={handleCommentSubmit} className="text-xs mt-4">
          <textarea
            value={newComment}
            spellCheck={true} // Enable spellcheck here
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isReply ? "Write a reply..." : "Agree? Disagree? Share your take!"}
            className="w-full p-3 rounded-lg bg-dark-4 text-light-1 focus:ring-2 focus:ring-primary-500 transition-all duration-300"
            rows={1}
            disabled={isSubmittingComment} // Disable textarea while submitting
          />
          <div className="mt-2 flex items-center">
            <Button type="submit" className="flex items-center" disabled={isSubmittingComment}>
              {isSubmittingComment ? <Loader size="small" /> : "Post Comment"}
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
