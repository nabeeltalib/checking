import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetSuggestions, useUpdateSuggestion } from '@/lib/react-query/queries';

const Suggestions = () => {
  const { id: listId } = useParams();
  const { data: suggestions, isLoading } = useGetSuggestions(listId);
  const { mutate: updateSuggestion } = useUpdateSuggestion();

  const handleAcceptSuggestion = (suggestionId) => {
    updateSuggestion({ suggestionId, status: 'accepted' });
  };

  const handleRejectSuggestion = (suggestionId) => {
    updateSuggestion({ suggestionId, status: 'rejected' });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen p-4 bg-white dark:bg-zinc-900">
      <header className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-800">
        <div className="flex items-center space-x-4">
          <img src="https://placehold.co/50x50" alt="Logo" className="w-12 h-12" />
          <input type="text" placeholder="Search" className="p-2 border rounded-lg dark:bg-zinc-700 dark:text-white" />
        </div>
        <div className="flex items-center space-x-4">
          <img src="https://placehold.co/40x40" alt="User Profile" className="w-10 h-10 rounded-full" />
          <button className="relative">
            <img src="https://placehold.co/24x24" alt="Notifications" />
            <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
          </button>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Suggestions</h2>
            {/* Received Suggestions */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Received Suggestions</h3>
              {suggestions?.documents.length > 0 ? (
                <ul>
                  {suggestions.documents.map((suggestion) => (
                    <li key={suggestion.$id} className="mb-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold dark:text-white">{suggestion.suggestedTitle}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {suggestion.suggestedDescription}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                            Status: {suggestion.status}
                          </span>
                          {suggestion.status === 'pending' && (
                            <>
                              <button
                                className="px-2 py-1 text-white bg-green-600 rounded-lg mr-2"
                                onClick={() => handleAcceptSuggestion(suggestion.$id)}
                              >
                                Accept
                              </button>
                              <button
                                className="px-2 py-1 text-white bg-red-600 rounded-lg"
                                onClick={() => handleRejectSuggestion(suggestion.$id)}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No received suggestions</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 bg-zinc-100 dark:bg-zinc-800">
        {/* Add footer content */}
      </footer>
    </div>
  );
};

export default Suggestions;