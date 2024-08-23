import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateList } from '@/lib/react-query/queries';
import { useToast } from '@/components/ui/use-toast';
import ListForm from '@/components/forms/ListForm';
import { IList, IListItem } from '@/types';
import { Loader } from '@/components/shared';
import { useGenerateListIdea } from '@/lib/react-query/queries';
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
    <div className="flex flex-1 items-center justify-center py-10 px-6 min-h-screen bg-zinc-900">
      <div className="max-w-4xl w-full bg-zinc-800 rounded-xl p-8 shadow-lg">
        <div className="flex items-center gap-4 mb-8">
          
          <h2 className="font-extralight text-2xl text-left w-full mt-8" style={{ fontFamily: "'Permanent Marker', cursive" }}>
          What's in your top 3, 4, 5... for anything!
        </h2>
        </div>

        {listIdea && (
          <div className="mb-4 p-4 bg-zinc-700 rounded-lg shadow-md">
            <p className="text-light-1">{listIdea}</p>
          </div>
        )}

        <div className="flex justify-end mb-4">
          <button
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            onClick={handleGenerateIdea}
            disabled={isGeneratingIdea}
          >
            {isGeneratingIdea ? 'Generating Idea...' : 'Generate List Idea'}
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
