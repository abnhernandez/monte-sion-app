"use client"

import { useMemo, useState, useTransition } from "react"
import {
  Search,
  Eye,
  X,
  Trash2,
  Sparkles,
  Lock,
  CheckCircle2,
  Clock,
  AlertCircle,
  type LucideIcon,
} from "lucide-react"
import { exportCSVFiltered, exportXLSXFiltered } from "@/lib/export-actions"

import {
  updateEstadoPeticion,
  deletePeticion,
  generarResumenIA,
  getPeticionDescifrada,
} from "@/lib/peticiones-actions"
import { ESTADOS_PETICION, type EstadoPeticion } from "@/lib/peticiones-types"

/* ================= TYPES ================= */

export type Peticion = {
  id: string
  nombre?: string | null
  email?: string | null
  estado?: EstadoPeticion | null
  resumen_ia?: string | null
  created_at?: string | null
}

/* ================= UI HELPERS ================= */

const ESTADOS: Record<EstadoPeticion, { label: string; color: string; bgColor: string; icon: LucideIcon }> = {
  Recibida: { label: "Recibida", color: "text-slate-600 dark:text-slate-400", bgColor: "bg-slate-100 dark:bg-slate-900/30", icon: Clock },
  Pendiente: { label: "Pendiente", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-900/30", icon: AlertCircle },
  "En proceso de oración": { label: "En proceso", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30", icon: Clock },
  Completada: { label: "Completada", color: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30", icon: CheckCircle2 },
  Cerrada: { label: "Cerrada", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30", icon: X },
  Resuelta: { label: "Resuelta", color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-100 dark:bg-emerald-900/30", icon: CheckCircle2 },
}

function EstadoBadge({ estado }: { estado?: EstadoPeticion | null }) {
  const s = estado ? ESTADOS[estado] : null
  const Icon = s?.icon || Clock
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${s?.bgColor ?? "bg-slate-100 dark:bg-slate-900/30"} ${s?.color ?? "text-slate-600 dark:text-slate-400"}`}>
      <Icon size={14} />
      {s?.label ?? "—"}
    </span>
  )
}

/* ================= MODAL ================= */

function PeticionModal({
  peticion,
  onClose,
  onUpdate,
  onDelete,
}: {
  peticion: Peticion
  onClose: () => void
  onUpdate: (p: Partial<Peticion>) => void
  onDelete: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [texto, setTexto] = useState<string | null>(null)
  const [loadingTexto, setLoadingTexto] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)

  const puedeResumir = texto && texto.trim().length >= 10

  async function handleDecrypt() {
    setLoadingTexto(true)
    try {
      const plain = await getPeticionDescifrada(peticion.id)
      setTexto(plain)
    } finally {
      setLoadingTexto(false)
    }
  }

  const fullName = peticion.nombre?.trim() || "Petición anónima"

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <header className="flex justify-between items-start p-6 border-b border-border">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground">{fullName}</h3>
            {peticion.email && <p className="text-sm text-muted-foreground mt-1">{peticion.email}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground ml-4 p-1 hover:bg-secondary rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Decrypt Button */}
          {!texto && (
            <button
              onClick={handleDecrypt}
              disabled={loadingTexto}
              className="w-full flex items-center justify-center gap-2 border border-primary/30 hover:border-primary/60 hover:bg-primary/5 rounded-xl py-4 text-primary font-medium transition-all disabled:opacity-50"
            >
              <Lock size={18} />
              {loadingTexto ? "Leyendo petición..." : "Mostrar contenido cifrado"}
            </button>
          )}

          {/* Prayer Request Content */}
          {texto && (
            <div className="bg-background/60 backdrop-blur-sm rounded-xl p-5 border border-border leading-relaxed text-sm text-foreground whitespace-pre-wrap">
              {texto}
            </div>
          )}

          {/* AI Summary */}
          {peticion.resumen_ia && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 uppercase tracking-wide mb-1">Resumen IA</p>
                  <p className="text-sm text-blue-800 dark:text-blue-300">{peticion.resumen_ia}</p>
                </div>
              </div>
            </div>
          )}

          {/* Status Error */}
          {statusError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-xl p-3 text-xs text-red-600 dark:text-red-400">
              {statusError}
            </div>
          )}

          {/* Estado Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Actualizar estado
            </label>
            <select
              value={peticion.estado ?? "Recibida"}
              onChange={(e) =>
                startTransition(async () => {
                  const estado = e.target.value as EstadoPeticion
                  setStatusError(null)
                  try {
                    await updateEstadoPeticion(peticion.id, estado)
                    onUpdate({ estado })
                  } catch (err) {
                    setStatusError(
                      err instanceof Error
                        ? err.message
                        : "No se pudo actualizar el estado"
                    )
                  }
                })
              }
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {Object.entries(ESTADOS).map(([key, s]) => (
                <option key={key} value={key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex flex-col sm:flex-row gap-3 p-6 border-t border-border">
          <button
            disabled={!puedeResumir || isPending}
            onClick={() =>
              startTransition(async () => {
                if (!texto) return
                const resumen = await generarResumenIA(peticion.id, texto)
                onUpdate({ resumen_ia: resumen })
              })
            }
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-primary/30 text-primary hover:bg-primary/10 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={16} />
            Generar resumen IA
          </button>

          <button
            onClick={() => {
              if (confirm("¿Eliminar definitivamente esta petición? Esta acción no se puede deshacer.")) {
                startTransition(async () => {
                  await deletePeticion(peticion.id)
                  onDelete()
                })
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-all"
          >
            <Trash2 size={16} />
            Eliminar
          </button>
        </footer>
      </div>
    </div>
  )
}

/* ================= MAIN ================= */

export default function AdminPeticiones({ data = [] }: { data?: Peticion[] }) {
  const [items, setItems] = useState<Peticion[]>(data)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Peticion | null>(null)
  const [estadoFilter, setEstadoFilter] = useState<"all" | EstadoPeticion>("all")
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent")
  const [exporting, setExporting] = useState<"csv" | "xlsx" | null>(null)

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: items.length }
    ESTADOS_PETICION.forEach((k) => {
      base[k] = items.filter((p) => p.estado === k).length
    })
    return base
  }, [items])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let next = items

    if (q) {
      next = next.filter((p) =>
        `${p.nombre ?? ""} ${p.email ?? ""}`.toLowerCase().includes(q)
      )
    }

    if (estadoFilter !== "all") {
      next = next.filter((p) => p.estado === estadoFilter)
    }

    const sortMultiplier = sortBy === "recent" ? -1 : 1
    next = [...next].sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
      return (aTime - bTime) * sortMultiplier
    })

    return next
  }, [items, search, estadoFilter, sortBy])

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
      const csv = await exportCSVFiltered({
        search,
        estado: estadoFilter,
        sortBy,
      })
      const blob = new Blob([csv], { type: "text/csv" })
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `peticiones_${getDate()}.csv`
      a.click()
      URL.revokeObjectURL(a.href)
    } finally {
      setExporting(null)
    }
  }

  const downloadXLSX = async () => {
    try {
      setExporting("xlsx")
      const data = await exportXLSXFiltered({
        search,
        estado: estadoFilter,
        sortBy,
      })
      const blob = new Blob([new Uint8Array(data)], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `peticiones_${getDate()}.xlsx`
      a.click()
      URL.revokeObjectURL(a.href)
    } finally {
      setExporting(null)
    }
  }

  return (
    <section className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">Peticiones de Oración</h3>
        <p className="text-xs text-muted-foreground mt-1">Gestiona y actualiza el estado de las peticiones</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Buscar por nombre o email..."
            className="w-full pl-10 pr-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value as "all" | EstadoPeticion)}
            className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">Todos los estados</option>
            {Object.entries(ESTADOS).map(([key, s]) => (
              <option key={key} value={key}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "recent" | "oldest")}
            className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="recent">Más recientes</option>
            <option value="oldest">Más antiguas</option>
          </select>

          <button
            onClick={downloadCSV}
            disabled={exporting !== null}
            className="rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {exporting === "csv" ? "Exportando..." : "CSV"}
          </button>
          <button
            onClick={downloadXLSX}
            disabled={exporting !== null}
            className="rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {exporting === "xlsx" ? "Exportando..." : "XLSX"}
          </button>
        </div>
      </div>

      {/* State Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setEstadoFilter("all")}
          className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
            estadoFilter === "all"
              ? "bg-primary text-primary-foreground"
              : "border border-border hover:bg-secondary"
          }`}
        >
          Todas <span className="ml-1 font-bold">({counts.all ?? 0})</span>
        </button>
        {Object.entries(ESTADOS).map(([key, s]) => (
          <button
            key={key}
            onClick={() => setEstadoFilter(key as EstadoPeticion)}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              estadoFilter === key
                ? "bg-primary text-primary-foreground"
                : "border border-border hover:bg-secondary"
            }`}
          >
            {s.label} <span className="ml-1 font-bold">({counts[key] ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Results Counter */}
      <div className="text-xs text-muted-foreground">
        Mostrando <span className="font-semibold text-foreground">{filtered.length}</span> de <span className="font-semibold text-foreground">{items.length}</span> peticiones
      </div>

      {/* Petitions List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No hay peticiones que coincidan con los filtros</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const fullName = p.nombre?.trim() || "Petición anónima"

            return (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-border bg-background/40 backdrop-blur-sm rounded-xl px-4 py-3 hover:border-primary/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{fullName}</p>
                  {p.email && <p className="text-xs text-muted-foreground truncate">{p.email}</p>}
                </div>

                <div className="flex items-center gap-3">
                  <EstadoBadge estado={p.estado} />
                  <button
                    onClick={() => setSelected(p)}
                    className="flex gap-1.5 items-center px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium text-sm"
                  >
                    <Eye size={16} />
                    Ver
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <PeticionModal
          peticion={selected}
          onClose={() => setSelected(null)}
          onUpdate={(patch) => {
            setItems((prev) =>
              prev.map((p) => (p.id === selected.id ? { ...p, ...patch } : p))
            )
            setSelected((s) => (s ? { ...s, ...patch } : s))
          }}
          onDelete={() => {
            setItems((prev) => prev.filter((p) => p.id !== selected.id))
            setSelected(null)
          }}
        />
      )}
    </section>
  )
}
