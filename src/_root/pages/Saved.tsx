import { Models } from "appwrite";
import { Loader } from "@/components/shared";
import { useGetCurrentUser } from "@/lib/react-query/queries";
import GridListList from "@/components/shared/GridListList";
import { IList } from "@/types";

const Saved = () => {
  const { data: currentUser, isLoading } = useGetCurrentUser();

  if (isLoading) {
    return <Loader />;
  }

  if (!currentUser) {
    return <div className="text-light-4 text-center">User not found</div>;
  }

  const savedLists: IList[] = currentUser.save
    ?.map((savedList: Models.Document) => ({
      ...savedList.list,
      creator: {
        imageUrl: currentUser.imageUrl,
      },
    }))
    .reverse() || [];

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

      <div className="w-full flex justify-center max-w-5xl gap-9">
        {savedLists.length === 0 ? (
          <p className="text-light-4">No saved lists</p>
        ) : (
          <GridListList lists={savedLists} showStats={false} />
        )}
      </div>
    </div>
  );
};

export default Saved;