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
    <div className="flex flex-1 items-center justify-center py-10 px-6 min-h-screen bg-zinc-900">
      <div className="max-w-4xl w-full bg-zinc-800 rounded-xl p-8 shadow-lg space-y-6">
        <div>
          <h2 className="font-extralight text-2xl text-left w-full mt-1" style={{ fontFamily: "'Permanent Marker', cursive" }}>
            Create your own top list! What's your ranking for...anything!
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Rank your favorites, share your opinions, or create fun lists on any topic.
          </p>
        </div>

        {listIdea && (
          <div className="mt-5 p-4 bg-zinc-700 rounded-lg shadow-md">
            <p className="text-light-1">{listIdea}</p>
          </div>
        )}

        <div className="text-right space-y-2">
          <p className="text-base text-blue-300">Need inspiration?</p>
          <button
            className="bg-primary-500 text-sm text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
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
