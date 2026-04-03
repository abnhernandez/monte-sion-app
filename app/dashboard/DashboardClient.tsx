"use client"

import Link from "next/link"
import { Cake, Construction, Home, User } from "lucide-react"
import { canAccessBirthdays, type AppRole } from "@/lib/roles"

export default function DashboardPage({ role }: { role: AppRole | null }) {
  const showBirthdays = canAccessBirthdays(role)

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-neutral-50 dark:bg-black text-black dark:text-white">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-amber-400/20 text-amber-500 flex items-center justify-center">
            <Construction size={32} />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-semibold">Panel en construcción</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Muy pronto podrás dar seguimiento a tus peticiones y recursos.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black"
          >
            <Home size={18} />
            Inicio
          </Link>

          <Link
            href="/account"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700"
          >
            <User size={18} />
            Mi cuenta
          </Link>
          {showBirthdays ? (
            <Link
              href="/birthdays"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
            >
              <Cake size={18} />
              Cumples
            </Link>
          ) : null}
        </div>

        <p className="text-xs text-zinc-500">
          Monte Sion · Plataforma en desarrollo
        </p>
      </div>
    </div>
  )
}
