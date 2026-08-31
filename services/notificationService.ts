import { createAdminClient } from "@/utils/supabase/server";
import { Notification, NotificationType } from "@/types/notification";

export const notificationService = {
  /**
   * Create and store a new notification in Supabase
   */
  async createNotification(notificationData: Omit<Notification, "id" | "read" | "createdAt">): Promise<Notification> {
    const supabase = await createAdminClient();
    
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: notificationData.userId,
        actor_id: notificationData.actorId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        is_read: false,
        data: {
          actorName: notificationData.actorName,
          actorImage: notificationData.actorImage,
          contentId: notificationData.contentId,
          contentType: notificationData.contentType,
          category: notificationData.category,
          thumbnail: notificationData.thumbnail,
        }
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      actorId: data.actor_id,
      actorName: data.data?.actorName,
      actorImage: data.data?.actorImage,
      type: data.type as NotificationType,
      title: data.title,
      message: data.message,
      contentId: data.data?.contentId,
      contentType: data.data?.contentType,
      category: data.data?.category,
      thumbnail: data.data?.thumbnail,
      read: data.is_read,
      createdAt: new Date(data.created_at).getTime(),
    };
  },

  /**
   * Get all notifications for a user
   */
  async getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
    const supabase = await createAdminClient();
    
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }

    return data.map((n) => ({
      id: n.id,
      userId: n.user_id,
      actorId: n.actor_id,
      actorName: n.data?.actorName,
      actorImage: n.data?.actorImage,
      type: n.type as NotificationType,
      title: n.title,
      message: n.message,
      contentId: n.data?.contentId,
      contentType: n.data?.contentType,
      category: n.data?.category,
      thumbnail: n.data?.thumbnail,
      read: n.is_read,
      createdAt: new Date(n.created_at).getTime(),
    }));
  },

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    const supabase = await createAdminClient();
    
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }

    return count || 0;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const supabase = await createAdminClient();
    
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    const supabase = await createAdminClient();
    
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const supabase = await createAdminClient();
    
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },

  /**
   * Broadcast a notification to all registered users (e.g. for new blog posts, announcements)
   */
  async broadcastNotification(notificationData: {
    title: string;
    message: string;
    type?: NotificationType;
    contentId?: string;
    contentType?: 'video' | 'reel' | 'music' | 'user' | 'blog' | 'story';
    category?: string;
    thumbnail?: string;
    actorId?: string;
    actorName?: string;
    actorImage?: string;
  }): Promise<number> {
    try {
      const supabase = await createAdminClient();
      
      const userIdsSet = new Set<string>();

      // 1. Fetch from public.users table
      try {
        const { data: users, error: usersError } = await supabase
          .from("users")
          .select("id");
        if (!usersError && users && Array.isArray(users)) {
          users.forEach((u) => { if (u.id) userIdsSet.add(u.id); });
        }
      } catch (err) {
        console.warn("Could not query public.users:", err);
      }

      // 2. Fetch from auth.admin.listUsers() to capture all registered accounts
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });
        if (!authError && authData?.users && Array.isArray(authData.users)) {
          authData.users.forEach((u) => { if (u.id) userIdsSet.add(u.id); });
        }
      } catch (err) {
        console.warn("Could not query auth.admin.listUsers():", err);
      }

      const allUserIds = Array.from(userIdsSet);
      if (allUserIds.length === 0) {
        console.warn("No users found across public.users or auth.admin for broadcast");
        return 0;
      }

      const rows = allUserIds.map((userId) => ({
        user_id: userId,
        actor_id: notificationData.actorId || null,
        type: notificationData.type || 'story',
        title: notificationData.title,
        message: notificationData.message,
        is_read: false,
        data: {
          actorName: notificationData.actorName || 'SawaFlix Editorial',
          actorImage: notificationData.actorImage || null,
          contentId: notificationData.contentId,
          contentType: notificationData.contentType || 'story',
          category: notificationData.category || 'story',
          thumbnail: notificationData.thumbnail || null,
        }
      }));

      // Batch insert into notifications table
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(rows);

      if (insertError) {
        console.error("Error broadcasting notification:", insertError);
        throw insertError;
      }

      console.log(`Successfully broadcasted notification to ${rows.length} users`);
      return rows.length;
    } catch (err) {
      console.error("Failed to broadcast notification:", err);
      return 0;
    }
  }
};

