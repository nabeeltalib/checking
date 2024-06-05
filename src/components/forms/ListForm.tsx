// ... (import statements)
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { ListValidation } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import {Models} from "appwrite"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {useNavigate} from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateList, useUpdateList } from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";

type ListFormProps = {
  list?: Models.Document;
  action: "Create" | "Update";
};

const ListForm = ({ list, action }: ListFormProps) => {
  // ... (form setup and queries)
  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  //validation for the form
  const formSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(3).max(1000),
    items: z.string().min(3).max(1000),
    category: z.string().min(3).max(100),
    tags: z.string().min(3).max(100),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: list?.title || "",
      description: list?.description || "",
      items: list?.items || "",
      category: list?.category || "",
      tags: list?.tags || [],
    },
  });
  
     const { mutateAsync: createList, isLoading: isLoadingCreate } =
       useCreateList();
     const { mutateAsync: updateList, isLoading: isLoadingUpdate } =
       useUpdateList();

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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* ... (form fields as per the schema title description items category and tags) */}
        {/* Form title and description */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Post Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="shadcn"
                  {...field}
                  className="w-full bg-dark-3 text-light-1 border-none"
                />
              </FormControl>
              <FormDescription> Enter a title for your list</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description"
                  {...field}
                  className="w-full bg-dark-3 text-light-1 border-none"
                />
              </FormControl>
              <FormDescription>
                Enter a description for your list
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form items */}
        <FormField
          control={form.control}
          name="items"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Items</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Items"
                  {...field}
                  className="w-full bg-dark-3 text-light-1 border-none"
                />
              </FormControl>
              <FormDescription>Enter items for your list</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-[200px] text-black bg-dark-3 text-light-1 border-none">
                    <SelectValue placeholder="Select a Category" />
                  </SelectTrigger>
                  <SelectContent className="text-black bg-dark-4 text-light-1 border-none">
                    <SelectGroup>
                      <SelectLabel className="-ml-6">
                        Restaraunts & Food
                      </SelectLabel>
                      <SelectItem value="fastfood">Fast Food</SelectItem>
                      <SelectItem value="finedining">Fine Dining</SelectItem>
                      <SelectItem value="streetfood">Street Food</SelectItem>
                    </SelectGroup>

                    <SelectGroup>
                      <SelectLabel className="-ml-6">Musicians</SelectLabel>
                      <SelectItem value="singers">Singers</SelectItem>
                      <SelectItem value="rappers">Rappers</SelectItem>
                      <SelectItem value="bands">Bands</SelectItem>
                    </SelectGroup>

                    <SelectGroup>
                      <SelectLabel className="-ml-6">Sneakers</SelectLabel>
                      <SelectItem value="jordans">Jordans</SelectItem>
                      <SelectItem value="nike">Nike</SelectItem>
                      <SelectItem value="adidas">Adidas</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Select a category for your list</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input
                  placeholder="Tags"
                  {...field}
                  className="text-black bg-dark-3 text-light-1 border-none"
                />
              </FormControl>
              <FormDescription>Enter tags for your list</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form checkbox */}

        <div className="flex gap-4 items-center justify-end">
          <Button
            type="button"
            className="shad-button_dark_4"
            onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate || isLoadingUpdate}>
            {(isLoadingCreate || isLoadingUpdate) && <Loader />}
            {action} List
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ListForm;