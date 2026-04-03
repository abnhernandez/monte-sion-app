"use client"

import { useMemo, useState } from "react"
import NotificationsClient from "@/app/components/NotificationsClient"
import AdminUsersTable from "./AdminUsersTable"
import AdminPeticiones from "./AdminPeticiones"
import ExportButtons from "./ExportButtons"
import type { UserItem } from "./AdminUsersTable"
import type { Peticion } from "./AdminPeticiones"
import Link from "next/link"
import { Bell, ClipboardList, Users, BarChart3, Zap, Settings, type LucideIcon } from "lucide-react"

type Props = {
  users: UserItem[]
  peticiones: Peticion[]
  unreadCount: number
}

export default function AdminPageClient({
  users,
  peticiones,
  unreadCount,
}: Props) {
  const [activeTab, setActiveTab] = useState<"users" | "peticiones">("users")
  const tabs: Array<{
    id: "users" | "peticiones"
    label: string
    icon: LucideIcon
  }> = [
    { id: "users", label: "Usuarios", icon: Users },
    { id: "peticiones", label: "Peticiones", icon: ClipboardList },
  ]

  const stats = useMemo(() => {
    const totalUsers = users.length
    const admins = users.filter((u) => u.role === "admin").length
    const leaders = users.filter((u) => u.role === "leader").length
    const totalPeticiones = peticiones.length
    const pendientes = peticiones.filter((p) => p.estado === "Pendiente").length

    return { totalUsers, admins, leaders, totalPeticiones, pendientes }
  }, [users, peticiones])

  const statCards = [
    {
      label: "Usuarios Totales",
      value: stats.totalUsers,
      subtext: `${stats.admins} Admins`,
      icon: Users,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Peticiones",
      value: stats.totalPeticiones,
      subtext: `${stats.pendientes} Pendientes`,
      icon: ClipboardList,
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      label: "Notificaciones",
      value: unreadCount,
      subtext: "Sin leer",
      icon: Bell,
      color: "bg-orange-500/10 text-orange-600",
    },
  ]

  const quickLinks = [
    { label: "Gestionar Usuarios", href: "/admin/users", icon: Users },
    { label: "Avisos", href: "/avisos#gestion", icon: Zap },
    { label: "Tráfico y campañas", href: "/admin/traffic", icon: BarChart3 },
    { label: "Configuración", href: "/admin/config", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b border-border p-6 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex col justify-between items-start gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Panel Admin</h1>
              <p className="text-muted-foreground mt-2">Gestiona usuarios, peticiones y notificaciones</p>
            </div>
            <ExportButtons />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {statCards.map((card) => (
              <div key={card.label} className="rounded-2xl bg-card border border-border p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{card.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-3">{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-2">{card.subtext}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions Grid */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary hover:bg-secondary transition-all group"
                >
                  <link.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="text-sm font-medium text-foreground">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Main Grid: Tabs + Notifications */}
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Content Tabs */}
            <div className="lg:col-span-3 space-y-6">
              {/* Tab Selector */}
              <div className="flex gap-2 border-b border-border">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="rounded-2xl border border-border bg-card p-6">
                {activeTab === "users" && <AdminUsersTable users={users} />}
                {activeTab === "peticiones" && <AdminPeticiones data={peticiones} />}
              </div>
            </div>

            {/* Notifications Sidebar */}
            <div className="rounded-2xl border border-border bg-card p-5 h-fit sticky top-32 lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Notificaciones</h3>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-red-500 text-white text-xs font-bold px-2.5 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="max-h-[500px] overflow-y-auto space-y-2">
                <NotificationsClient />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
