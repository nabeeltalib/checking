import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetSuggestions, useUpdateSuggestion } from '@/lib/react-query/queries';
import { Loader } from '@/components/shared';

const Suggestions: React.FC = () => {
  const { id: listId } = useParams<{ id: string }>();
  const { data: suggestions, isLoading, error } = useGetSuggestions(listId || '');
  const { mutate: updateSuggestion } = useUpdateSuggestion();

  const handleAcceptSuggestion = (suggestionId: string) => {
    updateSuggestion({ suggestionId, status: 'accepted' });
  };

  const handleRejectSuggestion = (suggestionId: string) => {
    updateSuggestion({ suggestionId, status: 'rejected' });
  };

  if (!listId) {
    return <div className="text-red-500">Error: List ID is missing</div>;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-red-500">Error: {(error as Error).message}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen p-4 bg-dark-1">
      <header className="flex items-center justify-between p-4 bg-dark-2">
        <h1 className="text-2xl font-bold text-light-1">Suggestions</h1>
      </header>

      <main className="flex-grow p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-dark-2 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-light-1">Received Suggestions</h2>
            {suggestions?.documents.length ? (
              <ul className="space-y-4">
                {suggestions.documents.map((suggestion) => (
                  <li key={suggestion.$id} className="bg-dark-3 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-light-1">{suggestion.suggestedTitle}</p>
                        <p className="text-sm text-light-2">{suggestion.suggestedDescription}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-light-3">
                          Status: {suggestion.status}
                        </span>
                        {suggestion.status === 'pending' && (
                          <>
                            <button
                              className="px-2 py-1 text-light-1 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                              onClick={() => handleAcceptSuggestion(suggestion.$id)}
                            >
                              Accept
                            </button>
                            <button
                              className="px-2 py-1 text-light-1 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
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
              <p className="text-light-2">No received suggestions</p>
            )}
          </div>
        </div>
      </main>

      <footer className="p-4 bg-dark-2 text-light-2 text-center">
        © 2024 Topfived. All rights reserved.
      </footer>
    </div>
  );
};

export default Suggestions;