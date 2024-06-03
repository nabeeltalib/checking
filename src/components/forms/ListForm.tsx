// ... (import statements)

type ListFormProps = {
  list?: Models.Document;
  action: "Create" | "Update";
};

const ListForm = ({ list, action }: ListFormProps) => {
  // ... (form setup and queries)

  // Handler
  const handleSubmit = async (value: z.infer<typeof ListValidation>) => {
    // ACTION = UPDATE
    if (list && action === "Update") {
      const updatedList = await updateList({
        ...value,
        listId: list.$id,
      });

      if (!updatedList) {
        toast({
          title: `${action} list failed. Please try again.`,
        });
      }
      return navigate(`/lists/${list.$id}`);
    }

    // ACTION = CREATE
    const newList = await createList({
      ...value,
      userId: user.id,
    });

    if (!newList) {
      toast({
        title: `${action} list failed. Please try again.`,
      });
    }
    navigate("/");
  };

  return (
    <Form {...form}>
      {/* ... (form fields for title, description, items, category, and tags) */}
      <div className="flex gap-4 items-center justify-end">
        {/* ... (cancel and submit buttons) */}
      </div>
    </Form>
  );
};

export default ListForm;