import React, { useState, useEffect, KeyboardEvent, useRef } from "react";
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
import { X, Info, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { motion } from 'framer-motion';
interface TagInputProps {
  tags: string[];
  onTagsChange: (newTags: string[]) => void;
}

const TagInput: React.FC<TagInputProps> = ({ tags, onTagsChange }) => {
  const [input, setInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmedInput = input.trim();
    if (trimmedInput && !tags.includes(trimmedInput)) {
      onTagsChange([...tags, trimmedInput]);
      setInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-dark-4 rounded-md">
      {tags.map(tag => (
        <div key={tag} className="flex items-center bg-primary-500 text-white px-2 py-1 rounded-full text-sm">
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="ml-1 focus:outline-none"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onBlur={addTag}
        placeholder="Add tags..."
        className="flex-grow bg-transparent border-none text-light-1 focus:outline-none text-sm"
      />
    </div>
  );
};

// New component for multi-select functionality
const MultiSelect: React.FC<{
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  onAdd: (newItem: string) => void;
  placeholder: string;
}> = ({ options, selected, onChange, onAdd, placeholder }) => {
  const [inputValue, setInputValue] = useState("");

  // Ensure options are unique
  const uniqueOptions = Array.from(new Set(options));

  const handleSelect = (e: React.MouseEvent, item: string) => {
    e.preventDefault(); // Prevent form submission
    if (selected.includes(item)) {
      onChange(selected.filter((i) => i !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  const handleAddNew = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    if (inputValue && !uniqueOptions.includes(inputValue)) {
      onAdd(inputValue);
      onChange([...selected, inputValue]);
      setInputValue("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-2 bg-dark-3 rounded-md min-h-[100px]">
        {uniqueOptions.map((item, index) => (
          <motion.button
            key={`${item}-${index}`} // Ensure unique key by combining item and index
            onClick={(e) => handleSelect(e, item)}
            type="button" // Explicitly set button type to "button"
            className={`px-3 py-1 rounded-full text-sm ${
              selected.includes(item)
                ? "bg-blue-800 text-white"
                : "bg-dark-4 text-light-2 hover:bg-dark-2"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {item}
          </motion.button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="flex-grow bg-dark-4 text-light-1 border-none"
        />
        <Button
          type="button" // Explicitly set button type to "button"
          onClick={handleAddNew}
          className="text-xs bg-primary-500 text-white hover:bg-primary-600"
        >
          Add New
        </Button>
      </div>
    </div>
  );
};


const ListForm = ({ list, action, initialData }: any) => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [timespans, setTimespans] = useState<string[]>([
    "All-time", "Decade", "This year", "For now"
  ]);
  const [locations, setLocations] = useState<string[]>([
    "United States", "Los Angeles", "South America", "Brooklyn", "Hyde Park", "Hillcrest HS"
  ]);
  const [newLocation, setNewLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<any[]>([]);
  const [previousItems, setPreviousItems] = useState<any[]>([]);
  const [showUndoButton, setShowUndoButton] = useState(false);
  const [friendsLists, setFriendsLists] = useState<any[]>([]);
  const [numItems, setNumItems] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: generateListItems, isLoading: isGeneratingItems } = useGenerateListItems();
  const { mutateAsync: createList, isLoading: isLoadingCreate } = useCreateList(user.id);
  const { mutateAsync: updateList, isLoading: isLoadingUpdate } = useUpdateList();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const formSchema = z.object({
    Title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
    Description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
    items: z.array(
      z.object({
        content: z.string().min(1, "Item cannot be empty"),
        isVisible: z.boolean(),
        creator: z.string().nullable().default(null),
        id: z.string().nullable().default(null),
      })
    ).min(3, "At least 3 items are required").max(10, "Maximum 10 items allowed"),
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
      items: initialData?.item?.map((item: any) => ({
        content: item.content,
        isVisible: true,
        creator: item?.creator?.$id,
        id: item?.$id,
      })) || list?.item?.map((item: any) => ({
        content: item.content,
        isVisible: true,
        creator: item?.creator?.$id,
        id: item?.$id,
      })) || Array(numItems).fill({ content: "", isVisible: true }),
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
        // Extract category names
        const categoryNames = fetchedCategories.map((cat) => cat.name);
        // Remove duplicates using a Set
        const uniqueCategories = Array.from(new Set(categoryNames)).sort();
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again later.");
      }
    };
  
    fetchData();
  }, []);
  const handleSubmit = async (value: z.infer<typeof formSchema>) => {
    // Check if the form is actually ready to be submitted
    if (!value.Title || value.items.length < 3) {
      toast({
        title: "Form not ready",
        description: "Please ensure you have a title and at least 3 list items before submitting.",
        variant: "destructive",
      });
      return; // Exit early if the form is not ready to be submitted
    }
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
          await updateCategoryUsageCount(category, 1);
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
    const locations = form.getValues("locations");
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
      onError: (error) => {
        console.error("Error generating list items:", error);
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
      description: "Items have been generated based on your title, locations, and timespans.",
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {error && (
          <div className="text-red-500 mb-4 p-4 bg-red-100 rounded-md" role="alert">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Basic Info Section */}
            <FormSection
              title="Step 1: Let's Start Your List*"
              tooltip="Enter a catchy title for your list. Make it descriptive and engaging to attract more viewers!"
            >
              <FormField
                control={form.control}
                name="Title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-light">What's your title?</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Top 5 Pizza Spots in Chicago, Most Underrated 90s Movies"
                        {...field}
                        className="text-md w-full bg-dark-4 text-light-1 border-none p-3"
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
              title="Step 2: Set the Scene (optional)"
              tooltip="Specify when and where your list is relevant. This helps contextualize your ranking and makes it more discoverable."
              isExpandable
            >
              <FormField
                control={form.control}
                name="timespans"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-light">When does this list apply?</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={timespans}
                        selected={field.value}
                        onChange={field.onChange}
                        onAdd={(newTimespan) => {if (newTimespan && !timespans.includes(newTimespan)) {
                          setTimespans([...timespans, newTimespan]);
                        }
                      }}
                      placeholder="Add a new timespan e.g. 90s, GOAT"
                    />
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
                  <FormLabel className="text-lg font-light">Where does this list focus on?</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={locations}
                      selected={field.value}
                      onChange={field.onChange}
                      onAdd={(newLocation) => {
                        if (newLocation && !locations.includes(newLocation)) {
                          setLocations([...locations, newLocation]);
                        }
                      }}
                      placeholder="Add a new location e.g. East, Worldwide"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          {/* List Items Section */}
          <FormSection
          title="Step 3: Rank Your Top Picks*"
          tooltip="Add your ranked items here. You can drag and drop to reorder them. The more specific and unique your items, the better!"
        >
          <FormItem>
            <FormLabel className="text-lg font-light">How deep does your ranking go?</FormLabel>
            <div className="flex gap-2">
              {[3, 5, 10].map((count) => (
                <Button
                  key={count}
                  type="button"
                  onClick={() => handleItemCountChange(count.toString())}
                  className={`text-sm px-4 py-2 rounded-md ${
                    form.getValues("items").length === count
                      ? "bg-gray-500 text-white"
                      : "bg-dark-4 text-light-2 hover:bg-dark-3"
                  }`}
                >
                  Top {count}
                </Button>
              ))}
            </div>
          </FormItem>         
          <div className="flex justify-between items-center mt-8 mb-8">
            {/*<span className="text-pretty text-[11px] text-gray-400 ml-8">Need ideas? Get AI-powered suggestions for list items based on your title, time frame, or location details</span>*/}
            <Button
              type="button"
              onClick={handleGenerateListItems}
              disabled={isGeneratingItems}
              className="bg-primary-500 text-white hover:bg-primary-600 text-sm px-4 py-2 rounded-md"
            >
              {isGeneratingItems ? "Generating..." : "Get item suggestions"}
            </Button>         
            <p className="text-xs  ml-5 text-gray-400 mb-4">Based on your title, timespan or location.</p>

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
              <SortableItem key={field.id} id={field.id} onDelete={() => remove(index)}>
                <div className="flex-grow flex items-center">
                  <FormField
                    control={form.control}
                    name={`items.${index}.content`}
                    render={({ field }) => (
                      <FormItem className="flex-grow mr-2">
                        <FormControl>
                          <Input
                            placeholder={`Enter #${index + 1} ranked item`}
                            {...field}
                            className="text-sm w-full bg-dark-2 text-light-1 border-none "
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
            title="Step 4: Fine-tune Your List"
            tooltip="Tags: Add relevant keywords to help others find your list. Categories: Choose or create a general topic for your list. Public/Private: Decide who can see your list."
            isExpandable
          >
            <FormField
              control={form.control}
              name="Tags"
              render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Add keywords to help others discover your list</FormLabel>
                <FormControl>
                  <TagInput
                    tags={field.value}
                    onTagsChange={(newTags) => field.onChange(newTags)}
                  />
                </FormControl>
                <FormDescription className="text-light-3">
                  Add keywords to help others find your list. Press Enter or comma to add a tag.
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
                  <FormLabel className="text-lg font-semibold">Choose the perfect category for your list</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={categories}
                      selected={field.value}
                      onChange={field.onChange}
                      onAdd={handleAddCategory}
                      placeholder="Add a new category"
                    />
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
                    <FormLabel className="text-lg font-semibold">Share with the world or keep it personal</FormLabel>
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
            title="Tell the Story Behind Your Ranking (optional)"
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
                      className="w-full bg-dark-4 text-light-1 border-none min-h-[100px] p-3"
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
            <h2 className="text-xl font-thin text-gray-400 mb-4">Your Preview</h2>
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
      {/*<p className="italic text-md font-thin text-blue-300 mb-4">Remember, there are no wrong answers – just opinions waiting to be challenged!</p>*/}

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
        <h2 className="text-xl font-thin text-light-1 flex items-center">
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