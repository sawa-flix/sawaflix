import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Notification, NotificationType } from '@/types/notification';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNotification, setNewNotification] = useState<Notification | null>(null);

  // Use a stable ref for supabase client to prevent re-renders triggering new subscriptions
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const channelRef = useRef<any>(null);
  // Tracks an in-flight removeChannel() call so a subsequent setup (e.g. a
  // remount) can wait for it — the effect's cleanup itself can't be async,
  // so without this, a fire-and-forget removal from cleanup can still be
  // in-flight when the next setup tries to create a channel with the same
  // topic name.
  const teardownRef = useRef<Promise<unknown> | null>(null);

  const mapNotification = (n: any): Notification => ({
    id: n.id,
    userId: n.user_id,
    actorId: n.actor_id,
    actorName: n.actor_name || n.data?.actorName,
    actorImage: n.actor_image || n.data?.actorImage,
    type: n.type as NotificationType,
    title: n.title,
    message: n.message,
    contentId: n.content_id || n.data?.contentId || n.data?.videoId,
    contentType: n.content_type || n.data?.contentType,
    category: n.category || n.data?.category,
    thumbnail: n.thumbnail || n.data?.thumbnail,
    read: n.is_read,
    createdAt: new Date(n.created_at).getTime(),
  });

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      setNotifications((data || []).map(mapNotification));
      setError(null);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      const { count, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (countError) throw countError;
      setUnreadCount(count || 0);
    } catch (err: any) {
      // Quietly log session-related errors as they are often transient lock issues
      if (err.message?.includes('Lock broken')) {
        console.warn('Unread count fetch postponed: session lock conflict');
        return;
      }
      console.error('Error fetching unread count:', err);
    }
  }, [supabase]);

  const markAsRead = async (id: string) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (updateError) throw updateError;

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (updateError) throw updateError;

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      const deletedNotification = notifications.find(n => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    let isMounted = true;

    const setupRealtime = async () => {
      // Wait for any in-flight teardown — from this call or a previous
      // instance's cleanup — before doing anything else. supabase-js can
      // hand back the SAME (already-subscribed) channel object from
      // .channel() if a prior channel with this exact topic name hasn't
      // finished being removed yet, and calling .on() on an
      // already-subscribed channel throws "cannot add postgres_changes
      // callbacks ... after subscribe()". This happens on any remount that
      // reuses the same topic (`notifications-${user.id}`) — most visibly
      // during dev via React Fast Refresh, but the race exists regardless of
      // what triggers the remount.
      if (teardownRef.current) {
        await teardownRef.current;
      }
      if (!isMounted) return;

      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user || !isMounted) return;

      if (channelRef.current) {
        const toRemove = channelRef.current;
        channelRef.current = null;
        await supabase.removeChannel(toRemove);
      }
      if (!isMounted) return;

      const channel = supabase
        .channel(`notifications-${user.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const newNotif = mapNotification(payload.new);
            setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]);
            setUnreadCount((prev) => prev + 1);
            setNewNotification(newNotif);
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const updatedNotif = mapNotification(payload.new);
            setNotifications((prev) =>
              prev.map((n) => (n.id === updatedNotif.id ? updatedNotif : n))
            );
            fetchUnreadCount();
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const deletedId = payload.old.id;
            setNotifications((prev) => prev.filter((n) => n.id !== deletedId));
            fetchUnreadCount();
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log('Subscribed to notifications realtime');
          }
          if (status === 'CHANNEL_ERROR') {
            console.error('Realtime subscription error:', err || 'Check if Realtime is enabled for "notifications" table in Supabase dashboard');
          }
        });

      channelRef.current = channel;
    };

    setupRealtime();

    return () => {
      isMounted = false;
      if (channelRef.current) {
        const toRemove = channelRef.current;
        channelRef.current = null;
        // Can't await inside a cleanup function, so track the promise
        // instead — the next setupRealtime() call (if any) awaits it.
        teardownRef.current = supabase.removeChannel(toRemove).finally(() => {
          teardownRef.current = null;
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount — fetchNotifications/fetchUnreadCount are stable useCallbacks

  return {
    notifications,
    unreadCount,
    loading,
    error,
    newNotification,
    setNewNotification,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

