"use client"

import Notifications from "./NotificationsView"
import { usePushNotifications } from "../../app/hooks/usePushNotifications"

export default function NotificationsClient({ userId }: { userId: string }) {
  usePushNotifications(userId)
  return <Notifications userId={userId} role="admin" />
}