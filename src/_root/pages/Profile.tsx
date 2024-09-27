import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetUserById,
  useGetUserLists,
  useGetUserFriends,
  useGetFriendRequests,
} from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";
import GridListList from "@/components/shared/GridListList";
import { Button } from "@/components/ui/button";
import FriendsList from "@/components/shared/FriendsList";
import FriendRequests from "@/components/shared/FriendRequests";
import {
  createNotification,
  followUser,
  getConnection,
  getSentRequests,
  getUserLikedLists,
  sendFriendRequest,
  UnFollow,
} from "@/lib/appwrite/api";
import { motion, AnimatePresence } from "framer-motion";
import { User, UserPlus, Settings, Activity, List, ThumbsUp, Users, ChevronDown, Lock, Edit } from "lucide-react";
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Link as LinkIcon } from 'lucide-react'; // Default icon

const Profile: React.FC = () => {
  const { user } = useUserContext();
  const { profile } = useParams();
  let id = profile ? (profile === "profile" ? user.id : profile) : "";
  const [refresh, setRefresh] = useState(false);

  const navigate = useNavigate();

  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isSendRequestLoading, setIsSendRequestLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("lists");
  const { data: currentUser, isLoading: isLoadingCurrentUser } = useGetUserById(id || "");
  const { data: userLists, isLoading: isLoadingLists } = useGetUserLists(id || "");
  const { data: friends, isLoading: isLoadingFriends } = useGetUserFriends(id || "");
  const { data: friendRequests, isLoading: isLoadingFriendRequests } = useGetFriendRequests(user?.id || "");
  
  const [isCuratedExpanded, setCuratedExpanded] = useState(true);
  const [isSavedExpanded, setSavedExpanded] = useState(true);
  const [isCollaborativeExpanded, setCollaborativeExpanded] = useState(true);
  const [sentRequest, setSentRequest] = useState<any>([]);
  const [connection, setConnection] = useState<any>(undefined);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followdBy, setFollowdBy] = useState<any>([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [userLikedLists, setUserLikedLists] = useState<any>([]);

  useEffect(() => {
    console.log('Current User:', currentUser);
  }, [currentUser]);
  
  useEffect(() => {
    const fetchConnection = async () => {
      if (id) {
        const ProfileConnection = await getConnection(id);
        const ProfileViewerConnection = await getConnection(user.id);
        setConnection(ProfileConnection.length > 0 ? ProfileConnection[0] : undefined);

        let commonConnection = [], remainingConnection = [], displayConnection = [];
        if (ProfileConnection?.length > 0 && ProfileViewerConnection?.length > 0) {
          commonConnection = ProfileConnection[0]?.follower.filter((user: any) =>
            ProfileViewerConnection[0]?.following.includes(user.$id)
          );
          remainingConnection = ProfileConnection[0]?.follower.filter((user: any) =>
            !ProfileViewerConnection[0]?.following.includes(user.$id)
          );
        }

        if (commonConnection.length > 0) {
          displayConnection = [...commonConnection, ...remainingConnection];
        } else {
          displayConnection = ProfileConnection.length > 0 ? ProfileConnection[0].follower : [];
        }
        setFollowdBy(displayConnection);
      }
    };
    fetchConnection();
  }, [id, user.id]);

  // Scroll to top when component mounts or when user navigates to the page
 useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, []);

  useEffect(() => {
    const fetchSentRequests = async () => {
      const res = await getSentRequests();
      const filtered = res.filter((req: any) => req.userId.$id === user.id);
      setSentRequest(filtered);
      setIsRequestSent(filtered.some((data: any) => data.friendId.$id === id));
      setIsSendRequestLoading(false);
    };
    fetchSentRequests();
  }, [id, refresh, user.id]);

  useEffect(() => {
    const fetchLikedLists = async () => {
      const data = await getUserLikedLists(id);
      setUserLikedLists(data);
    };
    fetchLikedLists();
  }, [id]);

  if (!id) return <div className="text-center text-light-1">User ID not found</div>;

  const LoadingSkeleton: React.FC = () => (
    <div className="animate-pulse">
      <div className="h-48 sm:h-64 bg-dark-3 rounded-b-lg mb-4"></div>
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 bg-dark-2 p-6 rounded-lg shadow-lg -mt-20 mx-4 relative z-10">
        <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full bg-dark-3"></div>
        <div className="flex-grow space-y-4">
          <div className="h-8 bg-dark-3 rounded w-3/4"></div>
          <div className="h-4 bg-dark-3 rounded w-1/2"></div>
          <div className="h-4 bg-dark-3 rounded w-full"></div>
        </div>
      </div>
      <div className="mt-8 space-y-4">
        <div className="h-10 bg-dark-3 rounded"></div>
        <div className="h-40 bg-dark-3 rounded"></div>
        <div className="h-40 bg-dark-3 rounded"></div>
      </div>
    </div>
  );

  if (isLoadingCurrentUser || isLoadingLists) return <LoadingSkeleton />;
  if (!currentUser) return <div className="text-center text-light-1">User not found</div>;

  const savedLists = currentUser?.save
    ? currentUser.save.map((savedItem: any) => ({
        ...savedItem.list,
        creator: savedItem.list.creator,
      }))
    : [];

  const collaborativeList: any = [];

  const isOwnProfile = currentUser.$id === user?.id;
  const isFollowed = connection?.follower?.some((follow: any) => follow.$id === user.id);
  const isAccepted = sentRequest.some(
    (data: any) => data.friendId.$id === id && data.status === "accepted"
  );

  const handleFollow = async () => {
    setIsFollowLoading(true);
    await followUser(user.id, id);
    const resp = await getConnection(id);
    setConnection(resp.length > 0 ? resp[0] : resp);
    setIsFollowLoading(false);
  };

  const handleUnFollow = async () => {
    setIsFollowLoading(true);
    await UnFollow(user.id, id);
    const resp = await getConnection(id);
    setConnection(resp.length > 0 ? resp[0] : resp);
    setIsFollowLoading(false);
  };

  const handleFriendRequest = async () => {
    try {
      setIsSendRequestLoading(true);
      await sendFriendRequest(user.id, id);
      await createNotification({
        userId: id,
        type: 'friend_request',
        message: `${user.name} has sent you a friend request. Please check it in your profile Friends tab`,
      });
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSendRequestLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark-1">
      {/* Main Content Wrapper */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col w-full bg-dark-1 px-4 sm:px-6 lg:px-8"
        >
      {/* Cover Photo */}
      <div className="h-48 sm:h-64 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-b-lg relative">
        {isOwnProfile && (
          <Button
            className="absolute bottom-4 right-4 bg-dark-4 text-light-1 hover:bg-dark-3"
            onClick={() => navigate(`/update-profile/${id}`)}
          >
            <Edit size={16} className="mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* User Info */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 bg-dark-2 p-6 rounded-lg shadow-lg -mt-20 mx-4 relative z-10">
        <motion.img
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          src={currentUser.ImageUrl || "/assets/icons/profile-placeholder.svg"}
          alt={`${currentUser.Name}'s profile`}
          className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-dark-1"
        />
        <div className="text-center sm:text-left flex-grow">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between w-full">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-light-1 flex items-center">
                {currentUser.Name}
                {!currentUser.Public && (
                  <Lock size={20} className="ml-2 text-yellow-500" title="Private Profile" />
                )}
              </h1>
              <p className="text-light-3 text-sm">@{currentUser.Username}</p>
              {!currentUser.Public && (
                <p className="text-yellow-500 text-sm mt-1">Private Profile</p>
              )}
              <p className="text-light-2 mt-2 max-w-md">
                {currentUser.Bio || "No bio available"}
              </p>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              {isOwnProfile ? (
                <Button
                  className="bg-gray-700 text-white px-4 py-2 rounded-full hover:bg-primary-600 transition-colors duration-300"
                  onClick={() => navigate(`/update-profile/${id}`)}
                >
                  <Edit size={16} className="mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  {currentUser.Public ? (
                    <Button
                      className={`px-6 py-2 rounded-full ${
                        isFollowed
                          ? "bg-dark-4 text-light-1 hover:bg-red-600 hover:text-white"
                          : "bg-primary-500 text-white hover:bg-primary-600"
                      }`}
                      onClick={isFollowed ? handleUnFollow : handleFollow}
                      disabled={isFollowLoading}
                    >
                      {isFollowLoading ? <Loader /> : (isFollowed ? "Unfollow" : "Follow")}
                    </Button>
                  ) : (
                    <Button
                      className="bg-primary-500 text-white px-6 py-2 rounded-full hover:bg-primary-600"
                      onClick={handleFriendRequest}
                      disabled={isRequestSent || isSendRequestLoading}
                    >
                      {isSendRequestLoading ? <Loader /> : (
                        <>
                          <UserPlus size={16} className="mr-2" />
                          {isRequestSent ? "Request Sent" : "Add Friend"}
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="flex justify-center sm:justify-start gap-6 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-light-1">{connection?.follower?.length || 0}</p>
              <p className="text-light-3 text-sm">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-light-1">{connection?.following?.length || 0}</p>
              <p className="text-light-3 text-sm">Following</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-light-1">{userLists?.length || 0}</p>
              <p className="text-light-3 text-sm">Lists</p>
            </div>
          </div>
          
          {followdBy.length > 2 && (
            <div className="mt-4 text-sm text-light-3">
              Followed by{" "}
              {followdBy.slice(0, 2).map((user: any, index: number) => (
                <Link
                  key={user.$id}
                  to={`/profile/${user.$id}`}
                  className="font-semibold text-primary-500 hover:underline"
                >
                  {user.Name}
                  {index === 0 && ", "}
                </Link>
              ))}{" "}
              <span
                className="cursor-pointer text-primary-500 hover:underline"
                onClick={() => setShowFollowers(true)}
              >
                and {connection.follower.length - 2} others
              </span>
            </div>
          )}
        </div>
      </div>
      {/* Social Media Links */}
      {currentUser.socialLinks && currentUser.socialLinks.length > 0 && (
        <div className="mt-4 flex space-x-4">
          {currentUser.socialLinks.map((link, index) => {
            let IconComponent = LinkIcon; // Default icon
            if (link.includes("twitter.com")) {
              IconComponent = FaTwitter;
            } else if (link.includes("facebook.com")) {
              IconComponent = FaFacebook;
            } else if (link.includes("instagram.com")) {
              IconComponent = FaInstagram;
            } else if (link.includes("linkedin.com")) {
              IconComponent = FaLinkedin;
            }

            return (
              <a key={index} href={link} target="_blank" rel="noopener noreferrer">
                <IconComponent className="text-light-1 hover:text-primary-500" />
              </a>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-8 mb-6 bg-dark-2 p-2 rounded-full w-full max-w-md sm:max-w-lg mx-auto">
        <Button
          onClick={() => setActiveTab("lists")}
          className={`py-1.5 px-4 sm:py-2 sm:px-6 rounded-full transition-all duration-300 flex items-center ${
            activeTab === "lists"
              ? "bg-primary-500 text-white shadow-lg"
              : "bg-transparent text-light-2 hover:bg-dark-3"
          }`}
        >
          <List size={16} className="mr-1.5 sm:mr-2" />
          <span className="text-sm sm:text-base">Rankings</span>
        </Button>
        
        <Button
          onClick={() => setActiveTab("liked")}
          className={`py-1.5 px-4 sm:py-2 sm:px-6 rounded-full transition-all duration-300 flex items-center ${
            activeTab === "liked"
              ? "bg-primary-500 text-white shadow-lg"
              : "bg-transparent text-light-2 hover:bg-dark-3"
          }`}
        >
          <ThumbsUp size={16} className="mr-1.5 sm:mr-2" />
          <span className="text-sm sm:text-base">Liked Rankings</span>
        </Button>

        <Button
          onClick={() => setActiveTab("friends")}
          className={`py-1.5 px-4 sm:py-2 sm:px-6 rounded-full transition-all duration-300 flex items-center ${
            activeTab === "friends"
              ? "bg-primary-500 text-white shadow-lg"
              : "bg-transparent text-light-2 hover:bg-dark-3"
          }`}
        >
          <Users size={16} className="mr-1.5 sm:mr-2" />
          <span className="text-sm sm:text-base">Friends</span>
        </Button>
      </div>

      {/* Content based on selected tab */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full px-4 py-6"
        >
          {activeTab === "lists" && (
            <div className="flex flex-col gap-8">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2
                  className="text-2xl font-bold text-light-1 mb-4 cursor-pointer flex items-center"
                  onClick={() => setCuratedExpanded(!isCuratedExpanded)}
                >
                  Rankings
                  <ChevronDown 
                    size={24}
                    className={`ml-2 transition-transform duration-300 ${isCuratedExpanded ? 'rotate-180' : ''}`}
                  />
                </h2>
                {isCuratedExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <GridListList lists={userLists || []} showUser={false} />
                  </motion.div>
                )}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2
                  className="text-2xl font-bold text-light-1 mb-4 cursor-pointer flex items-center"
                  onClick={() => setSavedExpanded(!isSavedExpanded)}
                >
                  Bookmarks
                  <ChevronDown 
                    size={24}
                    className={`ml-2 transition-transform duration-300 ${isSavedExpanded ? 'rotate-180' : ''}`}
                  />
                </h2>
                {isSavedExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {savedLists.length === 0 ? (
                      <p className="text-light-4">No saved rankings</p>
                    ) : (
                      <GridListList lists={savedLists} showStats={false} />
                    )}
                  </motion.div>
                )}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2
                  className="text-2xl font-bold text-light-1 mb-4 cursor-pointer flex items-center"
                  onClick={() => setCollaborativeExpanded(!isCollaborativeExpanded)}
                >
                  Collaborative Lists
                  <ChevronDown 
                    size={24}
                    className={`ml-2 transition-transform duration-300 ${isCollaborativeExpanded ? 'rotate-180' : ''}`}
                  />
                </h2>
                {isCollaborativeExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {collaborativeList.length === 0 ? (
                      <p className="text-light-4">No collaborative lists</p>
                    ) : (
                      <GridListList lists={collaborativeList} showUser={false} />
                    )}
                  </motion.div>
                )}
              </motion.div>
            </div>
          )}
          
          {activeTab === "liked" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-light-1 mb-4">Liked Rankings</h2>
              {userLikedLists.length > 0 ? (
                <GridListList lists={userLikedLists} showUser={true} />
              ) : (
                <p className="text-light-4">No liked rankings yet</p>
              )}
            </motion.div>
          )}
          
          {activeTab === "friends" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-light-1 mb-4">Friends</h2>
              {isLoadingFriends ? (
                <Loader />
              ) : friends && friends.length > 0 ? (
                <FriendsList friends={friends} />
              ) : (
                <p className="text-light-4">No friends yet</p>
              )}
              
              {isOwnProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="mt-8"
                >
                  <h2 className="text-2xl font-bold text-light-1 mb-4">Friend Requests</h2>
                  {isLoadingFriendRequests ? (
                    <Loader />
                  ) : friendRequests && friendRequests.length > 0 ? (
                    <FriendRequests requests={friendRequests} />
                  ) : (
                    <p className="text-light-4">No friend requests</p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {showFollowers && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowFollowers(false)}
        >
          <div 
            className="bg-dark-2 p-6 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto" 
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-light-1">Followers</h2>
            {followdBy.map((follower: any) => (
              <Link
                key={follower.$id}
                to={`/profile/${follower.$id}`}
                className="flex items-center gap-3 mb-3 p-2 hover:bg-dark-3 rounded transition-colors"
              >
                <img src={follower.ImageUrl} alt="User" className="w-10 h-10 rounded-full" />
                <span className="text-light-1">{follower.Name}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      <Outlet />
    </motion.div>
    </div>

    {/* Bottom Tabs */}
    {isOwnProfile && (
      <div className="fixed bottom-0 left-0 w-full">
        <div className="flex justify-end p-4">
          <Button
            className="bg-primary-500 text-white rounded-full p-3 shadow-lg hover:bg-primary-600 transition-colors duration-300"
            onClick={() => navigate(`/manage-list/${id}`)}
          >
            <Settings size={24} />
          </Button>
          <Button
            className="bg-secondary-500 text-white rounded-full p-3 shadow-lg hover:bg-secondary-600 transition-colors duration-300 ml-2"
            onClick={() => navigate("/userActivity")}
          >
            <Activity size={24} />
          </Button>
        </div>
      </div>
    )}
  </div>
  );
};

export default Profile;