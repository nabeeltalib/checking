import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import useMediaQuery from '@/hooks/useMediaQuery'; // You'll need to create this custom hook
import { PlusCircle, ChevronDown } from 'lucide-react';

const FAB: React.FC = () => {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 640px)'); // sm breakpoint in Tailwind
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCreateList = () => {
    navigate("/create-list");
    setIsDropdownOpen(false);
  };

  const handleCreateGroupList = () => {
    // This option is restricted for now
  };

  const handleCreateChallenge = () => {
    // This option is restricted for now
  };

  if (!isDesktop) return null; // Don't render anything on mobile

  return (
    <div className="fixed bottom-28 left-20 group">
      <button
        className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 flex items-center justify-center"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <PlusCircle className="h-5 w-5" />
        <ChevronDown className="ml-2 h-5 w-5" />
      </button>

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-48 rounded-md shadow-lg bg-blue-700 ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <button
              onClick={handleCreateList}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-blue-500"
            >
              Create List
            </button>
            <button
              onClick={handleCreateGroupList}
              className="w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
              disabled
            >
              Create Group List (Restricted)
            </button>
            <button
              onClick={handleCreateChallenge}
              className="w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
              disabled
            >
              Create Challenge (Restricted)
            </button>
          </div>
        </div>
      )}

      {/* Tooltip */}
      <div className="w-max absolute bottom-full right-1/2 transform translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-700 text-white text-xs rounded-md px-2 py-1">
        Create New List
      </div>
    </div>
  );
};

export default FAB;
