import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center mb-4 w-full">
      <input
        type="text"
        placeholder="Search lists..."
        value={searchQuery}
        onChange={handleInputChange}
        className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 w-full dark:bg-dark-3 dark:border-dark-4 dark:placeholder-light-4 dark:text-light-1"
        aria-label="Search lists"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-primary-500 text-white rounded-r-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Search"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;