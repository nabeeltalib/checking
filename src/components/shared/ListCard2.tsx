import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Bookmark,
  MapPin,
  Clock,
  ChevronDown,
  MoreVertical,
  Flag,
  ChevronUp,
  Wand,
} from 'lucide-react';
import {
  followUser,
  getConnection,
  shareList,
  UnFollow,
  likeList as likeListAPI,
  reportList,
} from '@/lib/appwrite/api';
import {
  useDeleteSavedList,
  useGetComments,
  useGetCurrentUser,
  useSaveList,
  useCreateComment,
} from '@/lib/react-query/queries';
import Comment from './Comment';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useUserContext } from '@/context/AuthContext';
import Loader from './Loader';
import Tooltip from '@/components/ui/Tooltip';
import { useShareDialog } from '@/components/shared/ShareDialogContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const ListCard2 = ({ list }) => {
  const navigate = useNavigate();
  const { data: currentUser } = useGetCurrentUser();
  const { mutate: deleteSaveList } = useDeleteSavedList();
  const { mutate: saveList } = useSaveList();
  const { toast } = useToast();

  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [connection, setConnection] = useState(undefined);
  const [followedBy, setFollowedBy] = useState([]);
  const [likes, setLikes] = useState(list?.Likes || []);
  const [dislikes, setDislikes] = useState(list?.Dislikes || []);
  const [isSaved, setIsSaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [newComment, setNewComment] = useState('');
  const { data: comments, isLoading: isLoadingComments } = useGetComments(list?.$id);
  const [firstComment, setFirstComment] = useState(null);
  const [firstReply, setFirstReply] = useState(null);
  const { mutateAsync: createComment, isLoading: isSubmittingComment } = useCreateComment();
  const { openShareDialog } = useShareDialog();
  const { user } = useUserContext();
  const { id } = user;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const hasLiked = useMemo(() => likes.includes(id), [likes, id]);
  const hasDisliked = useMemo(() => dislikes.includes(id), [dislikes, id]);

  useEffect(() => {
    if (list) {
      setLikes(list.Likes || []);
      setDislikes(list.Dislikes || []);
    }
  }, [list]);

  useEffect(() => {
    if (comments && comments.length > 0) {
      setFirstComment(comments[0]);
      if (comments[0].Reply && comments[0].Reply.length > 0) {
        setFirstReply(comments[0].Reply[0]);
      }
    }
  }, [comments]);

  useEffect(() => {
    if (currentUser && list) {
      setIsSaved(
        currentUser.save?.some((saved) => saved.list?.$id === list.$id) || false
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

          let commonConnection = [],
            remainingConnection = [],
            displayConnection = [];

          if (ProfileConnection?.length > 0 && ProfileViewerConnection?.length > 0) {
            commonConnection = ProfileConnection[0]?.follower.filter((user) =>
              ProfileViewerConnection[0]?.following.includes(user.$id)
            );
            remainingConnection = ProfileConnection[0]?.follower.filter(
              (user) => !ProfileViewerConnection[0]?.following.includes(user.$id)
            );
          }

          if (commonConnection.length > 0) {
            displayConnection = [...commonConnection, ...remainingConnection];
          } else {
            displayConnection = ProfileConnection.length > 0 ? ProfileConnection[0].follower : [];
          }

          setFollowedBy(displayConnection);
        } catch (error) {
          console.error('Error fetching connections:', error);
        }
      }
    };

    fetchData();
  }, [list?.creator?.$id, user.id]);

  const isOwnProfile = user.id === list?.creator?.$id;
  const isFollowed = connection?.follower?.some((follow) => follow.$id === user.id);

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
      console.error('Error liking list:', error);
      setLikes(likes);
      setDislikes(dislikes);
      toast({
        title: 'Error',
        description: 'Failed to update like status. Please try again.',
        variant: 'destructive',
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
      console.error('Error disliking list:', error);
      setLikes(likes);
      setDislikes(dislikes);
      toast({
        title: 'Error',
        description: 'Failed to update dislike status. Please try again.',
        variant: 'destructive',
      });
    }
  }, [likes, dislikes, id, list, hasLiked, hasDisliked, toast]);

  const handleSaveList = useCallback(async () => {
    if (!list || !currentUser) return;
    try {
      if (isSaved) {
        const savedListRecord = currentUser.save?.find(
          (record) => record.list?.$id === list.$id
        );
        if (savedListRecord) {
          await deleteSaveList(savedListRecord.$id);
        }
      } else {
        await saveList({ userId: id, listId: list.$id });
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error saving list:', error);
      toast({
        title: 'Error',
        description: 'Failed to save list. Please try again.',
        variant: 'destructive',
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
        title: 'Followed',
        description: `You are now following ${list.creator.Name}.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        title: 'Error',
        description: 'Failed to follow user. Please try again.',
        variant: 'destructive',
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
        title: 'Unfollowed',
        description: `You have unfollowed ${list.creator.Name}.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast({
        title: 'Error',
        description: 'Failed to unfollow user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsFollowLoading(false);
    }
  }, [list?.creator, user.id, toast]);

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const shareableLink = await shareList(list.$id);
      openShareDialog(shareableLink, list.Title);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate shareable link. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReport = useCallback(() => {
    if (!user || !user.id) {
      toast({
        title: "Error",
        description: "You must be logged in to report a list.",
        variant: "destructive",
      });
      return;
    }

    setIsReportDialogOpen(true);
  }, [user, toast]);

  const submitReport = useCallback(async () => {
    if (!reportReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for reporting.",
        variant: "destructive",
      });
      return;
    }

    try {
      await reportList(list.$id, user.id, list.Title, reportReason);
      toast({
        title: "List Reported",
        description: "Thank you for your report. We'll review it as soon as possible.",
      });
      setIsReportDialogOpen(false);
      setReportReason('');
    } catch (error) {
      console.error('Error reporting list:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    }
  }, [list, user.id, reportReason, toast]);

  const renderListItems = useMemo(() => {
    if (!list || !list.items) return null;

    let items = [];

    if (Array.isArray(list.items)) {
      items = list.items;
    } else if (typeof list.items === 'string') {
      items = list.items.split('\n');
    } else if (typeof list.items === 'object' && list.items !== null) {
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
          className="flex items-center mb-1 bg-gray-900 rounded-md p-0 hover:bg-gray-700 transition-colors duration-300"
        >
          <span className="text-lg font-bold text-orange-200 mr-4">
            {index === 0 ? <span className="text-orange-200">#1</span> : index + 1}
          </span>
          <span className="text-sm text-white truncate">
            {typeof item === 'string' ? item : item.content || ''}
          </span>
        </motion.li>
      ));
  }, [list?.items, isExpanded]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim() === '') return;

    try {
      const newCommentData = await createComment({
        listId: list.$id,
        userId: user.id,
        Content: newComment,
      });

      if (newCommentData) {
        setNewComment('');
        if (!firstComment) {
          setFirstComment(newCommentData);
        }
        toast({
          title: 'Comment Posted',
          description: 'Your comment has been added successfully.',
        });
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
      toast({
        title: 'Comment Failed',
        description: 'Unable to post comment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenReportDialog = useCallback(() => {
    setIsReportDialogOpen(true);
    setIsDropdownOpen(false);
  }, []);

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
            <Link to={`/profile/${list.creator.$id}`} className="flex items-center group">
              <img
                src={
                  list.creator?.ImageUrl || '/assets/icons/profile-placeholder.svg'
                }
                alt={`${list.creator?.Name}'s profile`}
                className="w-10 h-10 rounded-full mr-3 border-2 border-transparent group-hover:border-primary-500 transition-all duration-300"
              />
              <div>
                <p className="text-white font-semibold group-hover:text-primary-500 transition-colors duration-300">
                  {list.creator.Name}
                </p>
                <p className="text-gray-400 text-sm">@{list.creator.Username}</p>
              </div>
            </Link>

            <div className="flex items-center">
              {list.creator.Public && !isOwnProfile && (
                <Button
                  className={`text-sm px-4 py-2 rounded-full transition-colors duration-300 ${
                    isFollowed
                      ? 'text-gray-400 hover:text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1 rounded-full mr-2'
                  }`}
                  onClick={isFollowed ? handleUnFollow : handleFollow}
                  disabled={isFollowLoading}
                >
                  {isFollowLoading ? (
                    <Loader />
                  ) : isFollowed ? (
                    'Unfollow'
                  ) : (
                    'Follow'
                  )}
                </Button>
              )}
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="p-1">
                  <MoreVertical size={18} className="text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={handleOpenReportDialog}>
                  <Flag className="mr-2 h-4 w-4" />
                  <span>Report List</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>
        )}
        {/* Followed By */}
        {followedBy.length > 0 && (
          <div className="mb-4 text-xs text-light-3">
            {followedBy.length > 2 ? (
              <span>
                Followed by{' '}
                {followedBy.slice(0, 2).map((user, index) => (
                  <React.Fragment key={user.$id}>
                    <Link
                      to={`/profile/${user.$id}`}
                      className="font-semibold hover:text-primary-500 transition-colors duration-300"
                    >
                      {user.Name}
                    </Link>
                    {index === 0 && ', '}
                  </React.Fragment>
                ))}{' '}
                and {connection?.follower?.length - 2} others
              </span>
            ) : (
              <span>
                Followed by{' '}
                {followedBy.map((user, index) => (
                  <React.Fragment key={user.$id}>
                    <Link
                      to={`/profile/${user.$id}`}
                      className="font-semibold hover:text-primary-500 transition-colors duration-300"
                    >
                      {user.Name}
                    </Link>
                    {index === 0 && followedBy.length > 1 && ' and '}
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

          <h2 className="text-orange-200 text-xl font-bold mb-2">{list.Title}</h2>
          {list.Description && (
            <p className="text-light-2 text-sm">{list.Description}</p>
          )}
        </div>

        {/* List Items */}
        <Link to={`/lists/${list.$id}`} className="block mb-6">
          <AnimatePresence>
            <motion.ol className="list-none space-y-2">{renderListItems}</motion.ol>
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
              {list.tags.slice(0, 3).map((tag, index) => (
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
            list.Tags.map((tag, index) => (
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
            {list.locations.join(', ')}
          </div>
        )}

        {list.timespans && list.timespans.length > 0 && (
          <div className="flex items-center text-light-3 text-sm">
            <Clock size={16} className="mr-2" />
            {list.timespans.join(', ')}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-4 text-sm ml-5 mr-5">
        <div className="flex items-center space-x-4">
          <Tooltip content={hasLiked ? 'Unlike' : 'Like'}>
            <Button variant="default" onClick={handleLikeList} className="p-1">
              <ThumbsUp size={18} className={hasLiked ? 'fill-orange-500 text-orange-500' : 'text-white'} />
              <span className="ml-1">{likes.length}</span>
            </Button>
          </Tooltip>
          <Tooltip content={hasDisliked ? 'Remove dislike' : 'Dislike'}>
            <Button variant="default" onClick={handleDislikeList} className="p-1">
              <ThumbsDown size={18} className={hasDisliked ? 'fill-orange-500 text-orange-500' : 'text-white'} />
              <span className="ml-1">{dislikes.length}</span>
            </Button>
          </Tooltip>
          <Button variant="default" onClick={() => {}} className="p-1">
            <MessageCircle size={18} className="text-gray-500" />
            <span className="ml-1">{comments?.length || 0}</span>
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <Tooltip content={isSaved ? 'Unsave' : 'Save'}>
            <Button onClick={handleSaveList} className="p-1">
              <Bookmark size={18} className={isSaved ? 'fill-orange-500 text-orange-500' : ''} />
            </Button>
          </Tooltip>

          <Tooltip content="Remix">
            <Button variant="default" onClick={() => navigate(`/remix/${list.$id}`)} className="p-1">
              <Wand size={18} className="text-gray-200" />
            </Button>
          </Tooltip>
          <Tooltip content="Share">
            <Button
              onClick={handleShare}
              className="p-1"
              aria-label="Share this list"
            >
              <Share2 size={18} />
            </Button>
          </Tooltip>          
        </div>
      </div>

      {/* Comments Section */}
      <div className="p-4">
        {isLoadingComments ? (
          <p className="text-light-3 text-xs">Loading comments...</p>
        ) : firstComment ? (
          <div className="space-y-4 text-xs">
            <Comment
              comment={firstComment}
              setReply={() => {}}
              show={true}
              setCommentId={() => {}}
              setParentReplyId={() => {}}
              listId={list.$id}
            />
            {firstReply && (
              <div className="ml-4">
                <Comment
                  comment={firstReply}
                  setReply={() => {}}
                  show={true}
                  setCommentId={() => {}}
                  setParentReplyId={() => {}}
                  listId={list.$id}
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-light-3 text-xs">No comments yet. Be the first to comment!</p>
        )}

        {comments && comments.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <Button
              onClick={() => navigate(`/lists/${list.$id}`)}
              className="mt-4 text-primary-500 hover:text-primary-600 transition-colors duration-300 flex items-center"
            >
              View all {comments.length} comments
              <ChevronDown size={16} className="ml-2" />
            </Button>
          </motion.div>
        )}

        {/* Add Comment Input */}
        <div className="flex items-center mt-4">
          <img
            src={currentUser?.ImageUrl || '/assets/icons/profile-placeholder.svg'}
            alt={`${currentUser?.Username}'s avatar`}
            className="w-4 h-4 rounded-full object-cover mr-2"
          />
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm"
          />
          <button
            onClick={handleCommentSubmit}
            disabled={isSubmittingComment || !newComment.trim()}
            className="ml-2 text-blue-500 text-sm font-semibold focus:outline-none"
          >
            Post
          </button>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog
        open={isReportDialogOpen}
        onOpenChange={(open) => {
          setIsReportDialogOpen(open);
          if (!open) {
            setReportReason('');
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Report List</DialogTitle>
            <DialogDescription>
              Please provide a reason for reporting this list. We take all reports seriously and will review them promptly.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Enter your reason for reporting..."
            className="mt-2 bg-dark-4"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>Cancel</Button>
            <Button onClick={submitReport}>Submit Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ListCard2;