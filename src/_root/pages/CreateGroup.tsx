import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Users, Clock, Globe, Lock, Plus, ChevronDown, ChevronUp,
  Settings, Star, ListChecks, Layout, Sparkles, AlertTriangle,
  Info, HelpCircle, Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader2 } from '@/components/shared/Loader';
import GroupListCard from '@/components/shared/GroupListCard';
import AddGroupLists from '@/components/shared/AddGroupLists';
import { useUserContext } from '@/context/AuthContext';
import { createGroup, getConnection, getGroup, UpdateGroup } from '@/lib/appwrite/api';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; //
import { useToast } from '@/components/ui/use-toast';

// Types
type InitialState = {
  creator: string;
  header: string;
  title: string;
  lists: any[];
  highlights: any[];
  days?: number;
  votes: "one" | "many";
  public: boolean;
  viewers: any[];
  noOfLists?: number;
};

const initialState: InitialState = {
  creator: "",
  header: "",
  title: "",
  lists: [],
  highlights: [],
  days: undefined,
  votes: "one",
  public: true,
  viewers: [],
  noOfLists: undefined,
};

const CreateGroup = () => {
  // State
  const [groupData, setGroupData] = useState<InitialState>(initialState);
  const [isCreating, setIsCreating] = useState(false);
  const [lists, setLists] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [defaultStructure, setDefaultStructure] = useState(true);
  const [activeTab, setActiveTab] = useState('basics');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  
  // Hooks
  const { user } = useUserContext();
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Effects
  useEffect(() => {
    const fetchGroupData = async () => {
      if (!groupId) return;
      
      try {
        const group = await getGroup(groupId);
        const formattedLists = group.groupLists.map((item: any) => ({
          ...item.lists,
          creator: item.creator,
          groupListId: item.$id,
        }));

        setGroupData({
          creator: group.creator.$id,
          header: group.header,
          title: group.challengeTitle,
          lists: formattedLists,
          highlights: group.highlights,
          days: group.days,
          votes: group.votes,
          public: group.public,
          viewers: group.viewers,
          noOfLists: group.noOfLists,
        });

        setHighlights(group.highlights);
        setLists(formattedLists);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load group data. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchGroupData();
  }, [groupId]);

  useEffect(() => {
    if (!groupId && !isDirty) {
      setGroupData({ ...initialState });
      setLists([]);
    }
  }, [defaultStructure, isDirty, groupId]);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setIsDirty(true);
    
    setGroupData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));

    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!groupData.header.trim()) newErrors.header = "Header is required";
    if (!groupData.title.trim()) newErrors.title = "Challenge title is required";
    if (!groupData.days || groupData.days <= 0) newErrors.days = "Valid duration is required";
    if (defaultStructure && !groupData.noOfLists) newErrors.noOfLists = "Number of lists is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsCreating(true);
    try {
      const viewers = await getViewers();
      const formattedData = await formatGroupData(viewers);
      
      const response = await createGroup(formattedData);
      toast({
        title: "Success",
        description: "Group created successfully!",
      });
      navigate(`/group/${response.$id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !groupId) return;

    setIsCreating(true);
    try {
      const viewers = await getViewers();
      const formattedData = await formatGroupData(viewers);
      
      const listChanges = calculateListChanges();
      await UpdateGroup(
        formattedData,
        listChanges.deletedLists,
        listChanges.addedLists,
        groupId,
        listChanges.remainingLists
      );

      toast({
        title: "Success",
        description: "Group updated successfully!",
      });
      navigate(`/group/${groupId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Helper functions
  const getViewers = async () => {
    if (groupData.public) return [];
    
    const connections = await getConnection(user.id);
    if (!connections[0]) return [];
    
    const follower = connections[0].follower.map((person: any) => person.$id);
    return [...follower, ...connections[0]?.following];
  };

  const formatGroupData = (viewers: string[]) => ({
    ...groupData,
    highlights: highlights.map(item => item.$id),
    viewers,
  });

  const calculateListChanges = () => {
    const prevLists = groupData?.lists?.map((item: any) => item.groupListId) || [];
    const remainingLists = lists
      .filter((item: any) => item.groupListId)
      .map((item: any) => item.groupListId);
    const deletedLists = prevLists.filter(item => !remainingLists.includes(item));
    const addedLists = lists.filter((item: any) => !item.groupListId);

    return { remainingLists, deletedLists, addedLists };
  };

  return (
    <motion.div 
      className="max-w-4xl mx-auto p-6 space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <motion.h1 
          className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          {groupId ? "Update Group" : "Create New Group"}
        </motion.h1>

        {isDirty && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm text-gray-400"
          >
            Unsaved changes
          </motion.div>
        )}
      </div>

      {/* Main Form */}
      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="grid grid-cols-4 gap-4 bg-dark-2 p-2 rounded-xl">
          <TabsTrigger 
            value="basics" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-600"
          >
            <Settings size={18} />
            <span>Basics</span>
          </TabsTrigger>
          <TabsTrigger 
            value="highlights" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-600"
          >
            <Star size={18} />
            <span>Highlights</span>
          </TabsTrigger>
          <TabsTrigger 
            value="structure" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-600"
          >
            <Layout size={18} />
            <span>Structure</span>
          </TabsTrigger>
          <TabsTrigger 
            value="lists" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-600"
          >
            <ListChecks size={18} />
            <span>Lists</span>
          </TabsTrigger>
        </TabsList>

        <form onSubmit={groupId ? handleUpdate : handleSubmit} className="space-y-6">
          {/* Basics Tab */}
          <TabsContent value="basics">
            <motion.div 
              className="space-y-6 bg-dark-2 p-6 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Header Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">
                  Group Header
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="inline ml-2 h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The main title of your group that appears at the top</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </label>
                <input
                  type="text"
                  name="header"
                  className={`w-full p-3 bg-dark-3 rounded-lg border ${
                    errors.header ? 'border-red-500' : 'border-gray-700'
                  } focus:border-purple-500 focus:ring focus:ring-purple-500/20 transition-all`}
                  placeholder="Enter an engaging header for your group"
                  value={groupData.header}
                  onChange={handleInputChange}
                />
                {errors.header && (
                  <p className="text-red-500 text-sm mt-1">{errors.header}</p>
                )}
              </div>

              {/* Challenge Title Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">
                  Challenge Title
                </label>
                <input
                  type="text"
                  name="title"
                  className={`w-full p-3 bg-dark-3 rounded-lg border ${
                    errors.title ? 'border-red-500' : 'border-gray-700'
                  } focus:border-purple-500 focus:ring focus:ring-purple-500/20 transition-all`}
                  placeholder="What's your challenge about?"
                  value={groupData.title}
                  onChange={handleInputChange}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Duration and Votes */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    name="days"
                    min="1"
                    className={`w-full p-3 bg-dark-3 rounded-lg border ${
                      errors.days ? 'border-red-500' : 'border-gray-700'
                    } focus:border-purple-500 focus:ring focus:ring-purple-500/20 transition-all`}
                    placeholder="How many days?"
                    value={groupData.days || ''}
                    onChange={handleInputChange}
                  />
                  {errors.days && (
                    <p className="text-red-500 text-sm mt-1">{errors.days}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Voting System
                  </label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="votes"
                        value="one"
                        checked={groupData.votes === 'one'}
                        onChange={handleInputChange}
                        className="form-radio text-purple-600 focus:ring-purple-500"
                      />
                      <span>Single Vote</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="votes"
                        value="many"
                        checked={groupData.votes === 'many'}
                        onChange={handleInputChange}
                        className="form-radio text-purple-600 focus:ring-purple-500"
                      />
                      <span>Multiple Votes</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Privacy Toggle */}
              <div className="flex items-center justify-between p-4 bg-dark-3 rounded-lg mt-6">
                <div className="flex items-center space-x-4">
                  {groupData.public ? (
                    <Globe className="text-green-500" size={20} />
                  ) : (
                    <Lock className="text-yellow-500" size={20} />
                  )}
                  <div>
                    <h3 className="font-medium">{groupData.public ? 'Public Group' : 'Private Group'}</h3>
                    <p className="text-sm text-gray-400">
                      {groupData.public 
                        ? 'Anyone can view and participate' 
                        : 'Only followers can view and participate'}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="public"
                    className="sr-only peer"
                    checked={groupData.public}
                    onChange={handleInputChange}
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </motion.div>
          </TabsContent>

          {/* Highlights Tab */}
          <TabsContent value="highlights">
            <motion.div
              className="space-y-6 bg-dark-2 p-6 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Sparkles className="text-yellow-500" size={20} />
                    Highlighted Lists
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Feature your favorite lists at the top of your group
                  </p>
                </div>
                <div className="bg-dark-3 px-3 py-1 rounded-full">
                  <span className="text-sm text-gray-400">
                    {highlights.length} selected
                  </span>
                </div>
              </div>

              <AnimatePresence>
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  layout
                >
                  {highlights.map((list, index) => (
                    <motion.div
                      key={list.$id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.1 }}
                      layout
                    >
                      <GroupListCard
                        list={list}
                        RemoveHighlight="remove"
                        setHighlights={setHighlights}
                        highlights={highlights}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {highlights.length === 0 && (
                <motion.div 
                  className="text-center py-10 bg-dark-3 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Star size={40} className="text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-300 font-medium">No highlighted lists yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Add lists you want to feature at the top of your group
                  </p>
                </motion.div>
              )}

              <div className="mt-6">
                <AddGroupLists 
                  setHighlights={setHighlights} 
                  highlights={highlights}
                />
              </div>
            </motion.div>
          </TabsContent>

          {/* Structure Tab */}
          <TabsContent value="structure">
            <motion.div
              className="space-y-6 bg-dark-2 p-6 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Layout className="text-blue-500" size={20} />
                    Group Structure
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Define how your group's lists will be organized
                  </p>
                </div>
              </div>

              {/* Structure Type Selection */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDefaultStructure(true)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    defaultStructure 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <Layout size={24} className="text-purple-500" />
                    {defaultStructure && <Check size={20} className="text-purple-500" />}
                  </div>
                  <h3 className="text-left font-medium mb-2">Fixed Structure</h3>
                  <p className="text-sm text-gray-400 text-left">
                    All lists follow the same title and format
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDefaultStructure(false)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    !defaultStructure 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <Layout size={24} className="text-purple-500" />
                    {!defaultStructure && <Check size={20} className="text-purple-500" />}
                  </div>
                  <h3 className="text-left font-medium mb-2">Flexible Structure</h3>
                  <p className="text-sm text-gray-400 text-left">
                    Lists can have different titles and formats
                  </p>
                </button>
              </div>

              {/* Number of Lists Input (for Fixed Structure) */}
              {(defaultStructure || (!groupId && defaultStructure)) && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-200">
                    Number of Lists
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="inline ml-2 h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>How many lists should be in the challenge?</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <input
                    type="number"
                    name="noOfLists"
                    min="1"
                    className={`mt-1 w-full p-3 bg-dark-3 rounded-lg border ${
                      errors.noOfLists ? 'border-red-500' : 'border-gray-700'
                    } focus:border-purple-500 focus:ring focus:ring-purple-500/20 transition-all`}
                    placeholder="Enter number of lists"
                    value={groupData.noOfLists || ''}
                    onChange={handleInputChange}
                  />
                  {errors.noOfLists && (
                    <p className="text-red-500 text-sm mt-1">{errors.noOfLists}</p>
                  )}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Lists Tab */}
          <TabsContent value="lists">
            <motion.div
              className="space-y-6 bg-dark-2 p-6 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <ListChecks className="text-green-500" size={20} />
                    Challenge Lists
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Manage the lists in your challenge
                  </p>
                </div>
              </div>

              <AnimatePresence>
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  layout
                >
                  {lists.map((list, index) => (
                    <motion.div
                      key={list.$id || index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.1 }}
                      layout
                    >
                      <GroupListCard
                        list={list}
                        btn="remove"
                        lists={lists}
                        setLists={setLists}
                      />
                    </motion.div>
                  ))}

                  {(!defaultStructure || groupId) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="h-full"
                    >
                      <AddGroupLists
                        btn="add"
                        setHighlights={setHighlights}
                        highlights={highlights}
                        lists={lists}
                        setLists={setLists}
                      />
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              {lists.length === 0 && (
                <motion.div 
                  className="text-center py-10 bg-dark-3 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <ListChecks size={40} className="text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-300 font-medium">No lists added yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Start adding lists to your challenge
                  </p>
                </motion.div>
              )}
            </motion.div>
          </TabsContent>

          {/* Submit Button */}
          <motion.div 
            className="sticky bottom-0 bg-gradient-to-t from-dark-1 to-transparent pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              type="submit"
              className={`w-full py-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                isCreating
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              }`}
              disabled={isCreating}
            >
              {isCreating ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" />
                  <span>{groupId ? "Updating..." : "Creating..."}</span>
                </div>
              ) : (
                <span>{groupId ? "Update Group" : "Create Group"}</span>
              )}
            </Button>
          </motion.div>
        </form>
      </Tabs>
    </motion.div>
  );
};

export default CreateGroup;