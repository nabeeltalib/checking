import React, { useEffect, useState } from 'react';
import { useUserContext } from "@/context/AuthContext";
import { useGenerateListIdea } from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";
import { getPopularLists } from '@/lib/appwrite/api';
import ListCard2 from '@/components/shared/ListCard2';

const Home: React.FC = () => {
  const { user } = useUserContext();
  const [lists, setLists] = useState<any>([])

  useEffect(()=>{
    const fetchData = async ()=>{
     const list = await getPopularLists();
     setLists(list)
    }

    fetchData()
 },[])

  const { mutate: generateListIdea, isLoading: isGeneratingIdea } = useGenerateListIdea(user?.id || "");
  const [listIdea, setListIdea] = useState<string | null>(null);

  const handleGenerateIdea = () => {
    setListIdea(null); 
    generateListIdea("Generate a random list idea", {
      onSuccess: (idea) => setListIdea(idea),
    });
  };
  

  return (
    <div className="flex flex-col gap-4 p-4 w-full items-center common-container">
      <div className="flex items-center gap-4 mb-4">
        <p>Welcome, {user.name || "Guest"}</p>
        {user && (
          <div className="text-sm text-light-3">
            <span>{user.followersCount || 0} followers</span>
            <span className="mx-2">•</span>
            <span>{user.followingCount || 0} following</span>
          </div>
        )}
      </div>
      <div className="w-full max-w-5xl">
        <h2 className="h3-bold md:h2-bold text-left w-full mt-8">Need Inspiration?</h2>
        <button
          onClick={handleGenerateIdea}
          className="bg-primary-500 text-light-1 px-4 py-2 rounded-md mt-2"
          disabled={isGeneratingIdea}
        >
          {isGeneratingIdea ? "Generating..." : "Generate List Idea"}
        </button>
        {isGeneratingIdea ? (
          <div className="mt-4 p-4 bg-dark-3 rounded-lg">
            <Loader />
          </div>
        ) : listIdea && (
          <div className="mt-4 p-4 bg-dark-3 rounded-lg">
            <p className="text-light-1">{listIdea}</p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 max-w-5xl w-full">
      <h1 className="h3-bold md:h2-bold text-left w-full">Trending Lists</h1>
        {lists && lists.length > 0 ? (
          lists.map((list: any) => (
            <ListCard2 key={list.$id} list={list} />
          ))
        ) : (
          <p className="text-light-2">No recent lists available.</p>
        )}
      </div>
    </div>
  );
};

export default Home;