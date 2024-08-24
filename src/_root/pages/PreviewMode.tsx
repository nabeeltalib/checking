import React, { useEffect, useState } from 'react';
import { getPublicLists } from '@/lib/appwrite/api';
import ListCard from '@/components/shared/ListCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PreviewMode: React.FC = () => {
  const [publicLists, setPublicLists] = useState<any>([]);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const publicData = await getPublicLists();
        setPublicLists(publicData);
        // After data is fetched, wait for a moment to allow the component to fully render
        setIsContentLoaded(true);
      } catch (error) {
        console.error('Failed to fetch public lists:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isContentLoaded) {
      // Hide the main loader once content is fully loaded
      const loader = document.getElementById('loader');
      if (loader) {
        loader.style.display = 'none';
      }
    }
  }, [isContentLoaded]);

  if (!isContentLoaded) {
    // While loading, display the loader and "Loading World" text
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <div className="text-center">
          <img src="/assets/images/mobile.png" width={200} alt="Loading..." className="mx-auto mb-4" />
          <h1 className="text-2xl flashing">Loading Organized Opinions...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-4">
      <div className="text-2xl md:text-3xl text-gray-300 text-center font-base" style={{ fontFamily: "'Permanent Marker', cursive" }}>
      Discover Top Lists From Your World                
      </div>
      <h1 className="h3-light md:h2-light text-center w-full">Explore Rankings on Anything and Everything</h1>

      <div className="flex flex-col gap-4">
        {publicLists.map((list: any, index: number) => (
          <ListCard key={index} list={list} />
        ))}
      </div>
      <Button 
        onClick={() => navigate('/sign-in')} 
        className="w-full md:w-auto"
      >
        Sign Up/Sign In to Access More Features
      </Button>
    </div>
  );
};

export default PreviewMode;
