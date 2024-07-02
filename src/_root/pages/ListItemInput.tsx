// src/components/ListItemInput.tsx

import React, { useState } from 'react';
import { IListItem } from '@/types'; // Make sure to import IListItem from your types file

interface ListItemInputProps {
  onAddItem: (item: IListItem) => void;
}

const ListItemInput: React.FC<ListItemInputProps> = ({ onAddItem }) => {
  const [inputValue, setInputValue] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleAddItem = () => {
    if (inputValue.trim() !== '') {
      onAddItem({
        content: inputValue.trim(),
        isVisible: isVisible
      });
      setInputValue('');
      setIsVisible(true); // Reset visibility to true after adding an item
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddItem();
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="flex items-center w-full space-x-2">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Enter a list item"
        aria-label="List item input"
        className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-dark-3 text-light-1"
      />
      <button
        type="button"
        onClick={toggleVisibility}
        aria-label={isVisible ? "Set item as hidden" : "Set item as visible"}
        className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          isVisible ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'
        }`}
      >
        {isVisible ? 'Visible' : 'Hidden'}
      </button>
      <button
        type="button"
        onClick={handleAddItem}
        aria-label="Add item"
        className="px-4 py-2 text-white bg-primary-500 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        Add
      </button>
    </div>
  );
};

export default ListItemInput;