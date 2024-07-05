import React, { useState } from 'react';
import { useUserContext } from "@/context/AuthContext";
import { useListContext } from "@/context/ListContext";
import { useGenerateListIdea } from "@/lib/react-query/queries";
import { Loader, ListCard } from "@/components/shared";
import { IList } from "@/types";

const Home: React.FC = () => {
  const { user } = useUserContext();
  const { lists, isLoading, error } = useListContext(); // Add error handling
  const { mutate: generateListIdea, isLoading: isGeneratingIdea } = useGenerateListIdea(user.id);
  const [listIdea, setListIdea] = useState<string | null>(null);

  const handleGenerateIdea = () => {
    generateListIdea("Generate a random list idea", {
      onSuccess: (idea) => setListIdea(idea),
    });
  };

  if (isLoading) return <Loader />;
  if (error) return <div>Error loading lists: {error.message}</div>;

  return (
    <div className="flex flex-col gap-4 p-4 w-full items-center common-container">
      <h1 className="h3-bold md:h2-bold text-left w-full">Recent Lists</h1>
      <p>Welcome, {user.name}</p>
      <div className="w-full max-w-5xl">
        <h2 className="h3-bold md:h2-bold text-left w-full mt-8">Need Inspiration?</h2>
        <button
          onClick={handleGenerateIdea}
          className="bg-primary-500 text-light-1 px-4 py-2 rounded-md mt-2"
          disabled={isGeneratingIdea}
        >
          {isGeneratingIdea ? "Generating..." : "Generate List Idea"}
        </button>
        {listIdea && (
          <div className="mt-4 p-4 bg-dark-3 rounded-lg">
            <p className="text-light-1">{listIdea}</p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 max-w-5xl w-full">
        {lists && lists.length > 0 ? (
          lists.map((list: IList) => (
            <ListCard key={list.$id} list={list} />
          ))
        ) : (
          <p>No recent lists available.</p>
        )}
      </div>
    </div>
  );
};

export default Home;