import { useEffect, useState } from 'react';
import { getNotifications } from '@/lib/appwrite/api';
import { useUserContext } from '@/context/AuthContext';
import { useDeleteNotification, useMarkNotificationAsRead } from '@/lib/react-query/queries';

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user } = useUserContext();
  const userId = user.id
  useEffect(() => {
    const fetchNotifications = async () => {
      const userNotifications = await getNotifications(userId);
      setNotifications(userNotifications);
    };
    fetchNotifications();
  }, [userId]);

  const markAsReadMutation = useMarkNotificationAsRead();
  const deleteMutation = useDeleteNotification();

  const handleMarkAsRead = (notification: any) => {
    if (notification.read === false) {
      markAsReadMutation.mutate(notification.$id);
    }
  };

  const handleDelete = (notificationId: string) => {
    deleteMutation.mutate(notificationId);
    setNotifications((prevState)=> prevState.filter((i)=> i.$id !== notificationId))
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>
      {notifications?.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <ul className="space-y-4">
          {notifications?.map((notification) => (
            <li 
              key={notification.$id} 
              className={`p-4 rounded-lg shadow ${notification.read ? 'bg-gray-100' : 'bg-white'}`}
            >
              <p className="text-sm text-black" onClick={() => handleMarkAsRead(notification)} style={{cursor:"pointer"}}>{notification.message}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification.$id);
                  }}
                  className="text-red text-sm"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;