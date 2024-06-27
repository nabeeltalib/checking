import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Models } from "appwrite";
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
import { useNavigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateList, useUpdateList } from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";
import { useState, useEffect } from "react";
import { fetchAISuggestions, fetchCategories } from "@/lib/appwrite/aiService";

type ListFormProps = {
  list?: Models.Document;
  action: "Create" | "Update";
};

const ListForm = ({ list, action }: ListFormProps) => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  // AI-powered suggestions for tags and items
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch AI-powered suggestions for list items
    fetchAISuggestions().then((suggestions) => {
      setAiSuggestions(suggestions);
    });

    // Fetch categories
    fetchCategories().then((categories) => {
      setCategories(categories);
    });
  }, []);

  // Validation schema for the form
  const formSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(3).max(1000),
    items: z.string().min(3).max(1000),
    category: z.string().min(3).max(100),
    tags: z.string()
      .transform((value) => value.split(',').map((tag) => tag.trim())),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: list?.title || "",
      description: list?.description || "",
      items: list?.items || "",
      category: list?.category || "",
      tags: list?.tags?.join(', ') || "",
    },
  });

  const { mutateAsync: createList, isLoading: isLoadingCreate } = useCreateList();
  const { mutateAsync: updateList, isLoading: isLoadingUpdate } = useUpdateList();

  // Handler
  const handleSubmit = async (value: z.infer<typeof formSchema>) => {
    console.log("handleSubmit");
    if (list && action === "Update") {
      const updatedList = await updateList({ ...value, listId: list.$id });

      if (!updatedList) {
        toast({ title: `${action} list failed. Please try again.` });
      } else {
        navigate(`/lists/${list.$id}`);
      }
      return;
    }

    const newList = await createList({ ...value, userId: user.id });

    if (!newList) {
      toast({ title: `${action} list failed. Please try again.` });
    } else {
      navigate(`/lists/${newList.$id}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter a title"
                  {...field}
                  className="w-full bg-dark-3 text-light-1 border-none"
                />
              </FormControl>
              <FormDescription>Enter a title for your list</FormDescription>
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
                  placeholder="Enter a description"
                  {...field}
                  className="w-full bg-dark-3 text-light-1 border-none"
                />
              </FormControl>
              <FormDescription>Enter a description for your list</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="items"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Items</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter items"
                  {...field}
                  className="w-full bg-dark-3 text-light-1 border-none"
                />
              </FormControl>
              <FormDescription>
                Enter items for your list. You can also select from AI-powered suggestions:
                <ul className="list-disc pl-5 mt-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <li key={index} className="cursor-pointer" onClick={() => form.setValue("items", suggestion)}>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full bg-dark-3 text-light-1 border-none">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-4 text-light-1 border-none">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Select a category for your list</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter tags separated by commas"
                  {...field}
                  className="w-full bg-dark-3 text-light-1 border-none"
                />
              </FormControl>
              <FormDescription>Enter tags for your list separated by commas</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 items-center justify-end">
          <Button type="button" className="shad-button_dark_4" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate || isLoadingUpdate}
          >
            {(isLoadingCreate || isLoadingUpdate) && <Loader />}
            {action} List
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ListForm;
