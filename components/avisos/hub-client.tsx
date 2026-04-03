"use client"

import { useEffect, useEffectEvent, useRef, useState, useTransition } from "react"
import { CalendarDays, Plus, RefreshCcw, Shield, Sparkles } from "lucide-react"
import AvisoCard from "@/components/avisos/aviso-card"
import AvisoCalendarPanel from "@/components/avisos/aviso-calendar-panel"
import AvisoComposer from "@/components/avisos/aviso-composer"
import AvisoNotificationBell from "@/components/avisos/aviso-notification-bell"
import { subscribeToAvisosRealtime } from "@/lib/avisos/realtime"
import type { AvisoClassRecord, AvisoDraft, AvisosHubPayload, FeedItem } from "@/lib/avisos/types"
import { getRoleLabel } from "@/lib/roles"
import { cn } from "@/lib/utils"

type TabValue = "feed" | "clases" | "gestion"

function formatClassDate(item: AvisoClassRecord) {
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(item.start_at))
}

function PinnedClassCard({ item }: { item: AvisoClassRecord }) {
  return (
    <article className="rounded-[1.75rem] border border-primary/15 bg-[linear-gradient(135deg,_rgba(59,130,246,0.12),_rgba(255,255,255,0.92))] p-5 shadow-sm dark:bg-[linear-gradient(135deg,_rgba(59,130,246,0.18),_rgba(15,23,42,0.92))]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Clase destacada</p>
          <h3 className="mt-1 text-lg font-bold text-foreground">{item.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{item.subject}</p>
        </div>
        {item.live_link ? (
          <a
            href={item.live_link}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm"
          >
            Unirse en vivo
          </a>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border border-border bg-background/80 px-3 py-1.5">{formatClassDate(item)}</span>
        <span className="rounded-full border border-border bg-background/80 px-3 py-1.5">{item.teacher}</span>
      </div>
      {item.description ? <p className="mt-3 text-sm text-foreground/85">{item.description}</p> : null}
    </article>
  )
}

export default function AvisosHubClient({
  initialData,
}: {
  initialData: AvisosHubPayload
}) {
  const [data, setData] = useState(initialData)
  const [activeTab, setActiveTab] = useState<TabValue>("feed")
  const [composerOpen, setComposerOpen] = useState(false)
  const [editingDraft, setEditingDraft] = useState<AvisoDraft | null>(null)
  const [isPending, startTransition] = useTransition()
  const refreshTimerRef = useRef<number | null>(null)

  const canCompose =
    data.role === "admin" || data.role === "leader" || data.role === "staff"
  const canManage = canCompose

  async function refreshData() {
    const response = await fetch("/api/avisos/feed", {
      method: "GET",
      cache: "no-store",
    })
    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload.error ?? "No se pudo recargar AVISOS.")
    }

    setData(payload)
  }

  const handleRealtimeInvalidate = useEffectEvent(() => {
    if (typeof window === "undefined") return
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current)
    }

    refreshTimerRef.current = window.setTimeout(() => {
      startTransition(async () => {
        try {
          await refreshData()
        } catch {
          // ignore transient realtime refresh errors
        }
      })
    }, 350)
  })

  useEffect(() => {
    const unsubscribe = subscribeToAvisosRealtime(() => {
      handleRealtimeInvalidate()
    })

    return () => {
      unsubscribe()
      if (typeof window !== "undefined" && refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current)
      }
    }
  }, [])

  const pinnedClasses = data.feed.filter((item) => item.kind === "class")
  const postFeed = data.feed.filter((item): item is Extract<FeedItem, { kind: "post" }> => item.kind === "post")

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_32%),linear-gradient(180deg,_#fff,_#f8fafc)] px-4 py-8 dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_32%),linear-gradient(180deg,_#020617,_#0f172a)]">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[1.75rem] border border-border bg-background/90 p-4 shadow-sm backdrop-blur sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Hub social</p>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">AVISOS</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
                {data.role ? getRoleLabel(data.role) : "Público"}
              </span>
              <AvisoNotificationBell count={data.notification_count} notifications={data.notifications} />
              <button
                type="button"
                onClick={() =>
                  startTransition(async () => {
                    await refreshData()
                  })
                }
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground"
              >
                <RefreshCcw className={cn("h-3.5 w-3.5", isPending ? "animate-spin" : "")} />
                Actualizar
              </button>
              {canCompose ? (
                <button
                  type="button"
                  onClick={() => {
                    setComposerOpen((value) => !value)
                    if (composerOpen) {
                      setEditingDraft(null)
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nuevo
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {([
              { key: "feed", label: "Feed", icon: Sparkles },
              { key: "clases", label: "Clases", icon: CalendarDays },
              { key: "gestion", label: "Gestión", icon: Shield, hidden: !canManage },
            ] as Array<{ key: TabValue; label: string; icon: typeof Sparkles; hidden?: boolean }>).map((tab) =>
              tab.hidden ? null : (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
                    activeTab === tab.key
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border bg-background text-muted-foreground"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            )}
          </div>
        </header>

        {canCompose && composerOpen ? (
          <AvisoComposer
            groups={data.groups}
            managedGroupIds={data.managed_group_ids}
            role={data.role}
            currentUserId={data.current_user_id}
            draft={editingDraft}
            onSaved={async () => {
              setComposerOpen(false)
              setEditingDraft(null)
              await refreshData()
            }}
            onCancel={() => {
              setComposerOpen(false)
              setEditingDraft(null)
            }}
          />
        ) : null}

        {activeTab === "feed" ? (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-4">
              {pinnedClasses.length > 0 ? (
                <div className="space-y-3">
                  {pinnedClasses.map((item) => (
                    <PinnedClassCard key={item.id} item={item.class_item} />
                  ))}
                </div>
              ) : null}

              {postFeed.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-border bg-background p-8 text-center shadow-sm">
                  <p className="text-base font-semibold text-foreground">Todavía no hay publicaciones visibles</p>
                  <p className="mt-2 text-sm text-muted-foreground">Cuando alguien publique aquí, el feed aparecerá en tiempo real.</p>
                </div>
              ) : (
                postFeed.map((item) => (
                  <AvisoCard
                    key={item.id}
                    post={item.post}
                    currentUserId={data.current_user_id}
                    role={data.role}
                    canManage={Boolean(
                      data.role === "admin" || data.current_user_id === item.post.author_profile_id
                    )}
                    onEdit={(draft) => {
                      setEditingDraft(draft)
                      setComposerOpen(true)
                      setActiveTab("gestion")
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                    onRefresh={refreshData}
                  />
                ))
              )}
            </section>

            <div className="space-y-4">
              <AvisoCalendarPanel
                items={data.classes}
                groups={data.groups}
                managedGroupIds={data.managed_group_ids}
                role={data.role}
                onRefresh={refreshData}
              />
            </div>
          </div>
        ) : null}

        {activeTab === "clases" ? (
          <AvisoCalendarPanel
            items={data.classes}
            groups={data.groups}
            managedGroupIds={data.managed_group_ids}
            role={data.role}
            onRefresh={refreshData}
          />
        ) : null}

        {activeTab === "gestion" ? (
          canManage ? (
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <section className="space-y-4">
                <div className="rounded-[1.75rem] border border-border bg-background p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Gestión</p>
                  <h2 className="mt-1 text-xl font-bold text-foreground">Panel editorial</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Crea publicaciones, edita las tuyas y coordina clases desde el mismo módulo.
                  </p>
                </div>

                {data.posts.map((post) => (
                  <AvisoCard
                    key={`manage-${post.id}`}
                    post={post}
                    currentUserId={data.current_user_id}
                    role={data.role}
                    canManage={Boolean(data.role === "admin" || data.current_user_id === post.author_profile_id)}
                    onEdit={(draft) => {
                      setEditingDraft(draft)
                      setComposerOpen(true)
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                    onRefresh={refreshData}
                  />
                ))}
              </section>

              <AvisoCalendarPanel
                items={data.classes}
                groups={data.groups}
                managedGroupIds={data.managed_group_ids}
                role={data.role}
                onRefresh={refreshData}
              />
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-border bg-background p-8 text-center shadow-sm">
              <p className="text-base font-semibold text-foreground">No tienes permisos de gestión</p>
              <p className="mt-2 text-sm text-muted-foreground">Tu cuenta puede participar en el feed y en las clases, pero no administrar contenido.</p>
            </div>
          )
        ) : null}
      </div>
    </main>
  )
}
