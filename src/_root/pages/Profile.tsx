import React from "react";
import { Link, Outlet, useParams, useLocation } from "react-router-dom";
import { LikedLists } from "@/_root/pages";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById, useGetUserLists, useGetUserFriends, useGetFriendRequests } from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";
import GridListList from "@/components/shared/GridListList";
import FriendsList from "@/components/shared/FriendsList";
import FriendsLists from "@/components/shared/FriendsLists";
import FriendRequests from "@/components/shared/FriendRequests";

const Profile: React.FC = () => {
  const { user } = useUserContext();
  const { id } = useParams<{ id: string }>();
  const { pathname } = useLocation();

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
    <div className="flex flex-col gap-6 w-full p-6 mx-auto common-container">
      {/* User Info */}
      <div className="flex flex-col items-center mb-8">
        <img
          src={currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt={`${currentUser.name}'s profile`}
          className="w-24 h-24 rounded-full mb-4 object-cover"
        />
        <h1 className="text-2xl font-bold text-light-1">{currentUser.name}</h1>
        <p className="text-light-3">@{currentUser.username}</p>
        <p className="text-light-3 mt-2">{currentUser.bio || "No bio available"}</p>
        <div className="flex gap-4 mt-2 text-light-2">
          <span>{currentUser.followersCount || 0} followers</span>
          <span>{currentUser.followingCount || 0} following</span>
        </div>
        {!isOwnProfile && (
          <button className="mt-4 bg-primary-500 text-white px-4 py-2 rounded">
            Follow
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex max-w-5xl w-full mb-8">
        <Link
          to={`/profile/${id}`}
          className={`profile-tab rounded-l-lg ${pathname === `/profile/${id}` && "!bg-dark-3"}`}
        >
          <img src="/assets/icons/home.svg" alt="lists" width={20} height={20} />
          Lists
        </Link>
        <Link
          to={`/profile/${id}/liked-lists`}
          className={`profile-tab ${pathname === `/profile/${id}/liked-lists` && "!bg-dark-3"}`}
        >
          <img src="/assets/icons/like.svg" alt="like" width={20} height={20} />
          Liked Lists
        </Link>
        <Link
          to={`/profile/${id}/friends`}
          className={`profile-tab rounded-r-lg ${pathname === `/profile/${id}/friends` && "!bg-dark-3"}`}
        >
          <img src="/assets/icons/users.svg" alt="friends" width={20} height={20} />
          Friends
        </Link>
      </div>

      {/* Content based on selected tab */}
      {pathname === `/profile/${id}` && (
        <GridListList lists={userLists || []} showUser={false} />
      )}
      {pathname === `/profile/${id}/liked-lists` && <LikedLists />}
      {pathname === `/profile/${id}/friends` && (
        isLoadingFriends ? <Loader /> : <FriendsList friends={friends || []} />
      )}

      {/* Friend Requests section (only on own profile) */}
      {isOwnProfile && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-light-1 mb-4">Friend Requests</h2>
          {isLoadingFriendRequests ? (
            <Loader />
          ) : (
            <FriendRequests requests={friendRequests || []} />
          )}
        </div>
      )}

      {/* Friends' Lists section (only on own profile) */}
      {isOwnProfile && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-light-1 mb-4">Friends' Lists</h2>
          <FriendsLists userId={id} />
        </div>
      )}

      <Outlet />
    </div>
  );
};

export default Profile;