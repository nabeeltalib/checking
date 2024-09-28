// src/components/shared/LoaderOverlay.tsx

import React from 'react';
import Loader from "@/components/shared/Loader";
import { motion } from 'framer-motion';

const LoaderOverlay: React.FC = () => {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      aria-labelledby="loading"
      role="dialog"
      aria-modal="true"
    >
      <Loader />
    </motion.div>
  );
};

export default LoaderOverlay;
