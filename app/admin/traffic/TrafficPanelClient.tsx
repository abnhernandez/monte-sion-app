"use client"

import { useMemo, useState } from "react"
import type { AuditLogEntry } from "@/lib/audit-actions"

type TrafficEvent = AuditLogEntry & {
  parsed?: {
    source?: string
    pathname?: string
    from?: string
    to?: string
    reason?: string
    conversion?: string
    params?: Record<string, string>
    metadata?: Record<string, unknown>
  }
}

function safeParse(value: string | null) {
  if (!value) return null

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>
    return parsed
  } catch {
    return null
  }
}

function extractEvent(log: AuditLogEntry): TrafficEvent {
  const parsed = safeParse(log.after_state)
  return {
    ...log,
    parsed: parsed
      ? {
          source: typeof parsed.source === "string" ? parsed.source : undefined,
          pathname:
            typeof parsed.pathname === "string" ? parsed.pathname : undefined,
          from: typeof parsed.from === "string" ? parsed.from : undefined,
          to: typeof parsed.to === "string" ? parsed.to : undefined,
          reason: typeof parsed.reason === "string" ? parsed.reason : undefined,
          conversion:
            typeof parsed.conversion === "string" ? parsed.conversion : undefined,
          params:
            parsed.params && typeof parsed.params === "object"
              ? (parsed.params as Record<string, string>)
              : undefined,
          metadata:
            parsed.metadata && typeof parsed.metadata === "object"
              ? (parsed.metadata as Record<string, unknown>)
              : undefined,
        }
      : undefined,
  }
}

export default function TrafficPanelClient({ logs }: { logs: AuditLogEntry[] }) {
  const [query, setQuery] = useState("")
  const [action, setAction] = useState("all")

  const events = useMemo(() => logs.map(extractEvent), [logs])

  const actions = useMemo(() => {
    return Array.from(new Set(events.map((event) => event.action)))
  }, [events])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    return events.filter((event) => {
      const haystack = [
        event.action,
        event.entity,
        event.entity_id ?? "",
        event.actor_id,
        event.parsed?.source ?? "",
        event.parsed?.pathname ?? "",
        event.parsed?.from ?? "",
        event.parsed?.to ?? "",
        event.parsed?.conversion ?? "",
        JSON.stringify(event.parsed?.params ?? {}),
      ]
        .join(" ")
        .toLowerCase()

      const matchesQuery = !q || haystack.includes(q)
      const matchesAction = action === "all" || event.action === action

      return matchesQuery && matchesAction
    })
  }, [action, events, query])

  const stats = useMemo(() => {
    const refs = new Map<string, number>()
    const sources = new Map<string, number>()
    const conversions = new Map<string, number>()

    for (const event of events) {
      const ref = event.parsed?.params?.ref
      const source = event.parsed?.params?.utm_source
      const conversion = event.parsed?.conversion

      if (ref) refs.set(ref, (refs.get(ref) ?? 0) + 1)
      if (source) sources.set(source, (sources.get(source) ?? 0) + 1)
      if (conversion) conversions.set(conversion, (conversions.get(conversion) ?? 0) + 1)
    }

    return {
      total: events.length,
      refs: Array.from(refs.entries()).sort((a, b) => b[1] - a[1]),
      sources: Array.from(sources.entries()).sort((a, b) => b[1] - a[1]),
      conversions: Array.from(conversions.entries()).sort((a, b) => b[1] - a[1]),
    }
  }, [events])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Eventos</p>
          <p className="mt-2 text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Refs principales</p>
          <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
            {stats.refs.slice(0, 3).map(([name, count]) => `${name} (${count})`).join(", ") || "Sin datos"}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Conversiones</p>
          <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
            {stats.conversions.slice(0, 3).map(([name, count]) => `${name} (${count})`).join(", ") || "Sin datos"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar ref, utm_source, ruta o conversión"
          className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm"
        />
        <select
          value={action}
          onChange={(event) => setAction(event.target.value)}
          className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm"
        >
          <option value="all">Todos los eventos</option>
          {actions.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 text-sm text-neutral-500">
            No hay eventos para los filtros actuales.
          </div>
        ) : null}

        {filtered.map((event) => (
          <article
            key={event.id}
            className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold">{event.action}</p>
                <p className="text-xs text-neutral-500">
                  {new Date(event.created_at).toLocaleString()} · {event.entity} · {event.entity_id ?? "—"}
                </p>
              </div>
              <p className="text-xs text-neutral-500 break-all">{event.actor_id}</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-500">Ruta</p>
                <p className="break-all">{event.parsed?.pathname ?? event.parsed?.from ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-500">Destino</p>
                <p className="break-all">{event.parsed?.to ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-500">Fuente</p>
                <p className="break-all">{event.parsed?.source ?? event.parsed?.params?.utm_source ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-500">Conversión</p>
                <p className="break-all">{event.parsed?.conversion ?? event.parsed?.reason ?? "—"}</p>
              </div>
            </div>

            <details className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-3">
              <summary className="cursor-pointer text-sm font-medium">Query state</summary>
              <pre className="mt-3 overflow-x-auto text-xs text-neutral-600 dark:text-neutral-400">
{JSON.stringify(event.parsed?.params ?? event.parsed?.metadata ?? {}, null, 2)}
              </pre>
            </details>
          </article>
        ))}
      </div>
    </div>
  )
}