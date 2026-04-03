"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import {
  LayoutDashboard,
  Bell,
  ClipboardList,
  Users,
  Settings,
  Shield,
  FileText,
  ChevronLeft,
  BookOpen,
  Menu,
  Cake,
} from "lucide-react"

type Props = {
  role: string | null
}

export default function Sidebar({ role }: Props) {
  const pathname = usePathname()

  /* =====================
     STATE
  ===================== */
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("sidebar:collapsed") === "true"
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem("sidebar:collapsed", String(collapsed))
  }, [collapsed])

  /* =====================
     KEYBOARD SHORTCUTS
  ===================== */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault()
        setCollapsed(v => !v)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])


  /* =====================
     SIDEBAR CONTENT
  ===================== */
  const Content = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5">
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs opacity-60">
              Panel de control
            </p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(v => !v)}
          className="p-2 rounded-md hover:opacity-70 transition"
          aria-label="Colapsar menú (⌘+B)"
        >
          <ChevronLeft
            className={`h-4 w-4 transition-transform ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-6 text-sm">
        {/* General */}
        {!collapsed && (
          <p className="px-3 text-xs font-semibold uppercase opacity-50">
            General
          </p>
        )}

        <div className="space-y-1">
          <SidebarItem
            href="/dashboard"
            label="Dashboard"
            icon={<LayoutDashboard size={18} />}
            active={pathname === "/dashboard"}
            collapsed={collapsed}
            onSelect={() => setMobileOpen(false)}
          />
          <SidebarItem
            href="/peticiones"
            label="Peticiones"
            icon={<ClipboardList size={18} />}
            active={pathname === "/peticiones"}
            collapsed={collapsed}
            onSelect={() => setMobileOpen(false)}
          />
          <SidebarItem
            href="/avisos"
            label="Avisos"
            icon={<Bell size={18} />}
            active={pathname === "/avisos"}
            collapsed={collapsed}
            onSelect={() => setMobileOpen(false)}
          />
          {(role === "admin" || role === "leader") && (
            <SidebarItem
              href="/birthdays"
              label="Cumples"
              icon={<Cake size={18} />}
              active={
                pathname === "/birthdays" ||
                (pathname.startsWith("/birthdays/") && !pathname.startsWith("/birthdays/admin"))
              }
              collapsed={collapsed}
              onSelect={() => setMobileOpen(false)}
            />
          )}
          {role === "admin" && (
            <SidebarItem
              href="/birthdays/admin"
              label="Cumples Admin"
              icon={<Shield size={18} />}
              active={pathname === "/birthdays/admin"}
              collapsed={collapsed}
              onSelect={() => setMobileOpen(false)}
            />
          )}
        </div>

        {/* Biblia */}
        {!collapsed && (
          <p className="px-3 text-xs font-semibold uppercase opacity-50">
            Espiritual
          </p>
        )}

        <div className="space-y-1">
          {role === "admin" ? (
            <SidebarItem
              href="/admin/bible"
              label="Biblia (Admin)"
              icon={<BookOpen size={18} />}
              active={pathname === "/admin/bible"}
              collapsed={collapsed}
              onSelect={() => setMobileOpen(false)}
            />
          ) : (
            <SidebarItem
              href="/bible"
              label="Biblia"
              icon={<BookOpen size={18} />}
              active={pathname === "/bible"}
              collapsed={collapsed}
              onSelect={() => setMobileOpen(false)}
            />
          )}
        </div>

        {/* Admin */}
        {role === "admin" && (
          <>
            {!collapsed && (
              <p className="px-3 text-xs font-semibold uppercase opacity-50">
                Administración
              </p>
            )}

            <div className="space-y-1">
              <SidebarItem
                href="/admin"
                label="Panel Admin"
                icon={<Shield size={18} />}
                active={pathname === "/admin"}
                collapsed={collapsed}
                onSelect={() => setMobileOpen(false)}
              />
              <SidebarItem
                href="/admin/users"
                label="Usuarios"
                icon={<Users size={18} />}
                active={pathname === "/admin/users"}
                collapsed={collapsed}
                onSelect={() => setMobileOpen(false)}
              />
              <SidebarItem
                href="/admin/config"
                label="Configuración"
                icon={<Settings size={18} />}
                active={pathname === "/admin/config"}
                collapsed={collapsed}
                onSelect={() => setMobileOpen(false)}
              />
              <SidebarItem
                href="/admin/audit"
                label="Auditoría"
                icon={<FileText size={18} />}
                active={pathname === "/admin/audit"}
                collapsed={collapsed}
                onSelect={() => setMobileOpen(false)}
              />
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t text-xs opacity-60">
        {!collapsed && (
          <>© {new Date().getFullYear()} · Todo lo que hagas, hacedlo como para el SEÑOR</>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* Mobile button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md shadow"
        aria-label="Abrir menú"
      >
        <Menu size={18} />
      </button>

      {/* Sidebar desktop */}
      <aside
        className={`
          hidden md:flex h-screen sticky top-0 flex-col border-r shadow-sm
          transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
        `}
      >
        {Content}
      </aside>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 h-full shadow-xl flex flex-col">
            {Content}
          </aside>
        </div>
      )}
    </>
  )
}

function SidebarItem({
  href,
  label,
  icon,
  active,
  collapsed,
  onSelect,
}: {
  href: string
  label: string
  icon: ReactNode
  active: boolean
  collapsed: boolean
  onSelect: () => void
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      onClick={onSelect}
      className={`
        group relative flex items-center gap-3 px-3 py-2 rounded-md
        transition-all duration-200
        ${active ? "font-semibold opacity-100" : "opacity-70 hover:opacity-100"}
      `}
    >
      {icon}

      {!collapsed && <span>{label}</span>}

      {collapsed && (
        <span className="
          absolute left-full ml-3 px-2 py-1 text-xs rounded-md
          opacity-0 group-hover:opacity-100 pointer-events-none
          whitespace-nowrap shadow
        ">
          {label}
        </span>
      )}
    </Link>
  )
}
