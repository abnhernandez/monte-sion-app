"use server"
import "server-only"

import { revalidateTag } from "next/cache"
import { createClient } from "@supabase/supabase-js"

/* ===============================
   SUPABASE (SERVICE ROLE)
================================ */
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/* ===============================
   TYPES
================================ */
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

/* ===============================
   RLS SAFE FETCH (ROLE FILTER)
================================ */
export async function getNotificationsPage({
  userId,
  role,
  cursor,
  limit = 20,
}: {
  userId: string
  role: NotificationRole
  cursor?: string
  limit?: number
}) {
  let q = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .lte("role", role) // 👈 RLS by role hierarchy
    .order("created_at", { ascending: false })
    .limit(limit)

  if (cursor) q = q.lt("created_at", cursor)

  const { data, error } = await q
  if (error) throw error

  return {
    items: data as Notification[],
    nextCursor: data?.at(-1)?.created_at,
  }
}

/* ===============================
   UNREAD COUNT (ANALYTICS SAFE)
================================ */
export async function getUnreadCount(userId: string) {
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false)

  return count ?? 0
}

/* ===============================
   MARK READ (IDEMPOTENT)
================================ */
export async function markNotificationRead(id: string) {
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .eq("read", false)

  // 📊 analytics hook
  await supabase.from("notification_events").insert([
    {
      notification_id: id,
      event: "read",
    },
  ])

  revalidateTag("notifications", "default")
}

/* ===============================
   PUSH + SILENT MODE
================================ */
export async function getUserPreferences(userId: string) {
  const { data } = await supabase
    .from("user_preferences")
    .select("silent_notifications")
    .eq("user_id", userId)
    .single()

  return data ?? { silent_notifications: false }
}

/* ===============================
   CREATE NOTIFICATION
================================ */
export async function createNotification({
  userId,
  title,
  message,
  tone,
  role = "user",
}: {
  userId: string
  title: string
  message: string
  tone: NotificationTone
  role?: NotificationRole
}) {
  const { error } = await supabase.from("notifications").insert([
    {
      user_id: userId,
      title,
      message,
      tone,
      role,
      read: false,
    },
  ])

  if (error) throw error

  revalidateTag("notifications", "default")
}

/* ===============================
   CREATE NOTIFICATIONS FOR ADMINS
================================ */
export async function createNotificationForAdmins({
  title,
  message,
  tone,
  role = "admin",
}: {
  title: string
  message: string
  tone: NotificationTone
  role?: NotificationRole
}) {
  const { data: admins, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")

  if (error) throw error
  if (!admins?.length) return

  const rows = (admins ?? []).map((admin: { id: string }) => ({
    user_id: admin.id,
    title,
    message,
    tone,
    role,
    read: false,
  }))

  const { error: insertError } = await supabase
    .from("notifications")
    .insert(rows)

  if (insertError) throw insertError

  revalidateTag("notifications", "default")
}

/* ===============================
   AUDIT LOG
================================ */
export async function auditLog({
  actorId,
  action,
  entity,
  entityId,
  before,
  after,
}: {
  actorId: string
  action: string
  entity: string
  entityId?: string
  before?: string
  after?: string
}) {
  const { error } = await supabase.from("audit_logs").insert([
    {
      actor_id: actorId,
      action,
      entity,
      entity_id: entityId ?? null,
      before_state: before ?? null, // ✅ NOMBRE REAL DE COLUMNA
      after_state: after ?? null,   // ✅ NOMBRE REAL DE COLUMNA
    },
  ])

  if (error) {
    console.error("auditLog error:", error)
    throw new Error(error.message)
  }
}