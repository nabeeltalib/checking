import { useState } from 'react';
import { List, BarChart, MessageCircle, ExternalLink } from 'lucide-react';
 
const TopfivedEmbed = ({ type, title, items }:any) => {
  const [showTooltip, setShowTooltip] = useState(false);
 
  const handleCTAClick = () => {
	// In a real implementation, this would navigate to the Topfived site
    console.log('Navigating to Topfived');
  };
 
  return (
	<div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
  	<div className="p-6">
    	<div className="flex justify-between items-center mb-4">
      	<h2 className="text-xl font-bold">{title}</h2>
      	<div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
      	>
        	<button
              onClick={handleCTAClick}
              className="text-blue-500 hover:text-blue-600 transition-colors"
        	>
              <MessageCircle size={24} />
            </button>
            {showTooltip && (
          	<div className="absolute right-0 w-48 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg">
            	Join the discussion on Topfived
              </div>
        	)}
      	</div>
    	</div>
    	
    	{type === 'top5' ? (
      	<ol className="list-decimal list-inside">
            {items.map((item:any, index:number) => (
          	<li key={index} className="mb-2">{item}</li>
        	))}
      	</ol>
    	) : (
      	<ul>
            {items.map((item:any, index:number) => (
          	<li key={index} className="flex justify-between items-center mb-2">
                <span>{item.name}</span>
                <span className="font-semibold">{item.score} pts</span>
              </li>
        	))}
      	</ul>
    	)}
  	</div>
  	
  	<div className="bg-gray-100 px-6 py-3 flex justify-between items-center">
    	<span className="text-sm text-gray-600">Powered by Topfived</span>
    	<button
          onClick={handleCTAClick}
          className="text-blue-500 hover:text-blue-600 transition-colors flex items-center text-sm"
    	>
      	View on Topfived <ExternalLink size={16} className="ml-1" />
        </button>
  	</div>
	</div>
  );
};
 
const EmbedPreview = () => {
  const [embedType, setEmbedType] = useState('top5');
  const [customTitle, setCustomTitle] = useState('My Top 5 List');
 
  const top5Items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
  const leaderboardItems = [
	{ name: 'Item 1', score: 95 },
	{ name: 'Item 2', score: 82 },
	{ name: 'Item 3', score: 78 },
	{ name: 'Item 4', score: 65 },
	{ name: 'Item 5', score: 51 },
  ];
 
  return (
	<div className="max-w-2xl text-black mx-auto p-6 bg-white rounded-lg shadow-md">
  	<h2 className="text-2xl font-bold mb-4">Embed Preview</h2>
  	
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
 
      <TopfivedEmbed
        type={embedType}
        title={customTitle}
        items={embedType === 'top5' ? top5Items : leaderboardItems}
  	/>
	</div>
  );
};
 
export default EmbedPreview;
