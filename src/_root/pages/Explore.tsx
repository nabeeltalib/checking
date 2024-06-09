import React, { useEffect, useState } from 'react';
import { useGetRecentLists } from '@/lib/react-query/queries';
import { Loader } from '@/components/shared';
import ListCard from '@/components/shared/ListCard';
import axios from 'axios';

const Explore = () => {
  const { data, isLoading } = useGetRecentLists();
  const [trendingTags, setTrendingTags] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isTagsLoading, setIsTagsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  useEffect(() => {
    // Fetch trending tags
    axios.get('/api/tags/trending').then(response => {
      setTrendingTags(response.data.tags);
      setIsTagsLoading(false);
    });

    // Fetch popular categories
    axios.get('/api/categories/popular').then(response => {
      setPopularCategories(response.data.categories);
      setIsCategoriesLoading(false);
    });

    // Fetch AI-powered recommendations
    axios.get('/api/lists/recommendations').then(response => {
      setAiRecommendations(response.data.lists);
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    axios.get(`/api/lists/search?q=${searchQuery}`).then(response => {
      setSearchResults(response.data);
      setIsSearching(false);
    });
  };

  return (
    <div className="explore-container common-container">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Explore</h1>
        <form onSubmit={handleSearch} className="flex items-center">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Search"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary-500 text-white rounded-r-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Search button"
          >
            Search
          </button>
        </form>
        <div className="flex gap-4">
          <img src="/assets/icons/profile.svg" alt="Profile" className="w-6 h-6" />
          <img src="/assets/icons/notifications.svg" alt="Notifications" className="w-6 h-6" />
        </div>
      </header>

      <div className="flex-between w-full max-w-5xl mt-16 mb-7">
        <h3 className="body-bold md:h3-bold">Popular Lists</h3>

        <div className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer">
          <p className="small-medium md:base-medium text-light-2">All</p>
          <img
            src="/assets/icons/filter.svg"
            width={20}
            height={20}
            alt="filter"
          />
        </div>
      </div>

      <div className="categories mb-8">
        <h4 className="text-xl font-semibold mb-4">Popular Categories</h4>
        <div className="category-list flex gap-4 flex-wrap">
          {isCategoriesLoading ? (
            <Loader />
          ) : (
            popularCategories.map(category => (
              <div key={category.id} className="category-item bg-gray-200 p-2 rounded-lg">
                {category.name}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="tags mb-8">
        <h4 className="text-xl font-semibold mb-4">Trending Tags</h4>
        <div className="tag-list flex gap-4 flex-wrap">
          {isTagsLoading ? (
            <Loader />
          ) : (
            trendingTags.map(tag => (
              <Link
                key={tag.id}
                to={`/tags/${tag.id}`}
                className="tag-item bg-gray-200 p-2 rounded-lg"
              >
                {tag.name}
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="recommendations mb-8">
        <h4 className="text-xl font-semibold mb-4">Recommended for You</h4>
        <div className="recommendation-list grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {aiRecommendations.map(list => (
            <ListCard key={list.$id} list={list} />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {isLoading ? (
          <Loader />
        ) : (
          data?.documents.map((list: any) => (
            <ListCard key={list.$id} list={list} />
          ))
        )}
      </div>

      {isSearching && <Loader />}
      {!isSearching && searchResults.length > 0 && (
        <div className="search-results">
          <h4 className="text-xl font-semibold mb-4">Search Results</h4>
          <div className="result-list grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {searchResults.map(list => (
              <ListCard key={list.$id} list={list} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
