import React, { useEffect, useState } from 'react';
import { getPublicLists } from '@/lib/appwrite/api';
import ListCard from '@/components/shared/ListCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PreviewMode: React.FC = () => {
  const [publicLists, setPublicLists] = useState<any>([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const publicData = await getPublicLists();

      setPublicLists(publicData);
      setIsLoading(false)
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-8 p-4">
      <h2 className="h3-bold md:h2-bold">Explore Public Lists</h2>
      <div className="flex flex-col gap-4">
        {isLoading ? <img src="/public/assets/images/mobile.png" className='ml-28' width={400} alt="" /> : publicLists.map((list : any, index:number) => (
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