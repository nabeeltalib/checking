import React from 'react';  // Add this import

import { Link } from "react-router-dom";

interface Creator {
  $id: string;
  Name: string;
  ImageUrl?: string;
}

interface ListItem {
  $id: string;
  Title: string;
  items: string[];
  Tags?: string[];
  Likes?: string[];
  comments?: string[];
  creator?: Creator;
}

interface GridListListProps {
  lists: ListItem[];
  showUser?: boolean;
  showStats?: boolean;
}

const GridListList: React.FC<GridListListProps> = ({ lists, showUser = true, showStats = true }) => {
  if (!lists || lists.length === 0) {
    return <p className="text-light-2">No lists available.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {lists.map((item) => (
        <div
          key={item.$id}
          className="bg-dark-4 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105"
        >
          <Link to={`/lists/${item.$id}`} className="block p-4">
            <h3 className="text-xl font-bold text-light-1 mb-2">{item.Title}</h3>
            <ul className="list-decimal list-inside mb-4 text-light-1">
              {item.items.slice(0, 5).map((listItem, index) => (
                <li key={index} className="line-clamp-1">{listItem}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              {item.Tags && item.Tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="bg-dark-3 text-light-4 rounded-full px-2 py-1 text-xs">
                  #{tag}
                </span>
              ))}
              {item.Tags && item.Tags.length > 3 && (
                <span className="bg-dark-3 text-light-4 rounded-full px-2 py-1 text-xs">
                  +{item.Tags.length - 3}
                </span>
              )}
            </div>
          </Link>
          {showUser && item.creator && (
            <Link
              to={`/profile/${item.creator.$id}`}
              className="px-4 py-2 bg-dark-3 flex items-center z-50"
            >
              <img
                src={item.creator.ImageUrl || "/assets/icons/profile-placeholder.svg"}
                alt={`${item.creator.Name}'s profile picture`}
                className="w-8 h-8 rounded-full mr-2 object-cover"
              />
              <p className="text-light-1 truncate">{item.creator.Name}</p>
            </Link>
          )}
          {showStats && (
            <div className="px-4 py-2 bg-dark-3 flex justify-between items-center z-50">
              <span className="flex items-center">
                <img
                  src="/assets/icons/like.svg"
                  alt="Number of likes"
                  className="w-4 h-4 mr-1"
                />
                <p className="text-light-1">{item.Likes?.length || 0}</p>
              </span>
              <span className="flex items-center">
                <img
                  src="/assets/icons/comment.svg"
                  alt="Number of comments"
                  className="w-4 h-4 mr-1"
                />
                <p className="text-light-1">{item.comments?.length || 0}</p>
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default React.memo(GridListList);
