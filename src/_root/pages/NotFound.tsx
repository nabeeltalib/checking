import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate('/');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-dark-2 text-white">
      <div className="text-center">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mb-8"
        >
          <img src="/assets/images/astronaut.svg" alt="Lost Astronaut" className="w-64 h-64 mx-auto" />
        </motion.div>
        
        <h1 className="text-4xl font-bold mb-4">Lost in Space</h1>
        <p className="text-xl mb-8">Houston, we have a 404 problem!</p>
        
        <motion.div
          className="mb-8 cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSearch}
        >
          <motion.img 
            src="/assets/images/mobile2.png" 
            alt="Company Logo" 
            className="w-16 h-16 mx-auto"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />
          <p className="mt-2 text-sm">Click to search for civilization</p>
        </motion.div>

        {/*<div className="space-x-4">
          <Link 
            to="/" 
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Return Home
          </Link>
          <Link 
            to="/explore" 
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Explore New Worlds
          </Link>
        </div>*/}
      </div>
    </div>
  );
};

export default NotFound;