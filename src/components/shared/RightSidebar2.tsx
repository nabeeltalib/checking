import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, LocateFixed, X } from 'lucide-react'; // Make sure to import X
import { getMostLikedLists } from '@/lib/appwrite/api';
import { useGetComments } from '@/lib/react-query/queries';
import { Button } from "@/components/ui/button";

const RightSidebar2: React.FC = () => {
  const navigate = useNavigate();
  const [allTrendingLists, setAllTrendingLists] = useState<any[]>([]);
  const [displayedLists, setDisplayedLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Assume you have an authentication context or state
  const isLoggedIn = false; // Replace with actual authentication logic

  const fetchTrendingLists = useCallback(async () => {
    try {
      const data = await getMostLikedLists();
      const filteredLists = data.filter(
        (list: any) => !list.isDeleted && list.Title && list.creator
      );
      setAllTrendingLists(filteredLists);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch trending lists:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingLists();
  }, [fetchTrendingLists]);

  useEffect(() => {
    if (allTrendingLists.length > 0) {
      const updateDisplayedLists = () => {
        const shuffled = [...allTrendingLists].sort(() => 0.5 - Math.random());
        setDisplayedLists(shuffled.slice(0, 5));
      };

      updateDisplayedLists();
      const intervalId = setInterval(updateDisplayedLists, 10000); // Rotate every 10 seconds

      return () => clearInterval(intervalId);
    }
  }, [allTrendingLists]);

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <motion.aside
        initial={{ x: 300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="rightsidebar hidden lg:flex flex-col justify-between w-64 h-screen p-6 bg-dark-2 border-l border-dark-4 fixed right-0 top-20 shadow-xl overflow-y-auto"
      >
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-light-1 flex items-center">
              <LocateFixed className="mr-2" />
              In Your Area
            </h2>
            {/* <button onClick={handleRefresh} className="text-primary-500 hover:text-primary-600 transition-colors">
              <RefreshCw size={20} />
            </button> */}
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <AnimatePresence mode="wait">
              <motion.ul
                key={displayedLists.map((list) => list.$id).join(',')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                {displayedLists.map((list) => (
                  <TrendingListItem
                    key={list.$id}
                    list={list}
                    navigate={navigate}
                    isLoggedIn={isLoggedIn}
                    handleDialogOpen={handleDialogOpen}
                  />
                ))}
              </motion.ul>
            </AnimatePresence>
          )}

          <button
            className="mt-6 text-blue-500 py-2 px-4 rounded-lg shadow-lg hover:bg-dark-4 transition-all"
            onClick={() => {
              if (isLoggedIn) {
                navigate('/trending');
              } else {
                handleDialogOpen();
              }
            }}
          >
            View More Trending
          </button>
        </div>

        <div className="text-xs text-gray-400 text-center absolute bottom-20 left-0 right-0 p-4">
          <NavLink to="/privacypolicy" className="hover:text-white transition-colors duration-200">
            Privacy Policy
          </NavLink>
          <span className="mx-2">|</span>
          <NavLink
            to="/termsandconditions"
            className="hover:text-white transition-colors duration-200"
          >
            Terms & Conditions
          </NavLink>
          <p className="mt-2">&copy; 2024 Topfived. All rights reserved.</p>
        </div>
      </motion.aside>

      {/* Popup Component */}
      <AnimatePresence>
        {isDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 z-50 p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-dark-2 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-lg"
            >
              <button
                onClick={handleDialogClose}
                className="text-gray-400 hover:text-gray-200 absolute top-4 right-4 transition-colors duration-200"
                aria-label="Close"
              >
                <X size={24} />
              </button>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-light-1 mb-2">Unlock Full Access!</h3>
                <p className="text-sm text-light-2 mb-6">
                  Sign up now to like, comment, save, and remix lists. Create your own rankings and
                  join the community!
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <Button
                  type="button"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out"
                  onClick={() => {
                    handleDialogClose();
                    navigate('/signup');
                  }}
                >
                  Sign Up
                </Button>
                <Button
                  className="flex items-center justify-center bg-dark-3 text-light-1 border border-dark-4 px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out hover:bg-dark-4"
                  onClick={() => {
                    handleDialogClose();
                    // Handle Google Sign-In
                  }}
                >
                  <img
                    src="/assets/icons/google.svg"
                    alt="Google"
                    className="mr-2 h-5 w-5"
                  />
                  Sign In with Google
                </Button>
                <Button
                  className="text-primary-500 hover:text-primary-600 font-semibold transition-colors duration-200"
                  onClick={() => {
                    handleDialogClose();
                    navigate('/signin');
                  }}
                >
                  Sign In with Email
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

interface TrendingListItemProps {
  list: any;
  navigate: Function;
  isLoggedIn: boolean;
  handleDialogOpen: Function;
}

const TrendingListItem: React.FC<TrendingListItemProps> = ({
  list,
  navigate,
  isLoggedIn,
  handleDialogOpen,
}) => {
  const { data: comments } = useGetComments(list.$id);

  const handleClick = () => {
    if (isLoggedIn) {
      navigate(`/lists/${list.$id}`);
    } else {
      handleDialogOpen();
    }
  };

  return (
    <motion.li
      className="bg-dark-3 rounded-lg p-4 shadow hover:bg-dark-4 transition-all cursor-pointer"
      whileHover={{ y: -3 }}
      onClick={handleClick}
    >
      <h3 className="text-white text-sm font-semibold truncate">{list.Title}</h3>
      <p className="text-xs text-gray-400 truncate">by {list.creator.Name}</p>
      <div className="flex items-center mt-2 space-x-4">
        <div className="flex items-center text-xs text-gray-400">
          <Heart size={14} className="mr-1 text-red-500" />
          {list.Likes?.length || 0}
        </div>
        <div className="flex items-center text-xs text-gray-400">
          <MessageSquare size={14} className="mr-1 text-blue-500" />
          {comments?.length || 0}
        </div>
      </div>
    </motion.li>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="bg-dark-3 rounded-lg p-4 shadow animate-pulse">
        <div className="h-4 bg-dark-4 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-dark-4 rounded w-1/2 mb-3"></div>
        <div className="flex items-center space-x-4">
          <div className="h-3 bg-dark-4 rounded w-1/4"></div>
          <div className="h-3 bg-dark-4 rounded w-1/4"></div>
        </div>
      </div>
    ))}
  </div>
);

export default RightSidebar2;
