import React from 'react';
import { useGetNotifications } from '@/lib/react-query/queries';
import { Bell } from 'lucide-react';
import { useUserContext } from '@/context/AuthContext';

export const NotificationBell: React.FC = () => {
  const { user } = useUserContext();
  const { data: notifications } = useGetNotifications(user.$id);
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="relative">
      <Bell className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
          {unreadCount}
        </span>
      )}
    </div>
  );
};