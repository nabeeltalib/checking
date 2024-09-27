import React, { useState } from "react";
import { Crown } from "lucide-react"; // Import Trophy icon

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
    <div className="text-slate-600 p-6 bg-gray-900 rounded-lg shadow-md">
      <div
            className="text-slate-700 text-center text-xl sm:text-xl font-thin px-4 py-2 rounded-t-lg"
            style={{ fontFamily: "'Racing Sans One', sans-serif" }}
          >
            Ranking For
          </div>
      <h4 className="text-yellow-200 text-md font-bold mt-4 mb-3">{title || "Title"}</h4>
      {description && (
        <p className="text-light-2 text-xs mb-4">{description.length > 100 ? description.substring(0, 100) + '...' : description}</p>
      )}
      <ul className="text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {visibleItems.filter(item => item.isVisible).map((item, index) => (
          <li key={index} className="text-xs text-white flex items-center mb-2 bg-gray-800 rounded-md p-3 hover:bg-gray-700 transition-colors duration-300">
            <span className="text-sm font-bold text-yellow-200 mr-4">
              {index === 0 ? <Crown size={20} className="text-yellow-200" /> : index + 1}
            </span>
            <span>{item.content || "ranking"}</span>
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
