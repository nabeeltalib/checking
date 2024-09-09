import React, { useEffect, useState } from 'react';
import { getUserFriends } from '@/lib/appwrite/config';
import { useUserContext } from '@/context/AuthContext';
import ListCard3 from '@/components/shared/ListCard3';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, SortAsc, SortDesc } from 'lucide-react';

const ListFromFriends: React.FC = () => {
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

  const handleSortChange = () => {
    setSortOption(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  const sortLists = (lists: any) => {
    return lists.sort((a: any, b: any) => {
      if (sortOption === 'newest') {
        return new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
      } else {
        return new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime();
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="friends-lists max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-light-1 flex items-center">
          <Users className="mr-2" size={32} />
          Lists from Friends
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSortChange}
          className="bg-dark-4 text-light-2 px-4 py-2 rounded-full flex items-center"
        >
          {sortOption === 'newest' ? <SortDesc className="mr-2" size={18} /> : <SortAsc className="mr-2" size={18} />}
          Sort by {sortOption === 'newest' ? 'Newest' : 'Oldest'}
        </motion.button>
      </div>

      <p className="text-light-2 mb-8 text-lg">
        This page shows lists created by your friends. If your friends have private feeds, their lists will appear here if they've shared them with you.
      </p>

      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center h-64"
        >
          <div className="loader"></div>
        </motion.div>
      ) : friendsLists.length > 0 ? (
        <AnimatePresence>
          {friendsLists.map((friend: any) => {
            const sortedLists = sortLists(friend.lists);

            return (
              <motion.div
                key={friend.Name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mb-12"
              >
                <h2 className="text-2xl font-semibold text-light-1 mb-6 flex items-center">
                  <img 
                    src={friend.ImageUrl || "/assets/icons/profile-placeholder.svg"} 
                    alt={friend.Name} 
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                  {friend.Name}'s lists
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedLists.map((list: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <ListCard3 list={list} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-light-2 text-center py-12 bg-dark-4 rounded-lg"
        >
          <Users size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-xl mb-4">
            You haven't added any friends yet.
          </p>
          <p>
            Once you add friends, their lists will appear here if they share them with you.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ListFromFriends;