import React, { useEffect, useState } from 'react';
import { getPublicLists, getPopularLists } from '@/lib/appwrite/api';
import ListCard from '@/components/shared/ListCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PreviewMode: React.FC = () => {
  const [publicLists, setPublicLists] = useState<any>([]);
  const [popularLists, setPopularLists] = useState<any>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const publicData = await getPublicLists();
      const popularData = await getPopularLists();

      console.log("sharjeel ----> ", publicData)
      console.log("sharjeel ----> ", popularData)
      setPublicLists(publicData);
      setPopularLists(popularData);
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-8 p-4">
      <h2 className="h3-bold md:h2-bold">Explore Public Lists</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {publicLists.map((list : any) => (
          <ListCard key={list.$id} list={list} />
        ))}
      </div>
      <h2 className="h3-bold md:h2-bold">Popular Lists</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {popularLists.map((list :any) => (
          <ListCard key={list.$id} list={list} />
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