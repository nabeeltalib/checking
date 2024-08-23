import { useEffect, useState } from "react";
import { useGetCollaborations, useUpdateCollaboration } from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";
import { Loader } from "@/components/shared";

const Collaborations = () => {
  const { user } = useUserContext();
  const listId = user?.curatedList?.[0]?.$id || "";

  const [collaboration, setCollaboration] = useState<any>([]);
  const { data: collaborations, isLoading } = useGetCollaborations(listId);
  const { mutate: updateCollaboration } = useUpdateCollaboration();

  useEffect(() => {
    if (collaborations) {
      setCollaboration(collaborations);
    }
  }, [collaborations]);

  const handleAcceptCollaboration = (collaborationId: any) => {
    updateCollaboration({ collaborationId, status: "accepted" });
  };

  const handleDeclineCollaboration = (collaborationId: any) => {
    updateCollaboration({ collaborationId, status: "rejected" });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-800 shadow-md">
        <div className="flex items-center space-x-4">
          <img src="https://placehold.co/50x50" alt="Logo" className="w-12 h-12" />
          <input
            type="text"
            placeholder="Search"
            className="p-2 border rounded-lg bg-zinc-100 dark:bg-zinc-700 dark:text-white"
          />
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
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Collaborations</h2>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-white">
                Collaboration Invitations
              </h3>
              {collaboration?.length > 0 ? (
                <ul className="space-y-4">
                  {collaboration.map((collaboration: any, index: number) => (
                    <li key={index} className="bg-zinc-50 dark:bg-zinc-700 p-4 rounded-lg shadow-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white">{collaboration.listId}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Sent by: {collaboration.userId}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {collaboration.status === "pending" && (
                            <>
                              <button
                                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
                                onClick={() => handleAcceptCollaboration(collaboration.$id)}
                              >
                                Accept
                              </button>
                              <button
                                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
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

      <footer className="p-4 bg-zinc-100 dark:bg-zinc-800 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © 2024 Topfived. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Collaborations;
