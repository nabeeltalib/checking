import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGetListById } from '@/lib/react-query/queries';
import ListForm from '@/components/forms/ListForm';
import { Loader } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

const RemixList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { data: originalList, isLoading, isError } = useGetListById(id || '', user?.id || '');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (isLoading) {
    return (
      <div className="flex-center w-full h-screen">
        <Loader />
      </div>
    );
  }

  if (isError || !originalList) {
    return (
      <div className="flex-center flex-col w-full h-screen text-light-1">
        <h2 className="h3-bold">Error loading list</h2>
        <p className="text-light-3 mt-2">Please try again later.</p>
        <Button 
          type="button" 
          className="shad-button_dark_4 mt-4"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </div>
    );
  }

  const initialData = {
    ...originalList,
    title: `${originalList.Title} (Remixed by ${user?.Name})`,
    items: originalList.items,
    creator: { $id: user?.id, Name: user?.Name, ImageUrl: user?.ImageUrl },
    likes: [],
    saves: [],
    comments: [],
    CreatedAt: new Date(),
    UpdatedAt: new Date(),
  };

  // Remove properties that shouldn't be copied
  delete initialData.$id;
  delete initialData.$createdAt;
  delete initialData.$updatedAt;

  return (
    <motion.div 
      className="flex flex-col items-center w-full max-w-5xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between w-full mb-8">
        <Button 
          type="button" 
          className="text-primary-500 shad-button_ghost"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </Button>
        <h1 className="text-blue-300 h3-bold md:h2-bold text-center flex-1 mt-6">Rank It Better</h1>
        <div className="w-[70px]"></div> {/* Spacer for alignment */}
      </div>

      <p className="text-sm text-gray-400 text-center mb-6 max-w-2xl">
        You can modify the title, add or remove items, and make this list your own.
        Your remixed version will be a new list, and the original will remain unchanged.
      </p>
      <div className="bg-dark-4 p-3 rounded-lg shadow-lg w-full mb-8">
        <div className="flex items-center mb-4 ">
          <h3 className="text-xl font-light text-slate-400 mb-4 flex items-center">           
            What You Are Remixing        
          </h3>      
        </div>
        <p className="text-yellow-200 text-lg mb-2">"{originalList.Title}"</p>
        <p className="text-gray-400 text-sm">
          Originally created by <span className="font-semibold">{originalList.creator.Name}</span>
        </p>
      </div>

      <ListForm action="Create Remix" initialData={initialData} />

      <div className="flex justify-center mt-8 space-x-4">
        <Button 
          type="button" 
          className="shad-button_dark_4"
          onClick={() => navigate(-1)}
        >
          Cancel Remix
        </Button>
      </div>
    </motion.div>
  );
};

export default RemixList;