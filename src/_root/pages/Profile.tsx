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
    <div className="flex flex-col gap-6 w-full p-6 mx-auto max-w-7xl">
      {/* User Info */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 bg-dark-2 p-4 sm:p-6 rounded-lg shadow-lg">
        <img
          src={currentUser.ImageUrl || "/assets/icons/profile-placeholder.svg"}
          alt={`${currentUser.Name}'s profile`}
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover shadow-md"
        />
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-light-1">
            {currentUser.Name}
          </h1>
          <p className="text-light-3 text-sm">@{currentUser.Username}</p>
          <p className="text-light-2 mt-2 text-xs">
            {currentUser.Bio || "No bio available"}
          </p>
          <div className="text-xs flex gap-6 mt-3 text-light-2">
            <span>{connection?.follower?.length || 0} followers</span>
            <span>{connection?.following?.length || 0} following</span>
            <span>{userLists?.length || 0} lists</span>
          </div>
          <div className="mt-4 flex justify-center sm:justify-start gap-4">
            {currentUser.Public && !isOwnProfile && !isFollowed && (
              <Button
                className="bg-primary-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-primary-600"
                onClick={handleFollow}
                disabled={isFollowLoading}
              >
                {isFollowLoading ? <Loader /> : "Follow"}
              </Button>
            )}
            {isOwnProfile && (
              <Button
                className="bg-gray-700 text-white px-4 sm:px-6 py-2 rounded-lg"
                onClick={() => navigate(`/update-profile/${id}`)}
              >
                Edit Profile
              </Button>
            )}
            {!isOwnProfile && isFollowed && (
              <Button
                className="border border-slate-300 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-600"
                onClick={handleUnFollow}
                disabled={isFollowLoading}
              >
                {isFollowLoading ? <Loader /> : "Unfollow"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
        <Button
          onClick={() => setActiveTab("lists")}
          className={`py-2 px-6 ${activeTab === "lists" ? "bg-purple-700 text-white" : "bg-gray-700 text-light-2"} rounded-full`}
        >
          Lists
        </Button>
        <Button
          onClick={() => setActiveTab("liked")}
          className={`py-2 px-6 ${activeTab === "liked" ? "bg-purple-700 text-white" : "bg-gray-700 text-light-2"} rounded-full`}
        >
          Liked Lists
        </Button>
        <Button
          onClick={() => setActiveTab("friends")}
          className={`py-2 px-6 ${activeTab === "friends" ? "bg-purple-700 text-white" : "bg-gray-700 text-light-2"} rounded-full`}
        >
          Friends
        </Button>
      </div>

      {/* Content based on selected tab */}
      {activeTab === "lists" && (
        <div className="flex flex-col gap-5 mt-6">
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
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-light-1 mb-4">Liked Lists</h2>
          <GridListList lists={currentUser.likedLists || []} showUser={true} />
        </div>
      )}

      {activeTab === "friends" && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-light-1 mb-4">Friends</h2>
          {isLoadingFriends ? <Loader /> : <FriendsList friends={friends} />}
        </div>
      )}

      {/* Friend Requests section (only on own profile) */}
      {isOwnProfile && activeTab === "friends" && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-light-1 mb-4">Friend Requests</h2>
          {isLoadingFriendRequests ? <Loader /> : <FriendRequests requests={friendRequests} />}
        </div>
      )}

      <Outlet />
    </div>
  );
};

export default Profile;
