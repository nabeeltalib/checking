import React, { useEffect, useState } from 'react';
import { getPublicLists } from '@/lib/appwrite/api';
import ListCard from '@/components/shared/ListCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LampDesk, X } from 'lucide-react';
import MobileTrendingSlider from '@/components/shared/MobileTrendingSlider';
import Bottombar2 from '@/components/shared/Bottombar2';

interface IList {
  $id: string;
  [key: string]: any;
}

const PreviewMode: React.FC = () => {
  const [publicLists, setPublicLists] = useState<IList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const publicData = await getPublicLists();
        setPublicLists(publicData);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch public lists:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isDialogOpen) {
      setIsDialogOpen(true);
    }
  };

  const handleDialogClose = () => setIsDialogOpen(false);

  const LoadingSkeleton: React.FC = () => (
    <div className="space-y-8">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-dark-2 p-4 sm:p-6 rounded-xl shadow-lg">
          <motion.div
            className="h-8 bg-dark-3 rounded w-1/2 mb-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          ></motion.div>
          <div className="space-y-4">
            {[...Array(3)].map((_, rowIndex) => (
              <div key={rowIndex} className="flex items-center space-x-4">
                <motion.div
                  className="h-6 bg-dark-3 rounded w-1/4"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.1 * rowIndex }}
                ></motion.div>
                <motion.div
                  className="h-6 bg-dark-3 rounded w-1/2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.1 * rowIndex + 0.05 }}
                ></motion.div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="mt-4 w-full items-center bg-dark-1 min-h-screen pb-20">
        <header className="w-full bg-dark-1 py-4">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <motion.div
              className="h-8 bg-dark-3 rounded w-2/3 mx-auto mb-4"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            ></motion.div>
            <motion.div
              className="h-4 bg-dark-3 rounded w-1/2 mx-auto"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.1 }}
            ></motion.div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 w-full items-center bg-dark-1 min-h-screen pb-20">
      <header className="w-full bg-dark-1 py-4">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="text-2xl md:text-3xl text-blue-300 font-bold mb-2 mt-6" style={{ fontFamily: "'Permanent Marker', cursive" }}>
            <span>What's in Your Top Five??</span>
          </div>
          <p className="text-base sm:text-xl font-thin text-blue-200 mt-8">Your World's Recommendations On Everything • Discover/Debate The Best</p>
        </div>
      </header>

      {/* Sticky Search Bar */}
      <div className="sticky top-[calc(4rem)] z-10 w-full bg-dark-1 shadow-md my-4">
        <div className="max-w-2xl mx-auto px-4 py-3 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search for better opinions..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-gray-700 text-gray-200 pl-10 pr-4 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-3" />
          </div>
        </div>
      </div>

      {/* Mobile Trending Slider */}
      <MobileTrendingSlider setIsDialogOpen={setIsDialogOpen} />

      <h3 className="text-2xl font-bold text-light-1 mb-4 flex items-center mt-8">
        <LampDesk className="mr-2" />
        Home Feed
      </h3>

      {/* Main Content */}
      <div className="flex flex-col gap-6 p-4 w-full items-center max-w-5xl mx-auto mt-6">
        <AnimatePresence>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {publicLists.map((list: IList) => (
              <motion.div
                key={list.$id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ListCard list={list} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <Button
          onClick={() => navigate('/sign-in')}
          className="w-full md:w-auto mx-auto bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out"
        >
          Sign Up/Sign In to Access More Features
        </Button>
      </div>

      {/* Bottombar2 Component */}
      <Bottombar2 />

      {/* Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 z-50 p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-lg"
            >
              <button
                onClick={handleDialogClose}
                className="text-gray-500 hover:text-gray-700 absolute top-4 right-4"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Unlock Full Access!</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  Sign up now to search, like, comment, save, and remix lists. Create your own rankings and join the community!
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <Button
                  type="button"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out"
                  onClick={() => navigate("/sign-up")}
                >
                  Sign Up
                </Button>
                <Button
                  className="flex items-center justify-center bg-white text-gray-700 border border-gray-300 px-4 sm:px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out hover:bg-gray-100"
                  onClick={() => navigate("/sign-in")}
                >
                  <img src="/assets/icons/google.svg" alt="Google" className="mr-2 h-5 w-5" />
                  Sign In with Google
                </Button>
                <Button
                  className="text-indigo-600 hover:text-indigo-800 font-semibold"
                  onClick={() => navigate("/sign-in")}
                >
                  Sign In with Email
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PreviewMode;