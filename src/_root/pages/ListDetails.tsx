import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetListById,
  useGetRelatedLists,
  useDeleteList,
  useGetUserById,
  useGetComments,
  useCreateComment,
  useLikeList,
  useSaveList,
  useDeleteSavedList,
} from "@/lib/react-query/queries";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";
import GridListList from "@/components/shared/GridListList";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  followUser,
  getConnection,
  shareList,
  UnFollow,
  reportComment,
  createEmbedList,
} from "@/lib/appwrite/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  Trophy,
  MoreVertical,
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  UserPlus,
  UserMinus,
  MoreHorizontal,
  Flag,
  Repeat,
  Code,
} from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";
import { Models } from "appwrite";
import useUnsplashImage from "@/hooks/useUnsplashImage";

const ListDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useUserContext();
  const { toast } = useToast();

  const { data: list, isLoading } = useGetListById(id || "");
  const { data: listCreator, isLoading: isCreatorLoading } = useGetUserById(
    list?.creator.$id || ""
  );
  const { data: relatedLists, isLoading: isRelatedListsLoading } =
    useGetRelatedLists(id || "");
  const { data: comments, refetch: refetchComments } = useGetComments(id || "");
  const { mutateAsync: deleteList, isLoading: isDeleting } = useDeleteList();
  const { mutate: createComment, isLoading: isCreatingComment } =
    useCreateComment();
  const { mutate: likeList } = useLikeList();
  const { mutate: saveList } = useSaveList();
  const { mutate: deleteSaveList } = useDeleteSavedList();

  const [newComment, setNewComment] = useState("");
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isEmbed, setIsEmbed] = useState(false);
  const [isStatic, setIsStatic] = useState(true);
  const [connection, setConnection] = useState<any>(undefined);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [likes, setLikes] = useState<any[]>(list?.Likes || []);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch the header image using useUnsplashImage hook
  const { image: headerImage, loading: headerImageLoading } = useUnsplashImage(
    list?.Title || ""
  );

  useEffect(() => {
    const fetchConnection = async () => {
      if (listCreator?.$id) {
        const resp = await getConnection(listCreator.$id);
        const conn = resp.length > 0 ? resp[0] : resp;
        setConnection(conn);
        setIsFollowing(
          conn?.follower?.some((follower: any) => follower.$id === user.id)
        );
      }
    };
    fetchConnection();
  }, [listCreator, user.id]);

  useEffect(() => {
    setLikes(list?.Likes || []);
  }, [list]);

  useEffect(() => {
    if (user?.save && list) {
      setIsSaved(
        user.save?.some(
          (saved: any) => saved.list?.$id === list?.$id
        )
      );
    }
  }, [list, user]);

  const visibleItems = useMemo(() => {
    if (!list) return [];
    return isExpanded ? list.item : list.item.slice(0, 5);
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
        toast({ title: "Link copied to clipboard!" });
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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await createComment({ listId: id!, userId: user.id, content: newComment });
      setNewComment("");
      toast({ title: "Comment added successfully", variant: "default" });
      refetchComments();
    } catch (error) {
      toast({ title: "Error adding comment", variant: "destructive" });
    }
  };

  const handleLikeList = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const newLikes = likes.includes(user.id)
      ? likes.filter((Id) => Id !== user.id)
      : [...likes, user.id];
    setLikes(newLikes);
    try {
      await likeList({ listId: list?.$id, likesArray: newLikes });
    } catch (error) {
      console.error("Error liking list:", error);
    }
  };

  const handleSaveList = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      if (isSaved) {
        const savedListRecord = user.save?.find(
          (record: Models.Document) => record.list?.$id === list?.$id
        );
        if (savedListRecord) {
          await deleteSaveList(savedListRecord.$id);
        }
      } else {
        await saveList({ userId: user.id, listId: list?.$id });
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Error saving list:", error);
    }
  };

  const handleFollowToggle = async () => {
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await UnFollow(user.id, list.creator.$id);
      } else {
        await followUser(user.id, list.creator.$id);
      }
      const resp = await getConnection(list.creator.$id);
      const conn = resp.length > 0 ? resp[0] : resp;
      setConnection(conn);
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsFollowLoading(false);
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
      setIsEmbed(true);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to embed list ${list.Title}`,
        variant: "destructive",
      });
    }
  };

  const handleRemix = () => {
    navigate(`/remix/${list.$id}`);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="text-yellow-400" />;
      default:
        return <span className="text-white font-bold">{index + 1}</span>;
    }
  };

  if (isLoading || isCreatorLoading) return <Loader />;
  if (!list || !listCreator)
    return <div className="text-center text-light-1">List not found</div>;

  const isOwnProfile = user.id === list.creator.$id;
  const isCollaborator = list.users.some(
    (collab: any) => collab.$id === user.id
  );

  const CommentWithActions = ({ comment }: { comment: any }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsDropdownOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const handleReport = async () => {
      try {
        await reportComment({
          User: comment.user.Username,
          Content: comment.Content,
          id: comment.$id,
          Reporter: user.name,
        });
        toast({
          title: "Comment Reported",
          description:
            "We'll review this comment soon. Thank you for keeping our community safe.",
          duration: 5000,
        });
      } catch (error) {
        toast({
          title: "Couldn't Report Comment",
          description: "An error occurred. Please try again later.",
          variant: "destructive",
        });
      }
      setIsDropdownOpen(false);
    };

    return (
      <div className="flex items-start space-x-3 p-3 rounded-lg bg-dark-3">
        <img
          src={comment.user.ImageUrl || "/assets/default-avatar.png"}
          alt={`${comment.user.Username}'s avatar`}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-grow">
          <p className="text-primary-500 text-sm font-semibold">
            {comment.user.Username}
          </p>
          <p className="text-light-2 text-sm">{comment.Content}</p>
        </div>
        <div className="relative" ref={dropdownRef}>
          <Tooltip content="More options">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-gray-500 hover:text-gray-300 transition-colors duration-200"
              aria-label="More options"
            >
              <MoreHorizontal size={18} />
            </motion.button>
          </Tooltip>
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 mt-2 w-48 bg-dark-4 rounded-md shadow-lg z-20 overflow-hidden"
              >
                <motion.button
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  onClick={handleReport}
                  className="flex items-center w-full px-4 py-2 text-sm text-left text-light-2 hover:bg-dark-3"
                >
                  <Flag size={14} className="mr-2" />
                  Report comment
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  // Generate embed link
  const embedLink = isStatic
    ? `<iframe src="${import.meta.env.VITE_APP_DOMAIN}/staticframe/${list.$id}" width="50%" height="600"></iframe>`
    : `<iframe src="${import.meta.env.VITE_APP_DOMAIN}/liveframe/${list.$id}" width="50%" height="600"></iframe>`;

  return (
    <motion.div
      className="max-w-3xl mx-auto bg-dark-2 rounded-xl shadow-lg overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        {headerImageLoading ? (
          <div className="w-full h-full bg-dark-3 animate-pulse"></div>
        ) : (
          <img
            src={
              headerImage ||
              `https://via.placeholder.com/800x400?text=${encodeURIComponent(
                list.Title
              )}`
            }
            alt={list.Title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-2 to-transparent"></div>
        <h2 className="absolute bottom-4 left-4 right-4 text-3xl font-bold text-white">
          {list.Title}
        </h2>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Creator Info */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to={`/profile/${listCreator.$id}`}
            className="flex items-center group"
          >
            <img
              src={
                listCreator.ImageUrl || "/assets/icons/profile-placeholder.svg"
              }
              alt={`${listCreator.Name}'s profile`}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary-500 group-hover:border-primary-600 transition-colors"
            />
            <div className="ml-3">
              <p className="text-white font-semibold group-hover:text-primary-500 transition-colors">
                {listCreator.Name}
              </p>
              <p className="text-gray-400 text-sm">@{listCreator.Username}</p>
            </div>
          </Link>
          {!isOwnProfile && (
            <button
              onClick={handleFollowToggle}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isFollowing
                  ? "bg-dark-4 text-white hover:bg-dark-3"
                  : "bg-primary-500 text-white hover:bg-primary-600"
              }`}
              disabled={isFollowLoading}
            >
              {isFollowLoading ? (
                <Loader />
              ) : isFollowing ? (
                <>
                  <UserMinus size={16} className="inline mr-2" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus size={16} className="inline mr-2" />
                  Follow
                </>
              )}
            </button>
          )}
        </div>

        {/* List Items */}
        <ol className="space-y-4 mb-6">
          {visibleItems.map((item: any, index: number) => (
            <motion.li
              key={index}
              className="flex items-center bg-dark-3 p-4 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-dark-4 mr-4">
                {getRankIcon(index)}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">
                  {item.content || item}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
        {list.item.length > visibleItems.length && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-500 font-semibold block mx-auto sm:mx-0"
          >
            {isExpanded ? "Show Less" : "Show More"}
          </button>
        )}

        {/* Description */}
        {list.Description && (
          <p className="text-light-2 mb-6">{list.Description}</p>
        )}

        {/* Tags */}
        {list.Tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {list.Tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="bg-dark-4 text-primary-500 px-3 py-1 rounded-full text-xs cursor-pointer"
                onClick={() => navigate(`/categories/${tag}`)}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLikeList}
              className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Heart
                size={20}
                fill={likes.includes(user.id) ? "red" : "none"}
                className={likes.includes(user.id) ? "text-red-500" : ""}
              />
              <span>{likes.length}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                document
                  .getElementById(`comment-input-${list.$id}`)
                  ?.focus();
              }}
              className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <MessageCircle size={20} />
              <span>{comments?.length || 0}</span>
            </button>
            <button
              onClick={handleSaveList}
              className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors"
            >
              <Bookmark
                size={20}
                fill={isSaved ? "yellow" : "none"}
                className={isSaved ? "text-yellow-500" : ""}
              />
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>
            <button
              onClick={handleRemix}
              className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors"
            >
              <Repeat size={20} />
              <span>Remix</span>
            </button>
            <button
              onClick={handleEmbed}
              className="flex items-center gap-2 text-gray-400 hover:text-purple-500 transition-colors"
            >
              <Code size={20} />
              <span>Embed</span>
            </button>
          </div>
          <Button
            onClick={handleShare}
            disabled={isSharing}
            className="p-2 rounded-full bg-dark-3 hover:bg-dark-4 transition-colors"
          >
            <Share2 size={24} className="text-light-2" />
          </Button>
        </div>

        {/* Embed Section */}
        {isEmbed && (
          <div className="mt-6 bg-dark-3 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">
              Embed Code
            </h3>
            <div className="flex items-center mb-4">
              <button
                onClick={() => setIsStatic(true)}
                className={`px-4 py-2 rounded-l-lg ${
                  isStatic
                    ? "bg-primary-500 text-white"
                    : "bg-dark-4 text-gray-400"
                }`}
              >
                Static
              </button>
              <button
                onClick={() => setIsStatic(false)}
                className={`px-4 py-2 rounded-r-lg ${
                  !isStatic
                    ? "bg-primary-500 text-white"
                    : "bg-dark-4 text-gray-400"
                }`}
              >
                Live
              </button>
            </div>
            <textarea
              readOnly
              value={embedLink}
              className="w-full p-2 bg-dark-4 text-white rounded-lg mb-4"
            />
            <Link
              to={`${import.meta.env.VITE_APP_DOMAIN}/embedpreview/${list.$id}`}
              className="text-primary-500 hover:underline"
            >
              See Preview
            </Link>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-6 bg-dark-3 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">
            Comments
          </h3>
          {/* Comment Input */}
          <form onSubmit={handleAddComment} className="mb-4">
            <div className="flex items-center">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-grow bg-dark-4 text-white rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                id={`comment-input-${list.$id}`}
              />
              <button
                type="submit"
                className="bg-primary-500 text-white rounded-r-lg px-4 py-2 hover:bg-primary-600 transition-colors"
                disabled={isCreatingComment}
              >
                {isCreatingComment ? <Loader /> : <Send size={20} />}
              </button>
            </div>
          </form>
          {/* Comments */}
          <div className="space-y-4">
            {comments && comments.length > 0 ? (
              comments.map((comment: any, index: number) => (
                <CommentWithActions key={index} comment={comment} />
              ))
            ) : (
              <p className="text-light-3">No comments yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Related Lists */}
      <div className="p-6 border-t border-dark-4">
        <h3 className="text-2xl font-bold text-light-1 mb-6">
          Related Lists
        </h3>
        {isRelatedListsLoading ? (
          <Loader />
        ) : relatedLists && relatedLists.length > 0 ? (
          <GridListList lists={relatedLists} />
        ) : (
          <p className="text-light-2">No related lists found</p>
        )}
      </div>
    </motion.div>
  );
};

export default ListDetails;
