import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAISuggestions } from '@/lib/react-query/queries';
import { ListCard, Loader } from '@/components/shared';
import { getTrendingTags, getPopularCategories, getRecentLists } from '@/lib/appwrite/api';
import { useUserContext } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import ListCard2 from '@/components/shared/ListCard2';

const Explore: React.FC = () => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const [trendingTags, setTrendingTags] = useState<any[]>([]);
  const [popularCategories, setPopularCategories] = useState<any[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentListsData, setRecentListsData] = useState<any>([])
  

  const {
    data: aiSuggestions,
    isLoading: isLoadingAISuggestions,
    error: aiSuggestionsError
  } = useGetAISuggestions(user.id);

  useEffect(()=>{
    const fetchData = async ()=>{
      let data = await getRecentLists();
    setRecentListsData(data)
    }

    fetchData();
  },[])

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
    if (aiSuggestionsError) {
      toast({
        title: 'Error fetching AI suggestions',
        description: 'Please try again later',
        variant: 'destructive'
      });
    }
  }, [aiSuggestionsError, toast]);

  if (isLoadingAISuggestions) {
    return <Loader />;
  }

  if (error || aiSuggestionsError) {
    return (
      <div className="text-red">
        {error || (aiSuggestionsError as Error)?.message}
      </div>
    );
  }

  return (
    <div className="explore-container common-container w-full">
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-light-1 mb-4">
          AI Suggested Lists
        </h3>
        {isLoadingAISuggestions ? (
          <Loader />
        ) : aiSuggestions && aiSuggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiSuggestions.map((suggestion, index) => (
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
          {isCategoriesLoading ? (
            <Loader />
          ) : popularCategories.length > 0 ? (
            popularCategories.map((category, i) => (
              <Link
                key={i}
                to={`/categories/${category.name}`}
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
            trendingTags.map((tag, i) => (
              <Link
                key={i}
                to={`/categories/${tag}`}
                className="bg-dark-3 text-light-2 px-3 py-1 rounded-full hover:bg-primary-500 hover:text-light-1 transition-colors">
                #{tag}
              </Link>
            ))
          ) : (
            <p>No trending tags found.</p>
          )}
        </div>
      </section>

      <section className='w-full'>
        <h3 className="text-xl font-semibold text-light-1 mb-4">Recent Lists</h3>
        {recentListsData?.length > 0 ? (
          <div className="flex flex-col gap-4">
            {recentListsData?.map((list: any) => (
               user.id ? (
                <ListCard2 key={list.$id} list={list} />
              ) : (
                <ListCard key={list.$id} list={list} />
              )
            ))}
          </div>
        ) : (
          <Loader />
        )}
      </section>
    </div>
  );
};

export default Explore;