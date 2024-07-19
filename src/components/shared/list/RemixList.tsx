import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetListById } from '@/lib/react-query/queries';
import ListForm from '@/components/forms/ListForm';
import { Loader } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const RemixList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: originalList, isLoading, isError } = useGetListById(id || '');
  const { user } = useUserContext();
  const navigate = useNavigate();

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !originalList) {
    return <div>Error loading list. Please try again.</div>;
  }

  const initialData = {
    ...originalList,
    title: `${originalList.Title} (Remixed)`,
    items: originalList.items,
    creator: { $id: user.id, Name: user.Name, ImageUrl: user.ImageUrl },
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
    <div className="flex flex-col items-center w-full">
      <h1 className="h3-bold md:h2-bold w-full">Remix List</h1>
      <p className="text-light-3 small-medium md:base-regular mt-2 w-full">
        You're creating a new list based on "{originalList.Title}" by {originalList.creator.Name}
      </p>
      <ListForm action="Create" initialData={initialData} />
      <Button 
        type="button" 
        className="shad-button_dark_4 mt-4"
        onClick={() => navigate(-1)}
      >
        Cancel
      </Button>
    </div>
  );
};

export default RemixList;