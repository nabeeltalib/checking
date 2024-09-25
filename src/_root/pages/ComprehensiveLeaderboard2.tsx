import React, { useEffect, useState, useMemo } from "react";
import { Trophy, List, Heart, MessageCircle, Calendar, Filter } from "lucide-react";
import { getUsers } from "@/lib/appwrite/config";
import { getMostLikedLists } from "@/lib/appwrite/api";
import { Link } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const ComprehensiveLeaderboard2 = () => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const [timeFrame, setTimeFrame] = useState("week");
  const [category, setCategory] = useState("all");
  const [users, setUsers] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignUpDialogOpen, setIsSignUpDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const u = await getUsers();
        setUsers(u?.slice(0, 5));
        const l = await getMostLikedLists();
        setLists(l.slice(0, 5));
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to fetch leaderboard data. Please try again.",
          variant: "destructive",
        });
      }
    };
    fetchData();
  }, [toast]);

  const handleProtectedLinkClick = (e: React.MouseEvent, path: string) => {
    if (!user.isAuthenticated) {
      e.preventDefault();
      setIsSignUpDialogOpen(true);
    }
  };

  const closeSignUpDialog = () => {
    setIsSignUpDialogOpen(false);
  };

  const topUser = useMemo(
    () =>
      users.map((user: any, index: number) => ({
        rank: index + 1,
        path: `/profile/${user.$id}`,
        name: user.Name,
        avatar: user?.ImageUrl || "/assets/default-avatar.png",
        listsCreated: user?.lists ? user.lists.length : 0,
        totalLikes: user.totalLikes || 0,
      })),
    [users]
  );

  const topList = useMemo(
    () =>
      lists.map((list: any, index: number) => ({
        rank: index + 1,
        path: `/lists/${list.$id}`,
        title: list.Title,
        creator: list.creator ? list.creator.Name : 'Unknown',
        likes: list.Likes ? list.Likes.length : 0,
        comments: list.comments ? list.comments.length : 0,
      })),
    [lists]
  );

  const categories = ["All", "Technology", "Travel", "Food", "Entertainment", "Sports"];

  const LeaderboardSection = ({ title, data, columns }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 bg-dark-2 p-4 sm:p-6 rounded-xl shadow-lg"
    >
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-light-1">
        <Trophy className="mr-2 text-yellow-500" />
        {title}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-dark-3">
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Rank</th>
              {columns.map((col: any, index: number) => (
                <th key={index} className="px-4 py-2 text-left text-light-2">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item: any, index: number) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border-b border-dark-4 hover:bg-dark-3 transition-colors"
              >
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-light-1">
                  {item.rank === 1 && <Trophy className="inline text-yellow-500 mr-1" />}
                  {item.rank === 2 && <Trophy className="inline text-gray-400 mr-1" />}
                  {item.rank === 3 && <Trophy className="inline text-yellow-600 mr-1" />}
                  {item.rank}
                </td>
                {columns.map((col: any, colIndex: number) => (
                  <td key={colIndex} className="px-2 sm:px-4 py-2 sm:py-3 text-light-2">
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const LoadingSkeleton: React.FC = () => (
    <div className="space-y-8">
      {[...Array(2)].map((_, sectionIndex) => (
        <div key={sectionIndex} className="bg-dark-2 p-4 sm:p-6 rounded-xl shadow-lg">
          <motion.div
            className="h-8 bg-dark-3 rounded w-1/3 mb-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          ></motion.div>
          <div className="space-y-4">
            {[...Array(5)].map((_, rowIndex) => (
              <div key={rowIndex} className="flex items-center space-x-4">
                <motion.div
                  className="h-6 bg-dark-3 rounded w-8"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                ></motion.div>
                <motion.div
                  className="h-6 bg-dark-3 rounded w-1/4"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.1 }}
                ></motion.div>
                <motion.div
                  className="h-6 bg-dark-3 rounded w-1/6"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                ></motion.div>
                <motion.div
                  className="h-6 bg-dark-3 rounded w-1/6"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                ></motion.div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="max-w-full sm:max-w-5xl mx-auto p-4 sm:p-8 bg-dark-1 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl">
        <motion.div
          className="h-10 bg-dark-3 rounded w-2/3 mx-auto mb-8"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        ></motion.div>
        <div className="flex justify-between mb-8">
          <motion.div
            className="h-8 bg-dark-3 rounded w-1/4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.1 }}
          ></motion.div>
          <motion.div
            className="h-8 bg-dark-3 rounded w-1/4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
          ></motion.div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-full sm:max-w-5xl mx-auto p-4 sm:p-8 bg-dark-1 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8 text-center text-light-1"
      >
        Topfived Leaderboard
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row justify-between mb-4 sm:mb-8 gap-4"
      >
        <div className="flex items-center bg-dark-2 rounded-lg p-2">
          <Calendar className="text-light-2 mr-2" />
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            className="bg-dark-2 text-light-1 border-none focus:ring-2 focus:ring-primary-500 rounded"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="allTime">All Time</option>
          </select>
        </div>
        <div className="flex items-center bg-dark-2 rounded-lg p-2">
          <Filter className="text-light-2 mr-2" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-dark-2 text-light-1 border-none focus:ring-2 focus:ring-primary-500 rounded"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat.toLowerCase()}>{cat}</option>
            ))}
          </select>
        </div>
      </motion.div>

      <LeaderboardSection
        title="Top Users"
        data={topUser}
        columns={[
          {
            header: "User",
            key: "name",
            render: (item: any) => (
              <div className="flex items-center">
                <img src={item.avatar} alt={item.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 border-2 border-primary-500" />
                <Link to={item.path} className="text-primary-500 hover:underline font-semibold text-sm sm:text-base" onClick={(e) => handleProtectedLinkClick(e, item.path)}>
                  {item.name}
                </Link>
              </div>
            ),
          },
          { header: <List size={16} className="mr-1 sm:mr-2 text-light-2" />, key: "listsCreated" },
          { header: <Heart size={16} className="mr-1 sm:mr-2 text-light-2" />, key: "totalLikes" },
        ]}
      />
<LeaderboardSection
        title="Top Users"
        data={topUser}
        columns={[
          {
            header: "User",
            key: "name",
            render: (item: any) => (
              <div className="flex items-center">
                <img src={item.avatar} alt={item.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 border-2 border-primary-500" />
                <Link to={item.path} className="text-primary-500 hover:underline font-semibold text-sm sm:text-base" onClick={(e) => handleProtectedLinkClick(e, item.path)}>
                  {item.name}
                </Link>
              </div>
            ),
          },
          { header: <List size={16} className="mr-1 sm:mr-2 text-light-2" />, key: "listsCreated" },
          { header: <Heart size={16} className="mr-1 sm:mr-2 text-light-2" />, key: "totalLikes" },
        ]}
      />

      <LeaderboardSection
        title="Top Lists"
        data={topList}
        columns={[
          {
            header: "List Title",
            key: "title",
            render: (item: any) => (
              <div className="flex items-center">
                <Link to={item.path} className="text-primary-500 hover:underline font-semibold text-sm sm:text-base" onClick={(e) => handleProtectedLinkClick(e, item.path)}>
                  {item.title}
                </Link>
              </div>
            ),
          },
          { header: "Creator", key: "creator" },
          { header: <Heart size={20} className="inline mr-1 text-light-2" />, key: "likes" },
          { header: <MessageCircle size={20} className="inline mr-1 text-light-2" />, key: "comments" },
        ]}
      />

      <AnimatePresence>
        {isSignUpDialogOpen && (
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
              className="relative bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-lg"
            >
              <button
                onClick={closeSignUpDialog}
                className="text-black hover:text-light-1 absolute top-4 right-4 transition-colors duration-200"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-black mb-2">Unlock Full Access!</h3>
                <p className="text-black mb-6">Sign up now to like, comment, save, and remix lists. Create your own rankings and join the community!</p>
              </div>
              <div className="flex flex-col gap-4">
                <Button
                  type="button"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out"
                  onClick={() => { closeSignUpDialog(); /* Navigate to sign-up page */ }}
                >
                  Sign Up
                </Button>
                <Button
                  className="flex items-center justify-center bg-dark-3 text-light-1 border border-dark-4 px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out hover:bg-dark-4"
                  onClick={() => { closeSignUpDialog(); /* Navigate to sign-in page */ }}
                >
                  <img src="/assets/icons/google.svg" alt="Google" className="mr-2 h-5 w-5" />
                  Sign In with Google
                </Button>
                <Button
                  className="text-primary-500 hover:text-primary-600 font-semibold transition-colors duration-200"
                  onClick={() => { closeSignUpDialog(); /* Navigate to sign-in page */ }}
                >
                  Sign In with Email
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComprehensiveLeaderboard2;