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
import { 
  addListToGroupChallenge, 
  CollaborateOnList, 
  createNotification, 
  getCategories, 
  trackEngagement,
  updateCategoryUsageCount 
} from "@/lib/appwrite/api";
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
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { X, Info, ChevronDown, ChevronUp, GripVertical, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FormSection } from "./FormSection";

// Type definitions
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
    <div className="flex flex-wrap items-center gap-2 p-3 bg-dark-4 rounded-lg border border-gray-700 focus-within:border-primary-500 transition-all duration-300">
      <motion.div
        className="flex flex-wrap items-center gap-2 p-3 bg-dark-4 rounded-lg 
          border border-gray-700 focus-within:border-primary-500 transition-all duration-300"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {tags.map(tag => (
          <motion.div
            key={tag}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center bg-gradient-to-r from-primary-500 to-primary-600 
              text-white px-3 py-1.5 rounded-full text-sm shadow-sm hover:shadow-md 
              transition-all duration-300"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-2 hover:text-red-300 transition-colors duration-200"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </motion.div>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onBlur={addTag}
        placeholder="Add tags..."
        className="flex-grow bg-transparent border-none text-light-1 focus:outline-none text-sm placeholder-gray-500"
      />
    </div>
  );
};

const MultiSelect: React.FC<{
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  onAdd: (newItem: string) => void;
  placeholder: string;
}> = ({ options, selected, onChange, onAdd, placeholder }) => {
  const [inputValue, setInputValue] = useState("");
  const uniqueOptions = Array.from(new Set(options));

  const handleSelect = (e: React.MouseEvent, item: string) => {
    e.preventDefault();
    if (selected.includes(item)) {
      onChange(selected.filter((i) => i !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 p-4 bg-dark-3 rounded-lg min-h-[100px] border border-gray-700">
        {uniqueOptions.map((item, index) => (
          <motion.button
            key={`${item}-${index}`}
            onClick={(e) => handleSelect(e, item)}
            type="button"
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              selected.includes(item)
                ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md"
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
          className="flex-grow bg-dark-4 text-light-1 border-none focus:ring-2 focus:ring-primary-500"
        />
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (inputValue.trim()) {
              onAdd(inputValue.trim());
              setInputValue("");
            }
          }}
          className="bg-primary-500 text-white hover:bg-primary-600 transition-colors"
        >
          Add New
        </Button>
      </div>
    </div>
  );
};

const ListForm = ({ list, action, initialData, title, groupId }: any) => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [newTimespan, setNewTimespan] = useState("");

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
    engagementScore: z.number().optional(),
    trendingScore: z.number().optional(),
    qualityScore: z.number().optional(),
    rankingPosition: z.number().optional(),
    lastActiveTimestamp: z.string().optional(),
    rankingChange: z.number().optional(),
    trending: z.boolean().optional(),
    debateCount: z.number().optional(),
    viewCount: z.number().optional(),
    trendingCategory: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Title: title || initialData?.Title || list?.Title || "",
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
  const trackFormEngagement = async () => {
    if (user?.id) {
      try {
        await trackEngagement({
          userId: user.id,
          action: 'form_view',
          route: '/create-list',
          source: 'web',
          timestamp: new Date().toISOString(),
          quality: 1, // Base quality score for viewing form
          impact: 1 // Base impact score for viewing form
        });
      } catch (error) {
        console.error('Error tracking form engagement:', error);
      }
    }
  };

  trackFormEngagement();
}, [user?.id]);

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
  if (!value.Title || value.items.length < 3) {
    toast({
      title: "Form not ready",
      description: "Please ensure you have a title and at least 3 list items before submitting.",
      variant: "destructive",
    });
    return;
  }

  setIsSubmitting(true);
  try {
    const newList = await createList({
      ...value,
      userId: user.id,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
      engagementScore: 0,
      trendingScore: 0,
      qualityScore: 0,
      rankingPosition: 0,
      lastActiveTimestamp: new Date().toISOString(),
      rankingChange: 0,
      trending: false,
      debateCount: 0,
      viewCount: 0
    });

    if (newList) {
      // Track list creation engagement
      await trackEngagement({
        userId: user.id,
        action: 'create_list',
        route: '/create-list',
        source: 'form_submission',
        listId: newList.$id,
        quality: 5, // Higher quality score for list creation
        impact: 5, // Higher impact score for list creation
        timestamp: new Date().toISOString()
      });

      // Track general user engagement
      await trackGeneralEngagement({
        userId: user.id,
        action: 'create_list',
        metadataPage: 'create_list',
        metadataPlatform: 'web',
        metadataDuration: 0,
        metadataTimestamp: new Date().toISOString()
      });

      // Update category metrics
      const selectedCategories = value.Categories || [];
      for (const category of selectedCategories) {
        await updateCategoryUsageCount(category, 1);
      }

      // Index list for search with engagement metrics
      await indexList({
        ...newList,
        engagementScore: 0,
        trendingScore: 0,
        qualityScore: 0
      });

      if (groupId) {
        await addListToGroupChallenge(newList, groupId);
        navigate(`/group/${groupId}`);
      } else {
        navigate(`/lists/${newList.$id}`);
      }
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
        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-lg mb-6"
              role="alert"
            >
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

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
                        disabled={title && title.length > 0}
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
              className="group relative overflow-hidden bg-gradient-to-r from-primary-500 
                to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white 
                transition-all duration-300"
            >
              <motion.div
                animate={isGeneratingItems ? { rotate: 360 } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 
                  to-transparent -translate-x-full group-hover:translate-x-full transition-transform 
                  duration-1000"
              />
              <div className="flex items-center gap-2">
                <Sparkles className={`${isGeneratingItems ? 'animate-spin' : ''}`} />
                {isGeneratingItems ? "Generating..." : "Get AI Suggestions"}
              </div>
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
                <div className="relative group">
                  <FormField
                    control={form.control}
                    name={`items.${index}.content`}
                    render={({ field }) => (
                      <FormItem className="flex-grow mr-2">
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3">
                              <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                                #{index + 1}
                              </span>
                            </div>
                            <Input
                              placeholder={`Enter #${index + 1} ranked item`}
                              {...field}
                              className="pl-12 text-md w-full bg-dark-2 text-light-1 border-none 
                                focus:ring-2 focus:ring-primary-500 transition-all duration-300 
                                hover:bg-dark-3"
                              spellCheck={true}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <GripVertical className="text-gray-400" />
                  </div>
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
                userImageUrl={user.imageUrl}
                username={user.username}
                engagementStats={{
                  bookmarkCount: 0,
                  sharesCount: 0,
                  views: 0,
                  likesCount: 0,
                  dislikesCount: 0,
                  debateCount: 0,
                }}
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center 
          justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-dark-2 p-8 rounded-xl shadow-2xl max-w-md w-full mx-4"
        >
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity }
              }}
              className="w-16 h-16 mb-4"
            >
              <svg className="w-full h-full" viewBox="0 0 50 50">
                <circle
                  cx="25" cy="25" r="20"
                  className="stroke-primary-500"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="94.2477796076938 31.415926535897932"
                />
              </svg>
            </motion.div>
            <h3 className="text-xl font-bold text-light-1 mb-2">
              Creating Your List
            </h3>
            <p className="text-light-2 text-center mb-4">
              Almost there! Your list is being prepared...
            </p>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-primary-500 text-sm"
            >
              Just a moment...
            </motion.div>
          </div>
        </motion.div>
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

export default ListForm;