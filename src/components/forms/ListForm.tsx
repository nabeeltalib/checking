import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { CollaborateOnList, createNotification, getCategories } from "@/lib/appwrite/api";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import ConfirmationDialog from "./ConfirmationDialog";
import { getUserFriends, indexList } from "@/lib/appwrite/config";
import ListPreview from "@/components/shared/ListPreview";
import Tooltip from "@/components/ui/Tooltip"; // Assuming Tooltip is correctly exported
import { Info } from 'lucide-react';

const ListForm = ({ list, action, initialData }: any) => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [timespans, setTimespans] = useState<string[]>([
    "All-time",
    "Decade",
    "This year",
    "This week",
  ]);
  const [newTimespan, setNewTimespan] = useState("");
  const [locations, setLocations] = useState<string[]>([
    "United States",
    "Los Angeles",
    "South America",
    "Brooklyn",
    "Hyde Park",
    "Pace HS",
  ]);
  const [newLocation, setNewLocation] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<any[]>([]);
  const [previousItems, setPreviousItems] = useState<any[]>([]);
  const [showUndoButton, setShowUndoButton] = useState(false);
  const [friendsLists, setFriendsLists] = useState<any[]>([]);
  const [numItems, setNumItems] = useState<number>(5);

  const { mutate: generateListItems, isLoading: isGeneratingItems } = useGenerateListItems();
  const { mutateAsync: createList, isLoading: isLoadingCreate } = useCreateList(user.id);
  const { mutateAsync: updateList, isLoading: isLoadingUpdate } = useUpdateList();

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
          creator: z.string().nullable().default(null),
          id: z.string().nullable().default(null),
        })
      )
      .min(3, "At least 3 items are required")
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
        initialData?.item.map((item: any) => ({
          content: item.content,
          isVisible: true,
          creator: item?.creator.$id,
          id: item?.$id,
        })) ||
        list?.item?.map((item: any) => ({
          content: item.content,
          isVisible: true,
          creator: item?.creator?.$id,
          id: item?.$id,
        })) ||
        Array(numItems).fill({ content: "", isVisible: true }),
      Categories: initialData?.Categories || list?.Categories || [],
      Tags: initialData?.Tags || list?.Tags || [],
      timespans: initialData?.timespans || list?.timespans || [],
      locations: initialData?.locations || list?.locations || [],
      Public: initialData?.Public || list?.Public || true,
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleItemCountChange = (value: string) => {
    const count = parseInt(value.replace('Top ', ''));
    setNumItems(count);

    const currentFields = form.getValues('items');
    if (currentFields.length > count) {
      remove([...Array(currentFields.length - count).keys()].map(i => count + i));
    } else if (currentFields.length < count) {
      append([...Array(count - currentFields.length)].map(() => ({ content: "", isVisible: true, id: "", creator: "" })));
    }
  };

  const handleSubmit = async (value: z.infer<typeof formSchema>) => {
    try {
      if (action === "Update") {
        let item: any = value.items.map((item: any) => {
          let currentListItem = list.item.find((listItem: any) => listItem.content !== item.content);
          if (currentListItem) {
            return {
              ...item,
              content: item.content,
              creator: user.id,
            };
          }
          return {
            ...item,
          };
        });

        if (list.userId !== user.id) {
          await CollaborateOnList(list.$id, user.id);
        }

        const updatedList = await updateList({
          ...value,
          userId: user.id,
          item: item,
          listId: list.$id,
          UpdatedAt: new Date(),
        });

        if (!updatedList) {
          toast({ title: `${action} list failed. Please try again.` });
        } else {
          await indexList(updatedList);
          navigate(`/lists/${list!.$id}`);

          for (const friend of friendsLists) {
            await createNotification({
              userId: friend.$id,
              type: "friend_list",
              message: `${user.name} Updated list: "${updatedList.Title}"`,
            });
          }

          for (const person of list.users) {
            await createNotification({
              userId: person.$id,
              type: "friend_list",
              message: `${user.name} Updated list: "${updatedList.Title}"`,
            });
          }
        }
      } else {
        const newList = await createList({
          ...value,
          userId: user.id,
          CreatedAt: new Date(),
          UpdatedAt: new Date(),
          originalListId: action === "Remix" ? list?.$id : undefined,
        });

        if (!newList) {
          toast({ title: `${action} list failed. Please try again.` });
        } else {
          await indexList(newList);

          for (const friend of friendsLists) {
            await createNotification({
              userId: friend.$id,
              type: "friend_list",
              message: `${user.name} Created list: "${newList.Title}"`,
            });
          }

          navigate(`/lists/${newList.$id}`);
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
    const location = form.getValues("locations");
    const timespans = form.getValues("timespans");

    let obj = {
      Title: title,
      location: location,
      timespans: timespans,
    };
    if (title) {
      generateListItems(obj, {
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
      items.map((item) => ({ content: item, isVisible: true, id: "", creator: "" }))
    );
    setShowUndoButton(true);
    setTimeout(() => setShowUndoButton(false), 10000);
    toast({
      title: "List items generated",
      description: "Items have been generated based on your title.",
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
      form.setValue("Categories", [...form.getValues("Categories"), newCategory]);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Basic Info Section */}
            <div className="space-y-4 p-4 border border-slate-300 rounded-lg">
            <Tooltip content="Enter a catchy title for your list. Make it descriptive and engaging to attract more viewers!">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl md:text-2xl font-semibold text-slate-600">Basic Info*</h2>
                <span className="cursor-pointer">
                  <Info size={15} color="#64748b" /> {/* Info icon from lucide-react */}
                </span>
              </div>
            </Tooltip>
              <FormField
                control={form.control}
                name="Title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What's your title?</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a title e.g. Chicago HS Basketball Players, Innovations That Will Shape the Future"
                        {...field}
                        className="text-xs w-full bg-dark-4 text-light-1 border-none"
                        spellCheck={true} // Enable spellcheck here
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Time & Location Section */}
            <div className="space-y-4 p-4 border border-slate-300 rounded-lg mt-8">
              <Tooltip content="Specify when and where your list is relevant. This helps contextualize your ranking and makes it more discoverable.">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
                >
                  <div className="flex items-center space-x-2">
                <h2 className="text-xl md:text-2xl  font-semibold text-slate-600">Time & Location</h2>
                <span className="cursor-pointer">
                  <Info size={15} color="#64748b" /> {/* Info icon from lucide-react */}
                </span>
              </div>
                  <span>{showAdditionalDetails ? "−" : "↘"}</span>
                </div>
              </Tooltip>
              {showAdditionalDetails && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="timespans"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Any time frame?</FormLabel>
                        <FormControl>
                          <div>
                            <div className="flex flex-wrap gap-2">
                              <Select
                                onValueChange={(value) => {
                                  if (value && !field.value.includes(value)) {
                                    field.onChange([...field.value, value]);
                                  }
                                }}>
                                <SelectTrigger className="w-full md:w-[180px] bg-dark-4 text-light-1 border-none">
                                  <SelectValue placeholder="Select a timespan" />
                                </SelectTrigger>
                                <SelectContent className="bg-dark-4 text-light-1 border-none">
                                  {timespans
                                    .filter((timespan) => !field.value.includes(timespan))
                                    .map((timespan) => (
                                      <SelectItem key={timespan} value={timespan}>
                                        {timespan}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select> or
                              <Input
                                placeholder="Create new e.g. 90s, GOAT"
                                value={newTimespan}
                                onChange={(e) => setNewTimespan(e.target.value)}
                                className="text-xs w-full md:w-[220px] bg-dark-4 text-light-1 border-none"
                                spellCheck={true} // Enable spellcheck here
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
                                      const newTimespans = field.value.filter((_, i) => i !== index);
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
                        <FormLabel>Any location?</FormLabel>
                        <FormControl>
                          <div>
                            <div className="flex flex-wrap gap-2">
                              <Select
                                onValueChange={(value) => {
                                  if (value && !field.value.includes(value)) {
                                    field.onChange([...field.value, value]);
                                  }
                                }}>
                                <SelectTrigger className="w-full md:w-[180px] bg-dark-4 text-light-1 border-none">
                                  <SelectValue placeholder="Select a location" />
                                </SelectTrigger>
                                <SelectContent className="bg-dark-4 text-light-1 border-none">
                                  {locations
                                    .filter((location) => !field.value.includes(location))
                                    .map((location) => (
                                      <SelectItem key={location} value={location}>
                                        {location}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select> or
                              <Input
                                placeholder="Create new e.g. East, Worldwide"
                                value={newLocation}
                                onChange={(e) => setNewLocation(e.target.value)}
                                className="text-xs w-full md:w-[220px] bg-dark-4 text-light-1 border-none"
                                spellCheck={true} // Enable spellcheck here
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
                                      const newLocations = field.value.filter((_, i) => i !== index);
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
              )}
            </div>

            {/* List Items Section */}
            <div className="space-y-4 p-4 border border-slate-300 rounded-lg mt-8">
              <Tooltip content="Add your ranked items here. You can drag and drop to reorder them. The more specific and unique your items, the better!">
                <div className="flex items-center space-x-2">
                <h2 className="text-xl md:text-2xl  font-semibold text-slate-600">List Items*</h2>
                <span className="cursor-pointer">
                  <Info size={15} color="#64748b" /> {/* Info icon from lucide-react */}
                </span>
              </div>
              </Tooltip>
              <FormItem>
                <FormLabel>How long is your ranking?</FormLabel>
                <div className="flex gap-0">
                  <Button
                    type="button"
                    onClick={() => handleItemCountChange("3")}
                    className={`text-xs px-2 py-2 rounded-sm ${
                      form.getValues("items").length === 3 ? "border border-blue-500 text-gray-300" : "bg-dark-4"
                    }`}
                  >
                    Top 3
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleItemCountChange("5")}
                    className={`text-xs px-2 py-2 rounded-sm ${
                      form.getValues("items").length === 5 ? "border border-blue-500 text-gray-300" : "bg-dark-4"
                    }`}
                  >
                    Top 5
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleItemCountChange("10")}
                    className={`text-xs px-2 py-2 rounded-sm ${
                      form.getValues("items").length === 10 ? "border border-blue-500 text-gray-300" : "bg-dark-4"
                    }`}
                  >
                    Top 10
                  </Button>
                </div>
              </FormItem>
              <div className="text-right">
                <span className="text-xs text-gray-400 ml-3">Based on your title, time frame, or location details</span>
                <Button
                  type="button"
                  onClick={handleGenerateListItems}
                  disabled={isGeneratingItems}
                  className="bg-blue-900 text-xs text-light-1 px-4 py-2 rounded-md mb-4"
                >
                  {isGeneratingItems ? "Generating..." : "Get AI Item Suggestions"}
                </Button>
              </div>
              {showUndoButton && (
                <Button type="button" onClick={handleUndo} className="w-full">
                  Undo Generated Items
                </Button>
              )}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fields.map((field) => field.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {fields.map((field, index) => (
                    <SortableItem key={field.id} id={field.id}>
                      <div className="flex items-center mb-2">
                        <div className="mr-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-grip-vertical"
                            viewBox="0 0 16 16"
                          >
                            <path d="M2 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm4 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm4 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm4 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
                          </svg>
                        </div>
                        <FormField
                          control={form.control}
                          name={`items.${index}.content`}
                          render={({ field }) => (
                            <FormItem className="flex-grow mr-2">
                              <FormControl>
                                <Input
                                  placeholder={`Enter #${index + 1} ranked item`}
                                  {...field}
                                  className="text-xs w-full bg-dark-4 text-light-1 border-none"
                                  spellCheck={true} // Enable spellcheck here
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
                  onClick={() => append({ content: "", isVisible: true, id: "", creator: "" })}
                  aria-label="Add new item"
                  className="px-4 py-2 rounded-md mb-4"
                >
                  Add Row
                </Button>
              )}
            </div>

            {/* Additional Details Section */}
            <div className="space-y-4 p-4 border border-slate-300 rounded-lg mt-8">
              <Tooltip content="Tags: Add relevant keywords to help others find your list.
                Categories: Choose or create a general topic for your list.
                Public/Private: Decide who can see your list.">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
                >
                  <div className="flex items-center space-x-2">
                <h2 className="text-xl md:text-2xl  font-semibold text-slate-600">Additional Details</h2>
                <span className="cursor-pointer">
                  <Info size={15} color="#64748b" /> {/* Info icon from lucide-react */}
                </span>
              </div>
                  <span>{showAdditionalDetails ? "−" : "↘"}</span>
                </div>
              </Tooltip>
              {showAdditionalDetails && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="Tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (add keywords to help others find your list)</FormLabel>
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
                            className="text-xs w-full bg-dark-4 text-light-1 border-none"
                            spellCheck={true} // Enable spellcheck here
                          />
                        </FormControl>
                        <FormDescription>
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
                        <FormLabel>Categories (choose a general topic for your list)</FormLabel>
                        <FormControl>
                          <div>
                            <div className="flex flex-wrap gap-2">
                              <Select
                                onValueChange={(value) => {
                                  if (value && !field.value.includes(value)) {
                                    field.onChange([...field.value, value]);
                                  }
                                }}>
                                <SelectTrigger className="w-full md:w-[180px] bg-dark-4 text-light-1 border-none">
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent className="bg-dark-2 text-light-1 border-none">
                                  {categories
                                    .filter((category) => !field.value.includes(category))
                                    .map((category) => (
                                      <SelectItem 
                                        key={category} 
                                        value={category}
                                        className="bg-dark-4 text-light-1 border-none"
                                      >
                                        {category}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select> or
                              <Input
                                placeholder="Create new"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="text-xs w-full md:w-[180px] bg-dark-4 text-light-1 border-none"
                                spellCheck={true} // Enable spellcheck here
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
                                      const newCategories = field.value.filter((_, i) => i !== index);
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
                          Uncheck this if you want to make your list private
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Description Section */}
            <div className="space-y-4 p-4 border border-slate-900 rounded-lg mt-8">
              <Tooltip content="Provide more context about your list. Explain your ranking criteria or add interesting facts about your chosen topic.">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setShowDescription(!showDescription)}
                >
                  <div className="flex items-center space-x-2">
                <h2 className="text-sm md:text-base  font-semibold text-slate-600">Description (optional)</h2>
                <span className="cursor-pointer">
                  <Info size={15} color="#64748b" /> {/* Info icon from lucide-react */}
                </span>
              </div>
                  <span>{showDescription ? "−" : "↘"}</span>
                </div>
              </Tooltip>
              {showDescription && (
                <FormField
                  control={form.control}
                  name="Description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Enter a description"
                          {...field}
                          className="w-full bg-dark-4 text-light-1 border-none"
                          spellCheck={true} // Enable spellcheck here
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
            </div>

          </div>

          {/* Preview Section */}
          <div className="space-y-8">
            <ListPreview
              title={form.watch("Title")}
              items={form.watch("items")}
              description={form.watch("Description")}
              categories={form.watch("Categories")}
              tags={form.watch("Tags")}
              timespans={form.watch("timespans")}
              locations={form.watch("locations")}
              username={form.watch("Username") || "defaultUsername"}  // Ensure defaults are provided
              name={form.watch("Name") || "defaultName"}  // Ensure defaults are provided
              followers={form.watch("Followers") || 0}  // Provide default value of 0 if undefined
              following={form.watch("Following") || 0}  // Provide default value of 0 if undefined
            />
          </div>
        </div>

        {/* Submit Section */}
        <div className="flex justify-end gap-2 sm:gap-4 mt-4">
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
