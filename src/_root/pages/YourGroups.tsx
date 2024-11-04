import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Filter,
  AlertCircle,
  RefreshCcw,
  Loader as LoaderIcon,
  FolderPlus
} from 'lucide-react';
import { useUserContext } from '@/context/AuthContext';
import { getYourGroups } from '@/lib/appwrite/api';
import { Loader } from '@/components/shared';
import Group from '@/components/shared/Group';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const YourGroups = () => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const [groups, setGroups] = useState<any[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchGroups = async (showToast = false) => {
    setIsFetching(true);
    setError(null);
    
    try {
      const data = await getYourGroups(user.id);
      setGroups(data);
      setFilteredGroups(data);
      
      if (showToast) {
        toast({
          title: "Groups Refreshed",
          description: "Your groups have been updated.",
        });
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      setError("Failed to load your groups. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load your groups. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user.id]);

  useEffect(() => {
    const filtered = groups.filter(group =>
      group.header.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.challengeTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime();
        case 'popular':
          return (b.groupLists?.length || 0) - (a.groupLists?.length || 0);
        case 'alphabetical':
          return a.header.localeCompare(b.header);
        default:
          return 0;
      }
    });

    setFilteredGroups(sorted);
  }, [groups, searchTerm, sortBy]);

  const handleRetry = async () => {
    setIsRetrying(true);
    await fetchGroups(true);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Your Groups</h1>
          <p className="text-gray-400">
            Manage and participate in your created and joined groups
          </p>
        </div>
        
        <Link to="/create-group">
          <Button className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600">
            <Plus size={20} className="mr-2" />
            Create Group
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <motion.div 
        className="bg-dark-2 rounded-xl p-4 mb-8 flex flex-wrap gap-4 items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex-grow max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px] bg-dark-3">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => fetchGroups(true)}
          disabled={isFetching}
        >
          <RefreshCcw
            size={20}
            className={`${isFetching ? 'animate-spin' : ''}`}
          />
        </Button>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isFetching ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <Loader />
            <p className="text-gray-400 mt-4">Loading your groups...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-dark-2 rounded-xl p-8 text-center"
          >
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isRetrying ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Try Again
                </>
              )}
            </Button>
          </motion.div>
        ) : filteredGroups.length > 0 ? (
          <motion.div
            key="groups"
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {filteredGroups.map((item, index) => (
              <motion.div key={item.$id || index} variants={item}>
                <Group group={item} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-dark-2 rounded-xl p-12 text-center"
          >
            <FolderPlus className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Groups Found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm
                ? "No groups match your search criteria"
                : "You haven't created or joined any groups yet"}
            </p>
            <Link to="/create-group">
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus size={20} className="mr-2" />
                Create Your First Group
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default YourGroups;