import { useEffect, useState } from 'react';
import { Trophy,TrendingUp, List, ThumbsUp, MessageCircle, Eye } from 'lucide-react';
import { getUsers } from '@/lib/appwrite/config';
import { getMostLikedLists } from '@/lib/appwrite/api';
import { Link } from 'react-router-dom';

const ComprehensiveLeaderboard = () => {
  const [timeFrame, setTimeFrame] = useState('week');
  const [category, setCategory] = useState('all');
  const [users, setUsers] = useState<any>([])
  const [lists, setLists] = useState<any>([])

  useEffect(()=>{
    const fetchData = async ()=>{
      let u = await getUsers();
      setUsers(u?.slice(0,5))
      let l = await getMostLikedLists()
      setLists(l.slice(0,5));
    }
    fetchData()
  },[])
  
  let topUser = users.map((user:any,index:number)=> {
    return {rank: index+1,path:`/profile/${user.$id}` ,  name:user.Name, avatar:user.ImageUrl || "/assets/icons/profile-placeholder.svg", listsCreated: user.lists.length, totalLikes: user.totalLikes, totalViews: 100}
  })

  let topList = lists.map((list:any, index:number) => {
    return {rank:index+1,path:`/lists/${list.$id}`, title:list.Title, creator:list.creator.Name, likes: list.Likes.length, comments:list.comments.length, views:100}
  })

  const categories = ['All', 'Technology', 'Travel', 'Food', 'Entertainment', 'Sports'];

  const LeaderboardSection = ({ title, data, columns }:any) => (
    <div className="mb-8 bg-zinc-950">
      <h2 className="text-2xl font-bold mb-4 flex items-center justify-between">
        {title}
      </h2>
      {(
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-zinc-950">
                <th className="px-4 py-2">Rank</th>
                {columns.map((col:any, index:number) => (
                  <th key={index} className="px-4 py-2">{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item:any, index:number) => (
                <tr key={index} className="border-b hover:bg-zinc-800">
                  <td className="px-4 py-2 text-center font-bold">
                    {item.rank === 1 && <Trophy className="inline text-yellow-500 mr-1" />}
                    {item.rank === 2 && <Trophy className="inline text-gray-400 mr-1" />}
                    {item.rank === 3 && <Trophy className="inline text-yellow-600 mr-1" />}
                    {item.rank}
                  </td>
                  {columns.map((col:any, colIndex:number) => (
                    <td key={colIndex} className="px-4 py-2">
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-zinc-950 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Topfived Leaderboard</h1>

      {/* Time Frame and Category Selectors */}
      <div className="flex justify-between mb-6">
        <div>
          <label className="mr-2 font-semibold ">Time Frame:</label>
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
            {categories.map(cat => (
              <option key={cat} value={cat.toLowerCase()}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Users Section */}
      <LeaderboardSection
        title="Top Users"
        data={topUser}
        columns={[
          { header: "User", key: "name", render: (item:any) => (
            <div className="flex items-center">
              <img src={item.avatar} alt={item.name} className="w-8 h-8 rounded-full mr-2" />
              <Link to={item.path}>{item.name}</Link>
            </div>
          )},
          { header: <List size={24} className="inline mr-1" />, key: "listsCreated" },
          { header: <ThumbsUp size={16} className="inline mr-1" />, key: "totalLikes" },
          { header: <Eye size={16} className="inline mr-1" />, key: "totalViews" },
        ]}
      />

      {/* Top Lists Section */}
      <LeaderboardSection
        title="Top Lists"
        data={topList}
        columns={[
          { header: "List Title", key: "title", render: (item:any) => (
            <div className="flex items-center">
              <Link to={item.path}>{item.title}</Link>
            </div>
          )},
          { header: "Creator", key: "creator" },
          { header: <ThumbsUp size={16} className="inline mr-1" />, key: "likes" },
          { header: <MessageCircle size={16} className="inline mr-1" />, key: "comments" },
          { header: <Eye size={16} className="inline mr-1" />, key: "views" },
        ]}
      />

      {/* User's Personal Ranking */}
      {/*<div className="mt-8 p-4 bg-blue-100 rounded-lg flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Your Ranking</h3>
          <p>You're currently ranked #42 out of 1000 users</p>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors">
          View Your Profile
        </button>
      </div>*/}

      {/* Engagement Boosters */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-700 p-4 rounded-lg">
          <h3 className="font-semibold flex items-center"><TrendingUp className="mr-2" /> Trending Categories</h3>
          <ul className="mt-2 list-disc list-inside">
            <li>Technology</li>
            <li>Travel</li>
            <li>Food</li>
          </ul>
        </div>
        {/*<div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold flex items-center"><Star className="mr-2" /> This Week's Challenge</h3>
          <p className="mt-2">Create a "Top 5 Summer Destinations" list to climb the rankings!</p>
        </div>*/}
      </div>
    </div>
  );
};

export default ComprehensiveLeaderboard;
