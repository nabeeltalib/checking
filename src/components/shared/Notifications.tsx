import { useEffect, useState, useMemo } from 'react';
import { getNotifications } from '@/lib/appwrite/api';
import { useUserContext } from '@/context/AuthContext';
import { useDeleteNotification, useMarkNotificationAsRead } from '@/lib/react-query/queries';

// Define a type for Notification
interface Notification {
  $id: string;
  message: string;
  createdAt: string;
  read: boolean;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useUserContext();
  const userId = user.id;

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

  const markAsReadMutation = useMarkNotificationAsRead();
  const deleteMutation = useDeleteNotification();

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
        // Revert the optimistic update if delete fails
        setNotifications((prevState) =>
          prevState.concat(
            notifications.find((n) => n.$id === notificationId)!
          )
        );
      },
    });
  };

  const sortedNotifications = useMemo(
    () => notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notifications]
  );

  if (loading) {
    return <p>Loading notifications...</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-gray-200 rounded-lg shadow-lg dark:bg-gray-800">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Notifications</h2>
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center">
          <img src="/assets/icons/no-notifications.svg" alt="No notifications" className="w-24 h-24 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">You're all caught up!</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {sortedNotifications.map((notification) => (
            <li
              key={notification.$id}
              className={`p-4 rounded-lg shadow transition-transform transform hover:scale-105 cursor-pointer ${
                notification.read ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800 border-l-4 border-blue-500'
              }`}
              onClick={() => handleMarkAsRead(notification)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full ${notification.read ? 'bg-transparent' : 'bg-blue-500'} mr-2`}></div>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{notification.message}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification.$id);
                  }}
                  className="text-red-500 hover:text-red-700 transition-colors dark:text-red-400 dark:hover:text-red-600"
                  aria-label="Delete notification"
                >
                  Delete
                </button>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
                {new Date(notification.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  
};

export default Notifications;
