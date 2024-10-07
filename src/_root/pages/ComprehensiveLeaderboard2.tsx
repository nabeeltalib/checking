import React, { useState, useMemo, useEffect } from "react";
import { Trophy, List, ThumbsUp, MessageCircle, Clock, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import SignInDialog from '@/components/shared/SignInDialog';
import { useQuery } from "@tanstack/react-query";
import { getUsers, getMostLikedLists, getAllLists } from "@/lib/appwrite/api";

const ComprehensiveLeaderboard2 = () => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const [timeFrame, setTimeFrame] = useState("allTime");
  const [category, setCategory] = useState("all");
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>(["all"]);

  const {
    data: users,
    isLoading: isLoadingUsers,
    error: usersError
  } = useQuery(["users"], () => getUsers(5), {
    retry: 3,
    retryDelay: 1000,
  });

  const {
    data: allLists,
    isLoading: isLoadingAllLists,
    error: allListsError
  } = useQuery(["allLists"], getAllLists, {
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (allLists) {
      const categoryCount = new Map<string, number>();
      allLists.forEach(list => {
        list.Categories?.forEach(cat => {
          const lowercaseCat = cat.toLowerCase();
          categoryCount.set(lowercaseCat, (categoryCount.get(lowercaseCat) || 0) + 1);
        });
        list.Tags?.forEach(tag => {
          const lowercaseTag = tag.toLowerCase();
          categoryCount.set(lowercaseTag, (categoryCount.get(lowercaseTag) || 0) + 1);
        });
      });

      const sortedCategories = Array.from(categoryCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 14)  // Take top 14 (15th will be "all")
        .map(([category]) => category);

      setCategories(["all", ...sortedCategories]);
      console.log("Top 15 categories extracted:", ["all", ...sortedCategories]);
    }
  }, [allLists]);

  const isLoading = isLoadingUsers || isLoadingAllLists;
  const error = usersError || allListsError;

  const handleProtectedLinkClick = (e: React.MouseEvent, path: string) => {
    if (!user.isAuthenticated) {
      e.preventDefault();
      setIsSignInDialogOpen(true);
    }
  };

  const closeSignInDialog = () => {
    setIsSignInDialogOpen(false);
  };

  const topUsers = useMemo(() => 
    users?.map((user: any, index: number) => ({
      rank: index + 1,
      path: `/profile/${user?.$id || ""}`,
      name: user?.Name || "Unknown",
      username: user?.Username || "unknown",
      avatar: user?.ImageUrl || "/assets/icons/profile-placeholder.svg",
      listsCreated: user?.listsCreated || 0,
      totalLikes: user?.totalLikes || 0,
      key: user?.$id || `user-${index}`,
    })) || [],
    [users]
  );

  const topLists = useMemo(() => {
    if (!allLists) return [];

    const filteredLists = allLists.filter(list => {
      if (category === "all") return true;
      return (list.Categories?.map(c => c.toLowerCase()).includes(category.toLowerCase()) ||
              list.Tags?.map(t => t.toLowerCase()).includes(category.toLowerCase()));
    });

    const sortedLists = filteredLists.sort((a, b) => (b.Likes?.length || 0) - (a.Likes?.length || 0));

    return sortedLists.slice(0, 5).map((list: any, index: number) => ({
      rank: index + 1,
      path: `/lists/${list?.$id || ""}`,
      title: list?.Title || "Untitled",
      creator: list?.creator?.Name || "Unknown",
      likes: list?.Likes?.length || 0,
      comments: list?.comments?.length || 0,
      key: list?.$id || `list-${index}`,
    }));
  }, [allLists, category]);

  const LeaderboardSection = ({ title, data, columns }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="mb-8 bg-dark-2 p-4 sm:p-6 rounded-xl shadow-lg"
    >
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-light-1">
        <Trophy className="mr-2 text-orange-500" />
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
                key={item.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border-b border-dark-4 hover:bg-dark-3 transition-colors"
              >
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-light-1">
                  {item.rank === 1 && <Trophy className="inline text-orange-500 mr-1" />}
                  {item.rank === 2 && <Trophy className="inline text-gray-400 mr-1" />}
                  {item.rank === 3 && <Trophy className="inline text-white mr-1" />}
                  {item.rank}
                </td>
                {columns.map((col: any, colIndex: number) => (
                  <td key={`${item.key}-${colIndex}`} className="px-2 sm:px-4 py-2 sm:py-3 text-light-2">
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

  const LoadingSkeleton = () => (
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
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error",
      description: "Failed to fetch leaderboard data. Please try again.",
      variant: "destructive",
    });
    return <div>Error loading leaderboard. Please try again later.</div>;
  }

  return (
    <div className="max-w-full sm:max-w-5xl mx-auto p-4 sm:p-8 bg-dark-1 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8 text-center text-light-1"
      >
        Leaderboard
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row justify-between mb-4 sm:mb-8 gap-4 text-xs"
      >
        <div className="flex items-center bg-dark-2 rounded-lg p-2">
          <Clock className="text-light-2 mr-2" />
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
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>
      </motion.div>

      <AnimatePresence>
        <LeaderboardSection
          key="top-lists"
          title={`Top Lists ${category !== 'all' ? `- ${category.charAt(0).toUpperCase() + category.slice(1)}` : ''}`}
          data={topLists}
          columns={[
            {
              header: "List Title",
              key: "title",
              render: (item: any) => (
                <Link to={item.path} className="text-primary-500 hover:underline font-semibold text-sm sm:text-base" onClick={(e) => handleProtectedLinkClick(e, item.path)}>
                  {item.title}
                </Link>
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
              header: <div className="flex items-center"><ThumbsUp size={16} className="mr-1 sm:mr-2 text-light-2" /> <span className="hidden sm:inline">Likes</span></div>,
              key: "likes"
            },
            {
              header: <div className="flex items-center"><MessageCircle size={16} className="mr-1 sm:mr-2 text-light-2" /> <span className="hidden sm:inline">Comments</span></div>,
              key: "comments"
            },
          ]}
        />
        <LeaderboardSection
          key="top-users"
          title="Top Users"
          data={topUsers}
          columns={[
            {
              header: "User",
              key: "name",
              render: (item: any) => (
                <div className="flex items-center">
                  <img src={item.avatar} alt={item.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 border-2 border-primary-500" />
                  <div>
                    <Link to={item.path} className="text-primary-500 hover:underline font-semibold text-sm sm:text-base" onClick={(e) => handleProtectedLinkClick(e, item.path)}>
                      {item.name}
                    </Link>
                    <p className="text-light-3 text-xs">@{item.username}</p>
                  </div>
                </div>
              ),
            },
            {
              header: <div className="flex items-center"><List size={16} className="mr-1 sm:mr-2 text-light-2" /> <span className="hidden sm:inline">Lists</span></div>,
              key: "listsCreated"
            },
            {
              header: <div className="flex items-center"><ThumbsUp size={16} className="mr-1 sm:mr-2 text-light-2" /> <span className="hidden sm:inline">Likes</span></div>,
              key: "totalLikes"
            },
          ]}
        />
      </AnimatePresence>

      <SignInDialog isOpen={isSignInDialogOpen} onClose={closeSignInDialog} />
    </div>
);
};

export default ComprehensiveLeaderboard2;