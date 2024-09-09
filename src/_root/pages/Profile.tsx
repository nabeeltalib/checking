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
  followUser,
  getConnection,
  getSentRequests,
  sendFriendRequest,
  UnFollow,
} from "@/lib/appwrite/api";
import { Lock, Users, ListChecks, Heart, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


const Profile: React.FC = () => {
  const { user } = useUserContext();
  const { profile } = useParams();
  const id = profile === "profile" ? user?.id : profile || "";

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("lists");
  const [isCuratedExpanded, setCuratedExpanded] = useState(false);
  const [isSavedExpanded, setSavedExpanded] = useState(false);
  const [isCollaborativeExpanded, setCollaborativeExpanded] = useState(false);
  const [sentRequest, setSentRequest] = useState<any[]>([]);
  const [connection, setConnection] = useState<any>(undefined);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const { data: currentUser, isLoading: isLoadingCurrentUser } = useGetUserById(id);
  const { data: userLists, isLoading: isLoadingLists } = useGetUserLists(id);
  const { data: friends, isLoading: isLoadingFriends } = useGetUserFriends(id);
  const { data: friendRequests, isLoading: isLoadingFriendRequests } =
    useGetFriendRequests(user?.id || "");

  useEffect(() => {
    const fetchConnection = async () => {
      if (id) {
        const resp = await getConnection(id);
        setConnection(resp.length > 0 ? resp[0] : undefined);
      }
    };
    fetchConnection();
  }, [id]);

  useEffect(() => {
    const fetchSentRequests = async () => {
      const res = await getSentRequests();
      setSentRequest(res.filter((req: any) => req.userId.$id === user.id));
    };
    fetchSentRequests();
  }, [user.id]);

  const isRequestSent = sentRequest.some(
    (data: any) => data.friendId.$id === id
  );

  if (!id) return <div className="text-center text-light-1">User ID not found</div>;
  if (isLoadingCurrentUser || isLoadingLists) return <Loader />;
  if (!currentUser) return <div className="text-center text-light-1">User not found</div>;

  const savedLists = currentUser.save?.map((savedItem: any) => ({
    ...savedItem.list,
    creator: savedItem.list.creator,
  })) || [];

  const isOwnProfile = currentUser.$id === user.id;
  const isFollowed = connection?.follower?.some((follow: any) => follow.$id === user.id);

  const handleFollow = async () => {
    setIsFollowLoading(true);
    await followUser(user.id, id);
    const resp = await getConnection(id);
    setConnection(resp.length > 0 ? resp[0] : undefined);
    setIsFollowLoading(false);
  };

  const handleUnFollow = async () => {
    setIsFollowLoading(true);
    await UnFollow(user.id, id);
    const resp = await getConnection(id);
    setConnection(resp.length > 0 ? resp[0] : undefined);
    setIsFollowLoading(false);
  };

  const handleFriendRequest = async () => {
    await sendFriendRequest(user.id, id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col w-full mx-auto max-w-7xl"
    >
      {/* Cover Photo */}
      <div className="h-48 sm:h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-b-lg relative">
      </div>

      {/* User Info */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 bg-dark-2 p-6 rounded-lg shadow-lg -mt-20 mx-4 relative z-10">
        <motion.img
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          src={currentUser.ImageUrl || "/assets/icons/profile-placeholder.svg"}
          alt={`${currentUser.Name}'s profile`}
          className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover shadow-md border-4 border-dark-2"
        />
        <div className="text-center sm:text-left flex-grow w-full">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-light-1">
                {currentUser.Name}
              </h1>
              <p className="text-light-3 text-sm">@{currentUser.Username}</p>
              
              {!currentUser.Public && (
                <div className="flex items-center justify-center sm:justify-start mt-2 text-yellow-500">
                  <Lock size={16} className="mr-1" />
                  <span className="text-xs">Private Profile</span>
                </div>
              )}

              {/* Edit Profile button for mobile */}
              {isOwnProfile && (
                <Button
                  className="bg-gray-700 text-white px-4 py-2 rounded-full hover:bg-gray-600 mt-2 sm:hidden"
                  onClick={() => navigate(`/update-profile/${id}`)}
                >
                  <Edit3 size={16} className="mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              {/* Edit Profile button for desktop */}
              {isOwnProfile ? (
                <Button
                  className="bg-gray-700 text-white px-4 py-2 rounded-full hover:bg-gray-600 hidden sm:flex"
                  onClick={() => navigate(`/update-profile/${id}`)}
                >
                  <Edit3 size={16} className="mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  {currentUser.Public && !isFollowed && (
                    <Button
                      className="bg-primary-500 text-white px-6 py-2 rounded-full hover:bg-primary-600"
                      onClick={handleFollow}
                      disabled={isFollowLoading}
                    >
                      {isFollowLoading ? <Loader /> : "Follow"}
                    </Button>
                  )}
                  {isFollowed && (
                    <Button
                      className="border border-slate-300 text-white px-6 py-2 rounded-full hover:bg-red-600"
                      onClick={handleUnFollow}
                      disabled={isFollowLoading}
                    >
                      {isFollowLoading ? <Loader /> : "Unfollow"}
                    </Button>
                  )}
                  <Button
                    className="bg-gray-700 text-white px-4 py-2 rounded-full hover:bg-gray-600"
                    onClick={handleFriendRequest}
                    disabled={isRequestSent}
                  >
                    {isRequestSent ? "Request Sent" : "Add Friend"}
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <p className="text-light-2 mt-4 text-sm max-w-2xl">
            {currentUser.Bio || "No bio available"}
          </p>

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
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mt-8 mb-6">
        <Button
          onClick={() => setActiveTab("lists")}
          className={`py-2 px-6 rounded-full transition-all duration-300 ${
            activeTab === "lists" 
              ? "bg-primary-500 text-white shadow-lg" 
              : "bg-dark-4 text-light-2 hover:bg-dark-3"
          }`}
        >
          <ListChecks size={18} className="mr-2" />
          Lists
        </Button>
        <Button
          onClick={() => setActiveTab("liked")}
          className={`py-2 px-6 rounded-full transition-all duration-300 ${
            activeTab === "liked"
              ? "bg-primary-500 text-white shadow-lg"
              : "bg-dark-4 text-light-2 hover:bg-dark-3"
          }`}
        >
          <Heart size={18} className="mr-2" />
          Liked Lists
        </Button>
        <Button
          onClick={() => setActiveTab("friends")}
          className={`py-2 px-6 rounded-full transition-all duration-300 ${
            activeTab === "friends"
              ? "bg-primary-500 text-white shadow-lg"
              : "bg-dark-4 text-light-2 hover:bg-dark-3"
          }`}
        >
          <Users size={18} className="mr-2" />
          Friends
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
        >
          {activeTab === "lists" && (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-2xl font-bold text-light-1 mb-4">
                  My Lists
                </h2>
                <GridListList lists={userLists || []} showUser={false} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-light-1 mb-4">
                  Saved Lists
                </h2>
                {savedLists.length === 0 ? (
                  <p className="text-light-2">You haven't saved any lists yet.</p>
                ) : (
                  <GridListList lists={savedLists} showStats={false} />
                )}
              </div>
            </div>
          )}

          {activeTab === "liked" && (
            <div>
              <h2 className="text-2xl font-bold text-light-1 mb-4">Liked Lists</h2>
              <GridListList lists={currentUser.likedLists || []} showUser={true} />
            </div>
          )}

          {activeTab === "friends" && (
            <div>
              <h2 className="text-2xl font-bold text-light-1 mb-4">Friends</h2>
              {isLoadingFriends ? <Loader /> : <FriendsList friends={friends} />}
              
              {isOwnProfile && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold text-light-1 mb-4">Friend Requests</h2>
                  {isLoadingFriendRequests ? <Loader /> : <FriendRequests requests={friendRequests} />}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <Outlet />
    </motion.div>
  );
};

export default Profile;