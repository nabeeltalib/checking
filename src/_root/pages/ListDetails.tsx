// ... (import statements)
import { useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetListById,
  useGetUserLists,
  useDeleteList,
} from "@/lib/react-query/queries";
import { Button } from "@/components/ui/button";

import { Loader } from "@/components/shared";
import {
  useLikeList,
  useSaveList,
} from "@/lib/react-query/queries";
import GridListList from "@/components/shared/GridListList";
import ListStats from "@/components/shared/ListStats";

const ListDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserContext();

  const { data: list, isLoading } = useGetListById(id);
  const { data: userLists, isLoading: isUserListsLoading } = useGetUserLists(
    list?.creator.$id
  );
  const { mutate: deleteList } = useDeleteList();

  const relatedLists = userLists?.documents.filter(
    (userList) => userList.$id !== id
  );

  const handleDeleteList = () => {
    deleteList(id);
    navigate(-1);
  };
  // console.log(userLists?.documents[0]);

  return (
    <div className="flex flex-col gap-6 w-full p-6 ">
      {/* ... (back button) */}

      {isLoading || !list ? (
        <Loader />
      ) : (
        <div className="flex flex-col md:mx-auto gap-y-6">
          <div className="flex flex-col gap-6 w-full">
            {/* ... (list creator info) */}

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular gap-y-4">
              <h2 className="body-bold lg:h2-bold">{list?.title}</h2>
              <p>{list?.description}</p>
              <ul className="list-items">
                {list?.items.map((item: any, index: number) => (
                  <li key={index} className="list-item my-3">
                    {item}
                  </li>
                ))}
              </ul>
              <ul className="flex gap-1 mt-2 text-light-3 flex-wrap">
                {list?.tags.map((tag: string, index: string) => (
                  <li
                    key={`${tag}${index}`}
                    className="text-light-3 small-regular">
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full">
              {/* ... (list stats) */}

              {list.creator.$id == user.id && (
                <div className="flex gap-4 mt-6">
                  <Button
                    onClick={handleDeleteList}
                    className="shad-button_primary whitespace-nowrap">
                    Delete List
                  </Button>
                  <Button
                    onClick={() => navigate(`/update-list/${list.$id}`)}
                    className="shad-button_dark_4">
                    Edit List
                  </Button>
                </div>
              ) }

                
            </div>
            <ListStats list={list} userId={user.id} />
          </div>

        </div>
      )}

      <div className="w-full">
        <hr className="border w-full border-dark-4/80" />

        <h3 className="body-bold md:h3-bold w-full my-10">
          More Related Lists
        </h3>
        {isUserListsLoading || !relatedLists ? (
          <Loader />
        ) : (
          <GridListList lists={relatedLists} />
        )}
      </div>
    </div>
  );
};

export default ListDetails;
