import React, { useMemo } from 'react';
import { Loader } from "@/components/shared";
import { useGetCurrentUser } from "@/lib/react-query/queries";
import ListCard2 from "@/components/shared/ListCard2";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, AlertCircle, Frown } from 'lucide-react';

const Saved: React.FC = () => {
  const { data: currentUser, isLoading, error } = useGetCurrentUser();

  // Filter out any saved lists that are null or no longer exist
  const savedLists = useMemo(
    () => currentUser?.save?.filter((savedItem: any) => savedItem?.list && savedItem.list.$id) || [],
    [currentUser?.save]
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 100
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-screen text-light-4"
      >
        <AlertCircle size={48} className="mb-4" />
        <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
        <p>{error.message || 'An error occurred. Please try again later.'}</p>
      </motion.div>
    );
  }

  if (!currentUser) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-screen text-light-4"
      >
        <Frown size={48} className="mb-4" />
        <h2 className="text-2xl font-bold">User not found</h2>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="saved-container min-h-screen p-6 md:p-10"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="flex gap-4 items-center w-full max-w-5xl mx-auto p-6 bg-dark-3 rounded-lg mb-8 shadow-lg"
        variants={itemVariants}
      >
        <Bookmark size={36} className="text-primary-500" />
        <h2 className="text-3xl md:text-4xl font-bold text-light-1">Your Bookmarked Rankings</h2>
      </motion.div>
      
      <motion.div className="w-full max-w-5xl mx-auto" variants={itemVariants}>
        <AnimatePresence>
          {savedLists.length === 0 ? (
            <motion.div 
              className="flex flex-col items-center justify-center p-10 bg-dark-3 rounded-lg shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Bookmark size={64} className="text-light-4 mb-4" />
              <p className="text-light-4 text-xl mb-4">No saved rankings yet</p>
              <p className="text-light-4 text-center max-w-md">
                Start exploring and save lists that interest you. They'll appear here for easy access.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={containerVariants}
            >
              {savedLists.map((savedItem: any) => (
                <motion.div
                  key={savedItem.list.$id}  // Moved the comment above the key prop
                  variants={itemVariants}
                  className="bg-dark-2 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                  whileHover={{ y: -5 }}  // Properly placed whileHover prop
                >
                  <ListCard2 list={savedItem.list} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Saved;
