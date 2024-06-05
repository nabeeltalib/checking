// ... (import statements)
import { useGetRecentLists } from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";
import ListCard from "@/components/shared/ListCard";
const Explore = () => {
  // ... (search functionality)
  const { data, isLoading } = useGetRecentLists();
  

  return (
    <div className="explore-container">
      {/* ... (search input) */}

      <div className="flex-between w-full max-w-5xl mt-16 mb-7">
        <h3 className="body-bold md:h3-bold">Popular Lists</h3>

        <div className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer">
          <p className="small-medium md:base-medium text-light-2">All</p>
          <img
            src="/assets/icons/filter.svg"
            width={20}
            height={20}
            alt="filter"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {/* ... (search results or list of popular lists) */}
        {isLoading ? (
          <Loader />
        ) : (
          data?.documents.map((list: any) => (
            <ListCard key={list.$id} list={list} />
          ))
        )}
      </div>

      {/* ... (infinite scroll loader) */}
    </div>
  );
};

export default Explore;