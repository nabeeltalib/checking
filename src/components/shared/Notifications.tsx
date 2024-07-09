import React, { useEffect, useState } from 'react';
import { getUserNotifications } from '@/lib/appwrite/api';
import { INotification } from '@/types';

const Notifications: React.FC<{ userId: string }> = ({ userId }) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const userNotifications = await getUserNotifications(userId);
      setNotifications(userNotifications);
    };
    fetchNotifications();
  }, [userId]);

  return (
    <div className="notifications p-4">
      <h2 className="h3-bold mb-4">Notifications</h2>
      {notifications.map(notification => (
        <div key={notification.id} className="notification-item p-2 mb-2 bg-dark-3 rounded">
          {notification.content}
        </div>
      ))}
    </div>
  );
};

export default Notifications;