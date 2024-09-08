import { useEffect, useState } from 'react';
import { getUserFriends } from '@/lib/appwrite/config';
import { useUserContext } from '@/context/AuthContext';
import ListCard3 from '@/components/shared/ListCard3';

const ListFromFriends = () => {
  const { user } = useUserContext();
  const [friendsLists, setFriendsLists] = useState<any>([]);
  const [sortOption, setSortOption] = useState<string>('newest');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFriendsLists = async () => {
      try {
        const lists = await getUserFriends(user.id);
        setFriendsLists(lists);
      } catch (error) {
        console.error('Error fetching friends lists:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriendsLists();
  }, [user.id]);

  const handleSortChange = (e: any) => {
    setSortOption(e.target.value);
  };

  const sortLists = (lists: any) => {
    return lists.sort((a: any, b: any) => {
      if (sortOption === 'newest') {
        return new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
      } else if (sortOption === 'oldest') {
        return new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime();
      }
      return 0;
    });
  };

  return (
    <div className="friends-lists">
      <h1 className="text-3xl mb-4">Lists from Friends</h1>

      <p className="text-light-2 mb-4">
        This page shows lists created by your friends. If your friends have private feeds, their lists will appear here if they’ve shared them with you.
      </p>

      <div className="sort-options mb-4">
        <select className="bg-zinc-900 w-full p-2" onChange={handleSortChange} value={sortOption}>
          <option value="newest">Sort by Newest</option>
          <option value="oldest">Sort by Oldest</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-light-2">Loading lists...</p>
      ) : friendsLists.length > 0 ? (
        friendsLists.map((friend: any) => {
          const sortedLists = sortLists(friend.lists);

          return (
            <div key={friend.Name}>
              <h2 className="text-xl mb-4">{friend.Name}'s lists</h2>
              <div className="flex flex-col gap-5">
                {sortedLists.map((list: any, index: number) => (
                  <ListCard3 key={index} list={list} />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-light-2">
          <p>
            You haven’t added any friends yet. Once you add friends, their lists will appear here if they share them with you.
          </p>
        </div>
      )}
    </div>
  );
};

export default ListFromFriends;
