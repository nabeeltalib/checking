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
import { useCreateList, useUpdateList, useGenerateListIdea } from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";
import { useState, useEffect } from "react";
import { getCategories } from "@/lib/appwrite/api";
import { getAISuggestions } from '@/lib/appwrite/aiService';

type ListFormProps = {
  list?: Models.Document;
  action: "Create" | "Update";
};

const ListForm = ({ list, action }: ListFormProps) => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const suggestions = await getAISuggestions(user.id);
        setAiSuggestions(suggestions);

        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again later.');
      }
    };

    fetchData();
  }, [user.id]);

  const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
    description: z.string().min(3, "Description must be at least 3 characters").max(1000, "Description must be less than 1000 characters"),
    items: z.string().min(3, "Items must be at least 3 characters").max(1000, "Items must be less than 1000 characters"),
    category: z.string().min(3, "Category must be at least 3 characters").max(100, "Category must be less than 100 characters"),
    tags: z.string().transform((value) => value.split(',').map((tag) => tag.trim())),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: list?.title || "",
      description: list?.description || "",
      items: list?.items?.join(', ') || "",
      category: list?.category || "",
      tags: list?.tags?.join(', ') || "",
    },
  });
  
  const { mutate: generateListIdea, isLoading: isGeneratingIdea } = useGenerateListIdea();
  const { mutateAsync: createList, isLoading: isLoadingCreate } = useCreateList();
  const { mutateAsync: updateList, isLoading: isLoadingUpdate } = useUpdateList();

  const handleGenerateIdea = () => {
    generateListIdea(form.getValues("title"), {
      onSuccess: (idea) => {
        form.setValue("description", idea);
      },
    });
  };

  const handleSubmit = async (value: z.infer<typeof formSchema>) => {
    try {
      if (list && action === "Update") {
        const updatedList = await updateList({ ...value, listId: list.$id });
        if (!updatedList) {
          toast({ title: `${action} list failed. Please try again.` });
        } else {
          navigate(`/lists/${list.$id}`);
        }
      } else {
        const newList = await createList({ ...value, userId: user.id });
        if (!newList) {
          toast({ title: `${action} list failed. Please try again.` });
        } else {
          navigate(`/lists/${newList.$id}`);
        }
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing list:`, error);
      toast({ title: `${action} list failed. Please try again.`, variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      {error && <div className="text-red-500">{error}</div>}
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
        <Button
          type="button"
          onClick={handleGenerateIdea}
          disabled={isGeneratingIdea}
          className="mb-4"
        >
          {isGeneratingIdea ? "Generating..." : "Get AI Description"}
        </Button>

        <FormField
          control={form.control}
          name="items"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Items</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter items, separated by commas"
                  {...field}
                  className="w-full bg-dark-3 text-light-1 border-none"
                />
              </FormControl>
              <FormDescription>
                Enter items for your list, separated by commas. You can also select from AI-powered suggestions:
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