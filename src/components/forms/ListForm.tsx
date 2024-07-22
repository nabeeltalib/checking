import { useState, useEffect } from "react";
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
import {
  useGenerateListItems,
  useCreateList,
  useUpdateList,
} from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";
import { createNotification, getCategories } from "@/lib/appwrite/api";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import { IListItem, IList } from "@/types";
import ConfirmationDialog from "./ConfirmationDialog";
import { getUserFriends } from "@/lib/appwrite/config";
import SendNotifcation from "../shared/notifications/SendNotifcation";

type ListFormProps = {
  list?: Models.Document;
  action: "Create" | "Update" | "Remix";
  initialData?: any;
};

const ListForm = ({ list, action, initialData }: any) => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [timespans, setTimespans] = useState<string[]>([
    "all-time",
    "decade",
    "year",
    "week",
  ]);
  const [newTimespan, setNewTimespan] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<any[]>([]);
  const [previousItems, setPreviousItems] = useState<any>([]);
  const [showUndoButton, setShowUndoButton] = useState(false);
  const [friendsLists, setFriendsLists] = useState<any>([]);

  const { mutate: generateListItems, isLoading: isGeneratingItems } =
    useGenerateListItems();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchFriendsLists = async () => {
      const lists = await getUserFriends(user.id);
      setFriendsLists(lists);
    };

    fetchFriendsLists();
  }, [user.id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories.map((cat) => cat.name));
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again later.");
      }
    };

    fetchData();
  }, []);

  const formSchema = z.object({
    Title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be less than 100 characters"),
    Description: z
      .string()
      .max(1000, "Description must be less than 1000 characters")
      .optional(),
    items: z
      .array(
        z.object({
          content: z.string().min(1, "Item cannot be empty"),
          isVisible: z.boolean(),
        })
      )
      .min(5, "At least 5 items are required")
      .max(10, "Maximum 10 items allowed"),
    Categories: z.array(z.string()),
    Tags: z.array(z.string()),
    timespans: z.array(z.string()),
    locations: z.array(z.string()),
    Public: z.boolean(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Title: initialData?.Title || list?.Title || "",
      Description: initialData?.Description || list?.Description || "",
      items:
        initialData?.items.map((item: string | any) => {
          if (typeof item === "string") {
            const [content, isVisible] = item.split("|");
            return { content, isVisible: isVisible === "true" };
          }
          return item;
       }) ||
        list?.items?.map((item: string | any) => {
          if (typeof item === "string") {
            const [content, isVisible] = item.split("|");
            return { content, isVisible: isVisible === "true" };
          }
          return item;
       })||
       Array(5).fill({ content: "", isVisible: true }),
      Categories: initialData?.Categories || list?.Categories || [],
      Tags: initialData?.Tags || list?.Tags || [],
      timespans: initialData?.timespans || list?.timespans || [],
      locations: initialData?.locations || list?.locations || [],
      Public: initialData?.Public || list?.Public || false,
    },
  });

  const { fields, append, move } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const { mutateAsync: createList, isLoading: isLoadingCreate } = useCreateList(
    user.id
  );
  const { mutateAsync: updateList, isLoading: isLoadingUpdate } =
    useUpdateList();

    const handleSubmit = async (value: z.infer<typeof formSchema>) => {
      try {
        if (action === "Update") {
          const updatedList = await updateList({
            ...value,
            listId: list.$id,
            UpdatedAt: new Date(),
          });
    
          if (!updatedList) {
            toast({ title: `${action} list failed. Please try again.` });
          } else {
            // Use for loop to handle asynchronous operations
            for (const friend of friendsLists) {
              await createNotification({
                userId: friend.$id,
                type: "friend_list",
                message: `${user.name} Updated list: "${updatedList.Title}"`,
              });
            }

            navigate(`/lists/${list!.$id}`);
          }
        } else {
          // For both "Create" and "Remix" actions
          const newList = await createList({
            ...value,
            userId: user.id,
            CreatedAt: new Date(),
            UpdatedAt: new Date(),
            // For remix, we might want to add a reference to the original list
            originalListId: action === "Remix" ? list?.$id : undefined,
          });
    
          if (!newList) {
            toast({ title: `${action} list failed. Please try again.` });
          } else {
            navigate(`/lists/${newList.$id}`);
    
            // Use for loop to handle asynchronous operations
            for (const friend of friendsLists) {
              await createNotification({
                userId: friend.$id,
                type: "friend_list",
                message: `${user.name} Created list: "${newList.Title}"`,
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error ${action.toLowerCase()}ing list:`, error);
        toast({
          title: `${action} list failed. Please try again.`,
          variant: "destructive",
        });
      }
    };
    

  const handleGenerateListItems = () => {
    const title = form.getValues("Title");
    if (title) {
      generateListItems(title, {
        onSuccess: (items) => {
          setGeneratedItems(items);
          if (form.getValues("items").some((item) => item.content !== "")) {
            setIsConfirmDialogOpen(true);
          } else {
            applyGeneratedItems(items);
          }
        },
        onError: (_error) => {
          toast({
            title: "Failed to generate list items",
            description: "Please try again or enter items manually.",
            variant: "destructive",
          });
        },
      });
    } else {
      toast({
        title: "Title is required",
        description: "Please enter a title before generating list items.",
        variant: "destructive",
      });
    }
  };

  const applyGeneratedItems = (items: string[]) => {
    setPreviousItems(form.getValues("items"));
    form.setValue(
      "items",
      items.map((item) => ({ content: item, isVisible: true }))
    );
    setShowUndoButton(true);
    setTimeout(() => setShowUndoButton(false), 10000); // Hide undo button after 10 seconds
    toast({
      title: "List items generated",
      description: "5 items have been generated based on your title.",
    });
  };

  const handleUndo = () => {
    form.setValue("items", previousItems);
    setShowUndoButton(false);
    toast({
      title: "Changes undone",
      description: "Your previous list items have been restored.",
    });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((item) => item.id === active.id);
      const newIndex = fields.findIndex((item) => item.id === over.id);

      move(oldIndex, newIndex);
    }
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      form.setValue("Categories", [
        ...form.getValues("Categories"),
        newCategory,
      ]);
      setNewCategory("");
    }
  };

  const handleAddTimespan = () => {
    if (newTimespan && !timespans.includes(newTimespan)) {
      setTimespans([...timespans, newTimespan]);
      form.setValue("timespans", [...form.getValues("timespans"), newTimespan]);
      setNewTimespan("");
    }
  };

  const handleAddLocation = () => {
    if (newLocation && !locations.includes(newLocation)) {
      setLocations([...locations, newLocation]);
      form.setValue("locations", [...form.getValues("locations"), newLocation]);
      setNewLocation("");
    }
  };

  return (
    <Form {...form}>
      {error && (
        <div className="text-red-500" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="Title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Let's Give Your Ranking A Title </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter a title"
                  {...field}
                  className="w-full bg-dark-3 text-light-1 border-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="timespans"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timespans</FormLabel>
                <FormControl>
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Select
                        onValueChange={(value) => {
                          if (value && !field.value.includes(value)) {
                            field.onChange([...field.value, value]);
                          }
                        }}>
                        <SelectTrigger className="w-full md:w-[180px] bg-dark-3 text-light-1 border-none">
                          <SelectValue placeholder="Select a timespan" />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-4 text-light-1 border-none">
                          {timespans
                            .filter(
                              (timespan) => !field.value.includes(timespan)
                            )
                            .map((timespan) => (
                              <SelectItem key={timespan} value={timespan}>
                                {timespan}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="New timespan"
                        value={newTimespan}
                        onChange={(e) => setNewTimespan(e.target.value)}
                        className="w-full md:w-[180px] bg-dark-3 text-light-1 border-none"
                      />
                      <Button
                        type="button"
                        onClick={handleAddTimespan}
                        className="w-full md:w-auto">
                        Add Timespan
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((timespan, index) => (
                        <div
                          key={index}
                          className="bg-primary-500 text-white px-2 py-1 rounded-full flex items-center">
                          {timespan}
                          <button
                            type="button"
                            onClick={() => {
                              const newTimespans = field.value.filter(
                                (_, i) => i !== index
                              );
                              field.onChange(newTimespans);
                            }}
                            className="ml-2 text-xs">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Locations</FormLabel>
                <FormControl>
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Select
                        onValueChange={(value) => {
                          if (value && !field.value.includes(value)) {
                            field.onChange([...field.value, value]);
                          }
                        }}>
                        <SelectTrigger className="w-full md:w-[180px] bg-dark-3 text-light-1 border-none">
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-4 text-light-1 border-none">
                          {locations
                            .filter(
                              (location) => !field.value.includes(location)
                            )
                            .map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="New location"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        className="w-full md:w-[180px] bg-dark-3 text-light-1 border-none"
                      />
                      <Button
                        type="button"
                        onClick={handleAddLocation}
                        className="w-full md:w-auto">
                        Add Location
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((location, index) => (
                        <div
                          key={index}
                          className="bg-primary-500 text-white px-2 py-1 rounded-full flex items-center">
                          {location}
                          <button
                            type="button"
                            onClick={() => {
                              const newLocations = field.value.filter(
                                (_, i) => i !== index
                              );
                              field.onChange(newLocations);
                            }}
                            className="ml-2 text-xs">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <Button
            type="button"
            onClick={handleGenerateListItems}
            disabled={isGeneratingItems}
            className="bg-blue-900 text-light-1 px-4 py-2 rounded-md mb-4">
            {isGeneratingItems ? "Generating..." : "Get Inspiration"}
          </Button>

          {showUndoButton && (
            <Button type="button" onClick={handleUndo} className="w-full">
              Undo Generated Items
            </Button>
          )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}>
            <SortableContext
              items={fields.map((field) => field.id)}
              strategy={verticalListSortingStrategy}>
              {fields.map((field, index) => (
              <SortableItem key={field.id} id={field.id}>
                  <div className="flex items-center mb-2">
                    <div className="mr-2">⋮⋮</div>
                    <FormField
                      control={form.control}
                      name={`items.${index}.content`}
                      render={({ field }) => (
                        <FormItem className="flex-grow mr-2">
                          <FormControl>
                            <Input
                              placeholder={`Rank ${index + 1}`}
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
                                aria-label={`Make item ${index + 1} visible`}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                  </div>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>

          {fields.length < 10 && (
            <Button
              type="button"
              onClick={() => append({ content: "", isVisible: true })}
              aria-label="Add new item"
              className="px-4 py-2 rounded-md mb-4">
              Add Row
            </Button>
          )}
        </div>

        <FormField
          control={form.control}
          name="Tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter tags separated by commas"
                  onBlur={(e) => {
                    const Tags = e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean);
                    field.onChange(Tags);
                  }}
                  defaultValue={field.value.join(", ")}
                  className="w-full bg-dark-3 text-light-1 border-none"
                />
              </FormControl>
              <FormDescription>
                Enter tags for your list separated by commas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="Categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories</FormLabel>
              <FormControl>
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Select
                      onValueChange={(value) => {
                        if (value && !field.value.includes(value)) {
                          field.onChange([...field.value, value]);
                        }
                      }}>
                      <SelectTrigger className="w-full md:w-[180px] bg-dark-3 text-light-1 border-none">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter((category) => !field.value.includes(category))
                          .map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="New category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full md:w-[180px] bg-dark-3 text-light-1 border-none"
                    />
                    <Button
                      type="button"
                      onClick={handleAddCategory}
                      className="w-full md:w-auto">
                      Add Category
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value.map((category, index) => (
                      <div
                        key={index}
                        className="bg-primary-500 text-white px-2 py-1 rounded-full flex items-center">
                        {category}
                        <button
                          type="button"
                          onClick={() => {
                            const newCategories = field.value.filter(
                              (_, i) => i !== index
                            );
                            field.onChange(newCategories);
                          }}
                          className="ml-2 text-xs">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />  
        <FormField
          control={form.control}
          name="Public"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Public </FormLabel>
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              </FormControl>
              <FormDescription>
                Check if you want to publish this list.
              </FormDescription>
            </FormItem>
          )}
        />
        <Button
          type="button"
          onClick={() => setShowDescription(!showDescription)}
          className="px-4 py-2 rounded-md mb-4">
          {showDescription
            ? "Hide Description"
            : "If you want to add description"}
        </Button>

        {showDescription && (
          <FormField
            control={form.control}
            name="Description"
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
                <FormDescription>
                  Enter a description for your list
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex flex-col sm:flex-row justify-end items-center gap-2 sm:gap-4 mb-2">
          <Button
            type="button"
            className="shad-button_dark_4"
            onClick={() => navigate(-1)}>
            Cancel
          </Button>
          {/* <Button
            type="button"
            className="shad-button_dark_4"
            onClick={() => navigate(-1)}>
            Save as Draft
          </Button>
          <Button
            type="button"
            className="shad-button_dark_4"
            onClick={() => navigate(-1)}>
            Preview List
          </Button>
          <Button
            type="button"
            className="shad-button_dark_4"
            onClick={() => navigate(-1)}>
            Publish List
          </Button> */}
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate || isLoadingUpdate}>
            {(isLoadingCreate || isLoadingUpdate) && <Loader />}
            {action === "Remix" ? "Create Remixed List" : `${action} List`}
          </Button>
        </div>
      </form>

      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={() => {
          applyGeneratedItems(generatedItems);
          setIsConfirmDialogOpen(false);
        }}
        title="Replace existing items?"
        description="This will replace your current list items with the generated ones. Are you sure?"
      />
    </Form>
  );
};

export default ListForm;
