import React, { useEffect, useState, useMemo } from "react";
import { Trophy, List, Heart, MessageCircle } from "lucide-react";
import { getUsers } from "@/lib/appwrite/config";
import { getMostLikedLists } from "@/lib/appwrite/api";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const ComprehensiveLeaderboard = () => {
  const [timeFrame, setTimeFrame] = useState("week");
  const [category, setCategory] = useState("all");
  const [users, setUsers] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const u = await getUsers();
        setUsers(u?.slice(0, 5) || []); // Handle case if u is null
        const l = await getMostLikedLists();
        setLists(l.slice(0, 5) || []); // Handle case if l is null
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const topUser = useMemo(
    () =>
      users.map((user: any, index: number) => ({
        rank: index + 1,
        path: `/profile/${user?.$id || ""}`,
        name: user?.Name || "Unknown",
        avatar: user?.ImageUrl || "/assets/icons/profile-placeholder.svg",
        listsCreated: user?.lists?.length || 0,
        totalLikes: user?.totalLikes || 0,
        key: user?.$id || `user-${index}`, // Ensure unique keys
      })),
    [users]
  );

  const topList = useMemo(
    () =>
      lists.map((list: any, index: number) => ({
        rank: index + 1,
        path: `/lists/${list?.$id || ""}`,
        title: list?.Title || "Untitled",
        creator: list?.creator?.Name || "Unknown",
        likes: list?.Likes?.length || 0,
        comments: list?.comments?.length || 0,
        key: list?.$id || `list-${index}`, // Ensure unique keys
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
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-light-1">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-dark-3">
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Rank</th>
              {columns.map((col: any, index: number) => (
                <th key={`header-${index}`} className="px-2 sm:px-4 py-2 sm:py-3 text-left">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item: any) => (
              <motion.tr
                key={item.key} // Ensure unique keys here
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: item.rank * 0.1 }}
                className="border-b border-dark-4 hover:bg-dark-3 transition-colors"
              >
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-light-1">
                  {item.rank === 1 && <Trophy className="inline text-yellow-500 mr-1" size={16} />}
                  {item.rank === 2 && <Trophy className="inline text-gray-400 mr-1" size={16} />}
                  {item.rank === 3 && <Trophy className="inline text-yellow-600 mr-1" size={16} />}
                  {item.rank}
                </td>
                {columns.map((col: any, colIndex: number) => (
                  <td key={`col-${item.key}-${colIndex}`} className="px-2 sm:px-4 py-2 sm:py-3 text-light-2">
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-dark-1 text-light-1">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <img
            src="/assets/images/mobile.png"
            width={150}
            alt="Loading..."
            className="mx-auto mb-4"
          />
          <motion.h1
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-xl sm:text-2xl"
          >
            Loading Leaderboard...
          </motion.h1>
        </motion.div>
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
        className="flex flex-col sm:flex-row justify-between mb-4 sm:mb-8 gap-4"
      >
        <div className="flex items-center">
          <label className="mr-2 font-semibold text-light-2">Time Frame:</label>
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            className="border rounded-lg p-1 sm:p-2 bg-dark-3 text-light-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="allTime">All Time</option>
          </select>
        </div>
        <div className="flex items-center">
          <label className="mr-2 font-semibold text-light-2">Category:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded-lg p-1 sm:p-2 bg-dark-3 text-light-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat.toLowerCase()}>{cat}</option>
            ))}
          </select>
        </div>
      </motion.div>

      <AnimatePresence>
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
                  <Link to={item.path} className="text-primary-500 hover:underline font-semibold text-sm sm:text-base">{item.name}</Link>
                </div>
              ),
            },
            {
              header: <div className="flex items-center"><List size={16} className="mr-1 sm:mr-2 text-light-2" /> <span className="hidden sm:inline">Lists</span></div>,
              key: "listsCreated"
            },
            {
              header: <div className="flex items-center"><Heart size={16} className="mr-1 sm:mr-2 text-light-2" /> <span className="hidden sm:inline">Likes</span></div>,
              key: "totalLikes"
            },
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
                <Link to={item.path} className="text-primary-500 hover:underline font-semibold text-sm sm:text-base">{item.title}</Link>
              ),
            },
            { 
              header: "Creator",
              key: "creator",
              render: (item: any) => (
                <span className="text-sm sm:text-base">{item.creator}</span>
              ),
            },
            {
              header: <div className="flex items-center"><Heart size={16} className="mr-1 sm:mr-2 text-light-2" /> <span className="hidden sm:inline">Likes</span></div>,
              key: "likes"
            },
            {
              header: <div className="flex items-center"><MessageCircle size={16} className="mr-1 sm:mr-2 text-light-2" /> <span className="hidden sm:inline">Comments</span></div>,
              key: "comments"
            },
          ]}
        />
      </AnimatePresence>
    </div>
  );
};

export default ComprehensiveLeaderboard;
