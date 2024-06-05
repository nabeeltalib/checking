import { Loader } from "@/components/shared";
import { useGetCurrentUser } from "@/lib/react-query/queries";
import GridListList from "@/components/shared/GridListList";

const LikedLists = () => {
  const { data: currentUser } = useGetCurrentUser();

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  return (
    <>
      {currentUser.liked.length === 0 && (
        <p className="text-light-4">No liked lists</p>
      )}

      <GridListList lists={currentUser.liked} showStats={false} />
    </>
  );
};

export default LikedLists;