"use client"

import { useMemo, useState } from "react"
import type { AuditLogEntry } from "@/lib/audit-actions"
import { exportAuditCSV, exportAuditXLSX } from "@/lib/audit-actions"

export default function AuditLogTable({ logs }: { logs: AuditLogEntry[] }) {
  const [query, setQuery] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent")
  const [exporting, setExporting] = useState<"csv" | "xlsx" | null>(null)

  const actions = useMemo(() => {
    const unique = new Set(logs.map((l) => l.action))
    return Array.from(unique)
  }, [logs])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let next = logs.filter((l) => {
      const matchQuery =
        !q ||
        `${l.action} ${l.entity} ${l.entity_id ?? ""} ${l.actor_id}`
          .toLowerCase()
          .includes(q)
      const matchAction = actionFilter === "all" || l.action === actionFilter
      return matchQuery && matchAction
    })
    const sortMultiplier = sortBy === "recent" ? -1 : 1
    next = [...next].sort((a, b) => {
      const aTime = new Date(a.created_at).getTime()
      const bTime = new Date(b.created_at).getTime()
      return (aTime - bTime) * sortMultiplier
    })
    return next
  }, [logs, query, actionFilter, sortBy])

  const getDate = () => {
    return new Intl.DateTimeFormat("sv-SE", {
      timeZone: "America/Mexico_City",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date())
  }

  const downloadCSV = async () => {
    try {
      setExporting("csv")
      const csv = await exportAuditCSV({
        search: query,
        action: actionFilter,
        sortBy,
      })
      const blob = new Blob([csv], { type: "text/csv" })
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `audit_${getDate()}.csv`
      a.click()
      URL.revokeObjectURL(a.href)
    } finally {
      setExporting(null)
    }
  }

  const downloadXLSX = async () => {
    try {
      setExporting("xlsx")
      const data = await exportAuditXLSX({
        search: query,
        action: actionFilter,
        sortBy,
      })
      const blob = new Blob([new Uint8Array(data)], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `audit_${getDate()}.xlsx`
      a.click()
      URL.revokeObjectURL(a.href)
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Auditoría</h2>
          <p className="text-sm text-neutral-500">Actividad del sistema y cambios críticos</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar acción, entidad, actor"
            className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
          />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
          >
            <option value="all">Todas</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "recent" | "oldest")}
            className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
          >
            <option value="recent">Más recientes</option>
            <option value="oldest">Más antiguas</option>
          </select>
          <button
            onClick={downloadCSV}
            disabled={exporting !== null}
            className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-xs"
          >
            {exporting === "csv" ? "Exportando..." : "CSV"}
          </button>
          <button
            onClick={downloadXLSX}
            disabled={exporting !== null}
            className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-xs"
          >
            {exporting === "xlsx" ? "Exportando..." : "XLSX"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-0 text-xs font-semibold bg-neutral-50 dark:bg-neutral-950 px-4 py-3">
          <span>Fecha</span>
          <span>Acción</span>
          <span>Entidad</span>
          <span>Entidad ID</span>
          <span>Actor</span>
          <span>Antes</span>
          <span>Después</span>
        </div>
        {filtered.length === 0 && (
          <div className="p-6 text-sm text-neutral-500">Sin registros</div>
        )}
        {filtered.map((log) => (
          <div
            key={log.id}
            className="grid grid-cols-1 md:grid-cols-7 gap-2 border-t border-neutral-200 dark:border-neutral-800 px-4 py-3 text-sm"
          >
            <span className="text-neutral-500">
              {new Date(log.created_at).toLocaleString()}
            </span>
            <span className="font-medium">{log.action}</span>
            <span>{log.entity}</span>
            <span className="text-neutral-500 break-all">{log.entity_id ?? "—"}</span>
            <span className="text-neutral-500 break-all">{log.actor_id}</span>
            <span className="text-neutral-500 break-all line-clamp-2">
              {log.before_state ?? "—"}
            </span>
            <span className="text-neutral-500 break-all line-clamp-2">
              {log.after_state ?? "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
