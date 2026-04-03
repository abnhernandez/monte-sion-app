"use client"

import { useMemo, useState, useTransition } from "react"
import { updateUserRole, deleteUser } from "@/lib/admin-actions"
import { getRoleLabel, type AppRole } from "@/lib/roles"
import {
  Shield,
  User,
  Trash2,
  Search,
  Users,
} from "lucide-react"

type Role = AppRole

export type UserItem = {
  id: string
  name: string | null
  email: string
  role: Role
  created_at: string
}

function RoleBadge({ role }: { role: Role }) {
  const styles: Record<Role, string> = {
    admin: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    leader: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    staff: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    user: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
  }

  const icon =
    role === "admin"
      ? <Shield size={13} />
      : role === "leader"
      ? <Users size={13} />
      : role === "staff"
      ? <Users size={13} />
      : <User size={13} />

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${styles[role]}`}
    >
      {icon}
      {getRoleLabel(role)}
    </span>
  )
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirmar",
  destructive,
  onConfirm,
  onClose,
  loading,
}: {
  open: boolean
  title: string
  description: string
  confirmText?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>

          <button
            disabled={loading}
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-all ${
              destructive 
                ? "bg-red-600 hover:bg-red-700 disabled:bg-red-600/50" 
                : "bg-primary hover:bg-primary/90 disabled:bg-primary/50"
            }`}
          >
            {loading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg animate-in slide-in-from-bottom-4 ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {message}
    </div>
  )
}

export default function AdminUsersTable({ users = [] }: { users?: UserItem[] }) {
  const [data, setData] = useState<UserItem[]>(users)
  const [isPending, startTransition] = useTransition()

  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all")
  const [page, setPage] = useState(1)
  const perPage = 8

  const [toast, setToast] = useState<null | { msg: string; type: "success" | "error" }>(null)

  const [confirm, setConfirm] = useState<
    | null
    | {
        action: "delete" | "role"
        user: UserItem
        nextRole?: Role
      }
  >(null)

  const filtered = useMemo(() => {
    return data.filter((user) => {
      const matchQuery =
        user.name?.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())

      const matchRole = roleFilter === "all" || user.role === roleFilter
      return matchQuery && matchRole
    })
  }, [data, query, roleFilter])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const confirmDelete = (user: UserItem) => setConfirm({ action: "delete", user })

  const confirmRole = (user: UserItem, nextRole: Role) =>
    setConfirm({ action: "role", user, nextRole })

  const runConfirm = () => {
    if (!confirm) return

    const snapshot = data
    const { user, action, nextRole } = confirm
    setConfirm(null)

    if (action === "delete") {
      setData((current) => current.filter((item) => item.id !== user.id))

      startTransition(async () => {
        try {
          await deleteUser(user.id)
          setToast({ msg: "Usuario eliminado correctamente", type: "success" })
        } catch {
          setData(snapshot)
          setToast({ msg: "Error al eliminar usuario", type: "error" })
        }
      })
    }

    if (action === "role" && nextRole) {
      setData((current) =>
        current.map((item) => (item.id === user.id ? { ...item, role: nextRole } : item))
      )

      startTransition(async () => {
        try {
          await updateUserRole(user.id, nextRole)
          setToast({ msg: `Rol actualizado a ${getRoleLabel(nextRole)}`, type: "success" })
        } catch {
          setData(snapshot)
          setToast({ msg: "Error al cambiar rol", type: "error" })
        }
      })
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">Gestión de Usuarios</h3>
        <p className="text-xs text-muted-foreground mt-1">Administra roles de admin, líder, staff y usuario</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
            placeholder="Buscar por nombre o email..."
            className="w-full rounded-lg border border-border bg-background/50 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(event) => {
            setRoleFilter(event.target.value as "all" | Role)
            setPage(1)
          }}
          className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="all">Todos los roles</option>
          <option value="admin">Admins</option>
          <option value="leader">Líderes</option>
          <option value="staff">Staff</option>
          <option value="user">Usuarios</option>
        </select>
      </div>

      {/* Results Counter */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Mostrando <span className="font-semibold text-foreground">{paginated.length}</span> de <span className="font-semibold text-foreground">{filtered.length}</span>
        </span>
        {totalPages > 1 && <span>Página {page} de {totalPages}</span>}
      </div>

      {/* Users Grid */}
      {paginated.length > 0 ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((user) => (
              <div
                key={user.id}
                className="rounded-xl border border-border bg-background/40 backdrop-blur-sm p-4 hover:border-primary/30 transition-colors"
              >
                {/* User Info */}
                <div className="space-y-1 mb-4">
                  <p className="font-semibold text-foreground text-sm">{user.name || "Sin nombre"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>

                {/* Role Badge */}
                <div className="mb-4">
                  <RoleBadge role={user.role} />
                </div>

                {/* Role Selector */}
                <div className="mb-4 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Cambiar rol
                  </label>
                  <select
                    value={user.role}
                    onChange={(event) => {
                      const nextRole = event.target.value as Role
                      if (nextRole === user.role) return
                      confirmRole(user, nextRole)
                    }}
                    className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="admin">Admin</option>
                    <option value="leader">Líder</option>
                    <option value="staff">Staff</option>
                    <option value="user">Usuario</option>
                  </select>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => confirmDelete(user)}
                  className="w-full rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} />
                  Eliminar
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 mt-6">
              {/* Previous Button */}
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 rounded-lg border border-border disabled:opacity-50 hover:bg-secondary transition-colors text-xs font-medium"
              >
                Anterior
              </button>

              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = index + 1
                  } else {
                    const halfWindow = 2
                    if (page <= halfWindow + 1) {
                      pageNum = index + 1
                    } else if (page >= totalPages - halfWindow) {
                      pageNum = totalPages - 4 + index
                    } else {
                      pageNum = page - halfWindow + index
                    }
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                        page === pageNum
                          ? "bg-primary text-primary-foreground"
                          : "border border-border hover:bg-secondary"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 rounded-lg border border-border disabled:opacity-50 hover:bg-secondary transition-colors text-xs font-medium"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No se encontraron usuarios</p>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.action === "delete" ? "Eliminar usuario" : "Cambiar rol"}
        description={
          confirm?.action === "delete"
            ? `¿Estás seguro de que quieres eliminar a ${confirm?.user.name ?? confirm?.user.email}? Esta acción no se puede deshacer.`
            : `Se actualizará el rol de ${confirm?.user.name ?? confirm?.user.email} a ${
                confirm?.nextRole ? getRoleLabel(confirm.nextRole) : "otro rol"
              }.`
        }
        destructive={confirm?.action === "delete"}
        confirmText={confirm?.action === "delete" ? "Eliminar" : "Guardar cambios"}
        onConfirm={runConfirm}
        onClose={() => setConfirm(null)}
        loading={isPending}
      />

      {/* Toast Notification */}
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  )
}
