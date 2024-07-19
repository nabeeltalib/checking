import React, { useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById, useGetUserLists, useGetUserFriends, useGetFriendRequests } from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";
import GridListList from "@/components/shared/GridListList";
import { Button } from "@/components/ui/button";
import FriendsList from "@/components/shared/FriendsList";
import FriendRequests from "@/components/shared/FriendRequests";

const Profile: React.FC = () => {
  const { user } = useUserContext();
  const { profile } = useParams(); 
  let id = profile ? profile === "profile" ? user.id : profile : "";
  
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("lists");
  const { data: currentUser, isLoading: isLoadingCurrentUser } = useGetUserById(id || "");
  const { data: userLists, isLoading: isLoadingLists } = useGetUserLists(id || "");
  const { data: friends, isLoading: isLoadingFriends } = useGetUserFriends(id || "");
  const { data: friendRequests, isLoading: isLoadingFriendRequests } = useGetFriendRequests(user?.id || "");

  const [isCuratedExpanded, setCuratedExpanded] = useState(false);
  const [isSavedExpanded, setSavedExpanded] = useState(false);
  const [isCollaborativeExpanded, setCollaborativeExpanded] = useState(false);

  if (!id) return <div className="text-center text-light-1">User ID not found</div>;

  if (isLoadingCurrentUser || isLoadingLists) {
    return <Loader />;
  }

  if (!currentUser) {
    return <div className="text-center text-light-1">User not found</div>;
  }

  const collaborativeList : any = [];

  const savedLists = currentUser?.save
    ? currentUser.save.map((savedItem: any) => ({
        ...savedItem.list,
        creator: {
          $id: currentUser.$id,
          name: currentUser.name,
          imageUrl: currentUser.imageUrl || "/assets/icons/profile-placeholder.svg",
        },
      }))
    : [];

  const isOwnProfile = currentUser.$id === user?.id;
  return (
    <div className="flex flex-col gap-6 w-full p-6 mx-auto max-w-7xl">
      {/* User Info */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 bg-dark-2 p-4 sm:p-6 rounded-lg">
        <img
          src={currentUser.ImageUrl || "/assets/icons/profile-placeholder.svg"}
          alt={`${currentUser.Name}'s profile`}
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
        />
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-light-1">{currentUser.Name}</h1>
          <p className="text-light-3">@{currentUser.Username}</p>
          <p className="text-light-2 mt-2">{currentUser.Bio || "No bio available"}</p>
          <div className="flex justify-center sm:justify-start gap-4 mt-3 text-light-2">
            <span>{currentUser.followersCount || 0} followers</span>
            <span>{currentUser.followingCount || 0} following</span>
            <span>{userLists?.length || 0} lists</span>
          </div>
          {!isOwnProfile && (
            <Button className="mt-4 bg-primary-500 text-white px-4 sm:px-6 py-2 rounded-full">
              Follow
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-2">
        <Button
          onClick={() => setActiveTab("lists")}
          className={`tab-button ${activeTab === "lists" ? "active" : ""} flex gap-2`}
        >
          <img src="/assets/icons/list.svg" alt="lists" width={20} height={20} />
          Lists
        </Button>
        <Button
          onClick={() => setActiveTab("liked")}
          className={`tab-button ${activeTab === "liked" ? "active" : ""} flex gap-2`}
        >
          <img src="/assets/icons/like.svg" alt="like" width={20} height={20} />
          Liked Lists
        </Button>
        <Button
          onClick={() => setActiveTab("friends")}
          className={`tab-button ${activeTab === "friends" ? "active" : ""} flex gap-2`}
        >
          <img src="/assets/icons/people.svg" alt="friends" width={20} height={20} />
          Friends
        </Button>
      </div>

      {/* Edit Functionality */}
      { isOwnProfile &&
      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-8">
      <Button
          className={`tab-button flex gap-2`}
          onClick={()=> navigate(`/update-profile/${id}`)}
        >
          Edit Profile
        </Button>
        <Button
          className={`tab-button flex gap-2`}
          onClick={()=> navigate(`/manage-list/${id}`)}
        >
          Manage List
        </Button>
        <Button
          className={`tab-button flex gap-2`}
          onClick={()=> navigate("/userActivity")}
        >
          View Activity
        </Button>
      </div>
          }

      {/* Content based on selected tab */}
      {activeTab === "lists" && (
        <div className="flex flex-col gap-5">
          <div>
            <h2
              className="text-2xl font-bold text-light-1 mb-4 cursor-pointer"
              onClick={() => setCuratedExpanded(!isCuratedExpanded)}
            >
              Curated Lists
            </h2>
            {isCuratedExpanded && <GridListList lists={userLists || []} showUser={false} />}
          </div>
          <div>
            <h2
              className="text-2xl font-bold text-light-1 mb-4 cursor-pointer"
              onClick={() => setSavedExpanded(!isSavedExpanded)}
            >
              Saved Lists
            </h2>
            {isSavedExpanded && (
              savedLists.length === 0 ? (
                <p className="text-light-4">No saved lists</p>
              ) : (
                <GridListList lists={savedLists} showStats={false} />
              )
            )}
          </div>
          <div>
            <h2
              className="text-2xl font-bold text-light-1 mb-4 cursor-pointer"
              onClick={() => setCollaborativeExpanded(!isCollaborativeExpanded)}
            >
              Collaborative Lists
            </h2>
            {isCollaborativeExpanded && (
              collaborativeList.length === 0 ? (
                <p className="text-light-4">No Collaborative lists</p>
              ) : (
                <GridListList lists={collaborativeList} showUser={false} />
              )
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
        </div>
      )}

      {/* Friend Requests section (only on own profile) */}
      {isOwnProfile && activeTab === "friends" && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-light-1 mb-4">Friend Requests</h2>
          {isLoadingFriendRequests ? (
            <Loader />
          ) : (
            <FriendRequests requests={friendRequests} />
          )}
        </div>
      )}

      <Outlet />
    </div>
  );
};

export default Profile;
