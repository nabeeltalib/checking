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
  const { mutateAsync: createList, isLoading } = useCreateList();
  const { mutate: generateListIdea, isLoading: isGeneratingIdea } =
    useGenerateListIdea(user.id);
  const [listIdea, setListIdea] = useState<string | null>(null);

  const handleCreateList = async (listData: IList) => {
    try {
      console.log({ listData });
      // Ensure listData.items is an array of IListItem
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

      // Index the new list in Typesense
      await indexList(newList);

      toast({
        title: 'List created successfully!',
        description: 'Your new list has been created and indexed.',
        variant: 'success'
      });

      navigate(`/lists/${newList.$id}`);
    } catch (error) {
      console.error('Error creating list:', error);
      toast({
        title: 'Error creating list',
        description:
          'An error occurred while creating the list. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleGenerateIdea = () => {
    generateListIdea('Generate a list idea', {
      onSuccess: idea => setListIdea(idea)
    });
  };

  if (isLoading) return <Loader />;

  return (
    <div className="flex flex-1 items-center justify-center py-10 px-6 min-h-screen bg-dark-1">
      <div className="max-w-5xl w-full bg-dark-2 rounded-xl p-8 shadow-md">
        <div className="flex items-center gap-3 mb-8">
          <img
            src="/assets/icons/add-list.svg"
            width={36}
            height={36}
            alt="Add List"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-light-1">Create New List</h2>
        </div>

        <button
          onClick={handleGenerateIdea}
          className="bg-primary-500 text-light-1 px-4 py-2 rounded-md mb-4"
          disabled={isGeneratingIdea}>
          {isGeneratingIdea ? 'Generating...' : 'Get AI Suggestion'}
        </button>

        {listIdea && (
          <div className="mb-4 p-4 bg-dark-3 rounded-lg">
            <p className="text-light-1">{listIdea}</p>
          </div>
        )}

        <ListForm
          onSubmit={handleCreateList}
          isLoading={isLoading}
          action="Create"
          initialIdea={listIdea}
        />
      </div>
    </div>
  );
};

export default CreateList;
