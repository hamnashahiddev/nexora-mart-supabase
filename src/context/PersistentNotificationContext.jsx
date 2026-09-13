import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const PersistentNotificationContext = createContext();

export const PersistentNotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [dbNotifications, setDbNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Subscribe to real-time notifications
      const subscription = supabase
        .channel('public:notifications')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
        }, payload => {
          setDbNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    } else {
      setDbNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (!error && data) {
      setDbNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAsRead = async (id) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', user.id);
      
    if (!error) {
      setDbNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
      
    if (!error) {
      setDbNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    }
  };

  return (
    <PersistentNotificationContext.Provider value={{ 
      dbNotifications, 
      unreadCount, 
      markAsRead, 
      markAllAsRead,
      fetchNotifications
    }}>
      {children}
    </PersistentNotificationContext.Provider>
  );
};

export const usePersistentNotification = () => useContext(PersistentNotificationContext);
