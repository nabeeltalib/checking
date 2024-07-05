import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetRecentLists,
  useGetAISuggestions,
  useSearchLists
} from '@/lib/react-query/queries';
import { Loader } from '@/components/shared';
import ListCard from '@/components/shared/ListCard';
import useDebounce from '@/hooks/useDebounce';
import { getTrendingTags, getPopularCategories } from '@/lib/appwrite/api';
import { useUserContext } from '@/context/AuthContext';
import { IList } from '@/types';
import { useToast } from '@/components/ui/use-toast';

const Explore: React.FC = () => {
  const { user } = useUserContext();
  const {
    data: recentListsData,
    isLoading: isLoadingRecentLists,
    error: recentListsError
  } = useGetRecentLists();
  const [searchQuery, setSearchQuery] = useState('');
  const [isTagsLoading, setIsTagsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    data: aiSuggestions,
    isLoading: isLoadingAISuggestions,
    error: aiSuggestionsError
  } = useGetAISuggestions(user.id);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  const [popularCategories, setPopularCategories] = useState<
    { id: string; name: string }[]
  >([]);
  const { toast } = useToast();

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { data: searchResults, isLoading: isSearchLoading } =
    useSearchLists(debouncedSearchQuery,user.id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tags, categories] = await Promise.all([
          getTrendingTags(),
          getPopularCategories()
        ]);
        setTrendingTags(tags);
        setPopularCategories(categories);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setIsTagsLoading(false);
        setIsCategoriesLoading(false);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    if (recentListsError) {
      toast({
        title: 'Error fetching recent lists',
        description: 'Please try again later',
        variant: 'destructive'
      });
    }
    if (aiSuggestionsError) {
      toast({
        title: 'Error fetching AI suggestions',
        description: 'Please try again later',
        variant: 'destructive'
      });
    }
  }, [recentListsError, aiSuggestionsError, toast]);

  if (isLoadingRecentLists || isLoadingAISuggestions) {
    return <Loader />;
  }
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }
  if (isLoadingRecentLists || isLoadingAISuggestions) {
    return <Loader />;
  }

  if (recentListsError || aiSuggestionsError || error) {
    return (
      <div className="text-red-500">
        {(recentListsError as Error)?.message ||
          (aiSuggestionsError as Error)?.message ||
          error}
      </div>
    );
  }

  const recentLists = recentListsData?.pages || [];
console.log({searchResults,recentListsData})
  return (
    <div className="explore-container common-container">
      <input
        type="text"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Search lists..."
        className="w-full p-2 mb-4 rounded text-black"
      />
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-light-1 mb-4">
          AI Suggested Lists
        </h3>
        {isLoadingAISuggestions ? (
          <Loader />
        ) : aiSuggestions && aiSuggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiSuggestions?.map((suggestion, index) => (
              <div key={index} className="bg-dark-3 p-4 rounded-lg">
                <p className="text-light-1">{suggestion}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-light-2">No AI suggestions available.</p>
        )}
      </section>
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-light-1 mb-4">
          Popular Categories
        </h3>
        <div className="flex gap-4 flex-wrap">
          {/* {console.log({popularCategories})} */}
          {isCategoriesLoading ? (
            <Loader />
          ) : popularCategories.length > 0 ? (
            popularCategories?.map((category, i) => (
              <Link
                key={i}
                to={`/category/${category.$id}`}
                className="bg-dark-4 text-light-1 px-3 py-1 rounded-full hover:bg-primary-500 transition-colors">
                {category.name}
              </Link>
            ))
          ) : (
            <p>No categories found.</p>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold text-light-1 mb-4">
          Trending Tags
        </h3>
        <div className="flex gap-4 flex-wrap">
          {isTagsLoading ? (
            <Loader />
          ) : trendingTags.length > 0 ? (
            trendingTags?.map(tag => (
              <Link
                key={tag}
                to={`/tags/${tag}`}
                className="bg-dark-3 text-light-2 px-3 py-1 rounded-full hover:bg-primary-500 hover:text-light-1 transition-colors">
                #{tag}
              </Link>
            ))
          ) : (
            <p>No trending tags found.</p>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-light-1 mb-4">
          {searchQuery ? 'Search Results' : 'Recent Lists'}
        </h3>
        {isSearchLoading ? (
          <Loader />
        ) : searchQuery ? (
          searchResults && searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults?.map((list: IList) => (
                <ListCard key={list.$id} list={list} />
              ))}
            </div>
          ) : (
            <p>No results found.</p>
          )
        ) : recentLists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentLists?.map((list: IList) => (
              <ListCard key={list.$id} list={list} />
            ))}
          </div>
        ) : (
          <p>No recent lists available.</p>
        )}
      </section>
    </div>
  );
};

export default Explore;
