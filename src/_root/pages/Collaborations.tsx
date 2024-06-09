import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetCollaborations, useUpdateCollaboration } from '@/lib/react-query/queries';

const Collaborations = () => {
  const { id: listId } = useParams();
  const { data: collaborations, isLoading } = useGetCollaborations(listId);
  const { mutate: updateCollaboration } = useUpdateCollaboration();

  const handleAcceptCollaboration = (collaborationId) => {
    updateCollaboration({ collaborationId, status: 'accepted' });
  };

  const handleDeclineCollaboration = (collaborationId) => {
    updateCollaboration({ collaborationId, status: 'rejected' });
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
            <h2 className="text-xl font-bold mb-4 dark:text-white">Collaborations</h2>
            {/* Collaboration Invitations */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Collaboration Invitations</h3>
              {collaborations?.documents.length > 0 ? (
                <ul>
                  {collaborations.documents.map((collaboration) => (
                    <li key={collaboration.$id} className="mb-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold dark:text-white">{collaboration.listId}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Sent by: {collaboration.userId}
                          </p>
                        </div>
                        <div>
                          {collaboration.status === 'pending' && (
                            <>
                              <button
                                className="px-2 py-1 text-white bg-green-600 rounded-lg mr-2"
                                onClick={() => handleAcceptCollaboration(collaboration.$id)}
                              >
                                Accept
                              </button>
                              <button
                                className="px-2 py-1 text-white bg-red-600 rounded-lg"
                                onClick={() => handleDeclineCollaboration(collaboration.$id)}
                              >
                                Decline
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No collaboration invitations</p>
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

export default Collaborations;