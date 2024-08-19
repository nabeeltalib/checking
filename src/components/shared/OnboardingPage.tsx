import { useState } from 'react';
import { ChevronRight, Heart, Save, MessageCircle, Search, List } from 'lucide-react';

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const features = [
    { icon: <Heart />, title: "Like", description: "Show appreciation for great lists" },
    { icon: <Save />, title: "Save", description: "Bookmark lists for later" },
    { icon: <MessageCircle />, title: "Comment", description: "Engage in discussions" },
    { icon: <Search />, title: "Search", description: "Discover lists on any topic" },
    { icon: <List />, title: "Create", description: "Make your own top 5 lists" }
  ];

  const exampleLists = [
    { title: "Top 5 Sci-Fi Movies of All Time", likes: 1234, comments: 89 },
    { title: "Best Productivity Apps for 2024", likes: 987, comments: 56 },
    { title: "Most Influential Books of the 21st Century", likes: 2345, comments: 120 }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Welcome to Topfived</h1>
      
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Discover, Create, and Share Top 5 Lists</h2>
        <p className="text-gray-600">
          Join our community of list enthusiasts. Create, vote, and discuss 
          top 5 lists on any topic imaginable!
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {features.map((feature, index) => (
          <div key={index} className="border p-4 rounded-lg text-center">
            <div className="text-4xl mb-2 text-blue-500 flex justify-center">{feature.icon}</div>
            <h3 className="font-semibold mb-1">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-4">Popular Lists</h3>
        {exampleLists.map((list, index) => (
          <div key={index} className="border-b py-3 flex justify-between items-center">
            <span className="font-medium">{list.title}</span>
            <div className="text-sm text-gray-500">
              <span className="mr-3"><Heart size={16} className="inline mr-1" />{list.likes}</span>
              <span><MessageCircle size={16} className="inline mr-1" />{list.comments}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button className="bg-blue-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-600 transition-colors">
          Sign Up Now to Start Listing!
        </button>
        <p className="mt-4 text-gray-600">
          Already have an account? <a href="#" className="text-blue-500 hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
};

export default OnboardingPage;