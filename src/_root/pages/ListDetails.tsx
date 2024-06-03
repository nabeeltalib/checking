// ... (import statements)

const ListDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserContext();

  const { data: list, isLoading } = useGetListById(id);
  const { data: userLists, isLoading: isUserListsLoading } = useGetUserLists(
    list?.creator.$id
  );
  const { mutate: deleteList } = useDeleteList();

  const relatedLists = userLists?.documents.filter(
    (userList) => userList.$id !== id
  );

  const handleDeleteList = () => {
    deleteList({ listId: id });
    navigate(-1);
  };

  return (
    <div className="list_details-container">
      {/* ... (back button) */}

      {isLoading || !list ? (
        <Loader />
      ) : (
        <div className="list_details-card">
          <div className="list_details-info">
            {/* ... (list creator info) */}

            <hr className="border w-full border-dark-4/80" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <h2 className="body-bold lg:h2-bold">{list?.title}</h2>
              <p>{list?.description}</p>
              <ul className="list-items">
                {list?.items.map((item, index) => (
                  <li key={index} className="list-item">
                    {item}
                  </li>
                ))}
              </ul>
              <ul className="flex gap-1 mt-2">
                {list?.tags.map((tag: string, index: string) => (
                  <li
                    key={`${tag}${index}`}
                    className="text-light-3 small-regular">
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full">
              {/* ... (list stats) */}
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl">
        <hr className="border w-full border-dark-4/80" />

        <h3 className="body-bold md:h3-bold w-full my-10">
          More Related Lists
        </h3>
        {isUserListsLoading || !relatedLists ? (
          <Loader />
        ) : (
          <GridListList lists={relatedLists} />
        )}
      </div>
    </div>
  );
};

export default ListDetails;