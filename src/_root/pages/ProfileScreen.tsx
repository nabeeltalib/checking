import React, { useState } from 'react';
import { User, Edit, List, Heart, Star, MessageCircle, Settings, Plus } from 'lucide-react';

const ProfileScreen = ({ user }:any) => {
  const [activeTab, setActiveTab] = useState('myLists');

  // Placeholder data - replace with actual data fetching logic
  const userLists = [
    { id: 1, title: "Top 5 Sci-Fi Movies", likes: 42, comments: 7 },
    { id: 2, title: "Best Productivity Apps 2024", likes: 38, comments: 5 },
  ];

  const likedLists = [
    { id: 3, title: "Most Influential Books", creator: "BookWorm", likes: 156 },
    { id: 4, title: "Top Travel Destinations", creator: "Wanderlust", likes: 89 },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Header */}
      <div className="flex items-center mb-8">
        <div className="w-24 h-24 bg-gray-300 rounded-full mr-6 flex items-center justify-center">
          {user?.avatar ? (
            <img src={user?.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
          ) : (
            <User size={40} />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user?.name}</h1>
          <p className="text-gray-600">@{user?.username}</p>
          <p className="mt-2">{user?.bio || "No bio yet"}</p>
        </div>
        <button className="ml-auto bg-blue-500 text-white px-4 py-2 rounded-full flex items-center">
          <Edit size={16} className="mr-2" /> Edit Profile
        </button>
      </div>

      {/* Quick Stats */}
      <div className="flex justify-around mb-8 bg-gray-100 p-4 rounded-lg">
        <div className="text-center">
          <div className="font-bold text-xl">{userLists.length}</div>
          <div className="text-gray-600">Lists Created</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-xl">{likedLists.length}</div>
          <div className="text-gray-600">Lists Liked</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-xl">{user?.followers || 0}</div>
          <div className="text-gray-600">Followers</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button 
          className={`mr-4 py-2 ${activeTab === 'myLists' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('myLists')}
        >
          My Lists
        </button>
        <button 
          className={`mr-4 py-2 ${activeTab === 'likedLists' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('likedLists')}
        >
          Liked Lists
        </button>
        <button 
          className={`mr-4 py-2 ${activeTab === 'achievements' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          Achievements
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'myLists' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">My Lists</h2>
          {userLists.map(list => (
            <div key={list.id} className="border-b py-3 flex justify-between items-center">
              <span className="font-medium">{list.title}</span>
              <div className="text-sm text-gray-500">
                <span className="mr-3"><Heart size={16} className="inline mr-1" />{list.likes}</span>
                <span><MessageCircle size={16} className="inline mr-1" />{list.comments}</span>
              </div>
            </div>
          ))}
          <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded-full flex items-center mx-auto">
            <Plus size={16} className="mr-2" /> Create New List
          </button>
        </div>
      )}

      {activeTab === 'likedLists' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Liked Lists</h2>
          {likedLists.map(list => (
            <div key={list.id} className="border-b py-3 flex justify-between items-center">
              <div>
                <span className="font-medium">{list.title}</span>
                <span className="text-sm text-gray-500 ml-2">by {list.creator}</span>
              </div>
              <div className="text-sm text-gray-500">
                <Heart size={16} className="inline mr-1" />{list.likes}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="border p-4 rounded-lg text-center">
              <Star size={32} className="mx-auto mb-2 text-yellow-500" />
              <h3 className="font-semibold">List Creator</h3>
              <p className="text-sm text-gray-600">Created first list</p>
            </div>
            {/* Add more achievements as needed */}
          </div>
        </div>
      )}

      {/* Personalization and Settings */}
      <div className="mt-8 border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Personalize Your Experience</h2>
        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full flex items-center">
          <Settings size={16} className="mr-2" /> Manage Preferences
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;