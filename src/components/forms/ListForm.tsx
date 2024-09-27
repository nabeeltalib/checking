import React, { useState, useEffect, useRef } from "react";
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
import { CollaborateOnList, createNotification, getCategories, updateCategoryUsageCount } from "@/lib/appwrite/api";
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
import Tooltip from "@/components/ui/Tooltip";
import { Info, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { motion } from 'framer-motion';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: generateListItems, isLoading: isGeneratingItems } =
    useGenerateListItems();
  const { mutateAsync: createList, isLoading: isLoadingCreate } =
    useCreateList(user.id);
  const { mutateAsync: updateList, isLoading: isLoadingUpdate } =
    useUpdateList();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
        initialData?.item?.map((item: any) => ({
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
        const sortedCategories = fetchedCategories
          .map((cat) => cat.name)
          .sort();
        setCategories(sortedCategories);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again later.");
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (value: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      let newList;
      if (action === "Update") {
        // Update logic here
      } else {
        newList = await createList({
          ...value,
          userId: user.id,
          CreatedAt: new Date(),
          UpdatedAt: new Date(),
          originalListId: action === "Remix" ? list?.$id : undefined,
        });
  
        if (!newList) {
          toast({ title: `${action} list failed. Please try again.` });
          return;
        }
  
        // Update usageCount for selected categories
        const selectedCategories = value.Categories;
        for (const category of selectedCategories) {
          await updateCategoryUsageCount(category, 1);  // Increment usageCount by 1 for each selected category
        }
  
        await indexList(newList);
        navigate(`/lists/${newList.$id}`);
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing list:`, error);
      toast({
        title: `${action} list failed. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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

  const handleItemCountChange = (count: string) => {
    const newCount = parseInt(count, 10);
    setNumItems(newCount);
    const currentItems = form.getValues("items");
    if (newCount > currentItems.length) {
      const itemsToAdd = newCount - currentItems.length;
      for (let i = 0; i < itemsToAdd; i++) {
        append({ content: "", isVisible: true, id: "", creator: "" });
      }
    } else if (newCount < currentItems.length) {
      const itemsToRemove = currentItems.length - newCount;
      for (let i = 0; i < itemsToRemove; i++) {
        remove(currentItems.length - 1 - i);
      }
    }
  };

  return (
    <Form {...form}>
      {error && (
        <div className="text-red-500 mb-4 p-4 bg-red-100 rounded-md" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Basic Info Section */}
            <FormSection
              title="Basic Info"
              tooltip="Enter a catchy title for your list. Make it descriptive and engaging to attract more viewers!"
            >
              <FormField
                control={form.control}
                name="Title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">What's your title?</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a title e.g. Chicago HS Basketball Players, Innovations That Will Shape the Future"
                        {...field}
                        className="text-sm w-full bg-dark-2 text-light-1 border-none p-3"
                        spellCheck={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            {/* Time & Location Section */}
            <FormSection
              title="Time & Location"
              tooltip="Specify when and where your list is relevant. This helps contextualize your ranking and makes it more discoverable."
              isExpandable
            >
              <FormField
                control={form.control}
                name="timespans"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Any time frame?</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
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
                          </Select>
                          <span className="text-light-2 self-center">or</span>
                          <Input
                            placeholder="Create new e.g. 90s, GOAT"
                            value={newTimespan}
                            onChange={(e) => setNewTimespan(e.target.value)}
                            className="text-sm w-full md:w-[220px] bg-dark-2 text-light-1 border-none"
                            spellCheck={true}
                          />
                          <Button
                            type="button"
                            onClick={handleAddTimespan}
                            className="bg-primary-500 text-white hover:bg-primary-600">
                            Add Timespan
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((timespan, index) => (
                            <Chip
                              key={index}
                              label={timespan}
                              onRemove={() => {
                                const newTimespans = field.value.filter((_, i) => i !== index);
                                field.onChange(newTimespans);
                              }}
                            />
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
                    <FormLabel className="text-lg font-semibold">Any location?</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
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
                          </Select>
                          <span className="text-light-2 self-center">or</span>
                          <Input
                            placeholder="Create new e.g. East, Worldwide"
                            value={newLocation}
                            onChange={(e) => setNewLocation(e.target.value)}
                            className="text-sm w-full md:w-[220px] bg-dark-2 text-light-1 border-none"
                            spellCheck={true}
                          />
                          <Button
                            type="button"
                            onClick={handleAddLocation}
                            className="bg-primary-500 text-white hover:bg-primary-600">
                            Add Location
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((location, index) => (
                            <Chip
                              key={index}
                              label={location}
                              onRemove={() => {
                                const newLocations = field.value.filter((_, i) => i !== index);
                                field.onChange(newLocations);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            {/* List Items Section */}
            <FormSection
              title="List Items"
              tooltip="Add your ranked items here. You can drag and drop to reorder them. The more specific and unique your items, the better!"
            >
              <FormItem>
                <FormLabel className="text-lg font-semibold">How long is your ranking?</FormLabel>
                <div className="flex gap-2">
                  {[3, 5, 10].map((count) => (
                    <Button
                      key={count}
                      type="button"
                      onClick={() => handleItemCountChange(count.toString())}
                      className={`text-sm px-4 py-2 rounded-md ${
                        form.getValues("items").length === count
                          ? "bg-primary-500 text-white"
                          : "bg-dark-4 text-light-2 hover:bg-dark-3"
                      }`}
                    >
                      Top {count}
                    </Button>
                  ))}
                </div>
              </FormItem>

              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-light-2">Based on your title, time frame, or location details</span>
                <Button
                  type="button"
                  onClick={handleGenerateListItems}
                  disabled={isGeneratingItems}
                  className="bg-primary-500 text-white hover:bg-primary-600 text-sm px-4 py-2 rounded-md"
                >
                  {isGeneratingItems ? "Generating..." : "Get AI Item Suggestions"}
                </Button>
              </div>

              {showUndoButton && (
                <Button
                  type="button"
                  onClick={handleUndo}
                  className="w-full mt-2 bg-dark-4 text-light-1 hover:bg-dark-3"
                >
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
                      <div className="flex items-center mb-2 bg-dark-3 p-3 rounded-md">
                        <GripVertical className="mr-2 text-light-3" size={20} />
                        <FormField
                          control={form.control}
                          name={`items.${index}.content`}
                          render={({ field }) => (
                            <FormItem className="flex-grow mr-2">
                              <FormControl>
                                <Input
                                  placeholder={`Enter #${index + 1} ranked item`}
                                  {...field}
                                  className="text-sm w-full bg-dark-2 text-light-1 border-none"
                                  spellCheck={true}
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
                  className="mt-4 bg-dark-4 text-light-1 hover:bg-dark-3"
                >
                  Add Row
                </Button>
              )}
            </FormSection>

            {/* Additional Details Section */}
            <FormSection
              title="Additional Details"
              tooltip="Tags: Add relevant keywords to help others find your list. Categories: Choose or create a general topic for your list. Public/Private: Decide who can see your list."
              isExpandable
            >
              <FormField
                control={form.control}
                name="Tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Tags</FormLabel>
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
                        className="text-sm w-full bg-dark-2 text-light-1 border-none"
                        spellCheck={true}
                      />
                    </FormControl>
                    <FormDescription className="text-light-3">
                      Add keywords to help others find your list
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
                    <FormLabel className="text-lg font-semibold">Categories</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
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
                                    className="bg-dark-4 text-light-1 border-none hover:bg-dark-3"
                                  >
                                    {category}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <span className="text-light-2 self-center">or</span>
                          <Input
                            placeholder="Create new category"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="text-sm w-full md:w-[180px] bg-dark-2 text-light-1 border-none"
                            spellCheck={true}
                          />
                          <Button
                            type="button"
                            onClick={handleAddCategory}
                            className="bg-primary-500 text-white hover:bg-primary-600">
                            Add Category
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((category, index) => (
                            <Chip
                              key={index}
                              label={category}
                              onRemove={() => {
                                const newCategories = field.value.filter((_, i) => i !== index);
                                field.onChange(newCategories);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription className="text-light-3">
                      Choose or create a general topic for your list
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />  
              <FormField
                control={form.control}
                name="Public"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="w-4 h-4"
                      />
                    </FormControl>
                    <div>
                      <FormLabel className="text-lg font-semibold">Public</FormLabel>
                      <FormDescription className="text-light-3">
                        Uncheck this if you want to make your list private
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </FormSection>

            {/* Description Section */}
            <FormSection
              title="Description"
              tooltip="Provide more context about your list. Explain your ranking criteria or add interesting facts about your chosen topic."
              isExpandable
            >
              <FormField
                control={form.control}
                name="Description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a description for your list"
                        {...field}
                        className="w-full bg-dark-2 text-light-1 border-none min-h-[100px] p-3"
                        spellCheck={true}
                      />
                    </FormControl>
                    <FormDescription className="text-light-3">
                      Explain your ranking criteria or add interesting facts (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>
          </div>

          {/* Preview Section */}
          <div className="space-y-8">
            <div className="sticky top-4">
              <h2 className="text-2xl font-bold text-light-1 mb-4">List Preview</h2>
              <div className="bg-dark-3 p-6 rounded-lg shadow-lg">
                <ListPreview
                  title={form.watch("Title")}
                  items={form.watch("items")}
                  description={form.watch("Description")}
                  categories={form.watch("Categories")}
                  tags={form.watch("Tags")}
                  timespans={form.watch("timespans")}
                  locations={form.watch("locations")}
                  username={form.watch("Username") || "defaultUsername"}
                  name={form.watch("Name") || "defaultName"}
                  followers={form.watch("Followers") || 0}
                  following={form.watch("Following") || 0}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Section */}
      <div className="flex justify-end gap-4 mt-8">
        <Button
          type="button"
          className="bg-dark-4 text-light-1 hover:bg-dark-3"
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-primary-500 text-white hover:bg-primary-600"
          disabled={isSubmitting}
        >
          {action === "Remix" ? "Create Remixed List" : `${action} List`}
        </Button>
      </div>
    </form>

    {/* Enhanced Loading Overlay */}
    {isSubmitting && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-dark-1 bg-opacity-80 flex items-center justify-center z-50"
      >
        <div className="text-center">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              times: [0, 0.5, 1],
              repeat: Infinity,
            }}
            className="w-20 h-20 mb-4 mx-auto"
          >
            <svg className="w-full h-full" viewBox="0 0 50 50">
              <circle
                cx="25"
                cy="25"
                r="20"
                stroke="#3B82F6"
                strokeWidth="4"
                fill="none"
                strokeDasharray="31.4 31.4"
              >
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  from="0 25 25"
                  to="360 25 25"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </motion.div>
          <h2 className="text-2xl font-bold text-light-1 mb-2">Creating Your List</h2>
          <p className="text-light-2 mb-4">Please wait while we add your awesome list to the system.</p>
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            className="text-primary-500 text-sm"
          >
            This may take a few moments...
          </motion.div>
        </div>
      </motion.div>
    )}

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

// Utility Components

const FormSection: React.FC<{
  title: string;
  children: React.ReactNode;
  tooltip: string;
  isExpandable?: boolean;
}> = ({ title, children, tooltip, isExpandable = false }) => {
  const [isExpanded, setIsExpanded] = useState(!isExpandable);
  const sectionRef = useRef<HTMLDivElement>(null);

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isExpandable) {
      setIsExpanded(!isExpanded);
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  };

  return (
    <div className="bg-dark-2 p-6 rounded-lg shadow-md" ref={sectionRef}>
      <div
        className={`flex items-center justify-between mb-4 ${isExpandable ? 'cursor-pointer' : ''}`}
        onClick={toggleExpand}
      >
        <Tooltip content={tooltip}>
          <h2 className="text-xl font-bold text-light-1 flex items-center">
            {title}
            <Info size={16} className="ml-2 text-light-3" />
          </h2>
        </Tooltip>
        {isExpandable && (
          <Button variant="ghost" size="sm">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </Button>
        )}
      </div>
      {(!isExpandable || isExpanded) && <div className="space-y-6">{children}</div>}
    </div>
  );
};

const Chip: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <div className="bg-gray-800 text-white px-3 py-1 rounded-full flex items-center text-sm">
    {label}
    <button
      type="button"
      onClick={onRemove}
      className="ml-2 focus:outline-none"
    >
      ×
    </button>
  </div>
);

export default ListForm;