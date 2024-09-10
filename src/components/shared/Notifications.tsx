import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications } from '@/lib/appwrite/api';
import { useUserContext } from '@/context/AuthContext';
import { useDeleteNotification, useMarkNotificationAsRead } from '@/lib/react-query/queries';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertCircle, CheckCircle, X, XCircle } from 'lucide-react';

interface Notification {
  $id: string;
  message: string;
  createdAt: string;
  read: boolean;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useUserContext();
  const userId = user.id;
  const navigate = useNavigate();

  const markAsReadMutation = useMarkNotificationAsRead();
  const deleteMutation = useDeleteNotification();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userNotifications = await getNotifications(userId);
        setNotifications(userNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [userId]);

  const handleClose = () => {
    navigate('/'); // Navigate to the home page
  };

  const handleMarkAsRead = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.$id, {
        onSuccess: () => {
          setNotifications((prevState) =>
            prevState.map((n) =>
              n.$id === notification.$id ? { ...n, read: true } : n
            )
          );
        },
      });
    }
  };

  const handleDelete = (notificationId: string) => {
    setNotifications((prevState) =>
      prevState.filter((n) => n.$id !== notificationId)
    );
    deleteMutation.mutate(notificationId, {
      onError: (error) => {
        console.error("Error deleting notification:", error);
        setNotifications((prevState) =>
          prevState.concat(
            notifications.find((n) => n.$id === notificationId)!
          )
        );
      },
    });
  };

  const handleDismiss = (notification: Notification) => {
    handleMarkAsRead(notification);
    handleDelete(notification.$id);
  };

  const sortedNotifications = useMemo(
    () => notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notifications]
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
      >
        <header className="bg-blue-700 p-4 rounded-t-lg flex justify-between items-center">
          <h1 className="text-xl font-bold text-white flex items-center">
            <Bell className="mr-2" size={24} />
            Notifications
          </h1>
          <button 
            onClick={handleClose}
            className="text-white hover:bg-blue-800 p-1 rounded-full transition-colors"
            aria-label="Close notifications and go to home page"
          >
            <X size={24} />
          </button>
        </header>

        <div className="p-4 overflow-y-auto flex-grow">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle size={48} className="text-green-500 mb-4" />
              <p className="text-lg text-gray-600 dark:text-gray-300">You're all caught up!</p>
              <p className="mt-2 text-gray-400">No new notifications at the moment.</p>
            </div>
          ) : (
            <AnimatePresence>
              <ul className="space-y-4">
                {sortedNotifications.map((notification) => (
                  <motion.li
                    key={notification.$id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3 rounded-lg shadow-sm transition-all ${
                      notification.read ? 'bg-gray-700' : 'bg-gray-600 border-l-4 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-grow pr-4">
                        <p className="text-gray-200 text-sm">{notification.message}</p>
                        <span className="text-xs text-gray-400 mt-1 block">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDismiss(notification)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Dismiss notification"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Notifications;