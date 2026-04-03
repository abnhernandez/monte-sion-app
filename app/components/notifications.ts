// lib/notifications.ts
import { createClient } from "@supabase/supabase-js"
import webpush from "web-push"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

webpush.setVapidDetails(
  "mailto:rootmontesion@gmail.com",
  process.env.NOTIFICACIONID_PUBLIC!,
  process.env.NOTIFICACIONID_PRIVATE!
)

export async function createNotificationForAdmins(notification: { title: string; message: string }) {
  const { data: admins } = await supabase.from("profiles").select("id").eq("role", "admin")
  if (!admins) return

  for (const admin of admins) {
    await supabase.from("notifications").insert({
      user_id: admin.id,
      title: notification.title,
      message: notification.message,
      tone: "attention",
      role: "admin",
      read: false,
    })

    const { data: subs } = await supabase.from("push_subscriptions").select("*").eq("user_id", admin.id)
    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(sub.subscription, JSON.stringify(notification))
      } catch (err) {
        console.error("Push error:", err)
      }
    }
  }
}