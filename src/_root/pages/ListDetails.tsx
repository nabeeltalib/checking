import React, { useState, useMemo, useEffect, useRef } from "react";
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
} from "@/lib/appwrite/api";
import { Share2, ChevronLeft, ChevronDown, ChevronUp, MoreVertical, Edit, Trash2, Code } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/react-query/queryKeys";

const ListDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useUserContext();
  const { toast } = useToast();
  const { data: list, isLoading } = useGetListById(id || "");
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

  const [isSharing, setIsSharing] = useState(false);

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
      toast({ title: "Failed to share list. Please try again.", variant: "destructive" });
    } finally {
      setIsSharing(false);
    }
  };

  if (isLoading || isCreatorLoading) return <Loader />;
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

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col w-full max-w-3xl mx-auto bg-gray-900 rounded-xl shadow-lg overflow-hidden"
      >
        {/* Header with Creator Options */}
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
          <div className="flex items-center">
          <Button
            onClick={handleShare}
            className="text-light-2 hover:text-primary-500 transition-colors mr-2"
            disabled={isSharing}
          >
            <Share2 size={24} />
          </Button>
          {isCreator && (
            <div className="relative" ref={creatorOptionsRef}>
              <Button
                variant="ghost"
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
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        setShowEmbedOptions(!showEmbedOptions);
                        setShowCreatorOptions(false);
                      }}
                      className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                        isCreator ? "text-light-2 hover:bg-dark-3" : "text-gray-500 cursor-not-allowed"
                      }`}
                      disabled={!isCreator}
                    >
                      <Code className={`mr-2 h-4 w-4 ${isCreator ? "" : "text-gray-500"}`} />
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
            className="flex items-center gap-4 mb-6"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
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
              {listCreator.Public && !isCreator && (
                <Button
                  onClick={isFollowed ? handleUnFollow : handleFollow}
                  disabled={isFollowLoading}
                  className={`mt-2 ${isFollowed ? "bg-dark-4 text-gray-400" : "bg-primary-500 text-white"}`}
                >
                  {isFollowLoading ? <Loader /> : (isFollowed ? "Unfollow" : "Follow")}
                </Button>
              )}
            </div>
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
            <h1 className="text-3xl font-bold mb-2 text-primary-500">{list.Title}</h1>
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
                  className="flex items-center mb-2 bg-gray-800 rounded-md p-3 hover:bg-gray-700 transition-colors duration-300"
                >
                  <span className="text-lg font-bold text-yellow-500 mr-4">{index + 1}</span>
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
                className="bg-primary-500 text-white px-3 py-1 rounded-full text-xs cursor-pointer hover:bg-primary-600 transition-colors duration-300"
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
            
            {list.locations.length > 0 && (
              <div className="mt-2">
                <strong>Locations: </strong>
                {list.locations.join(", ")}
              </div>
            )}
    
            {list.timespans.length > 0 && (
              <div className="mt-2">
                <strong>Timespans: </strong>
                {list.timespans.join(", ")}
              </div>
            )}
          </motion.div>
    
        {/* Embed Section - Only visible to the creator */}
        {showEmbedOptions && isCreator && (
          <motion.div 
            className="mt-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <h2 className="text-xl font-bold text-light-1 mb-4">Embed This List</h2>
            <div className="flex justify-between mb-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsStatic(true)}
                  className={`px-4 py-2 rounded ${isStatic ? "bg-primary-500 text-white" : "bg-dark-4 text-light-2"}`}
                >
                  Static
                </button>
                <button
                  onClick={() => setIsStatic(false)}
                  className={`px-4 py-2 rounded ${!isStatic ? "bg-primary-500 text-white" : "bg-dark-4 text-light-2"}`}
                >
                  Live
                </button>
              </div>
              <Link to="#" className="text-sm underline text-primary-500">
                What's the difference?
              </Link>
            </div>
            <div className="bg-dark-4 p-4 rounded">
              <code className="text-light-2 break-all">{embedLink}</code>
            </div>
            <Link 
              to={`${import.meta.env.VITE_APP_DOMAIN}/embedpreview/${list.$id}`} 
              className="text-primary-500 hover:underline mt-2 inline-block p-6"
            >
              See Preview
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
            <Loader />
          ) : relatedLists && relatedLists.length > 0 ? (
            <GridListList lists={relatedLists} />
          ) : (
            <p className="text-light-2">No related rankings found</p>
          )}
        </motion.div>
        </motion.div>
  );
};

export default ListDetails;