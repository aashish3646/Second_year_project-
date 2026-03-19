import { useCallback, useEffect, useMemo, useState } from 'react';
import { notificationsApi } from '../services/notificationsApi';
import { useAuth } from '../context/AuthContext';

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await notificationsApi.list();
      setItems(Array.isArray(data) ? data : data?.results ?? []);
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
    if (!isAuthenticated) return;
    const t = setInterval(fetchNotifications, 30000);
    return () => clearInterval(t);
  }, [fetchNotifications, isAuthenticated]);

  const unreadCount = useMemo(() => items.filter((n) => !n.is_read).length, [items]);

  return { items, unreadCount, loading, refresh: fetchNotifications };
}

