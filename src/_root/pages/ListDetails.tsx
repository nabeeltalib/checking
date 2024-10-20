import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetListById,
  useGetRelatedLists,
  useDeleteList,
  useGetUserById,
} from "@/lib/react-query/queries";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/shared";
import GridListList from "@/components/shared/GridListList";
import ListStats from "@/components/shared/ListStats";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  createEmbedList,
  followUser,
  getConnection,
  getListById,
  shareList,
  UnFollow,
  reportList,
} from "@/lib/appwrite/api";
import { Share2, ChevronLeft, ChevronDown, ChevronUp, MoreVertical, Edit, Trash2, Code, Copy, MapPin, Clock } from 'lucide-react';
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/react-query/queryKeys";
import LoaderOverlay from "@/components/shared/LoaderOverlay";
import { useShareDialog } from "@/components/shared/ShareDialogContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Tooltip from "@/components/ui/Tooltip";

const ListDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useUserContext();
  const { toast } = useToast();
  const { data: list, isLoading } = useGetListById(id || "", user.id);
  const { mutateAsync: deleteList, isLoading: isDeleting } = useDeleteList();
  const { data: relatedLists, isLoading: isRelatedListsLoading } =
    useGetRelatedLists(id || "");
  const { data: listCreator, isLoading: isCreatorLoading } = useGetUserById(
    list?.creator?.$id || ""
  );
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isEmbed, setIsEmbed] = useState(false);
  const [isStatic, setIsStatic] = useState(true);
  const [followedBy, setFollowedBy] = useState<any>([]);
  const [connection, setConnection] = useState<any>(undefined);
  const queryClient = useQueryClient();
  const [showCreatorOptions, setShowCreatorOptions] = useState(false);
  const [showEmbedOptions, setShowEmbedOptions] = useState(false);
  const creatorOptionsRef = useRef<HTMLDivElement>(null);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [isReply, setIsReply] = useState(false);
  const [commentId, setCommentId] = useState("");
  const { openShareDialog } = useShareDialog();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (creatorOptionsRef.current && !creatorOptionsRef.current.contains(event.target as Node)) {
        setShowCreatorOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const fetchedList = await getListById(id);
      const ProfileConnection = await getConnection(fetchedList.creator.$id);
      const ProfileViewerConnection = await getConnection(user.id);

      ProfileConnection.length > 0 && setConnection(ProfileConnection[0]);

      let commonConnection = [],
        remainingConnection = [],
        displayConnection = [];

      if (ProfileConnection?.length > 0 && ProfileViewerConnection?.length > 0) {
        commonConnection = ProfileConnection[0]?.follower.filter((user: any) =>
          ProfileViewerConnection[0]?.following.includes(user.$id)
        );
        remainingConnection = ProfileConnection[0]?.follower.filter(
          (user: any) => !ProfileViewerConnection[0]?.following.includes(user.$id)
        );
      }

      if (commonConnection.length > 0) {
        displayConnection = [...commonConnection, ...remainingConnection];
      } else {
        displayConnection = ProfileConnection.length > 0 ? ProfileConnection[0].follower : [""];
      }
      setFollowedBy(displayConnection);
    };

    if (id) {
      fetchData();
    }
  }, [id, user.id]);
  const isCreator = list?.creator?.$id === user.id;

  const [isExpanded, setIsExpanded] = useState(false);

  const visibleItems = useMemo(() => {
    if (!list) return [];
    return isExpanded ? list.item : list.item.slice(0, 4);
  }, [list, isExpanded]);

  const handleDeleteList = async () => {
    if (!id) return;
    try {
      await deleteList(id);
      toast({ title: "List deleted successfully!" });
      queryClient.invalidateQueries([QUERY_KEYS.GET_INFINITE_LISTS]);
      navigate("/");
    } catch (error) {
      toast({ title: "Error deleting list", variant: "destructive" });
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const shareableLink = await shareList(id);
      if (isMobile() && navigator.share) {
        await navigator.share({
          title: list?.Title || 'Shared List',
          text: `Check out this list: ${list?.Title}`,
          url: shareableLink,
        });
      } else {
        openShareDialog(shareableLink, list?.Title || 'Shared List');
      }
    } catch (error) {
      console.error("Error sharing list:", error);
      toast({ 
        title: "Error", 
        description: "Failed to generate shareable link. Please try again.", 
        variant: "destructive" 
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
      await reportList(id!, user.id, list!.Title, reportReason);
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
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    }
  }, [id, user.id, list, reportReason, toast]);
  
  const LoadingSkeleton: React.FC = () => (
    <div className="animate-pulse">
      <div className="h-48 bg-dark-3 rounded-b-lg mb-4"></div>
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 bg-dark-2 p-6 rounded-lg shadow-lg -mt-20 mx-4 relative z-10">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-dark-3"></div>
        <div className="flex-grow space-y-4">
          <div className="h-8 bg-dark-3 rounded w-3/4"></div>
          <div className="h-4 bg-dark-3 rounded w-1/2"></div>
          <div className="h-4 bg-dark-3 rounded w-full"></div>
        </div>
      </div>
      <div className="mt-8 space-y-4 p-6">
        <div className="h-8 bg-dark-3 rounded w-3/4"></div>
        <div className="h-4 bg-dark-3 rounded w-full"></div>
        <div className="h-4 bg-dark-3 rounded w-full"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-10 bg-dark-3 rounded"></div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 my-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-6 w-20 bg-dark-3 rounded-full"></div>
          ))}
        </div>
        <div className="h-20 bg-dark-3 rounded"></div>
      </div>
    </div>
  );

  if (isLoading || isCreatorLoading) return <LoadingSkeleton />;
  if (!list || !listCreator) return <div className="text-center text-light-1">List not found</div>;


  const isOwnProfile = user.id === list.creator.$id;
  const isFollowed = connection?.follower?.some((follow: any) => follow.$id === user.id);

  const handleFollow = async () => {
    setIsFollowLoading(true);
    await followUser(user.id, list.creator.$id);
    const resp = await getConnection(list.creator.$id);
    resp.length > 0 ? setConnection(resp[0]) : setConnection(resp);
    setIsFollowLoading(false);
  };

  const handleUnFollow = async () => {
    setIsFollowLoading(true);
    await UnFollow(user.id, list.creator.$id);
    const resp = await getConnection(list.creator.$id);
    resp.length > 0 ? setConnection(resp[0]) : setConnection(resp);
    setIsFollowLoading(false);
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

  const embedLink = isStatic
    ? `<iframe src="${import.meta.env.VITE_APP_DOMAIN}/staticframe/${list.$id}" width="50%" height="600"></iframe>`
    : `<iframe src="${import.meta.env.VITE_APP_DOMAIN}/liveframe/${list.$id}" width="50%" height="600"></iframe>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedLink);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col w-full max-w-3xl mx-auto bg-gray-900 rounded-xl shadow-lg overflow-hidden"
    >
       {/* Loader Overlay for Deletion */}
       <AnimatePresence>
        {isDeleting && <LoaderOverlay />}
      </AnimatePresence>

      {/* Header with action items */}
      <motion.div 
        className="sticky top-0 z-10 bg-dark-3 p-4 border-b border-dark-4 flex justify-between items-center"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
      >
        <Button
          onClick={() => navigate(-1)}
          className="text-primary-500 font-bold text-lg flex items-center"
        >
          <ChevronLeft size={24} />
          Back
        </Button>
        <div className="flex items-center space-x-2">
          <Tooltip content="Share">
            <Button
              onClick={handleShare}
              className="text-light-2 hover:text-primary-500 transition-colors"
              aria-label="Share this list"
            >
              <Share2 size={24} />
            </Button>
          </Tooltip>
          {!isCreator && (
            <Tooltip content="Report">
              <Button
                onClick={handleReport}
                className="text-light-2 hover:text-primary-500 transition-colors"
                aria-label="Report this list"
              >
                <MoreVertical size={18} />
              </Button>
            </Tooltip>
          )}
          {isCreator && (
            <div className="relative" ref={creatorOptionsRef}>
              <Button
                variant="default"
                className="p-2"
                onClick={() => setShowCreatorOptions(!showCreatorOptions)}
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
              
              {showCreatorOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-dark-4 rounded-md shadow-lg z-20">
                  <div className="py-1">
                    <button
                      onClick={() => navigate(`/update-list/${list?.$id}`)}
                      className="flex items-center px-4 py-2 text-sm text-light-2 hover:bg-dark-3 w-full text-left"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteList}
                      className="flex items-center px-4 py-2 text-sm text-light-2 hover:bg-dark-3 w-full text-left"
                      disabled={isDeleting}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                    <button
                      onClick={() => {
                        setShowEmbedOptions(!showEmbedOptions);
                        setShowCreatorOptions(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-light-2 hover:bg-dark-3 w-full text-left"
                    >
                      <Code className="mr-2 h-4 w-4" />
                      Embed
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <div className="p-6">
        {/* Creator Info */}
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <img
              src={listCreator.ImageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="creator"
              className="w-16 h-16 rounded-full object-cover shadow-lg"
            />
            <div>
              <Link to={`/profile/${listCreator.$id}`} className="text-xl font-semibold text-light-1 hover:text-primary-500 transition-colors">
                {listCreator.Name}
              </Link>
              <p className="text-light-3">@{listCreator.Username}</p>
            </div>
          </div>

          {listCreator.Public && !isCreator && (
            <Button
              onClick={isFollowed ? handleUnFollow : handleFollow}
              disabled={isFollowLoading}
              className={`ml-auto ${isFollowed ? "bg-dark-4 text-gray-400" : "bg-primary-500 text-white"}`}
            >
              {isFollowLoading ? <Loader /> : (isFollowed ? "Unfollow" : "Follow")}
            </Button>
          )}
        </motion.div>
  
          {/* Followed By */}
          {followedBy.length > 0 && (
            <motion.div
              className="mb-4 text-xs text-light-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {followedBy.length > 2 ? (
                <span>
                  Followed by{" "}
                  {followedBy.slice(0, 2).map((user: any, index: number) => (
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
                  {followedBy.map((user: any, index: number) => (
                    <React.Fragment key={user.$id}>
                      <Link
                        to={`/profile/${user.$id}`}
                        className="font-semibold hover:text-primary-500 transition-colors duration-300"
                      >
                        {user.Name}
                      </Link>
                      {index === 0 && followedBy.length > 1 && " and "}
                    </React.Fragment>
                  ))}
                </span>
              )}
            </motion.div>
          )}            
    
          {/* List Title and Description */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-3xl font-bold mb-2 text-orange-200">{list.Title}</h1>
            {list.Description && (
              <p className="text-light-2 mb-4">{list.Description}</p>
            )}
          </motion.div>
    
          {/* List Items */}
          <motion.ul 
            className="space-y-3 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <AnimatePresence>
              {visibleItems?.map((item: any, index: number) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center mb-2 bg-gray-900 rounded-md p-2 hover:bg-gray-700 transition-colors duration-300"
                >
                  <span className="text-lg font-bold text-orange-500 mr-4">{index + 1}</span>
                  <span className="text-light-1">{item?.content || item}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
    
          {list.item.length > 4 && (
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center text-primary-500 font-semibold mx-auto"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="mr-1" size={16} />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1" size={16} />
                  + {list.item.length - 4} more items
                </>
              )}
            </Button>
          )}
    
          {/* Tags */}
          <motion.div 
            className="flex flex-wrap gap-2 my-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {list?.Tags?.map((tag: string, index: number) => (
              <span
                key={`${tag}${index}`}
                onClick={() => navigate(`/categories/${tag}`)}
                className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs cursor-pointer hover:bg-primary-600 transition-colors duration-300"
              >
                #{tag}
              </span>
            ))}
          </motion.div>
    
          {/* Additional Info */}
          <motion.div
            className="text-light-3 text-sm mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p>Created {formatDistanceToNow(new Date(list.$createdAt), { addSuffix: true })}</p>
            
            <div>
          {/* Locations and Timespans */}
          {list.locations && list.locations.length > 0 && (
            <div className="flex items-center text-light-2 text-sm mb-2">
              <MapPin size={16} className="mr-2" />
              {list.locations.join(", ")}
            </div>
          )}

          {list.timespans && list.timespans.length > 0 && (
            <div className="flex items-center text-light-2 text-sm">
              <Clock size={16} className="mr-2" />
              {list.timespans.join(", ")}
            </div>
          )}
        </div>
          </motion.div>
    
         {/* Embed Section - Only visible to the creator */}
          {showEmbedOptions && isCreator && (
            <motion.div 
              className={`mt-6 p-4 rounded-lg ${showEmbedOptions ? 'bg-dark-1' : ''}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <h2 className="text-lg font-bold text-gray-200 mb-4">Embed This Ranking</h2>
              <div className="flex justify-between mb-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsStatic(true)}
                    className={`px-4 py-2 rounded ${isStatic ? "bg-dark-4 text-white" : "text-gray-300"}`}
                  >
                    Static
                  </button>
                  <button
                    onClick={() => setIsStatic(false)}
                    className={`px-4 py-2 rounded ${!isStatic ? "bg-dark-4 text-white" : " text-gray-300"}`}
                  >
                    Live
                  </button>
                </div>
                <Link to="#" className="text-sm underline text-primary-500">
                  What's the difference?
                </Link>
              </div>
              <div className="bg-dark-4 p-4 rounded flex items-center justify-between">
                <code className="text-gray-300 break-all flex-grow mr-2">{embedLink}</code>
                <Button
                  onClick={handleCopyEmbed}
                  className="hover:bg-primary-600 text-white px-3 py-1 rounded flex items-center text-xs"
                >
                  {copiedEmbed ? 'Copied!' : <><Copy size={16} className="mr-1" /> </>}
                </Button>
              </div>
              <Link 
                to={`${import.meta.env.VITE_APP_DOMAIN}/embedpreview/${list.$id}`} 
                className="text-primary-500 hover:underline inline-block mt-4"
              >
                See Embed Preview
              </Link>
            </motion.div>
          )}
         {/* List Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <ListStats
          list={list}
          userId={user.id}
          setIsEmbed={isCreator ? setShowEmbedOptions : undefined}
          textSize="text-sm"
          backgroundColor="bg-gray-900"
          isCreator={isCreator}
          dislikesCount={isCreator ? list.DislikesCount : undefined}
        />
      </motion.div>

      </div>
    
        {/* Related Lists */}
      <motion.div 
        className="p-6 bg-dark-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <h3 className="text-2xl font-bold text-light-1 mb-6">Related Rankings</h3>
        {isRelatedListsLoading ? (
          <LoadingSkeleton />
        ) : relatedLists && relatedLists.length > 0 ? (
          <GridListList lists={relatedLists} />
        ) : (
          <p className="text-light-2">No related rankings found</p>
        )}
      </motion.div>
      {/* Add the Report Dialog */}
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
            <Button variant="default" onClick={() => setIsReportDialogOpen(false)}>Cancel</Button>
            <Button onClick={submitReport}>Submit Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ListDetails;