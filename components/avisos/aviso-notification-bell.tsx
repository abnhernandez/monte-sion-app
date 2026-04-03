"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import type { AvisoNotificationPreview } from "@/lib/avisos/types"

function formatTime(value: string) {
  return new Date(value).toLocaleString("es-MX", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

export default function AvisoNotificationBell({
  count,
  notifications,
}: {
  count: number
  notifications: AvisoNotificationPreview[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm"
      >
        <Bell className="h-4.5 w-4.5" />
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-destructive-foreground">
            {count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-[320px] rounded-[1.35rem] border border-border bg-background p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">Notificaciones</p>
            <span className="text-xs text-muted-foreground">{count} sin leer</span>
          </div>

          <div className="space-y-2">
            {notifications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/10 p-3 text-xs text-muted-foreground">
                No hay notificaciones recientes.
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-2xl border px-3 py-2.5 text-sm ${
                    notification.read
                      ? "border-border bg-muted/10"
                      : "border-primary/15 bg-primary/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-foreground">{notification.title}</p>
                    {!notification.read ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{notification.message}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">{formatTime(notification.created_at)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
