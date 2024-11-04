import React, { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, AlertCircle } from "lucide-react";
import { useUserContext } from "@/context/AuthContext";
import { likeGroupList } from "@/lib/appwrite/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface VoteOnListProps {
  children: React.ReactNode;
  item: any;
  vote: boolean;
  setVote: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const VoteOnList: React.FC<VoteOnListProps> = ({ children, item, vote, setVote }) => {
  const { user } = useUserContext();
  const { id } = user;
  const { toast } = useToast();
  
  const [likes, setLikes] = useState<string[]>(() => item.votes || []);
  const [isVoting, setIsVoting] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const hasLiked = useMemo(() => likes.includes(id), [likes, id]);

  const handleLikeList = useCallback(async () => {
    if (!item || isVoting) return;

    if (vote && !hasLiked) {
      toast({
        title: "Already Voted",
        description: "You can only vote for one list in this challenge.",
        variant: "default",
        duration: 3000,
      });
      return;
    }

    setIsVoting(true);
    const updatedLikes = hasLiked
      ? likes.filter((userId) => userId !== id)
      : [...likes, id];

    setLikes(updatedLikes);

    try {
      await likeGroupList(item.$id, { votes: updatedLikes });
      
      if (!hasLiked) {
        toast({
          title: "Vote Counted! 🎉",
          description: "Your vote has been recorded successfully.",
          variant: "default",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error voting for list:", error);
      setLikes(likes);
      toast({
        title: "Vote Failed",
        description: "Unable to record your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
      setVote((prev: boolean) => !prev);
    }
  }, [likes, id, item, hasLiked, vote, toast, setVote]);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main Content */}
      <motion.div
        className={`relative ${hasLiked ? 'ring-2 ring-orange-500 ring-opacity-50 rounded-xl' : ''}`}
        animate={{ scale: hasLiked ? 1.02 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>

      {/* Vote Button */}
      <div className="mt-4">
        <div className="flex flex-col items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setShowHint(true)}
            onHoverEnd={() => setShowHint(false)}
          >
            <Button
              variant={hasLiked ? "default" : "outline"}
              onClick={handleLikeList}
              disabled={isVoting || (vote && !hasLiked)}
              className={`relative overflow-hidden ${
                hasLiked 
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white' 
                  : 'hover:bg-dark-3'
              }`}
            >
              <AnimatePresence>
                {isVoting && (
                  <motion.div
                    className="absolute inset-0 bg-black bg-opacity-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2">
                <ThumbsUp
                  size={18}
                  className={`${
                    hasLiked ? "fill-white text-white" : "text-gray-400"
                  } transition-colors`}
                />
                
                <motion.span
                  key={likes.length}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="min-w-[20px]"
                >
                  {likes.length}
                </motion.span>

                {vote && !hasLiked && (
                  <AlertCircle size={14} className="text-gray-400 ml-1" />
                )}
              </div>
            </Button>
          </motion.div>

          {/* Hint Text */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-gray-400 text-center"
              >
                {vote && !hasLiked 
                  ? "You've already voted for another list"
                  : hasLiked 
                    ? "Click to remove your vote" 
                    : "Click to vote for this list"
                }
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Vote Count */}
        <AnimatePresence>
          {likes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-center mt-2 text-sm text-gray-400"
            >
              {likes.length === 1 ? '1 vote' : `${likes.length} votes`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default VoteOnList;