import { getMockDb } from "@/lib/mock-db";
import { createAdminClient } from "@/lib/supabase/admin";
import type { WebNotification } from "@/types/notification";
import { mapNotificationRow, mapNotificationToRow, type WebNotificationRow } from "./mappers";

function shouldUseSupabase() {
  return process.env.USE_SUPABASE === "true" && Boolean(createAdminClient());
}

export interface NotificationQuery {
  userId?: string;
  isRead?: boolean;
  important?: boolean;
  type?: string;
}

export async function listNotifications(query: NotificationQuery = {}) {
  if (shouldUseSupabase()) {
    const supabase = createAdminClient()!;
    let request = supabase.from("web_notifications").select("*").order("created_at", { ascending: false });
    if (query.userId) request = request.eq("user_id", query.userId);
    if (typeof query.isRead === "boolean") request = request.eq("is_read", query.isRead);
    if (query.important) request = request.gte("priority_score", 80);
    if (query.type && query.type !== "All") request = request.eq("type", query.type);
    const { data, error } = await request;
    if (error) throw error;
    return (data as WebNotificationRow[]).map(mapNotificationRow);
  }

  return getMockDb().webNotifications.filter((item) => {
    const matchesUser = !query.userId || item.userId === query.userId;
    const matchesRead = typeof query.isRead !== "boolean" || item.isRead === query.isRead;
    const matchesImportant = !query.important || item.priorityScore >= 80;
    const matchesType = !query.type || query.type === "All" || item.type === query.type;
    return matchesUser && matchesRead && matchesImportant && matchesType;
  });
}

export async function createNotification(notification: WebNotification) {
  if (shouldUseSupabase()) {
    const supabase = createAdminClient()!;
    const { data, error } = await supabase.from("web_notifications").insert(mapNotificationToRow(notification)).select("*").single();
    if (error) throw error;
    return mapNotificationRow(data as WebNotificationRow);
  }

  getMockDb().webNotifications.unshift(notification);
  return notification;
}

export async function updateNotificationRead(id: string, isRead: boolean, userId?: string) {
  if (shouldUseSupabase()) {
    const supabase = createAdminClient()!;
    let request = supabase.from("web_notifications").update({ is_read: isRead }).eq("id", id);
    if (userId) request = request.eq("user_id", userId);
    const { data, error } = await request.select("*").single();
    if (error || !data) return null;
    return mapNotificationRow(data as WebNotificationRow);
  }

  const db = getMockDb();
  const index = db.webNotifications.findIndex((item) => item.id === id && (!userId || item.userId === userId));
  if (index === -1) return null;
  db.webNotifications[index] = { ...db.webNotifications[index], isRead };
  return db.webNotifications[index];
}
