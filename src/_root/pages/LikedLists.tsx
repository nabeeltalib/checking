import { Loader } from "@/components/shared";
import { useGetCurrentUser } from "@/lib/react-query/queries";
import GridListList from "@/components/shared/GridListList";

const LikedLists = () => {
  const { data: currentUser, isLoading } = useGetCurrentUser();

  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex-center w-full h-full">
        <p className="text-light-4">User not found</p>
      </div>
    );
  }

  return (
    <div className="common-container">
      <h1 className="h3-bold md:h2-bold text-left w-full mb-6">Liked Lists</h1>
      <div className="w-full max-w-5xl mx-auto">
        {currentUser.liked.length === 0 ? (
          <p className="text-light-4 text-center">No liked lists</p>
        ) : (
          <GridListList lists={currentUser.liked} showStats={false} />
        )}
      </div>
    </div>
  );
};

export default LikedLists;