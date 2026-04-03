"use server"

import { getSupabaseServer } from "@/lib/supabase-server"

export type NotificationTone =
  | "calm"
  | "attention"
  | "action"
  | "progress"
  | "resolved"
  | "alert"

export type NotificationRole =
  | "admin"
  | "leader"
  | "intercessor"
  | "user"

export type Notification = {
  id: string
  user_id: string
  title: string
  message: string
  tone: NotificationTone
  role: NotificationRole
  read: boolean
  created_at: string
}

export async function getNotificationsPage({
  userId,
  cursor,
  limit = 20,
}: {
  userId: string
  role: NotificationRole
  cursor?: string
  limit?: number
}) {
  const supabase = await getSupabaseServer()

  let q = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (cursor) q = q.lt("created_at", cursor)

  const { data, error } = await q
  if (error) throw error

  return {
    items: (data ?? []) as Notification[],
    nextCursor: data?.at(-1)?.created_at,
  }
}

export async function getUnreadCount(userId: string) {
  const supabase = await getSupabaseServer()

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false)

  if (error) throw error

  return count ?? 0
}

export async function markNotificationRead(id: string) {
  const supabase = await getSupabaseServer()

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .eq("read", false)

  if (error) throw error
}

export async function deleteNotification(id: string) {
  const supabase = await getSupabaseServer()

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id)

  if (error) throw error
}

export async function getUserNotificationPreferences(userId: string) {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("user_preferences")
    .select("silent_notifications")
    .eq("user_id", userId)
    .single()

  if (error && error.code !== "PGRST116") throw error

  return data ?? { silent_notifications: false }
}

export async function savePushSubscription(
  userId: string,
  subscription: PushSubscriptionJSON
) {
  const supabase = await getSupabaseServer()

  const { error } = await supabase.from("push_subscriptions").upsert({
    user_id: userId,
    subscription,
  })

  if (error) throw error
}

export async function sendNotifyEmail(email: string): Promise<boolean> {
  const supabase = await getSupabaseServer()

  try {
    // Guardar subscripción de email en la tabla notify_emails
    const { error } = await supabase.from("notify_emails").insert({
      email,
      created_at: new Date().toISOString(),
    })

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error guardando email de notificación:", error)
    return false
  }
}
export type PushSubscriptionJSON = {
  endpoint: string
  keys: Record<string, string>
  expirationTime?: number | null
}
