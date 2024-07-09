import React from 'react';
import { useGetNotifications, useMarkNotificationAsRead, useDeleteNotification } from '@/lib/react-query/queries';
import { INotification } from '@/types';

export const NotificationsList: React.FC = () => {
  const { data: notifications } = useGetNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();
  const deleteMutation = useDeleteNotification();

  const handleMarkAsRead = (notification: INotification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.$id);
    }
  };

  const handleDelete = (notificationId: string) => {
    deleteMutation.mutate(notificationId);
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
              onClick={() => handleMarkAsRead(notification)}
            >
              <p className="text-sm">{notification.message}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification.$id);
                  }}
                  className="text-red-500 text-sm"
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