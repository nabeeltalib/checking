import { useEffect, useState } from "react";
import { Trophy, List, ThumbsUp, MessageCircle, Eye } from "lucide-react";
import { getUsers } from "@/lib/appwrite/config";
import { getMostLikedLists } from "@/lib/appwrite/api";
import { Link } from "react-router-dom";

const ComprehensiveLeaderboard = () => {
  const [timeFrame, setTimeFrame] = useState("week");
  const [category, setCategory] = useState("all");
  const [users, setUsers] = useState<any>([]);
  const [lists, setLists] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

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
          }, 500); // Duration of fade-out animation
        }, 1000); // Optional delay before starting fade-out
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const topUser = users.map((user: any, index: number) => ({
    rank: index + 1,
    path: `/profile/${user.$id}`,
    name: user.Name,
    avatar: user.ImageUrl || "/assets/icons/profile-placeholder.svg",
    listsCreated: user.lists.length,
    totalLikes: user.totalLikes,
    totalViews: 100,
  }));

  const topList = lists.map((list: any, index: number) => ({
    rank: index + 1,
    path: `/lists/${list.$id}`,
    title: list.Title,
    creator: list.creator.Name,
    likes: list.Likes.length,
    comments: list.comments.length,
    views: 100,
  }));

  const categories = ["All", "Technology", "Travel", "Food", "Entertainment", "Sports"];

  const LeaderboardSection = ({ title, data, columns }: any) => (
    <div className="mb-8 bg-zinc-950">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-zinc-900">
              <th className="px-4 py-2">Rank</th>
              {columns.map((col: any, index: number) => (
                <th key={index} className="px-4 py-2">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item: any, index: number) => (
              <tr key={index} className="border-b hover:bg-zinc-800">
                <td className="px-4 py-2 text-center font-bold">
                  {item.rank === 1 && <Trophy className="inline text-yellow-500 mr-1" />}
                  {item.rank === 2 && <Trophy className="inline text-gray-400 mr-1" />}
                  {item.rank === 3 && <Trophy className="inline text-yellow-600 mr-1" />}
                  {item.rank}
                </td>
                {columns.map((col: any, colIndex: number) => (
                  <td key={colIndex} className="px-4 py-2">
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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-zinc-950 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Topfived Leaderboard</h1>

      <div className="flex justify-between mb-6">
        <div>
          <label className="mr-2 font-semibold">Time Frame:</label>
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            className="border rounded p-1 bg-zinc-950"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="allTime">All Time</option>
          </select>
        </div>
        <div>
          <label className="mr-2 font-semibold">Category:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded p-1 bg-zinc-950"
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
                <Link to={item.path}>{item.name}</Link>
              </div>
            ),
          },
          { header: <List size={24} className="inline mr-1" />, key: "listsCreated" },
          { header: <ThumbsUp size={16} className="inline mr-1" />, key: "totalLikes" },
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
                <Link to={item.path}>{item.title}</Link>
              </div>
            ),
          },
          { header: "Creator", key: "creator" },
          { header: <ThumbsUp size={16} className="inline mr-1" />, key: "likes" },
          { header: <MessageCircle size={16} className="inline mr-1" />, key: "comments" },
        ]}
      />
    </div>
  );
};

export default ComprehensiveLeaderboard;
