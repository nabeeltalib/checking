import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetSuggestions, useUpdateSuggestion } from '@/lib/react-query/queries';
import { Loader } from '@/components/shared';
import { Button } from '@/components/ui/button';

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
    <div className="flex flex-col min-h-screen p-4 bg-zinc-900 text-white">
      <header className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg mb-6 shadow-lg">
        <h1 className="text-3xl font-bold">Suggestions</h1>
      </header>

      <main className="flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Received Suggestions</h2>
            {suggestions?.documents.length ? (
              <ul className="space-y-6">
                {suggestions.documents.map((suggestion) => (
                  <li key={suggestion.$id} className="bg-zinc-700 p-5 rounded-lg shadow-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-semibold">{suggestion.suggestedTitle}</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {suggestion.suggestedDescription}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-400">
                          Status: <span className="font-medium capitalize">{suggestion.status}</span>
                        </span>
                        {suggestion.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleAcceptSuggestion(suggestion.$id)}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectSuggestion(suggestion.$id)}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No received suggestions</p>
            )}
          </div>
        </div>
      </main>

      <footer className="p-4 mt-6 bg-zinc-800 text-gray-400 text-center rounded-lg shadow-lg">
        © 2024 Topfived. All rights reserved.
      </footer>
    </div>
  );
};

export default Suggestions;
