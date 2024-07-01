import { useState, useCallback, useRef } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const debouncedSearch = useCallback(
    (query: string) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        onSearch(query);
      }, 300);
    },
    [onSearch]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full max-w-md">
      <input
        type="text"
        placeholder="Search lists..."
        value={searchQuery}
        onChange={handleInputChange}
        className="w-full px-4 py-2 rounded-l-md bg-dark-3 border border-dark-4 text-light-1 placeholder-light-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Search lists"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-primary-500 text-light-1 rounded-r-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Search"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;