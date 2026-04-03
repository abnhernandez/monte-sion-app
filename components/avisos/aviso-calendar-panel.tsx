"use client"

import { useMemo, useState, useTransition } from "react"
import { CalendarDays, Loader2, Radio } from "lucide-react"
import Calendario from "@/app/components/calendario"
import { getRoleLabel, type AppRole } from "@/lib/roles"
import type { EventoItem } from "@/lib/eventos-types"
import type { AvisoClassRecord, GroupOption } from "@/lib/avisos/types"

function toLocalInputValue(value: string) {
  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

function toIsoFromLocal(value: string) {
  return new Date(value).toISOString()
}

export default function AvisoCalendarPanel({
  items,
  groups,
  managedGroupIds,
  role,
  onRefresh,
}: {
  items: AvisoClassRecord[]
  groups: GroupOption[]
  managedGroupIds: string[]
  role: AppRole | null
  onRefresh: () => Promise<void> | void
}) {
  const [isPending, startTransition] = useTransition()
  const [editingItem, setEditingItem] = useState<AvisoClassRecord | null>(null)
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [teacher, setTeacher] = useState("")
  const [description, setDescription] = useState("")
  const [startAt, setStartAt] = useState("")
  const [endAt, setEndAt] = useState("")
  const [liveLink, setLiveLink] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [feedPin, setFeedPin] = useState(false)
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([])
  const [feedback, setFeedback] = useState<string | null>(null)

  const canManage = role === "admin" || role === "leader"

  const calendarItems = useMemo<EventoItem[]>(
    () =>
      items.map((item) => ({
        id: item.id,
        fecha: item.start_at,
        title: item.title,
        subject: item.subject,
        teacher: item.teacher,
        avatarUrl: item.avatar_url,
        startTime: new Date(item.start_at).toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        endTime: item.end_at
          ? new Date(item.end_at).toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        tags: item.tags,
      })),
    [items]
  )

  const assignableGroups = useMemo(() => {
    if (role === "admin") return groups
    return groups.filter((group) => managedGroupIds.includes(group.id))
  }, [groups, managedGroupIds, role])

  function resetForm() {
    setEditingItem(null)
    setTitle("")
    setSubject("")
    setTeacher("")
    setDescription("")
    setStartAt("")
    setEndAt("")
    setLiveLink("")
    setAvatarUrl("")
    setFeedPin(false)
    setSelectedGroups([])
    setSelectedRoles([])
    setFeedback(null)
  }

  function startEdit(item: AvisoClassRecord) {
    setEditingItem(item)
    setTitle(item.title)
    setSubject(item.subject)
    setTeacher(item.teacher)
    setDescription(item.description)
    setStartAt(toLocalInputValue(item.start_at))
    setEndAt(item.end_at ? toLocalInputValue(item.end_at) : "")
    setLiveLink(item.live_link ?? "")
    setAvatarUrl(item.avatar_url ?? "")
    setFeedPin(item.feed_pin)
    setSelectedGroups(item.audience_groups)
    setSelectedRoles(item.audience_roles)
    setFeedback(null)
  }

  async function handleSave() {
    const url = editingItem ? `/api/classes/${editingItem.id}` : "/api/classes"
    const method = editingItem ? "PATCH" : "POST"

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        subject,
        teacher,
        description,
        start_at: toIsoFromLocal(startAt),
        end_at: endAt ? toIsoFromLocal(endAt) : null,
        live_link: liveLink || null,
        ...(avatarUrl.trim() ? { avatar_url: avatarUrl.trim() } : {}),
        feed_pin: feedPin,
        audience_groups: selectedGroups,
        audience_roles: selectedRoles,
      }),
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error ?? "No se pudo guardar la clase.")
    }

    await onRefresh()
    resetForm()
  }

  return (
    <section className="space-y-4 rounded-[1.75rem] border border-border bg-background p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Clases</p>
          <h3 className="text-lg font-bold text-foreground">Calendario educativo</h3>
        </div>
        <span className="rounded-full border border-border bg-muted/20 px-3 py-1.5 text-xs font-medium text-muted-foreground">
          {items.length} programadas
        </span>
      </div>

      {canManage ? (
        <div className="space-y-3 rounded-[1.5rem] border border-border bg-muted/15 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CalendarDays className="h-4 w-4 text-primary" />
            {editingItem ? "Editar clase" : "Programar clase"}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título" className="rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none" />
            <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Materia" className="rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none" />
            <input value={teacher} onChange={(event) => setTeacher(event.target.value)} placeholder="Profesor" className="rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none" />
            <input value={liveLink} onChange={(event) => setLiveLink(event.target.value)} placeholder="Link en vivo" className="rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none" />
            <input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="Avatar desde DB (URL)" className="rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none" />
            <input type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} className="rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none" />
            <input type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} className="rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none" />
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Descripción breve" className="md:col-span-2 rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none" />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-foreground">
              <input type="checkbox" checked={feedPin} onChange={(event) => setFeedPin(event.target.checked)} />
              Fijar en el feed
            </label>
            <span className="text-xs text-muted-foreground">Rol: {role ? getRoleLabel(role) : "Usuario"}</span>
          </div>

          {assignableGroups.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {assignableGroups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() =>
                    setSelectedGroups((current) =>
                      current.includes(group.id)
                        ? current.filter((item) => item !== group.id)
                        : [...current, group.id]
                    )
                  }
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    selectedGroups.includes(group.id)
                      ? "border-primary/30 bg-primary/10 text-foreground"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {group.name}
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {(["leader", "staff", "user"] as AppRole[]).map((roleValue) => (
              <button
                key={roleValue}
                type="button"
                onClick={() =>
                  setSelectedRoles((current) =>
                    current.includes(roleValue)
                      ? current.filter((item) => item !== roleValue)
                      : [...current, roleValue]
                  )
                }
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  selectedRoles.includes(roleValue)
                    ? "border-primary/30 bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                {getRoleLabel(roleValue)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={resetForm} className="rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground">
              Limpiar
            </button>
            <button
              type="button"
              disabled={isPending || !title || !subject || !teacher || !startAt}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await handleSave()
                  } catch (error) {
                    setFeedback(error instanceof Error ? error.message : "No se pudo guardar la clase.")
                  }
                })
              }
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Radio className="h-3.5 w-3.5" />}
              {editingItem ? "Actualizar clase" : "Publicar clase"}
            </button>
          </div>

          {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}
        </div>
      ) : null}

      {items.length > 0 && canManage ? (
        <div className="flex flex-wrap gap-2">
          {items.slice(0, 6).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => startEdit(item)}
              className="rounded-full border border-border bg-muted/20 px-3 py-1.5 text-xs font-medium text-muted-foreground"
            >
              Editar {item.title}
            </button>
          ))}
        </div>
      ) : null}

      <Calendario eventos={calendarItems} titulo="Calendario de clases" categoria="CLASES" />
    </section>
  )
}
