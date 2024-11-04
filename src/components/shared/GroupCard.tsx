import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Share2, ThumbsUp, MessageCircle, ChevronDown, ChevronUp,
  Crown, Plus, Users, Sparkles, Calendar, Lock, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const GroupCard = ({ group, onVote, currentUser, onComment }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const navigate = useNavigate();

  // Social stats
  const totalVotes = group.groupLists?.reduce((acc, list) => acc + (list.votes?.length || 0), 0);
  const totalParticipants = group.groupLists?.length || 0;
  const daysRemaining = Math.max(0, Math.ceil((new Date(group.endDate) - new Date()) / (1000 * 60 * 60 * 24)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl overflow-hidden mb-6"
    >
      {/* Header Section */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-0.5 rounded-full">
              <img 
                src={group.creator?.ImageUrl || "/assets/icons/profile-placeholder.svg"}
                className="w-12 h-12 rounded-full border-2 border-white"
                alt="Creator"
              />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">{group.creator?.Name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>{new Date(group.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span className="flex items-center">
                  {group.isPublic ? <Globe size={14} /> : <Lock size={14} />}
                </span>
              </div>
            </div>
          </div>
          
          <Button variant="ghost" className="hover:bg-gray-700">
            <Share2 size={20} className="text-gray-400" />
          </Button>
        </div>

        {/* Challenge Title */}
        <div className="space-y-2">
          <motion.h2 
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {group.challengeTitle}
          </motion.h2>
          <p className="text-gray-300">{group.header}</p>
        </div>

        {/* Challenge Stats */}
        <div className="flex space-x-6 mt-4 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <Users size={16} />
            <span>{totalParticipants} participants</span>
          </div>
          <div className="flex items-center space-x-2">
            <ThumbsUp size={16} />
            <span>{totalVotes} votes</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar size={16} />
            <span>{daysRemaining} days left</span>
          </div>
        </div>
      </div>

      {/* Lists Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {group.groupLists?.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start space-x-3">
                <img
                  src={item.creator?.ImageUrl || "/assets/icons/profile-placeholder.svg"}
                  className="w-10 h-10 rounded-full"
                  alt={item.creator?.Name}
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{item.lists.Title}</h4>
                  <p className="text-sm text-gray-400">by {item.creator?.Name}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onVote(item.$id)}
                  className={`${
                    item.votes?.includes(currentUser.id)
                      ? 'text-blue-400'
                      : 'text-gray-400'
                  }`}
                >
                  <ThumbsUp size={16} />
                  <span className="ml-1">{item.votes?.length || 0}</span>
                </Button>
              </div>
            </motion.div>
          ))}

          {/* Add List Button */}
          {group.noOfLists && group.groupLists?.length < group.noOfLists && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-4 flex items-center justify-center cursor-pointer"
              onClick={() => navigate(`/create-list/${group.challengeTitle}/${group.$id}`)}
            >
              <div className="text-center">
                <Plus size={24} className="mx-auto mb-2 text-white" />
                <span className="text-white font-medium">Add Your List</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Comments Section */}
        <div className="mt-6">
          <Button 
            variant="ghost" 
            className="w-full flex justify-between items-center py-2"
            onClick={() => setShowComments(!showComments)}
          >
            <span className="flex items-center">
              <MessageCircle size={20} className="mr-2" />
              Comments ({group.comments?.length || 0})
            </span>
            {showComments ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </Button>

          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 space-y-4"
              >
                {/* Comment components would go here */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default GroupCard;