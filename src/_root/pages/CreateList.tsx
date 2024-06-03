import ListForm from "@/components/forms/ListForm";

const CreateList = () => {
  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="max-w-5xl flex-start gap-3 justify-start w-full">
          <img
            src="/assets/icons/add-list.svg"
            width={36}
            height={36}
            alt="Add List Icon"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Create List</h2>
        </div>

        <ListForm action="Create" />
      </div>
    </div>
  );
};

export default CreateList;