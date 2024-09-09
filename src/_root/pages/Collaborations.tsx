import React, { useEffect, useState } from "react";
import { useGetCollaborations, useUpdateCollaboration } from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";
import { Loader } from "@/components/shared";
import { motion, AnimatePresence } from "framer-motion";
import { Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Collaborations: React.FC = () => {
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

  const handleAcceptCollaboration = (collaborationId: string) => {
    updateCollaboration({ collaborationId, status: "accepted" });
  };

  const handleDeclineCollaboration = (collaborationId: string) => {
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900"
    >
      <header className="bg-white dark:bg-gray-800 shadow-md p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
            <Users className="mr-2" size={32} />
            Collaborations
          </h1>
        </div>
      </header>

      <main className="flex-grow p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
              <AlertCircle className="mr-2" size={24} />
              What are Collaborations?
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Collaborations allow you to work together with other users on lists. Here, you can view and manage collaboration invitations you've received. Accept invitations to join exciting projects or decline those that don't interest you.
            </p>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Collaboration Invitations</h2>

            <AnimatePresence>
              {collaboration?.length > 0 ? (
                <motion.ul className="space-y-4">
                  {collaboration.map((collab: any, index: number) => (
                    <motion.li 
                      key={collab.$id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-md"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white">{collab.listId}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Sent by: {collab.userId}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {collab.status === "pending" && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition flex items-center"
                                onClick={() => handleAcceptCollaboration(collab.$id)}
                              >
                                <CheckCircle size={16} className="mr-2" />
                                Accept
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition flex items-center"
                                onClick={() => handleDeclineCollaboration(collab.$id)}
                              >
                                <XCircle size={16} className="mr-2" />
                                Decline
                              </motion.button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              ) : (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-500 dark:text-gray-400 text-center py-8"
                >
                  No collaboration invitations at the moment.
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      <footer className="p-4 bg-white dark:bg-gray-800 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © 2024 Topfived. All rights reserved.
        </p>
      </footer>
    </motion.div>
  );
};

export default Collaborations;