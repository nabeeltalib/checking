import { useToast } from "@/components/ui/use-toast";
import { Loader } from "@/components/shared";
import { useGetLists } from "@/lib/react-query/queries";
import ListCard from "@/components/shared/ListCard";

const AllLists = () => {
  const { toast } = useToast();
  const { data: lists, isLoading, isError: isErrorLists } = useGetLists();

  if (isErrorLists) {
    toast({ title: "Something went wrong." });
    return null;
  }

  return (
    <div className="common-container">
      <div className="list-container">
        <h2 className="h3-bold md:h2-bold text-left w-full">All Lists</h2>
        {isLoading && !lists ? (
          <Loader />
        ) : (
          <ul className="list-grid">
            {lists?.documents.map((list) => (
              <li key={list.$id} className="flex-1 min-w-[200px] w-full">
                <ListCard list={list} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllLists;