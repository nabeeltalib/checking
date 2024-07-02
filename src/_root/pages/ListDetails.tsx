import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetListById,
  useGetUserLists,
  useDeleteList,
} from "@/lib/react-query/queries";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/shared";
import GridListList from "@/components/shared/GridListList";
import ListStats from "@/components/shared/ListStats";
import { useToast } from "@/components/ui/use-toast";
import { IListItem } from "@/types";

const ListDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserContext();
  const { toast } = useToast();
  const [showAllItems, setShowAllItems] = useState(false);

  const { data: list, isLoading } = useGetListById(id);
  const { data: userLists, isLoading: isUserListsLoading } = useGetUserLists(
    list?.creator.$id
  );
  const { mutateAsync: deleteList, isLoading: isDeleting } = useDeleteList();

  const relatedLists = useMemo(() => 
    userLists?.documents.filter((userList) => userList.$id !== id) || [],
    [userLists, id]
  );

  const visibleItems = useMemo(() => {
    if (!list) return [];
    return showAllItems 
      ? list.items
      : list.items.filter((item: IListItem) => item.isVisible).slice(0, 5);
  }, [list, showAllItems]);

  const handleDeleteList = async () => {
    if (!id) return;
    try {
      await deleteList(id);
      toast({
        title: "List deleted successfully!",
        description: "Your list has been deleted and removed from the index.",
        variant: "success",
      });
      navigate(-1);
    } catch (error) {
      toast({
        title: "Error deleting list",
        description: "An error occurred while deleting the list. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <Loader />;
  if (!list) return <div>List not found</div>;

  return (
    <div className="flex flex-col gap-6 w-full p-6 common-container">
      <button onClick={() => navigate(-1)} className="text-primary-500 mb-4">
        &larr; Back
      </button>

      <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
        <div className="flex flex-col gap-6 w-full">
          <div className="flex items-center gap-3">
            <img
              src={list.creator.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="creator"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="base-medium text-light-1">{list.creator.name}</p>
              <p className="small-regular text-light-3">@{list.creator.username}</p>
            </div>
          </div>

          <div className="flex flex-col flex-1 w-full small-medium lg:base-regular gap-y-4">
            <h2 className="body-bold lg:h2-bold">{list.title}</h2>
            <p>{list.description}</p>
            <ul className="list-items">
              {visibleItems.map((item: IListItem, index: number) => (
                <li key={index} className="list-item my-3">
                  {item.content}
                </li>
              ))}
            </ul>
            {list.items.length > 5 && (
              <Button onClick={() => setShowAllItems(!showAllItems)}>
                {showAllItems ? "Show Less" : "Show More"}
              </Button>
            )}
            <ul className="flex gap-1 mt-2 text-light-3 flex-wrap">
              {list.tags.map((tag: string, index: number) => (
                <li
                  key={`${tag}${index}`}
                  className="text-light-3 small-regular">
                  #{tag}
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full">
            <ListStats list={list} userId={user.id} />

            {list.creator.$id === user.id && (
              <div className="flex gap-4 mt-6">
                <Button
                  onClick={handleDeleteList}
                  className="shad-button_primary whitespace-nowrap"
                  disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete List"}
                </Button>
                <Button
                  onClick={() => navigate(`/update-list/${list.$id}`)}
                  className="shad-button_dark_4">
                  Edit List
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full">
        <hr className="border w-full border-dark-4/80" />
        <h3 className="body-bold md:h3-bold w-full my-10">More Related Lists</h3>
        {isUserListsLoading ? (
          <Loader />
        ) : (
          <GridListList lists={relatedLists} />
        )}
      </div>

      <div className="w-full">
        <hr className="border w-full border-dark-4/80" />
        <h3 className="body-bold md:h3-bold w-full my-10">Comments</h3>
        {/* TODO: Add comments component */}
      </div>

      <div className="w-full">
        <hr className="border w-full border-dark-4/80" />
        <h3 className="body-bold md:h3-bold w-full my-10">Suggestions</h3>
        {/* TODO: Add suggestions component */}
      </div>

      <div className="w-full">
        <hr className="border w-full border-dark-4/80" />
        <h3 className="body-bold md:h3-bold w-full my-10">Collaborations</h3>
        {/* TODO: Add collaborations component */}
      </div>
    </div>
  );
};

export default ListDetails;