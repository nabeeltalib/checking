import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateList, useGenerateListIdea } from '@/lib/react-query/queries';
import { useToast } from '@/components/ui/use-toast';
import ListForm from '@/components/forms/ListForm';
import { IList, IListItem } from '@/types';
import { Loader } from '@/components/shared';
import { indexList } from '@/lib/appwrite/api';
import { useUserContext } from '@/context/AuthContext';

const CreateList: React.FC = () => {
  const { toast } = useToast();
  const { user } = useUserContext();
  const navigate = useNavigate();
  
  const { mutateAsync: createList, isLoading } = useCreateList(user.id);
  const { mutate: generateListIdea, isLoading: isGeneratingIdea } = useGenerateListIdea(user.id);
  const [listIdea, setListIdea] = useState<string | null>(null);

  const handleCreateList = async (listData: IList) => {
    try {
      const transformedListData = {
        ...listData,
        items: listData.items.map((item: string | IListItem) => {
          if (typeof item === 'string') {
            return { content: item, isVisible: true };
          }
          return item;
        })
      };

      const newList = await createList(transformedListData);

      await indexList(newList);

      toast({
        title: 'List created successfully!',
        description: 'Your new list has been created and indexed.',
        variant: 'success',
      });

      navigate(`/lists/${newList.$id}`);
    } catch (error) {
      console.error('Error creating list:', error);
      toast({
        title: 'Error creating list',
        description: 'An error occurred while creating the list. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateIdea = () => {
    generateListIdea('Generate a list idea', {
      onSuccess: (idea) => setListIdea(idea),
    });
  };

  if (isLoading) return <Loader />;

  return (
    <div className="flex flex-1 items-center justify-center py-10 px-2 min-h-screen bg-black">
      <div className="max-w-4x2 w-full bg-dark-1 rounded-xl p-4 shadow-lg space-y-6">
        <div>
          <h2 className="text-orange-300 font-extralight text-3xl text-left w-full mt-1" style={{ fontFamily: "'Permanent Marker', cursive" }}>
            Create your ranking, for anything!
          </h2>
          <p className="text-base mt-2">
            Your opinion could be the best or most trusted, on any topic.
          </p>
        </div>

        {listIdea && (
          <div className="mt-5 p-4 bg-zinc-700 rounded-lg shadow-md">
            <p className="text-light-1">{listIdea}</p>
          </div>
        )}
          
        <div className="text-right space-y-2">
          <p className="italic text-base text-blue-300">Need inspiration?</p>
          <button
            className="bg-primary-500 text-xs text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            onClick={handleGenerateIdea}
            disabled={isGeneratingIdea}
          >
            {isGeneratingIdea ? 'Generating Idea...' : 'Generate Title Ideas'}
          </button>
        </div>

        <ListForm
          ontSubmit={handleCreateList}
          action="Create"
          initialIdea={listIdea}
        />
      </div>
    </div>
  );
};

export default CreateList;
