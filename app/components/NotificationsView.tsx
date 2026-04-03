"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import {
  type Notification,
  type NotificationTone,
  type NotificationRole,
  getNotificationsPage,
  getUnreadCount,
  markNotificationRead,
  deleteNotification,
  getUserNotificationPreferences,
} from "@/lib/notifications-actions"

export type { Notification, NotificationTone, NotificationRole }


/* ===============================
   GROUP BY DAY
================================ */
function groupByDay(items: Notification[]) {
  const groups: Record<string, Notification[]> = {}

  for (const n of items) {
    const d = new Date(n.created_at)
    const key =
      d.toDateString() === new Date().toDateString()
        ? "Hoy"
        : d.toDateString() ===
          new Date(Date.now() - 86400000).toDateString()
        ? "Ayer"
        : d.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "long",
          })

    groups[key] ||= []
    groups[key].push(n)
  }

  return groups
}

function formatTime(value: string) {
  const d = new Date(value)
  return d.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

/* ===============================
   COMPONENT
================================ */
export function Notifications({
  userId,
  role,
}: {
  userId: string
  role: NotificationRole
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState<Notification[]>([])
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [unread, setUnread] = useState(0)
  const [silent, setSilent] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  /* ===============================
     INITIAL LOAD (STREAMING SAFE)
  ================================ */
  useEffect(() => {
    startTransition(async () => {
      const [{ items: nextItems, nextCursor }, nextUnread, prefs] =
        await Promise.all([
          getNotificationsPage({ userId, role }),
          getUnreadCount(userId),
          getUserNotificationPreferences(userId),
        ])

      setItems(nextItems)
      setCursor(nextCursor)
      setUnread(nextUnread)
      setSilent(prefs.silent_notifications)
    })
  }, [userId, role])

  /* ===============================
     INFINITE SCROLL
  ================================ */
  useEffect(() => {
    if (!ref.current || !cursor) return

    const io = new IntersectionObserver(async ([e]) => {
      if (!e.isIntersecting || !cursor) return

      const { items: nextItems, nextCursor } =
        await getNotificationsPage({
          userId,
          role,
          cursor,
        })

      setItems((prev) => [...prev, ...nextItems])
      setCursor(nextCursor)
    })

    io.observe(ref.current)
    return () => io.disconnect()
  }, [cursor, userId, role])

  /* ===============================
     GROUPED VIEW
  ================================ */
  const grouped = useMemo(() => groupByDay(items), [items])

  const handleRead = (id: string) => {
    let wasUnread = false
    setItems((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n
        wasUnread = !n.read
        return { ...n, read: true }
      })
    )
    if (wasUnread) setUnread((prev) => Math.max(0, prev - 1))
    startTransition(() => markNotificationRead(id))
  }

  const handleDelete = async (id: string, read: boolean) => {
    setDeletingId(id)
    try {
      await deleteNotification(id)
      setItems((prev) => prev.filter((n) => n.id !== id))
      if (!read) {
        setUnread((prev) => Math.max(0, prev - 1))
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          Notificaciones
        </div>
        <div className="flex items-center gap-2">
          {silent && (
            <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              Silencio
            </span>
          )}
          {unread > 0 && (
            <span className="inline-flex items-center rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
              {unread}
            </span>
          )}
        </div>
      </div>

      {items.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          No tienes notificaciones todavía.
        </div>
      )}

      {Object.entries(grouped).map(([day, items]) => (
        <section key={day}>
          <h3 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
            {day}
          </h3>

          <div className="space-y-2">
            {items.map((n) => (
              <div
                key={n.id}
                onClick={() => handleRead(n.id)}
                className={`rounded-2xl border px-4 py-3 transition cursor-pointer group ${
                  n.read
                    ? "border-border bg-card opacity-80"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm font-semibold text-foreground">
                    {n.title}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                    <span>{formatTime(n.created_at)}</span>
                  </div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {n.message}
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      void handleDelete(n.id, n.read)
                    }}
                    disabled={deletingId === n.id}
                    className="rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    {deletingId === n.id ? "Borrando..." : "Borrar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div ref={ref} />
    </div>
  )
}

export default Notifications
