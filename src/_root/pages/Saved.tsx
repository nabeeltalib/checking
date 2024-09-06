import React, { useMemo } from 'react';
import { Loader } from "@/components/shared";
import { useGetCurrentUser } from "@/lib/react-query/queries";
import ListCard2 from "@/components/shared/ListCard2";
import { motion } from "framer-motion";

const Saved: React.FC = () => {
  const { data: currentUser, isLoading, error } = useGetCurrentUser();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-light-4 text-center">Error: {error.message || 'An error occurred. Please try again later.'}</div>;
  }

  if (!currentUser) {
    return <div className="text-light-4 text-center">User not found</div>;
  }

  const savedLists = useMemo(
    () => currentUser?.save?.map((savedItem: any) => savedItem?.list || {}) || [],
    [currentUser?.save]
  );

  return (
    <div className="saved-container common-container flex flex-col items-center">
      <div className="flex gap-4 items-center w-full max-w-5xl p-4 bg-dark-3 rounded-lg mb-6">
        <img
          src="/assets/icons/save.svg"
          width={36}
          height={36}
          alt="Saved lists"
          className="invert"
        />
        <h2 className="h3-bold md:h2-bold text-left text-light-1">Your Bookmarked Lists</h2>
      </div>
      
      <div className="w-full max-w-5xl">
        {savedLists.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 bg-dark-3 rounded-lg">
            <p className="text-light-4 text-lg mb-4">No saved lists</p>
            <img
              src="/assets/icons/empty.svg"
              alt="No saved lists"
              className="w-24 h-24"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {savedLists.map((list: any, index) => (
              <motion.div
                key={`${list.$id}-${index}`} // Combine $id and index to ensure uniqueness
                className="shadow-lg rounded-lg overflow-hidden bg-dark-2 hover:shadow-xl transition-shadow duration-300"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <ListCard2 list={list} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;
