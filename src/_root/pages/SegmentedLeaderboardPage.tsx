import React, { useState } from 'react';
import { Trophy, Star, TrendingUp, Calendar, Users, List, Filter, MapPin } from 'lucide-react';

const SegmentedLeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [timeFrame, setTimeFrame] = useState('week');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('global');

  // Sample data - in a real application, this would be fetched based on selected filters
  const leaderboardData = {
    users: [
      { rank: 1, name: "ListMaster", score: 1250, avatar: "https://example.com/avatar1.jpg", category: "Technology", location: "New York" },
      { rank: 2, name: "TopFiver", score: 1100, avatar: "https://example.com/avatar2.jpg", category: "Travel", location: "London" },
      { rank: 3, name: "RankingPro", score: 950, avatar: "https://example.com/avatar3.jpg", category: "Food", location: "Tokyo" },
      // ... more users
    ],
    lists: [
      { rank: 1, title: "Top 5 Sci-Fi Movies of All Time", creator: "CinemaGuru", score: 2500, category: "Entertainment", location: "Los Angeles" },
      { rank: 2, title: "Best Productivity Apps for 2024", creator: "TechWizard", score: 2200, category: "Technology", location: "San Francisco" },
      { rank: 3, title: "Most Influential Books of the 21st Century", creator: "Bookworm", score: 1900, category: "Literature", location: "London" },
      // ... more lists
    ]
  };

  const categories = ['All', 'Technology', 'Travel', 'Food', 'Entertainment', 'Literature', 'Sports'];
  const locations = ['Global', 'North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania'];

  const renderLeaderboardItem = (item, index) => {
    const isUser = 'name' in item;
    return (
      <div key={index} className={`flex items-center p-4 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
        <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-4 ${
          index < 3 ? 'bg-yellow-400 text-white' : 'bg-gray-200'
        }`}>
          {index + 1}
        </div>
        {isUser && (
          <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full mr-4" />
        )}
        <div className="flex-grow">
          <h3 className="font-semibold">{isUser ? item.name : item.title}</h3>
          {!isUser && <p className="text-sm text-gray-600">by {item.creator}</p>}
          <div className="text-xs text-gray-500 mt-1">
            <span className="mr-2">{item.category}</span>
            <MapPin size={12} className="inline mr-1" />{item.location}
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold">{item.score}</div>
          <div className="text-sm text-gray-600">{isUser ? 'points' : 'likes'}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Topfived Leaderboard</h1>

      {/* Tabs for Users vs Lists */}
      <div className="flex justify-center mb-6">
        <button
          className={`mx-2 px-4 py-2 rounded-full ${activeTab === 'users' ? 'bg-blue-500 text-white' : 'bg-slate-900'}`}
          onClick={() => setActiveTab('users')}
        >
          <Users className="inline-block mr-2" /> Top Users
        </button>
        <button
          className={`mx-2 px-4 py-2 rounded-full ${activeTab === 'lists' ? 'bg-blue-500 text-white' : 'bg-slate-900'}`}
          onClick={() => setActiveTab('lists')}
        >
          <List className="inline-block mr-2" /> Top Lists
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center justify-center">
        <div className="m-2">
          <label className="mr-2 font-semibold">Time Frame:</label>
          <select 
            value={timeFrame} 
            onChange={(e) => setTimeFrame(e.target.value)}
            className="border rounded p-1"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="allTime">All Time</option>
          </select>
        </div>
        <div className="m-2">
          <label className="mr-2 font-semibold">Category:</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded p-1"
          >
            {categories.map(cat => (
              <option key={cat} value={cat.toLowerCase()}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="m-2">
          <label className="mr-2 font-semibold">Location:</label>
          <select 
            value={location} 
            onChange={(e) => setLocation(e.target.value)}
            className="border rounded p-1"
          >
            {locations.map(loc => (
              <option key={loc} value={loc.toLowerCase().replace(' ', '-')}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard Display */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-4 bg-blue-500 text-white flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className="mr-2" />
            <h2 className="text-xl font-semibold">
              {activeTab === 'users' ? 'Top Listers' : 'Most Popular Lists'}
            </h2>
          </div>
          <div className="text-sm">
            {category !== 'all' && <span className="mr-2">{category}</span>}
            {location !== 'global' && <span>{location}</span>}
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {leaderboardData[activeTab].map(renderLeaderboardItem)}
        </div>
      </div>

      {/* User's Personal Ranking (within the selected category/location) */}
      <div className="mt-8 p-4 bg-yellow-100 rounded-lg flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Your Ranking</h3>
          <p>You're currently ranked #42 in {category} {location !== 'global' && `(${location})`}</p>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors">
          Improve Ranking
        </button>
      </div>

      {/* Additional engagement features can be added here */}
    </div>
  );
};

export default SegmentedLeaderboardPage;
