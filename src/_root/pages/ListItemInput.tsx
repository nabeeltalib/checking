import React, { useState } from 'react';
import { IListItem } from '@/types';

interface ListItemInputProps {
  onAddItem: (item: IListItem) => void;
}

const ListItemInput: React.FC<ListItemInputProps> = ({ onAddItem }) => {
  const [inputValue, setInputValue] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isMovable, setIsMovable] = useState(true);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleAddItem = () => {
    if (inputValue.trim() !== '') {
      onAddItem({
        content: inputValue.trim(),
        isVisible: isVisible,
        isMovable: isMovable
      });
      setInputValue('');
      setIsVisible(true);
      setIsMovable(true);
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

  const toggleMovable = () => {
    setIsMovable(!isMovable);
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Enter a list item"
        aria-label="List item input"
        className="w-full px-4 py-2 border border-dark-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-dark-3 text-light-1"
      />
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={toggleVisibility}
          aria-label={isVisible ? "Set item as hidden" : "Set item as visible"}
          className={`flex-1 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            isVisible ? 'bg-primary-500 hover:bg-primary-600' : 'bg-dark-4 hover:bg-dark-3'
          } text-light-1`}
        >
          {isVisible ? 'Visible' : 'Hidden'}
        </button>
        <button
          type="button"
          onClick={toggleMovable}
          aria-label={isMovable ? "Set item as fixed" : "Set item as movable"}
          className={`flex-1 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            isMovable ? 'bg-primary-500 hover:bg-primary-600' : 'bg-dark-4 hover:bg-dark-3'
          } text-light-1`}
        >
          {isMovable ? 'Movable' : 'Fixed'}
        </button>
        <button
          type="button"
          onClick={handleAddItem}
          aria-label="Add item"
          className="flex-1 px-4 py-2 text-light-1 bg-primary-500 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default ListItemInput;