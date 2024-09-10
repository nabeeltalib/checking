import React, { useEffect, useState } from 'react';
import { getPublicLists } from '@/lib/appwrite/api';
import ListCard from '@/components/shared/ListCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X } from 'lucide-react';

const PreviewMode: React.FC = () => {
  const [publicLists, setPublicLists] = useState<any>([]);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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
    <div className="flex flex-col gap-6 p-4 w-full items-center common-container">
      <header className="w-full max-w-5xl">
        <div className="text-wrap text-2xl md:text-4xl text-orange-300 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 mb-4 font-bold" style={{ fontFamily: "'Permanent Marker', cursive" }}>
          <span>Discover Top Lists From Your World</span>
        </div>
        <h1 className="h3-light md:h2-light text-center w-full mb-6">Explore Rankings on Anything and Everything</h1>
      </header>

      <div className="flex flex-col gap-6 max-w-5xl w-full">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search lists..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-dark-4 text-light-1 pl-10 pr-4 py-2 rounded-md"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-3" />
          </div>
          <div className="text-xs flex items-center gap-2">
            <Filter className="text-light-3" />
            <select 
              className="bg-dark-3 text-light-1 p-2 rounded-md"
              onChange={() => setIsDialogOpen(true)}
            >
              <option value="">Filter Lists</option>
              <option value="category">Category</option>
              <option value="tags">Tags</option>
            </select>
          </div>
        </div>

        <AnimatePresence>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {publicLists.map((list: any, index: number) => (
              <motion.div
                key={index}
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
                <p className="text-sm sm:text-base text-gray-600 mb-6">Sign up now to search, like, comment, save, and remix lists. Create your own rankings and join the community!</p>
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