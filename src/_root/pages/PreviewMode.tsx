import React, { useEffect, useState } from 'react';
import { getPublicLists } from '@/lib/appwrite/api';
import ListCard from '@/components/shared/ListCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

interface IList {
  $id: string;
  [key: string]: any; // Adjust based on your list's shape
}

const PreviewMode: React.FC = () => {
  const [publicLists, setPublicLists] = useState<IList[]>([]);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const publicData = await getPublicLists();
        setPublicLists(publicData);
        setIsContentLoaded(true);
      } catch (error) {
        console.error('Failed to fetch public lists:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isContentLoaded) {
      const loader = document.getElementById('loader');
      if (loader) {
        loader.style.display = 'none';
      }
    }
  }, [isContentLoaded]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => setIsDialogOpen(false);

  if (!isContentLoaded) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <div className="text-center">
          <img src="/assets/images/mobile.png" width={200} alt="Loading..." className="mx-auto mb-4" />
          <h1 className="text-2xl flashing">Loading Organized Opinions...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col w-full items-center bg-dark-1 min-h-screen">
      <header className="w-full bg-dark-1 py-4">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="text-2xl md:text-3xl text-blue-300 font-bold mb-2 mt-6" style={{ fontFamily: "'Permanent Marker', cursive" }}>
            <span>What's in Your Top Five??</span>
          </div>
          <p className="text-base sm:text-xl text-thin text-blue-200 mt-8">Your World's Recommendations On Everything • Debate The Best</p>
        </div>
      </header>

      {/* Sticky Search Bar */}
      <div className="sticky top-20 z-10 w-full bg-dark-1 shadow-md mt-6 ">
        <div className="max-w-2xl mx-auto px-4 py-3 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search for better opinions..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-dark-4 text-light-1 pl-10 pr-4 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-3" />
          </div>
        </div>
      </div>

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
