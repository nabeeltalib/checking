import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases, appwriteConfig } from '@/lib/appwrite/config';
import { Loader } from '@/components/shared';
import { IList } from '@/types';
import { AppwriteException } from 'appwrite';
import { motion } from 'framer-motion';
import { Share2, ThumbsUp, ThumbsDown, MessageCircle, Bookmark, Wand, MapPin, Clock, Crown, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import SignInDialog from '@/components/shared/SignInDialog';
import { useUserContext } from "@/context/AuthContext";

const SharedListView: React.FC = () => {
  const { sharedId } = useParams<{ sharedId: string }>();
  const [list, setList] = useState<IList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useUserContext();

  useEffect(() => {
    const fetchSharedList = async () => {
      if (!sharedId) {
        setError('No shared ID provided');
        setLoading(false);
        return;
      }

      try {
        const sharedLink = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.sharedLinksCollectionId,
          sharedId
        );

        if (new Date(sharedLink.expiresAt) < new Date()) {
          throw new Error('This shared link has expired');
        }

        const listData = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.listCollectionId,
          sharedLink.listId
        );
        setList(listData as IList);
      } catch (err) {
        console.error('Error fetching shared list:', err);
        if (err instanceof AppwriteException) {
          setError(`Appwrite error: ${err.message} (Code: ${err.code})`);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSharedList();
  }, [sharedId]);

  const handleAuthRequiredAction = () => {
    if (user?.id) {
      navigate(`/lists/${list?.$id}`);
    } else {
      setIsSignInDialogOpen(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: list?.Title || 'Shared List',
          text: 'Check out this list!',
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "The list link has been copied to your clipboard.",
      });
    }
  };

  const handleItemClick = () => {
    if (user?.id) {
      navigate(`/lists/${list?.$id}`);
    } else {
      setIsSignInDialogOpen(true);
    }
  };

  const renderListItems = () => {
    if (!list || !list.items) return null;

    const items: any[] = Array.isArray(list.items)
      ? list.items
      : typeof list.items === "string"
      ? list.items.split("\n")
      : Object.values(list.items);

    const displayItems = isExpanded ? items : items.slice(0, 5);

    return displayItems.map((item, index) => (
      <motion.li
        key={index}
        className="flex items-center mb-2 bg-gray-900 rounded-md p-1 hover:bg-gray-700 transition-colors duration-300 cursor-pointer"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        onClick={handleItemClick}
      >
        <div className={`flex-shrink-0 w-8 h-8 ${getRankColor(index)} flex items-center justify-center font-bold mr-3`}>
          <span className="text-sm">{index + 1}</span>
          {index === 0 && <Crown size={12} className="ml-1" />}
        </div>
        <span className="text-sm md:text-base text-white truncate">
          {typeof item === "string" ? item : item.content || ""}
        </span>
      </motion.li>
    ));
  };

  const getRankColor = (index: number) => {
    const colors = [
      "text-yellow-300",
      "text-gray-400",
      "text-orange-500",
      "text-blue-500",
      "text-green-500",
    ];
    return index < colors.length ? colors[index] : "text-purple-500";
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;
  if (!list) return <div className="text-light-1 p-4 text-center">List not found</div>;

  return (
    <motion.div 
      className="shared-list-view p-6 max-w-2xl mx-auto bg-gray-900 rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Creator Info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <img
            src={list?.creator?.ImageUrl || "/assets/icons/profile-placeholder.svg"}
            alt={list?.creator?.Name}
            className="w-12 h-12 rounded-full mr-4"
          />
          <div>
            <h2 className="text-lg font-semibold text-light-1">{list?.creator?.Name}</h2>
            <p className="text-sm text-light-3">@{list?.creator?.Username}</p>
          </div>
        </div>
        <Button onClick={handleAuthRequiredAction} className="bg-primary-500 rounded-xl text-white">
          Follow
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 
          className="text-2xl font-bold text-yellow-200 cursor-pointer hover:text-yellow-300 transition-colors"
          onClick={handleItemClick}
        >
          {list?.Title}
        </h1>
        <button 
          onClick={handleShare}
          className="text-white p-2 rounded-full hover:bg-primary-600 transition-colors"
        >
          <Share2 size={20} />
        </button>
      </div>

      {list?.Description && (
        <p className="mb-6 text-light-2 text-xs">{list.Description}</p>
      )}

      <div className="mb-4">
        <ol className="list-none space-y-2">{renderListItems()}</ol>
        {list?.items?.length > 5 && (
          <motion.button
            className="w-full text-primary-500 font-semibold text-sm mt-2 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the handleItemClick
              setIsExpanded(!isExpanded);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isExpanded ? (
              <>
                Show Less <ChevronUp size={16} className="ml-1" />
              </>
            ) : (
              <>
                Show More <ChevronDown size={16} className="ml-1" />
              </>
            )}
          </motion.button>
        )}
      </div>
      
      {list?.Tags && list?.Tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {list.Tags.map((tag, index) => (
            <span key={index} className="bg-gray-700 text-light-2 px-3 py-1 rounded-full text-xs">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mb-4">
        {list?.locations?.length > 0 && (
          <div className="flex items-center text-light-3 text-sm mb-2">
            <MapPin size={16} className="mr-2" />
            {list.locations.join(", ")}
          </div>
        )}
        {list?.timespans?.length > 0 && (
          <div className="flex items-center text-light-3 text-sm">
            <Clock size={16} className="mr-2" />
            {list.timespans.join(", ")}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <Button onClick={handleAuthRequiredAction} className="flex items-center gap-2">
          <ThumbsUp size={20} />
          <span>{list?.Likes?.length || 0}</span>
        </Button>
        <Button onClick={handleAuthRequiredAction} className="flex items-center gap-2">
          <ThumbsDown size={20} />
        </Button>
        <Button onClick={handleAuthRequiredAction} className="flex items-center gap-2">
          <MessageCircle size={20} />
          <span>{list?.comments?.length || 0}</span>
        </Button>
        <Button onClick={handleAuthRequiredAction} className="flex items-center gap-2">
          <Bookmark size={20} />
        </Button>
        <Button onClick={handleAuthRequiredAction} className="flex items-center gap-2">
          <Wand size={20} />
          <span>Remix</span>
        </Button>
      </div>

      {/* Comments Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-light-1 mb-4">Comments</h3>
        {list?.comments?.length > 0 ? (
          list.comments.slice(0, 3).map((comment, index) => (
            <div key={index} className="bg-dark-3 p-4 rounded-lg mb-4">
              <p className="text-light-2">{comment.content}</p>
              <p className="text-sm text-light-3 mt-2">By {comment.user.name}</p>
            </div>
          ))
        ) : (
          <p className="text-light-3">No comments yet.</p>
        )}
        {list?.comments?.length > 3 && (
          <Button onClick={handleAuthRequiredAction} className="mt-4">
            View all comments
          </Button>
        )}
      </div>

      <SignInDialog isOpen={isSignInDialogOpen} onClose={() => setIsSignInDialogOpen(false)} />
    </motion.div>
  );
};

export default SharedListView;
