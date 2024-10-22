import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  likeList as likeListAPI,
  addEmojiReaction,
  removeEmojiReaction,
} from "@/lib/appwrite/api";
import {
  useSaveList,
  useDeleteSavedList,
  useGetCommentsWithReplies,
  useGetUserById,
  useCreateComment,
  useCreateReply,
} from '@/lib/react-query/queries';
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import Comment from "./Comment";
import {
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  MessageSquare,
  Wand,
  Code,
  ChevronDown,
  ChevronUp,
  Smile,
  Loader2,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/Popover";
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/queryKeys';

const quickEmojis = ["😂", "😢", "😮", "😍", "👏", "🔥", "👀", "😅"];

interface ListStatsProps {
  setIsEmbed: (value: boolean) => void;
  list: any;
  textSize?: string;
  backgroundColor?: string;
  isCreator: boolean;
}

const ListStats: React.FC<ListStatsProps> = ({
  setIsEmbed,
  list,
  textSize = "text-base",
  backgroundColor = "bg-dark-3",
  isCreator,
}) => {
  const navigate = useNavigate();
  const [likes, setLikes] = useState<string[]>(list?.Likes || []);
  const [dislikes, setDislikes] = useState<string[]>(list?.Dislikes || []);
  const [isSaved, setIsSaved] = useState(false);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(true);
  const { user } = useUserContext();
  const userId = user?.$id || user?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentUser } = useGetUserById(userId);
  const { data: commentsWithReplies, isLoading: isLoadingComments, refetch: refetchComments } = useGetCommentsWithReplies(list.$id);
  const [newComment, setNewComment] = useState("");
  const { mutate: createComment, isLoading: isCreatingComment } = useCreateComment();
  const { mutate: createReply, isLoading: isCreatingReply } = useCreateReply();
  const { mutate: deleteSaveList, isLoading: isDeletingSave } = useDeleteSavedList();
  const { mutate: saveList, isLoading: isSaving } = useSaveList();
  const [showAllComments, setShowAllComments] = useState(false);
  const [isEmojiPopoverOpen, setIsEmojiPopoverOpen] = useState(false);

  // State for handling replies
  const [isReplying, setIsReplying] = useState(false);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyingToParentReplyId, setReplyingToParentReplyId] = useState<string | null>(null);
  const [newReply, setNewReply] = useState("");

  // New loading states
  const [isLiking, setIsLiking] = useState(false);
  const [isDisliking, setIsDisliking] = useState(false);
  const [isReacting, setIsReacting] = useState(false);

  const hasLiked = useMemo(() => likes.includes(userId), [likes, userId]);
  const hasDisliked = useMemo(() => dislikes.includes(userId), [dislikes, userId]);
  const [reactions, setReactions] = useState(list?.Reactions || []);

  useEffect(() => {
    if (currentUser) {
      const savedListRecord = currentUser.save?.find(
        (record: any) => record.list?.$id === list.$id
      );
      setIsSaved(!!savedListRecord);
    }
  }, [currentUser, list.$id]);

  const handleLikeList = async () => {
    if (isLiking) return;
    setIsLiking(true);
    let updatedLikes = [...likes];
    let updatedDislikes = [...dislikes];

    if (hasLiked) {
      updatedLikes = updatedLikes.filter((Id) => Id !== userId);
    } else {
      updatedLikes.push(userId);
      if (hasDisliked) {
        updatedDislikes = updatedDislikes.filter((Id) => Id !== userId);
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
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
      setLikes(likes);
      setDislikes(dislikes);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDislikeList = async () => {
    if (isDisliking) return;
    setIsDisliking(true);
    let updatedLikes = [...likes];
    let updatedDislikes = [...dislikes];

    if (hasDisliked) {
      updatedDislikes = updatedDislikes.filter((Id) => Id !== userId);
    } else {
      updatedDislikes.push(userId);
      if (hasLiked) {
        updatedLikes = updatedLikes.filter((Id) => Id !== userId);
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
      toast({
        title: "Error",
        description: "Failed to update dislike status. Please try again.",
        variant: "destructive",
      });
      setLikes(likes);
      setDislikes(dislikes);
    } finally {
      setIsDisliking(false);
    }
  };

  const handleSaveList = () => {
    if (isSaved) {
      const savedListRecord = currentUser?.save?.find(
        (record: any) => record.list.$id === list.$id
      );
      if (savedListRecord) {
        deleteSaveList(savedListRecord.$id);
      }
    } else {
      saveList({ userId: userId, listId: list.$id });
    }
    setIsSaved(!isSaved);
  };

  const visibleComments = useMemo(() => {
    if (!commentsWithReplies) return [];
    return showAllComments ? commentsWithReplies : commentsWithReplies.slice(0, 3);
  }, [commentsWithReplies, showAllComments]);

  const handleViewAllComments = () => {
    setShowAllComments(true);
  };

  const handleShowLess = () => {
    setShowAllComments(false);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === "") return;

    const commentData = {
      listId: list.$id,
      userId: userId,
      Content: newComment,
    };

    // Optimistically update UI
    const newCommentObj = {
      $id: 'temp-id-' + Date.now(),
      Content: newComment,
      user: currentUser,
      CreatedAt: new Date().toISOString(),
      Likes: [],
      Reactions: [],
      replies: [],
    };

    queryClient.setQueryData(
      [QUERY_KEYS.GET_COMMENTS_WITH_REPLIES, list.$id],
      (old: any) => [newCommentObj, ...(old || [])]
    );

    try {
      await createComment(commentData);
      setNewComment("");
      refetchComments();
      toast({
        title: "Success",
        description: "Comment posted successfully",
      });
    } catch (error) {
      console.error("Failed to post comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
      // Revert optimistic update
      refetchComments();
    }
  };

  const handleReplySubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (newReply.trim() === "" || !replyingToCommentId) return;

    const replyData = {
      listId: list.$id,
      userId: userId,
      Content: newReply,
      commentId: replyingToCommentId,
      parentReplyId: replyingToParentReplyId,
    };

    // Optimistically update the UI
    queryClient.setQueryData(
      [QUERY_KEYS.GET_COMMENTS_WITH_REPLIES, list.$id],
      (oldData: any) => {
        return oldData.map((comment: any) => {
          if (comment.$id === replyingToCommentId) {
            return {
              ...comment,
              replies: [
                ...(comment.replies || []),
                {
                  $id: 'temp-id-' + Date.now(),
                  Content: newReply,
                  userId: userId,
                  createdAt: new Date().toISOString(),
                  Likes: [],
                  Reactions: [],
                },
              ],
            };
          }
          return comment;
        });
      }
    );

    try {
      await createReply(replyData);
      setNewReply("");
      setIsReplying(false);
      setReplyingToCommentId(null);
      setReplyingToParentReplyId(null);
      refetchComments();
      toast({
        title: "Success",
        description: "Reply posted successfully",
      });
    } catch (error) {
      console.error("Failed to post reply:", error);
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      });
      refetchComments(); // Revert optimistic update
    }
  }, [newReply, replyingToCommentId, replyingToParentReplyId, list.$id, userId, createReply, refetchComments, queryClient]);

  const handleEmojiReaction = async (emoji: string) => {
    if (isReacting) return;
    setIsReacting(true);
    setIsEmojiPopoverOpen(false);
    try {
      const reactionString = `${emoji}:${userId}`;
      let updatedReactions = [...reactions];
      
      if (reactions.includes(reactionString)) {
        updatedReactions = updatedReactions.filter(r => r !== reactionString);
        await removeEmojiReaction(list.$id, emoji, userId);
      } else {
        updatedReactions.push(reactionString);
        await addEmojiReaction(list.$id, emoji, userId);
      }
      
      setReactions(updatedReactions);
    } catch (error) {
      console.error("Error handling emoji reaction:", error);
      toast({
        title: "Error",
        description: "Failed to update reaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsReacting(false);
    }
  };

  const parseReactions = (reactions: string[]) => {
    const emojiCounts: { [key: string]: number } = {};
    reactions.forEach(reaction => {
      const [emoji] = reaction.split(':');
      emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
    });
    return emojiCounts;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${backgroundColor} p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl`}
    >
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <div className="flex items-center space-x-1">
          <Button
            variant="default"
            className="flex-1 flex items-center justify-center space-x-2"
            onClick={handleLikeList}
            disabled={isLiking}
          >
            {isLiking ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ThumbsUp
                size={20}
                className={
                  hasLiked ? "fill-orange-500 text-orange-500" : "text-gray-400"
                }
              />
            )}
            <span className={textSize}>{likes.length}</span>
          </Button>

          <Button
            variant="default"
            className="flex-1 flex items-center justify-center space-x-2"
            onClick={handleDislikeList}
            disabled={isDisliking}
          >
            {isDisliking ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ThumbsDown
                size={20}
                className={
                  hasDisliked ? "fill-orange-500 text-orange-500" : "text-gray-400"
                }
              />
            )}
          </Button>
        </div>

        <Button
          variant="default"
          className="flex-1 flex items-center justify-center space-x-2"
          onClick={handleSaveList}
          disabled={isSaving || isDeletingSave}
        >
          {isSaving || isDeletingSave ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Bookmark
              size={20}
              className={
                isSaved
                  ? "text-orange-500 fill-orange-500"
                  : "text-gray-400 fill-none"
              }
            />
          )}
          <span className={textSize}>{isSaved ? "Saved" : "Save"}</span>
        </Button>

        <Button
          variant="default"
          className="flex-1 flex items-center justify-center space-x-2"
          onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
        >
          <MessageSquare size={20} className="text-gray-400" />
          <span className={textSize}>{commentsWithReplies?.length || 0}</span>
        </Button>

        <Button
          variant="default"
          className="flex-1 flex items-center justify-center space-x-2"
          onClick={() => navigate(`/remix/${list.$id}`)}
        >
          <Wand size={20} className="text-gray-400" />
          <span className={textSize}>Remix</span>
        </Button>

        {isCreator ? (
          <Button
            variant="default"
            className="flex-1 flex items-center justify-center space-x-2"
            onClick={() => setIsEmbed((prev) => !prev)}
          >
            <Code size={20} className="text-gray-400" />
            <span className={textSize}>Embed</span>
          </Button>
        ) : (
          <div
            className="flex-1 flex items-center justify-center space-x-2 opacity-50 cursor-not-allowed"
            title="Only the creator can embed this list"
          >
            <Code size={20} className="text-gray-400" />
            <span className={textSize}>Embed</span>
          </div>
        )}

        <Popover open={isEmojiPopoverOpen} onOpenChange={setIsEmojiPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="default"
              className="flex-1 flex items-center justify-center space-x-2"
              disabled={isReacting}
            >
              {isReacting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Smile size={20} className="text-gray-400" />
                  <span className={textSize}>React</span>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1">
            <div className="flex space-x-1">
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiReaction(emoji)}
                  className="text-xl hover:bg-gray-200 rounded p-1"
                  disabled={isReacting}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(parseReactions(reactions)).map(([emoji, count]) => (
          <button
            key={emoji}
            onClick={() => handleEmojiReaction(emoji)}
            className={`text-sm rounded-full px-2 py-1 ${
              reactions.includes(`${emoji}:${userId}`) ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}
            disabled={isReacting}
          >
            {emoji} {count}
          </button>
        ))}
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {isCommentsExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <h3 className="text-xl font-semibold mb-4">Comments</h3>
            {isLoadingComments ? (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-400">Loading comments...</span>
              </div>
            ) : visibleComments.length > 0 ? (
              <div className="space-y-4">
                {visibleComments.map((comment: any) => (
                  <Comment
                    key={comment.$id}
                    comment={comment}
                    setReply={setIsReplying}
                    show={true}
                    setCommentId={setReplyingToCommentId}
                    setParentReplyId={setReplyingToParentReplyId}
                    listId={list.$id}
                  />
                ))}

                {!showAllComments && commentsWithReplies && commentsWithReplies.length > 3 && (
                  <Button
                    variant="link"
                    onClick={handleViewAllComments}
                    className="text-blue-300 flex items-center"
                  >
                    <ChevronDown className="mr-2" size={16} />
                    View all {commentsWithReplies.length} comments
                  </Button>
                )}

                {showAllComments && (
                  <Button
                    variant="link"
                    onClick={handleShowLess}
                    className="text-blue-300 flex items-center"
                  >
                    <ChevronUp className="mr-2" size={16} />
                    Show less
                  </Button>
                )}
              </div>
            ) : (
              <p className={`${textSize} text-gray-500`}>
                No comments yet. Be the first to comment!
              </p>
            )}

            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="mt-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 rounded-lg bg-dark-4 text-light-1 focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                rows={1}
                disabled={isCreatingComment}
              />
              <div className="flex gap-2 mt-2">
                <Button 
                  type="submit" 
                  variant="default"
                  disabled={isCreatingComment || newComment.trim() === ""}
                >
                  {isCreatingComment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Comment"
                  )}
                </Button>
              </div>
            </form>

            {/* Reply Input */}
            {isReplying && (
              <form onSubmit={handleReplySubmit} className="mt-6">
                <textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full p-3 rounded-lg bg-dark-4 text-light-1 focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                  rows={1}
                  disabled={isCreatingReply}
                />
                <div className="flex gap-2 mt-2">
                  <Button 
                    type="submit" 
                    variant="default"
                    disabled={isCreatingReply || newReply.trim() === ""}
                  >
                    {isCreatingReply ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post Reply"
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsReplying(false);
                      setReplyingToCommentId(null);
                      setReplyingToParentReplyId(null);
                    }}
                    disabled={isCreatingReply}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ListStats;