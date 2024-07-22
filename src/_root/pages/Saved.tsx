import { Loader } from "@/components/shared";
import { useGetCurrentUser } from "@/lib/react-query/queries";
import GridListList from "@/components/shared/GridListList";
import { IList, IUser } from "@/types";
import ListCard2 from "@/components/shared/ListCard2";

const Saved = () => {
  const { data: currentUser, isLoading } = useGetCurrentUser();

  if (isLoading) {
    return <Loader />;
  }

  if (!currentUser) {
    return <div className="text-light-4 text-center">User not found</div>;
  }

 const savedLists: IList[] = currentUser?.save
  ? currentUser.save.map((savedItem: any) => ({
      ...savedItem.list,
      creator: {
        $id: currentUser.$id,
        name: currentUser.name,
        imageUrl: currentUser.imageUrl || "/assets/icons/profile-placeholder.svg",
      },
    }))
  : [];

  console.log("Saved Lists:", savedLists); // Add this line for debugging

  return (
    <div className="saved-container common-container">
      <div className="flex gap-2 w-full max-w-5xl">
        <img
          src="/assets/icons/save.svg"
          width={36}
          height={36}
          alt="edit"
          className="invert-white"
        />
        <h2 className="h3-bold md:h2-bold text-left w-full">Saved Lists</h2>
      </div>
      
      <div className="w-full flex justify-center ">
        {savedLists.length === 0 ? (
          <p className="text-light-4">No saved lists</p>
        ) : (
          savedLists.map((list, index)=>(
            <ListCard2 list={list} key={index} />
          ))
        )}
      </div>
    </div>
  );
};

export default Saved;