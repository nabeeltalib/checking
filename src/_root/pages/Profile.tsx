import React, { useState } from "react";
import { Link, Outlet, useParams, useLocation } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById, useGetUserLists, useGetUserFriends, useGetFriendRequests } from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";
import GridListList from "@/components/shared/GridListList";
import { Button } from "@/components/ui/button";
import FriendsList from "@/components/shared/FriendsList";
import FriendsLists from "@/components/shared/FriendsLists";
import FriendRequests from "@/components/shared/FriendRequests";

const Profile: React.FC = () => {
  const { user } = useUserContext();
  const { id } = useParams<{ id: string }>();
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = useState("lists");

  const { data: currentUser, isLoading: isLoadingCurrentUser } = useGetUserById(id || "");
  const { data: userLists, isLoading: isLoadingLists } = useGetUserLists(id || "");
  const { data: friends, isLoading: isLoadingFriends } = useGetUserFriends(id || "");
  const { data: friendRequests, isLoading: isLoadingFriendRequests } = useGetFriendRequests(user?.id || "");

  if (!id) return <div className="text-center text-light-1">User ID not found</div>;

  if (isLoadingCurrentUser || isLoadingLists) {
    return <Loader />;
  }

  if (!currentUser) {
    return <div className="text-center text-light-1">User not found</div>;
  }

  const isOwnProfile = currentUser.$id === user?.id;

  return (
    <div className="flex flex-col gap-6 w-full p-6 mx-auto max-w-7xl">
      {/* User Info */}
      <div className="flex items-center gap-8 bg-dark-2 p-6 rounded-lg">
        <img
          src={currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt={`${currentUser.name}'s profile`}
          className="w-32 h-32 rounded-full object-cover"
        />
        <div>
          <h1 className="text-3xl font-bold text-light-1">{currentUser.name}</h1>
          <p className="text-light-3">@{currentUser.username}</p>
          <p className="text-light-2 mt-2">{currentUser.bio || "No bio available"}</p>
          <div className="flex gap-4 mt-3 text-light-2">
            <span>{currentUser.followersCount || 0} followers</span>
            <span>{currentUser.followingCount || 0} following</span>
            <span>{userLists?.length || 0} lists</span>
          </div>
          {!isOwnProfile && (
            <Button className="mt-4 bg-primary-500 text-white px-6 py-2 rounded-full">
              Follow
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        <Button
          onClick={() => setActiveTab("lists")}
          className={`tab-button ${activeTab === "lists" ? "active" : ""}`}
        >
          <img src="/assets/icons/list.svg" alt="lists" width={20} height={20} />
          Lists
        </Button>
        <Button
          onClick={() => setActiveTab("liked")}
          className={`tab-button ${activeTab === "liked" ? "active" : ""}`}
        >
          <img src="/assets/icons/like.svg" alt="like" width={20} height={20} />
          Liked Lists
        </Button>
        <Button
          onClick={() => setActiveTab("friends")}
          className={`tab-button ${activeTab === "friends" ? "active" : ""}`}
        >
          <img src="/assets/icons/users.svg" alt="friends" width={20} height={20} />
          Friends
        </Button>
      </div>

      {/* Content based on selected tab */}
      {activeTab === "lists" && (
        <div>
          <h2 className="text-2xl font-bold text-light-1 mb-4">Curated Lists</h2>
          <GridListList lists={userLists || []} showUser={false} />
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
          {isLoadingFriends ? <Loader /> : <FriendsList friends={friends || []} />}
        </div>
      )}

      {/* Friend Requests section (only on own profile) */}
      {isOwnProfile && activeTab === "friends" && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-light-1 mb-4">Friend Requests</h2>
          {isLoadingFriendRequests ? (
            <Loader />
          ) : (
            <FriendRequests requests={friendRequests || []} />
          )}
        </div>
      )}

      {/* Friends' Lists section (only on own profile) */}
      {isOwnProfile && activeTab === "lists" && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-light-1 mb-4">Friends' Lists</h2>
          <FriendsLists userId={id} />
        </div>
      )}

      <Outlet />
    </div>
  );
};

export default Profile;