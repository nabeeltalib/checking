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
import { useForm, useFieldArray } from "react-hook-form";
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
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
    items: z.array(z.object({
      content: z.string().min(1, "Item cannot be empty"),
      isVisible: z.boolean(),
    })).min(5, "At least 5 items are required").max(10, "Maximum 10 items allowed"),
    category: z.string().min(3, "Category must be at least 3 characters").max(100, "Category must be less than 100 characters"),
    tags: z.string().transform((value) => value.split(',').map((tag) => tag.trim())),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: list?.title || "",
      description: list?.description || "",
      items: list?.items?.map((item: string) => ({ content: item, isVisible: true })) || 
             Array(5).fill({ content: "", isVisible: true }),
      category: list?.category || "",
      tags: list?.tags?.join(', ') || "",
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "items",
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

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    move(result.source.index, result.destination.index);
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

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="list-items">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {fields.map((field, index) => (
                  <Draggable key={field.id} draggableId={field.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex items-center mb-2"
                      >
                        <FormField
                          control={form.control}
                          name={`items.${index}.content`}
                          render={({ field }) => (
                            <FormItem className="flex-grow mr-2">
                              <FormControl>
                                <Input
                                  placeholder={`Item ${index + 1}`}
                                  {...field}
                                  className="w-full bg-dark-3 text-light-1 border-none"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.isVisible`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <input
                                  type="checkbox"
                                  {...field}
                                  checked={field.value}
                                  className="mr-2"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button type="button" onClick={() => remove(index)} className="bg-red-500 text-white">
                          Remove
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {fields.length < 10 && (
          <Button type="button" onClick={() => append({ content: '', isVisible: true })}>
            Add Item
          </Button>
        )}

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