import React from 'react';
import { useGetUserFriends, useGetFriendsLists } from '@/lib/react-query/queries';
import { useUserContext } from '@/context/AuthContext';
import { Loader, ListCard } from '@/components/shared';

const FriendsFeed: React.FC = () => {
  const { user } = useUserContext();
  const { data: friends, isLoading: isLoadingFriends } = useGetUserFriends(user.id);
  const { data: friendsLists, isLoading: isLoadingLists } = useGetFriendsLists(user.id);

  if (isLoadingFriends || isLoadingLists) return <Loader />;

  return (
    <div className="friends-feed">
      <h2 className="text-2xl font-bold mb-4">Friends</h2>
      <div className="friends-list mb-8">
        {friends && friends.length > 0 ? (
          friends.map((friendId) => (
            <div key={friendId} className="friend-item">
              {/* Display friend information here */}
              {friendId}
            </div>
          ))
        ) : (
          <p>No friends found.</p>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-4">Friends' Lists</h2>
      <div className="friends-lists grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {friendsLists && friendsLists.length > 0 ? (
          friendsLists.map((list) => (
            <ListCard key={list.$id} list={list} />
          ))
        ) : (
          <p>No lists from friends found.</p>
        )}
      </div>
    </div>
  );
};

export default FriendsFeed;