import React, { useState } from "react";
import { Crown, User, Clock, MapPin } from "lucide-react";

interface ListPreviewProps {
  title: string;
  description?: string;
  items: Array<{ content: string; isVisible: boolean }>;
  categories: string[];
  tags: string[];
  timespans: string[];
  locations: string[];
  userImageUrl?: string;
  username: string;
}

const ListPreview: React.FC<ListPreviewProps> = ({ 
  title, 
  description, 
  items, 
  categories, 
  tags, 
  timespans, 
  locations, 
  userImageUrl, 
  username 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleItems = isExpanded ? items : items.slice(0, 5);

  return (
    <div className="text-slate-600 p-6 bg-gray-900 rounded-lg shadow-md">
      {/* User Info */}
      <div className="flex items-center mb-4">
        {userImageUrl ? (
          <img 
            src={userImageUrl} 
            alt={`${username}'s profile`} 
            className="w-8 h-8 rounded-full mr-3 object-cover border-2 border-primary-500"
          />
        ) : (
          <div className="w-8 h-8 rounded-full mr-3 bg-gray-700 flex items-center justify-center">
            <User className="text-gray-400" size={20} />
          </div>
        )}
        <span className="text-xs text-light-1 font-semibold">@{username}</span>
      </div>

      <div
        className="text-slate-700 text-center text-xl sm:text-xl font-thin px-4 py-2 rounded-t-lg"
        style={{ fontFamily: "'Racing Sans One', sans-serif" }}
      >
        Ranking For
      </div>
      <h4 className="text-orange-200 text-md font-bold mt-4 mb-3">{title || "Title"}</h4>
      {description && (
        <p className="text-light-2 text-xs mb-4">{description.length > 100 ? description.substring(0, 100) + '...' : description}</p>
      )}
      <ul className="space-y-2 mb-4">
        {visibleItems.filter(item => item.isVisible).map((item, index) => (
          <li key={index} className="flex items-center text-sm text-white bg-gray-800 rounded-md p-3 hover:bg-gray-700 transition-colors duration-300">
            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-sm font-bold text-orange-200 mr-3">
              {index === 0 ? <Crown size={20} className="text-orange-200" /> : index + 1}
            </span>
            <span className="flex-grow">{item.content || "ranking"}</span>
          </li>
        ))}
      </ul>

      {items.length > 5 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary-500 font-semibold block mx-auto">
          {isExpanded ? "Show Less" : "Show More"}
        </button>
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
        {timespans.length > 0 && (
          <div className="flex items-center mt-2">
            <Clock size={14} className="mr-2 text-gray-400" />
            <span>{timespans.join(", ")}</span>
          </div>
        )}
        {locations.length > 0 && (
          <div className="flex items-center mt-2">
            <MapPin size={14} className="mr-2 text-gray-400" />
            <span>{locations.join(", ")}</span>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-6 text-right">
        about 2 min ago
      </p>
    </div>
  );
};

export default ListPreview;