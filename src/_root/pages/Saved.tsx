import { Models } from "appwrite";

import { Loader } from "@/components/shared";
import { useGetCurrentUser } from "@/lib/react-query/queries";
import GridListList from "@/components/shared/GridListList";

const Saved = () => {
  const { data: currentUser } = useGetCurrentUser();

  const savedLists = currentUser?.savedLists
    .map((savedList: Models.Document) => ({
      ...savedList.list,
      creator: {
        imageUrl: currentUser.imageUrl,
      },
    }))
    .reverse();

  return (
    <div className="saved-container">
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

      {!currentUser ? (
        <Loader />
      ) : (
        <ul className="w-full flex justify-center max-w-5xl gap-9">
          {savedLists.length === 0 ? (
            <p className="text-light-4">No available lists</p>
          ) : (
            <GridListList lists={savedLists} showStats={false} />
          )}
        </ul>
      )}
    </div>
  );
};

export default Saved;