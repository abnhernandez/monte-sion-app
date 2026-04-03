"use client"

import { useEffect, useState, useTransition } from "react"
import { getCurrentUserNotificationData } from "@/lib/auth-actions"
import Notifications from "./NotificationsView"
import type { NotificationRole } from "./NotificationsView"
import { usePushNotifications } from "@/app/hooks/usePushNotifications"

export default function NotificationsClient() {
  const [userId, setUserId] = useState<string | null>(null)
  const [role, setRole] = useState<NotificationRole>("user")
  const [ready, setReady] = useState(false)
  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const data = await getCurrentUserNotificationData()
      if (!data) {
        setReady(true)
        return
      }

      setUserId(data.userId)
      setRole((data.role as NotificationRole) ?? "user")
      setReady(true)
    })
  }, [])

  usePushNotifications(userId ?? "")

  if (!ready || !userId) return null

  return <Notifications userId={userId} role={role} />
}
