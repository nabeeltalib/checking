import React, { useEffect, useState } from "react";
import { UserCard, Loader } from "@/components/shared";
import { getUsers } from "@/lib/appwrite/config";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, AlertCircle } from 'lucide-react';

interface IUser {
  $id: string;
  [key: string]: any; // Add more properties as needed for the user object
}

const Userlist: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    getUserData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center min-h-screen bg-gray-900"
    >
      <header className="w-full bg-bg-gray-800 shadow-md p-6 mb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white flex items-center mb-4">
            <Users className="mr-2" size={32} />
            User Directory
          </h1>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-900 p-4 rounded-lg"
          >
            <h2 className="text-xl font-semibold mb-2 text-blue-200 flex items-center">
              <AlertCircle className="mr-2" size={24} />
              Collaborations and Connections
            </h2>
            <p className="text-blue-300">
              Discover and connect with other users to collaborate on lists and projects. Building a network enhances your Topfived experience, allowing you to share ideas and create together. Browse the directory, send connection requests, and start collaborating!
            </p>
          </motion.div>
        </div>
      </header>

      <main className="w-full max-w-6xl mx-auto px-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : users.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-gray-800 rounded-lg shadow-md"
          >
            <UserPlus size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-300">No users found.</p>
            <p className="mt-2 text-gray-400">Check back later or try refreshing the page.</p>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {users.map((user: IUser) => (
                <motion.div key={user.$id} variants={itemVariants}>
                  <UserCard user={user} listId="" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <footer className="w-full mt-12 p-4 bg-gray-800 text-center">
        <p className="text-sm text-gray-400">
          © 2024 Topfived. All rights reserved.
        </p>
      </footer>
    </motion.div>
  );
};

export default Userlist;
