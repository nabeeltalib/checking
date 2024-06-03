// ... (import statements)
import { useParams } from "react-router-dom";

const EditList = () => {
  const { id } = useParams();
  const { data: list, isLoading } = useGetListById(id);

  // ... (loading state handling)

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="flex-start gap-3 justify-start w-full max-w-5xl">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit List</h2>
        </div>

        {isLoading ? <Loader /> : <ListForm action="Update" list={list} />}
      </div>
    </div>
  );
};

export default EditList;