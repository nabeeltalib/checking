import ListForm from "@/components/forms/ListForm";
import { useCreateList } from "@/lib/react-query/queries";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { IList } from "@/types";

const CreateList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { mutate: createList, isLoading } = useCreateList();

  const handleCreateList = async (listData: IList) => {
    try {
      const newList = await createList(listData);
      toast({
        title: "List created successfully!",
        description: "Your new list has been created.",
        variant: "success",
      });
      navigate(`/lists/${newList.$id}`);
    } catch (error) {
      toast({
        title: "Error creating list",
        description: "An error occurred while creating the list. Please try again.",
        variant: "error",
      });
    }
  };

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="flex-start gap-3 justify-start w-full max-w-5xl">
          <img
            src="/assets/icons/add-list.svg"
            width={36}
            height={36}
            alt="Add List Icon"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Create List</h2>
        </div>

        <ListForm
          onSubmit={handleCreateList}
          isLoading={isLoading}
          action="Create"
        />
      </div>
    </div>
  );
};

export default CreateList;