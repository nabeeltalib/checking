import React, { useState } from "react";
import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { useEnhanceListDescription } from "@/lib/react-query/queries";

const ListCard = ({ list }: ListCardProps) => {
  const { mutate: enhanceDescription, isLoading: isEnhancing } = useEnhanceListDescription();
  const [enhancedDescription, setEnhancedDescription] = useState<string | null>(null);

  const handleEnhanceDescription = () => {
    enhanceDescription({ listId: list.$id, description: list.description }, {
      onSuccess: (enhanced) => setEnhancedDescription(enhanced),
    });
  };

  return (
    <div className="list-card bg-dark-3 p-4 rounded-lg shadow-md transition-transform transform hover:scale-105">
      <Link to={`/lists/${list.$id}`} className="block">
        <h3 className="list-title text-xl font-bold mb-2 text-white line-clamp-2">
          {list.title}
        </h3>
        <p className="list-description text-light-3 mb-4 line-clamp-3">
        {enhancedDescription || list.description}
      </p>
      
      <button
        onClick={handleEnhanceDescription}
        className="bg-primary-500 text-light-1 px-2 py-1 rounded-md text-xs mt-2"
        disabled={isEnhancing}
      >
        {isEnhancing ? "Enhancing..." : "Enhance Description"}
      </button>
        <ul className="list-items mb-4">
          {list.items.slice(0, 5).map((item: string, index: number) => (
            <li key={index} className="list-item text-light-1 mb-1 line-clamp-1">
              {item}
            </li>
          ))}
          {list.items.length > 5 && (
            <li className="list-item text-light-1 mb-1">
              and {list.items.length - 5} more...
            </li>
          )}
        </ul>
        <div className="list-tags flex flex-wrap gap-2">
          {list.tags.map((tag: string) => (
            <Link
              key={tag}
              to={`/tags/${tag}`}
              className="list-tag bg-dark-4 text-light-3 rounded-full px-2 py-1 text-xs"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </Link>
    </div>
  );
};

export default ListCard;