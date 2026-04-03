"use client"
import { useEffect } from "react"
import { savePushSubscription } from "@/lib/notifications-actions"

export function usePushNotifications(userId: string) {
  useEffect(() => {
    if (!userId) return
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC
    if (!publicKey) return

    const register = async () => {
      const reg = await navigator.serviceWorker.register("/sw.js")
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      // Guardar suscripción de push en servidor
      try {
        const subJson = subscription.toJSON()
        if (subJson.endpoint && subJson.keys) {
          await savePushSubscription(userId, {
            endpoint: subJson.endpoint,
            keys: subJson.keys,
            expirationTime: subJson.expirationTime,
          })
        }
      } catch (error) {
        console.error("Error guardando suscripción de push:", error)
      }

      // Pedir permiso de notificación
      if (Notification.permission !== "granted") {
        await Notification.requestPermission()
      }
    }

    register()
  }, [userId])
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}