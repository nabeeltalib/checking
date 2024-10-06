import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGetUserLists } from '@/lib/react-query/queries';
import { useUserContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import GridListList from '@/components/shared/GridListList';
import { Loader } from '@/components/shared';
import { Plus, Search, Filter, TrendingUp, Calendar, ThumbsUp } from 'lucide-react';

const MyRankings: React.FC = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const { data: userLists, isLoading } = useGetUserLists(user.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filteredLists, setFilteredLists] = useState(userLists || []);

  useEffect(() => {
    if (userLists) {
      let sorted = [...userLists];
      if (sortBy === 'popular') {
        sorted.sort((a, b) => (b.Likes?.length || 0) - (a.Likes?.length || 0));
      } else if (sortBy === 'recent') {
        sorted.sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime());
      }
      setFilteredLists(sorted.filter(list => 
        list.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        list.Tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      ));
    }
  }, [userLists, searchTerm, sortBy]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const listVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) return <Loader />;

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-light-1">My Rankings</h1>
        {/*<Button 
          onClick={() => navigate('/create-list')}
          className="bg-primary-500 hover:bg-primary-600 text-white rounded-full px-6 py-2 flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Create New Ranking
        </Button>*/}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <div className="relative w-full md:w-1/3">
          <Input
            type="text"
            placeholder="Search your rankings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-dark-3 text-light-1 rounded-full"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-3" size={20} />
        </div>
       {/*} <div className="flex items-center space-x-4">
          <Filter size={20} className="text-light-3" />
          <Select
            value={sortBy}
            onValueChange={setSortBy}
            className="bg-dark-3 text-light-1 rounded-full"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
          </Select>
        </div>*/}
      </div>

      <AnimatePresence>
        {filteredLists.length > 0 ? (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ staggerChildren: 0.1 }}
          >
            <GridListList 
              lists={filteredLists}
              showUser={false}
              itemClassName="bg-dark-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            />
          </motion.div>
        ) : (
          <motion.p
            variants={listVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="text-center text-light-3 mt-8"
          >
            No rankings found. Start creating your first ranking!
          </motion.p>
        )}
      </AnimatePresence>

      {filteredLists.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Button className="bg-dark-3 text-light-1 hover:bg-dark-4 rounded-full px-6 py-2">
            Load More
          </Button>
        </div>
      )}

      <motion.div 
        className="fixed bottom-8 right-8 flex flex-col space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button className="bg-secondary-500 hover:bg-secondary-600 text-white rounded-full p-3">
          <TrendingUp size={24} />
        </Button>
        <Button className="bg-primary-500 hover:bg-primary-600 text-white rounded-full p-3">
          <Calendar size={24} />
        </Button>
        <Button className="bg-accent-500 hover:bg-accent-600 text-white rounded-full p-3">
          <ThumbsUp size={24} />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default MyRankings;