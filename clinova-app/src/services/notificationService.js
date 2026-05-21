import { supabase } from '../lib/supabaseClient';

export const notificationService = {
  // Obtener historial de notificaciones
  async getNotifications(userId) {
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
    return data;
  },

  // Marcar una notificación como leída
  async markAsRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
      
    if (error) {
      console.error("Error marking notification as read:", error);
    }
  },

  // Suscribirse a nuevas notificaciones en tiempo real
  subscribeToNotifications(userId, callback) {
    if (!userId) return null;

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return channel;
  },

  // Método auxiliar para crear una notificación (ej. desde Recepción a un Doctor)
  async createNotification(userId, title, message, link = null) {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        title,
        message,
        link,
        read: false
      }]);
      
    if (error) {
      console.error("Error creating notification:", error);
    }
  }
};
