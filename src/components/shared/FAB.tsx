import React from 'react';
import { useNavigate } from "react-router-dom";
import useMediaQuery from '@/hooks/useMediaQuery'; // You'll need to create this custom hook

const FAB: React.FC = () => {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 640px)'); // sm breakpoint in Tailwind

  const handleClick = () => {
    navigate("/create-list");
  };

  if (!isDesktop) return null; // Don't render anything on mobile

  return (
    <div className="fixed bottom-16 left-16 group">
      <button
        className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 flex items-center justify-center"
        onClick={handleClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
      {/* Tooltip */}
      <div className="w-max absolute bottom-full right-1/2 transform translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-700 text-white text-xs rounded-md px-2 py-1">
        Create New List
      </div>
    </div>
  );
};

export default FAB;