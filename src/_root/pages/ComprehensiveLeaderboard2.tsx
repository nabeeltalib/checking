import React, { useEffect, useState, useMemo } from "react";
import { Trophy, List, ThumbsUp, MessageCircle } from "lucide-react";
import { getUsers } from "@/lib/appwrite/config";
import { getMostLikedLists } from "@/lib/appwrite/api";
import { Link } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui";
import { useToast } from "@/components/ui/use-toast";

const ComprehensiveLeaderboard2 = () => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const [timeFrame, setTimeFrame] = useState("week");
  const [category, setCategory] = useState("all");
  const [users, setUsers] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [isSignUpDialogOpen, setIsSignUpDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const u = await getUsers();
        setUsers(u?.slice(0, 5));
        const l = await getMostLikedLists();
        setLists(l.slice(0, 5));
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        }, 1000);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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
        avatar: user.ImageUrl || "/assets/icons/profile-placeholder.svg",
        listsCreated: user.lists.length,
        totalLikes: user.totalLikes,
        totalViews: 100,
      })),
    [users]
  );

  const topList = useMemo(
    () =>
      lists.map((list: any, index: number) => ({
        rank: index + 1,
        path: `/lists/${list.$id}`,
        title: list.Title,
        creator: list.creator.Name,
        likes: list.Likes.length,
        comments: list.comments.length,
        views: 100,
      })),
    [lists]
  );

  const categories = ["All", "Technology", "Travel", "Food", "Entertainment", "Sports"];

  const LeaderboardSection = ({ title, data, columns }: any) => (
    <div className="mb-8 bg-zinc-900 p-4 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-light-1">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-zinc-800">
              <th className="px-4 py-2">Rank</th>
              {columns.map((col: any, index: number) => (
                <th key={index} className="px-4 py-2 text-left">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item: any, index: number) => (
              <tr key={index} className="border-b border-zinc-700 hover:bg-zinc-800">
                <td className="px-4 py-2 text-center font-bold text-light-1">
                  {item.rank === 1 && <Trophy className="inline text-yellow-500 mr-1" />}
                  {item.rank === 2 && <Trophy className="inline text-gray-400 mr-1" />}
                  {item.rank === 3 && <Trophy className="inline text-yellow-600 mr-1" />}
                  {item.rank}
                </td>
                {columns.map((col: any, colIndex: number) => (
                  <td key={colIndex} className="px-4 py-2 text-light-2">
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div
        className={`flex justify-center items-center h-screen bg-black text-white transition-opacity duration-500 ${
          fadeOut ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="text-center">
          <img
            src="/assets/images/mobile.png"
            width={200}
            alt="Loading..."
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl flashing">Loading Leaderboard...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-zinc-950 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-light-1">Topfived Leaderboard</h1>

      <div className="flex justify-between mb-6">
        <div>
          <label className="mr-2 font-semibold text-light-2">Time Frame:</label>
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            className="border rounded p-1 bg-zinc-900 text-light-1"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="allTime">All Time</option>
          </select>
        </div>
        <div>
          <label className="mr-2 font-semibold text-light-2">Category:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded p-1 bg-zinc-900 text-light-1"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat.toLowerCase()}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <LeaderboardSection
        title="Top Users"
        data={topUser}
        columns={[
          {
            header: "User",
            key: "name",
            render: (item: any) => (
              <div className="flex items-center">
                <img src={item.avatar} alt={item.name} className="w-8 h-8 rounded-full mr-2" />
                <Link to={item.path} className="text-primary-500 hover:underline" onClick={(e) => handleProtectedLinkClick(e, item.path)}>
                  {item.name}
                </Link>
              </div>
            ),
          },
          { header: <List size={24} className="inline mr-1 text-light-2" />, key: "listsCreated" },
          { header: <ThumbsUp size={16} className="inline mr-1 text-light-2" />, key: "totalLikes" },
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
                <Link to={item.path} className="text-primary-500 hover:underline" onClick={(e) => handleProtectedLinkClick(e, item.path)}>
                  {item.title}
                </Link>
              </div>
            ),
          },
          { header: "Creator", key: "creator" },
          { header: <ThumbsUp size={16} className="inline mr-1 text-light-2" />, key: "likes" },
          { header: <MessageCircle size={16} className="inline mr-1 text-light-2" />, key: "comments" },
        ]}
      />

      {isSignUpDialogOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 z-50 p-4 sm:p-8">
          <div className="relative bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-lg">
            <button
              onClick={closeSignUpDialog}
              className="text-gray-500 hover:text-gray-700 absolute top-4 right-4"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Unlock Full Access!</h3>
              <p className="text-sm sm:text-sm text-gray-600 mb-6">Sign up now to like, comment, save, and remix lists. Create your own rankings and join the community!</p>
            </div>
            <div className="flex flex-col gap-4">
              <Button
                type="button"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out"
                onClick={() => { closeSignUpDialog(); /* Navigate to sign-up page */ }}
              >
                Sign Up
              </Button>
              <Button
                className="flex items-center justify-center bg-white text-gray-700 border border-gray-300 px-4 sm:px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out hover:bg-gray-100"
                onClick={() => { closeSignUpDialog(); /* Navigate to sign-in page */ }}
              >
                <img src="/assets/icons/google.svg" alt="Google" className="mr-2 h-5 w-5" />
                Sign In with Google
              </Button>
              <Button
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
                onClick={() => { closeSignUpDialog(); /* Navigate to sign-in page */ }}
              >
                Sign In with Email
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveLeaderboard2;
