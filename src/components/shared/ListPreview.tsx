import React, { useState } from "react";

interface ListPreviewProps {
  title: string;
  description?: string;
  items: Array<{ content: string; isVisible: boolean }>;
  categories: string[];
  tags: string[];
  timespans: string[];
  locations: string[];
}

const ListPreview: React.FC<ListPreviewProps> = ({ title, description, items, categories, tags, timespans, locations }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleItems = isExpanded ? items : items.slice(0, 5);

  return (
    <div className="p-6 bg-dark-2 rounded-lg shadow-md">      
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="flex items-center space-x-4">
          <img
            src={'/assets/icons/profile-placeholder.svg'}
            alt="User Profile"
            className="w-10 h-10 rounded-full object-cover shadow-md"
          />        
          
          <div>
            <p className="text-lg font-semibold text-light-1">You</p>
            <p className="text-sm text-blue-400">@you</p>
            <p className="text-xs text-gray-500">6 Followers • 2 Following</p>
          </div>
        </div>

        {/* Button moved to the right for both mobile and desktop views */}
       </div>

      <div className="bg-dark-3 text-gray-500 text-center text-xl font-thin py-1 rounded-t-lg" style={{ fontFamily: "'Racing Sans One', sans-serif" }}>
        Ranking For
      </div>

      <h4 className="text-md font-bold text-blue-300 mt-4 mb-6">{title || "Your Title Here"}</h4>

      <ul className="text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {visibleItems.filter(item => item.isVisible).map((item, index) => (
          <li key={index} className="p-2 bg-dark-1 text-light-1 rounded-md shadow-md flex items-center">
            <span className="text-xs w-6 h-6 flex items-center justify-center bg-dark-4 text-blue-300 rounded-full mr-2">
              {index + 1}
            </span>
            <span>{item.content || "Item content here"}</span>
          </li>
        ))}
      </ul>

      {items.length > 5 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary-500 font-semibold block mx-auto sm:mx-0">
          {isExpanded ? "Show Less" : "Show More"}
        </button>
      )}

      {description && (
        <p className="text-sm text-gray-500 mt-4">{description.length > 100 ? description.substring(0, 100) + '...' : description}</p>
      )}

      <div className="flex flex-wrap gap-2 mt-6">
        {tags && tags.length > 0 && tags.map((tag, index) => (
          <span key={index} className="bg-blue-800 text-blue-200 px-3 py-1 rounded-full text-xs cursor-pointer shadow-md">
            #{tag}
          </span>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        {categories.length > 0 && <p>Categories: {categories.join(", ")}</p>}
        {timespans.length > 0 && <p>Timespans: {timespans.join(", ")}</p>}
        {locations.length > 0 && <p>Locations: {locations.join(", ")}</p>}
      </div>

      <p className="text-xs text-gray-400 mt-6 text-right">
        about 2 min ago
      </p>
    </div>
  );
};

export default ListPreview;
