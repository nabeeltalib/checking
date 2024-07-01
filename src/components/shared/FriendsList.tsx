// FriendsList.tsx
import React from 'react';
import { Link } from 'react-router-dom';

type Friend = {
  $id: string;
  name: string;
  imageUrl: string;
};

type FriendsListProps = {
  friends: Friend[];
};

const FriendsList: React.FC<FriendsListProps> = ({ friends }) => {
  return (
    <div className="friends-list">
      <h3 className="text-lg font-bold text-light-1 mb-4">Friends</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {friends.map((friend) => (
          <Link key={friend.$id} to={`/profile/${friend.$id}`} className="flex flex-col items-center">
            <img
              src={friend.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt={`${friend.name}'s profile`}
              className="w-16 h-16 rounded-full object-cover mb-2"
            />
            <span className="text-light-1 text-sm">{friend.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FriendsList;