import React from 'react';
import { useGetFriendsLists } from '@/lib/react-query/queries';
import ListCard from "@/components/shared/ListCard";
import { Loader } from '@/components/shared';

const FriendsLists: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: friendsLists, isLoading } = useGetFriendsLists(userId);

  if (isLoading) return <Loader />;

  return (
    <div className="friends-lists">
      <h2 className="text-2xl font-bold text-light-1 mb-4">Lists from Friends</h2>
      {friendsLists && friendsLists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {friendsLists.map((list) => (
            <ListCard key={list.$id} list={list} />
          ))}
        </div>
      ) : (
        <p className="text-light-2">No lists from friends available.</p>
      )}
    </div>
  );
};

export default FriendsLists;