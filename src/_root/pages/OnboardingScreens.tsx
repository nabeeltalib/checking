import React, { useState } from 'react';
import { User, Mail, Lock, ChevronRight, List, Heart, Star, Facebook, Twitter, SkipForward, HelpCircle } from 'lucide-react';

const OnboardingScreens = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  const screens = [
    { title: 'Sign Up', component: <SignUpScreen /> },
    { title: 'Quick Interests', component: <QuickInterestsScreen /> },
    { title: 'Profile Basics', component: <ProfileBasicsScreen /> },
    { title: 'Welcome', component: <WelcomeScreen /> },
    { title: 'First-Time Homepage', component: <FirstTimeHomepage /> }
  ];

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between mb-6">
        {screens.map((screen, index) => (
          <div key={index} className={`flex flex-col items-center ${index <= currentScreen ? 'text-blue-500' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 flex items-center justify-center rounded-full ${index <= currentScreen ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {index + 1}
            </div>
            <span className="text-xs mt-1">{screen.title}</span>
          </div>
        ))}
      </div>
      {screens[currentScreen].component}
      <div className="mt-4 flex justify-between">
        <button 
          onClick={() => setCurrentScreen(Math.max(0, currentScreen - 1))}
          className="text-blue-500 hover:text-blue-700"
          disabled={currentScreen === 0}
        >
          Back
        </button>
        <button 
          onClick={() => setCurrentScreen(Math.min(screens.length - 1, currentScreen + 1))}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {currentScreen === screens.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

const SignUpScreen = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Join Topfived</h2>
    <form>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
          Email
        </label>
        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="email" placeholder="Email" />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
          Password
        </label>
        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************" />
      </div>
      <div className="flex flex-col space-y-2">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
          Sign Up with Email
        </button>
        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center">
          <Google className="mr-2" size={16} /> Sign Up with Google
        </button>
        <button className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center">
          <Facebook className="mr-2" size={16} /> Sign Up with Facebook
        </button>
      </div>
    </form>
  </div>
);

const QuickInterestsScreen = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">What are you into?</h2>
    <p className="mb-4">Select a few topics you're interested in:</p>
    <div className="grid grid-cols-2 gap-4 mb-6">
      {['Movies', 'Technology', 'Food', 'Travel', 'Books', 'Music', 'Sports', 'Art'].map((topic) => (
        <button key={topic} className="bg-gray-200 hover:bg-blue-500 hover:text-white text-gray-800 font-bold py-2 px-4 rounded">
          {topic}
        </button>
      ))}
    </div>
    <div className="flex justify-between items-center">
      <button className="text-blue-500 hover:text-blue-700 flex items-center">
        <SkipForward size={16} className="mr-1" /> Skip for now
      </button>
      <div className="relative">
        <HelpCircle 
          size={20} 
          className="text-gray-500 cursor-pointer" 
        //   onMouseEnter={() => setShowTooltip(true)}
        //   onMouseLeave={() => setShowTooltip(false)}
        />
        {/* {showTooltip && (
          <div className="absolute right-0 w-48 p-2 mt-1 text-sm bg-gray-800 text-white rounded shadow-lg">
            Selecting interests helps us personalize your experience!
          </div>
        )} */}
      </div>
    </div>
  </div>
);

const ProfileBasicsScreen = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Create Your Profile</h2>
    <form>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
          Username
        </label>
        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Username" />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">
          Bio (optional)
        </label>
        <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="bio" placeholder="Tell us a bit about yourself"></textarea>
      </div>
      <div className="flex justify-between items-center">
        <button className="text-blue-500 hover:text-blue-700 flex items-center">
          <SkipForward size={16} className="mr-1" /> Complete later
        </button>
        <div className="text-sm text-gray-500">
          Profile completion: 2/3
        </div>
      </div>
    </form>
  </div>
);

const WelcomeScreen = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Welcome to Topfived!</h2>
    <p className="mb-4">You're all set! Here's what you can do now:</p>
    <ul className="list-disc list-inside mb-6">
      <li>Browse popular lists</li>
      <li>Create your first list</li>
      <li>Follow other list makers</li>
    </ul>
    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="alert">
      <p className="font-bold">Tip:</p>
      <p>Creating your first list unlocks the "Newcomer" badge!</p>
    </div>
    <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
      Start Exploring
    </button>
  </div>
);

const FirstTimeHomepage = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Discover Top 5 Lists</h2>
    <div className="mb-4">
      <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="Search for lists..." />
    </div>
    <div className="mb-4">
      <h3 className="font-bold text-lg mb-2">Recommended for You</h3>
      <div className="bg-gray-100 p-3 rounded">
        <p className="font-semibold">Top 5 Sci-Fi Movies of 2024</p>
        <p className="text-sm text-gray-600">By MovieBuff123</p>
      </div>
    </div>
    <div className="mb-4">
      <h3 className="font-bold text-lg mb-2">Popular Categories</h3>
      <div className="flex flex-wrap gap-2">
        <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded">Movies</span>
        <span className="bg-green-200 text-green-800 px-2 py-1 rounded">Technology</span>
        <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Food</span>
      </div>
    </div>
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
      Create Your First List
    </button>
  </div>
);

export default OnboardingScreens;
