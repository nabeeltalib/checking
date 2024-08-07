import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetListById, useUpdateList } from '@/lib/react-query/queries';
import { Loader } from '@/components/shared';
import ListForm from '@/components/forms/ListForm';
import { useUserContext } from '@/context/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { IList, IListItem } from "@/types";

const EditList = () => {
  const { id } = useParams();
  const { data: list, isLoading, isError } = useGetListById(id);
  const { user } = useUserContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutateAsync: updateList, isLoading: isUpdating } = useUpdateList();

  // useEffect(() => {
  //   if (list && user && list.creator.$id !== user.id) {
  //     navigate(`/lists/${id}`);
  //   }
  // }, [list, user, id, navigate]);

  const handleUpdateList = async (updatedListData: IList) => {
    if (!id) return;
    try {
      const transformedListData = {
        ...updatedListData,
        items: updatedListData.items.map((item: string | IListItem) => {
          if (typeof item === 'string') {
            return { content: item, isVisible: true };
          }
          return item;
        }),
        listId: id
      };
      await updateList(transformedListData);
      toast({
        title: "List updated successfully!",
        description: "Your list has been updated and re-indexed.",
        variant: "success",
      });
      navigate(`/lists/${id}`);
    } catch (error) {
      toast({
        title: "Error updating list",
        description: "An error occurred while updating the list. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !list) {
    return <div>Error loading list. Please try again later.</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full p-6">
      <div className="flex flex-col gap-6 w-full p-6 mx-auto">
        <div className="flex-start gap-3 justify-start w-full">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit List</h2>
        </div>

        <ListForm action="Update" list={list} onSubmit={handleUpdateList} isLoading={isUpdating} />
      </div>
    </div>
  );
};

export default EditList;