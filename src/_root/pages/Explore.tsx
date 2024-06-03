// ... (import statements)

const Explore = () => {
  // ... (search functionality)

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
      </div>

      {/* ... (infinite scroll loader) */}
    </div>
  );
};

export default Explore;