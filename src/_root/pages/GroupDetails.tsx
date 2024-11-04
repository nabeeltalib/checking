import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2, Copy, Plus, ChevronUp, ChevronDown,
  Clock, Users, MessageCircle, Edit, Trash2,
  Settings, Trophy, Star, AlertTriangle
} from 'lucide-react';
import { useUserContext } from '@/context/AuthContext';
import { useCreateGroupComment, useGetGroupComments } from '@/lib/react-query/queries';
import { deleteGroup, getGroup, createReply, updateCommentWithReply, updateReplyWithReply } from '@/lib/appwrite/api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useShareDialog } from '@/components/shared/ShareDialogContext';
import { Loader } from '@/components/shared';
import GroupListCard from '@/components/shared/GroupListCard';
import Comment from '@/components/shared/Comment';
import VoteOnList from '@/components/shared/VoteOnList';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const GroupDetails = () => {
  const { groupId } = useParams();
  const { user } = useUserContext();
  const { id } = user;
  const [group, setGroup] = useState<any>(null);
  const [vote, setVote] = useState(false);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const [areAllCommentsVisible, setAreAllCommentsVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isReply, setIsReply] = useState(false);
  const [commentId, setCommentId] = useState('');
  const [parentReplyId, setParentReplyId] = useState('');
  const [isEmbed, setIsEmbed] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [combinedList, setCombinedList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleComments, setVisibleComments] = useState<any[]>([]);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { openShareDialog } = useShareDialog();
  const { data: comments, refetch: refetchComments } = useGetGroupComments(group?.$id);
  const { mutate: createGroupComment } = useCreateGroupComment();

  const embedLink = `<iframe src="${import.meta.env.VITE_APP_DOMAIN}/embed-group/${group?.$id}" width="50%" height="600"></iframe>`;
  const isCreator = group?.creator?.$id === user.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getGroup(groupId);
        setGroup(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load group data",
          variant: "destructive",
        });
      }
    };
    fetchData();
  }, [groupId, vote]);

  useEffect(() => {
    setVisibleComments(
      areAllCommentsVisible ? comments : comments?.slice(0, 3) || []
    );
  }, [comments, areAllCommentsVisible]);

  useEffect(() => {
    if (group?.votes === "one") {
      const hasVoted = group?.groupLists?.some((item: any) => item.votes.includes(id));
      setVote(hasVoted);
    }
  }, [group, id]);

  useEffect(() => {
    if (group?.groupLists && Array.isArray(group.groupLists) && group.noOfLists != null) {
      const placeholdersNeeded = group.noOfLists - group.groupLists.length;
      setCombinedList([
        ...group.groupLists,
        ...Array.from({ length: Math.max(0, placeholdersNeeded) }, () => null)
      ]);
    }
  }, [group]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === "") return;

    try {
      if (isReply) {
        await handleReplySubmit();
      } else {
        await createGroupComment({
          groupId: group.$id,
          userId: id,
          Content: newComment,
        });
      }

      resetCommentForm();
      refetchComments();
      toast({
        title: "Success",
        description: isReply ? "Reply added successfully" : "Comment posted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment or reply",
        variant: "destructive",
      });
    }
  };

  const handleReplySubmit = async () => {
    const replyData = {
      userId: id,
      Content: newComment,
      commentId: commentId,
      parentReplyId: parentReplyId,
    };

    const newReply = await createReply(replyData);
    if (!newReply) return;

    if (parentReplyId) {
      await updateReplyWithReply(parentReplyId, newReply.$id);
    } else {
      await updateCommentWithReply(commentId, newReply.$id);
    }
  };

  const resetCommentForm = () => {
    setNewComment("");
    setIsReply(false);
    setCommentId("");
    setParentReplyId("");
  };

  const handleShare = async (e: React.MouseEvent) => {
    if (!group) return;
    e.preventDefault();
    e.stopPropagation();

    const shareableLink = `${import.meta.env.VITE_APP_DOMAIN || 'http://localhost:3000'}/group/${group.$id}`;
    
    try {
      if (isMobile() && navigator.share) {
        await navigator.share({
          title: group.challengeTitle,
          text: `Check out this group: ${group.challengeTitle}`,
          url: shareableLink,
        });
      } else {
        openShareDialog(shareableLink, group.challengeTitle);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share group",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteGroup(group);
      navigate(-1);
      toast({
        title: "Success",
        description: "Group deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedLink);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  if (!group) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-2 rounded-xl p-6 mb-8"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-400">
              {group.header}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-gray-400">
              <div className="flex items-center">
                <Clock size={16} className="mr-1" />
                {group.days} days left
              </div>
              <div className="flex items-center">
                <Users size={16} className="mr-1" />
                {group.groupLists?.length || 0} participants
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCreator ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEmbed(!isEmbed)}>
                    <Code size={16} className="mr-2" />
                    Embed Challenge
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/create-group/${group.$id}`}>
                      <Edit size={16} className="mr-2" />
                      Edit Group
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-red-500"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete Group
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="hover:bg-dark-3"
            >
              <Share2 size={20} />
            </Button>
          </div>
        </div>

        {isEmbed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-3 p-4 rounded-lg mt-4"
          >
            <div className="flex items-center justify-between">
              <code className="text-sm text-gray-300 break-all flex-grow mr-4">
                {embedLink}
              </code>
              <Button
                size="sm"
                onClick={handleCopyEmbed}
                className="shrink-0"
              >
                {copiedEmbed ? (
                  <Check size={16} className="mr-2" />
                ) : (
                  <Copy size={16} className="mr-2" />
                )}
                {copiedEmbed ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Featured Lists Section */}
      {group.highlights.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Star className="text-yellow-500 mr-2" size={24} />
            Featured Lists
          </h2>
          
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6">
              {group.highlights.map((item: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="w-[300px] shrink-0"
                >
                  <GroupListCard list={item} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Challenge Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Trophy className="text-orange-500 mr-2" size={24} />
          {group.challengeTitle}
        </h2>

        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6">
            {(group.noOfLists === null ? group.groupLists : combinedList).map((item: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="w-[300px] shrink-0"
              >
                {item ? (
                  <VoteOnList item={item} vote={vote} setVote={setVote}>
                    <GroupListCard
                      list={item.lists}
                      creator={item.creator}
                      noTitle={Boolean(group.noOfLists)}
                      noAction={true}
                    />
                  </VoteOnList>
                ) : (
                  <Link
                    to={`/create-list/${group.challengeTitle.replace(/\s+/g, '-')}/${group.$id}`}
                    className="bg-dark-3 rounded-xl h-[400px] flex items-center justify-center hover:bg-dark-4 transition-colors"
                  >
                    <div className="text-center">
                      <Plus size={40} className="mx-auto mb-2 text-gray-400" />
                      <span className="text-gray-400">Add Your List</span>
                    </div>
                  </Link>
                )}
                {index !== (group.noOfLists === null ? group.groupLists.length : combinedList.length) - 1 && (
                  <div className="flex items-center justify-center w-[50px]">
                    <span className="text-xl font-bold text-gray-400">VS</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Comments Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-2 rounded-xl p-6"
      >
        <Button
          onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
          className="w-full flex items-center justify-between mb-6"
          variant="ghost"
        >
          <div className="flex items-center">
            <MessageCircle className="mr-2" size={20} />
            <span>Comments ({comments?.length || 0})</span>
          </div>
          {isCommentsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </Button>

        <AnimatePresence>
          {isCommentsExpanded && (
            <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {/* Comments List */}
            <div className="space-y-4">
              {visibleComments.length > 0 ? (
                visibleComments.map((comment) => (
                  <motion.div
                    key={comment.$id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Comment
                      comment={comment}
                      setReply={setIsReply}
                      show={true}
                      setCommentId={setCommentId}
                      setParentReplyId={setParentReplyId}
                      listId={group.$id}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <MessageCircle 
                    size={40} 
                    className="mx-auto mb-3 text-gray-500" 
                  />
                  <p className="text-gray-400 font-medium">No comments yet</p>
                  <p className="text-gray-500 text-sm">Be the first to share your thoughts!</p>
                </motion.div>
              )}

              {/* Show More/Less Button */}
              {comments && comments.length > 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <Button
                    variant="ghost"
                    onClick={() => setAreAllCommentsVisible(!areAllCommentsVisible)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {areAllCommentsVisible ? (
                      <span className="flex items-center">
                        <ChevronUp size={16} className="mr-1" />
                        Show less
                      </span>
                    ) : (
                      <span>
                        Show all {comments.length} comments
                      </span>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Comment Input Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleCommentSubmit}
              className="space-y-4"
            >
              <div className="relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={isReply ? "Write a reply..." : "Add a comment..."}
                  className="w-full p-4 bg-dark-3 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none min-h-[100px]"
                  rows={3}
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  {isReply && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsReply(false);
                        setCommentId("");
                        setParentReplyId("");
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={!newComment.trim()}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {isReply ? "Reply" : "Comment"}
                  </Button>
                </div>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>

    {/* Time Remaining Banner */}
    {group.days > 0 && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6"
      >
        <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-full px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-white" />
            <span className="text-white font-medium">
              {group.days} days remaining
            </span>
          </div>
        </div>
      </motion.div>
    )}

    {/* Loading Overlay */}
    {isLoading && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div className="bg-dark-2 rounded-xl p-6 flex items-center gap-3">
          <Loader />
          <span className="text-white">Processing...</span>
        </div>
      </motion.div>
    )}
  </div>
);
};

export default GroupDetails;