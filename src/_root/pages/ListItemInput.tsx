// src/components/ListItemInput.tsx

import React, { useState } from 'react';

interface ListItemInputProps {
  onAddItem: (item: string) => void;
}

const ListItemInput: React.FC<ListItemInputProps> = ({ onAddItem }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleAddItem = () => {
    if (inputValue.trim() !== '') {
      onAddItem(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddItem();
    }
  };

  return (
    <div className="flex items-center w-full">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Enter a list item"
        aria-label="List item input"
        className="flex-grow px-4 py-2 mr-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
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
