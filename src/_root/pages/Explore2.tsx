import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetRecentLists, useGetAISuggestions } from '@/lib/react-query/queries';
import { ListCard, Loader } from '@/components/shared';
import { getTrendingTags, getPopularCategories } from '@/lib/appwrite/api';
import { useUserContext } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import ListCard2 from '@/components/shared/ListCard2';
import { Button } from '@/components/ui';

const Explore2: React.FC = () => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  const [popularCategories, setPopularCategories] = useState<string[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSignUpDialogOpen, setIsSignUpDialogOpen] = useState(false);

  const {
    data: recentListsData,
    isLoading: isLoadingRecentLists,
    error: recentListsError,
  } = useGetRecentLists();

  const {
    data: aiSuggestions,
    isLoading: isLoadingAISuggestions,
    error: aiSuggestionsError,
  } = useGetAISuggestions(user?.id || ""); // Ensure user.id is available

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tags, categories] = await Promise.all([getTrendingTags(), getPopularCategories()]);
        setTrendingTags(tags);
        setPopularCategories(categories);
      } catch (error) {
        console.error('Error fetching data:', error);
        setFetchError('Failed to fetch data. Please try again later.');
      } finally {
        setIsTagsLoading(false);
        setIsCategoriesLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (recentListsError || aiSuggestionsError) {
      toast({
        title: 'Error',
        description: 'An error occurred while fetching data. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [recentListsError, aiSuggestionsError, toast]);

  const handleProtectedClick = (e: React.MouseEvent) => {
    if (!user?.isAuthenticated) {  // Check if the user is authenticated
      e.preventDefault();
      setIsSignUpDialogOpen(true);
    }
  };

  const closeSignUpDialog = () => {
    setIsSignUpDialogOpen(false);
  };

  const renderedLists = useMemo(() => {
    if (recentListsData?.length > 0) {
      return recentListsData.map((list: any) =>
        user?.id ? (
          <ListCard2 key={list.$id} list={list} onUsernameClick={handleProtectedClick} onTitleClick={handleProtectedClick} />
        ) : (
          <ListCard key={list.$id} list={list} />
        )
      );
    } else {
      return <p>No recent lists available.</p>;
    }
  }, [recentListsData, user?.id]);

  if (isLoadingRecentLists || isLoadingAISuggestions || isTagsLoading || isCategoriesLoading) {
    return <Loader />;
  }

  if (fetchError || recentListsError || aiSuggestionsError) {
    return (
      <div className="text-red-500">
        {fetchError || recentListsError?.message || aiSuggestionsError?.message || 'Something went wrong.'}
      </div>
    );
  }

  return (
    <div className="explore-container common-container w-full">
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-light-1 mb-4">Interesting List Titles</h3>
        {aiSuggestions && aiSuggestions.length > 0 ? (
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
        <h3 className="text-xl font-semibold text-light-1 mb-4">Popular Categories</h3>
        <div className="flex gap-4 flex-wrap">
          {popularCategories.length > 0 ? (
            popularCategories.map((category, i) => (
              <Link
                key={i}
                to={`/categories/${category.name}`}
                className="bg-dark-4 text-light-1 px-3 py-1 rounded-full hover:bg-primary-500 transition-colors"
                onClick={handleProtectedClick}
              >
                {category.name}
              </Link>
            ))
          ) : (
            <p>No categories found.</p>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold text-light-1 mb-4">Trending Tags</h3>
        <div className="flex gap-4 flex-wrap">
          {trendingTags.length > 0 ? (
            trendingTags.map((tag, i) => (
              <Link
                key={i}
                to={`/categories/${tag}`}
                className="bg-dark-3 text-light-2 px-3 py-1 rounded-full hover:bg-primary-500 hover:text-light-1 transition-colors"
                onClick={handleProtectedClick}
              >
                #{tag}
              </Link>
            ))
          ) : (
            <p>No trending tags found.</p>
          )}
        </div>
      </section>

      <section className="w-full">
        <h3 className="text-xl font-semibold text-light-1 mb-4">Recent Lists</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">{renderedLists}</div>
      </section>

      {isSignUpDialogOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 z-50 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="signUpDialogTitle"
          onClick={closeSignUpDialog}  // Close when clicking outside
        >
          <div
            className="relative bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-lg"
            onClick={(e) => e.stopPropagation()}  // Prevent click inside the modal from closing it
          >
            <button
              onClick={closeSignUpDialog}
              className="text-gray-500 hover:text-gray-700 absolute top-4 right-4"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center">
              <h3 id="signUpDialogTitle" className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Unlock Full Access!</h3>
              <p className="text-sm sm:text-sm text-gray-600 mb-6">
                Sign up now to like, comment, save, and remix lists. Create your own rankings and join the community!
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Button
                type="button"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out"
                onClick={() => { closeSignUpDialog(); navigate('/signup'); }}
              >
                Sign Up
              </Button>
              <Button
                className="flex items-center justify-center bg-white text-gray-700 border border-gray-300 px-4 sm:px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out hover:bg-gray-100"
                onClick={() => { closeSignUpDialog(); navigate('/signin'); }}
              >
                <img src="/assets/icons/google.svg" alt="Google" className="mr-2 h-5 w-5" />
                Sign In with Google
              </Button>
              <Button
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
                onClick={() => { closeSignUpDialog(); navigate('/signin'); }}
              >
                Sign In with Email
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore2;
