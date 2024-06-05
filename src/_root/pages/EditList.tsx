// ... (import statements)
import { useParams } from "react-router-dom";
import { useGetListById } from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";
import ListForm from "@/components/forms/ListForm";
import { useUserContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const EditList = () => {
  const { id } = useParams();
  const { data: list, isLoading } = useGetListById(id);
  const { user } = useUserContext();
  const navigate = useNavigate();
  // ... (loading state handling)
  
  //if user id is not equal to the list creator id, redirect to the list details page
  if (user && list && list.creator.$id !== user?.id) {
    navigate(`/lists/${id}`);
  }


  return (
    <div className="flex flex-col gap-6 w-full p-6">
      <div className="flex flex-col gap-6 w-full p-6 mx-auto">
        <div className="flex-start gap-3 justify-start w-full ">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit List</h2>
        </div>

        {isLoading ? <Loader /> : list && <ListForm action="Update" list={list} />}
      </div>
    </div>
  );
};

export default EditList;