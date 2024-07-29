import { useState } from 'react';
import { List, BarChart } from 'lucide-react';
 
const EmbedSelector = () => {
  const [embedType, setEmbedType] = useState('top5');
  const [customTitle, setCustomTitle] = useState('My Top 5 List');
 
  const generateEmbedCode = () => {
	const baseUrl = 'https://topfived.com/embed';
	const params = new URLSearchParams({
  	type: embedType,
  	title: customTitle,
  	listId: '12345' // This would be dynamically set based on the user's actual list
	});
	return `<iframe src="${baseUrl}?${params}" width="100%" height="${embedType === 'top5' ? '300' : '400'}" frameborder="0"></iframe>`;
  };
 
  return (
	<div className="max-w-2xl mx-auto p-6 text-black bg-white rounded-lg shadow-md">
  	<h2 className="text-2xl font-bold mb-4">Choose Your Embed Type</h2>
  	
  	<div className="flex space-x-4 mb-6">
    	<button
      	onClick={() => setEmbedType('top5')}
          className={`flex-1 py-2 px-4 rounded-md ${embedType === 'top5' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
    	>
      	<List className="inline-block mr-2" /> Top 5 List
        </button>
    	<button
      	onClick={() => setEmbedType('leaderboard')}
          className={`flex-1 py-2 px-4 rounded-md ${embedType === 'leaderboard' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
    	>
      	<BarChart className="inline-block mr-2" /> Live Leaderboard
        </button>
  	</div>
 
  	<div className="mb-6">
    	<label className="block text-sm font-medium text-gray-700 mb-1">
      	Custom Title
    	</label>
    	<input
          type="text"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
    	/>
  	</div>
 
  	<div className="bg-gray-100 p-4 rounded-md mb-6">
    	<h3 className="font-semibold mb-2">Embed Preview</h3>
    	{embedType === 'top5' ? (
      	<div className="bg-white p-4 rounded border">
        	<h4 className="font-bold mb-2">{customTitle}</h4>
        	<ol className="list-decimal list-inside">
              <li>Item 1</li>
              <li>Item 2</li>
              <li>Item 3</li>
              <li>Item 4</li>
              <li>Item 5</li>
            </ol>
      	</div>
    	) : (
      	<div className="bg-white p-4 rounded border">
        	<h4 className="font-bold mb-2">{customTitle}</h4>
        	<div className="space-y-2">
          	<div className="flex justify-between">
                <span>Item 1</span>
                <span>95 pts</span>
              </div>
          	<div className="flex justify-between">
                <span>Item 2</span>
                <span>82 pts</span>
              </div>
          	<div className="flex justify-between">
                <span>Item 3</span>
                <span>78 pts</span>
              </div>
          	<div className="flex justify-between">
                <span>Item 4</span>
                <span>65 pts</span>
              </div>
          	<div className="flex justify-between">
                <span>Item 5</span>
                <span>51 pts</span>
              </div>
            </div>
      	</div>
    	)}
  	</div>
 
  	<div className="mb-6">
    	<h3 className="font-semibold mb-2">Embed Code</h3>
    	<textarea
      	readOnly
          value={generateEmbedCode()}
          className="w-full h-24 px-3 py-2 text-sm font-mono bg-gray-100 border border-gray-300 rounded-md"
    	/>
  	</div>
 
  	<div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
    	<h3 className="font-bold text-yellow-700">Understanding the Difference</h3>
    	<p className="mt-2">
          <strong>Top 5 List:</strong> A static display of your curated top 5 items. Perfect for showcasing your final selections or recommendations. It's simple, clean, and doesn't change unless you update it.
    	</p>
    	<p className="mt-2">
          <strong>Live Leaderboard:</strong> An interactive, real-time ranking of items that viewers can vote on. Great for engaging your audience and getting their opinions. The order can change based on votes, making it dynamic and interactive.
    	</p>
  	</div>
	</div>
  );
};
 
export default EmbedSelector;
