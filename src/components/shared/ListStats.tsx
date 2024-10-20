import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { likeList as likeListAPI, addEmojiReaction, removeEmojiReaction } from "@/lib/appwrite/api";
import {
  useSaveList,
  useDeleteSavedList,
  useGetComments,
  useGetUserById,
  useCreateComment,
} from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";
import { toast } from "../ui";
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
} from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const quickEmojis = ['😂', '😢', '😮', '😍', '👏', '🔥', '👀', '😅'];

interface ListStatsProps {
  setIsEmbed: (value: boolean) => void;
  list: any;
  userId: string;
  textSize?: string;
  backgroundColor?: string;
  isCreator: boolean;
}

const ListStats: React.FC<ListStatsProps> = ({
  setIsEmbed,
  list,
  userId,
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
  const { id } = user;
  const { mutate: deleteSaveList } = useDeleteSavedList();
  const { mutate: saveList } = useSaveList();
  const { data: currentUser } = useGetUserById(id);
  const { data: comments, refetch: refetchComments } = useGetComments(list.$id);
  const [newComment, setNewComment] = useState("");
  const { mutate: createComment } = useCreateComment();
  const [showAllComments, setShowAllComments] = useState(false);
  
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
    }
  };

  const handleDislikeList = async () => {
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
    if (!comments) return [];
    return showAllComments ? comments : comments.slice(0, 3);
  }, [comments, showAllComments]);

  const handleViewAllComments = () => {
    setShowAllComments(true);
  };
  
  const handleShowLess = () => {
    setShowAllComments(false);
  };
  
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === "") return;
  
    try {
      await createComment({
        listId: list.$id,
        userId: id,
        Content: newComment,
      });
  
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
        description: "Failed to post comment.",
        variant: "destructive",
      });
    }
  };

  const handleEmojiReaction = async (emoji: string) => {
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
          {/* Like Button */}
          <Button
            variant="default"
            className="flex-1 flex items-center justify-center space-x-2"
            onClick={handleLikeList}
          >
            <ThumbsUp
              size={20}
              className={
                hasLiked ? "fill-orange-500 text-orange-500" : "text-gray-400"
              }
            />
            <span className={textSize}>{likes.length}</span>
          </Button>

          {/* Dislike Button */}
          <Button
            variant="default"
            className="flex-1 flex items-center justify-center space-x-2"
            onClick={handleDislikeList}
          >
            <ThumbsDown
              size={20}
              className={
                hasDisliked ? "fill-orange-500 text-orange-500" : "text-gray-400"
              }
            />
            {/*<span className={textSize}>{dislikes.length}</span>*/}
          </Button>
        </div>

        {/* Save Button */}
        <Button
          variant="default"
          className="flex-1 flex items-center justify-center space-x-2"
          onClick={handleSaveList}
        >
          <Bookmark
            size={20}
            className={
              isSaved
                ? "text-orange-500 fill-orange-500"
                : "text-gray-400 fill-none"
            }
          />
          <span className={textSize}>{isSaved ? "Saved" : "Save"}</span>
        </Button>

        {/* Comments Button */}
        <Button
          variant="default"
          className="flex-1 flex items-center justify-center space-x-2"
          onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
        >
          <MessageSquare size={20} className="text-gray-400" />
          <span className={textSize}>{comments?.length || 0}</span>
        </Button>

        {/* Remix Button */}
        <Button
          variant="default"
          className="flex-1 flex items-center justify-center space-x-2"
          onClick={() => navigate(`/remix/${list.$id}`)}
        >
          <Wand size={20} className="text-gray-400" />
          <span className={textSize}>Remix</span>
        </Button>

        {/* Embed Button */}
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
      <Popover>
          <PopoverTrigger asChild>
            <Button variant="default" className="flex-1 flex items-center justify-center space-x-2">
              <Smile size={20} className="text-gray-400" />
              <span className={textSize}>React</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1">
            <div className="flex space-x-1">
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiReaction(emoji)}
                  className="text-xl hover:bg-gray-200 rounded p-1"
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
            {(comments?.length ?? 0) > 0 ? (
              <div className="space-y-4">
                {visibleComments.map((comment: any) => (
                  <Comment
                    key={comment.$id}
                    comment={comment}
                    setReply={() => {}}
                    show={true}
                    setCommentId={() => {}}
                    setParentReplyId={() => {}}
                    listId={list.$id}
                  />
                ))}

                {!showAllComments && comments.length > 3 && (
                  <Button
                    variant="link"
                    onClick={handleViewAllComments}
                    className="text-blue-300 flex items-center"
                  >
                    <ChevronDown className="mr-2" size={16} />
                    View all {comments.length} comments
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
                spellCheck={true}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 rounded-lg bg-dark-4 text-light-1 focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                rows={1}
              />
              <div className="flex gap-2 mt-2">
                <Button type="submit" variant="default">
                  Post Comment
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ListStats;