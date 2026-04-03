"use client"

import { useState, useTransition } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { loginInlineAction, registerAction } from "@/lib/auth-actions"

type AuthModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthSuccess?: () => void
}

export function AuthModal({ open, onOpenChange, onAuthSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">("login")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [acceptedLegal, setAcceptedLegal] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!open) return null

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "")
    const password = String(formData.get("password") ?? "")

    startTransition(async () => {
      const result = await loginInlineAction({ email, password })
      if (result?.error) {
        setError(result.error)
        return
      }
      setMessage("Sesión iniciada")
      onAuthSuccess?.()
    })
  }

  const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") ?? "")
    const email = String(formData.get("email") ?? "")
    const password = String(formData.get("password") ?? "")

    if (!acceptedLegal) {
      setError("Debes aceptar los Términos y el Aviso de Privacidad")
      return
    }

    startTransition(async () => {
      const result = await registerAction({
        name,
        email,
        password,
        acceptedLegal,
      })
      if (result?.error) {
        setError(result.error)
        return
      }
      setMessage("Cuenta creada. Revisa tu correo si es necesario.")
      onAuthSuccess?.()
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950/95 p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Inicia sesión</h3>
            <p className="text-xs text-white/60">
              Reacciona y guarda tu progreso
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full p-2 text-white/70 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex gap-2 rounded-full bg-white/5 p-1 text-xs">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={cn(
              "flex-1 rounded-full px-3 py-2 transition",
              tab === "login" && "bg-white/10 text-white"
            )}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={cn(
              "flex-1 rounded-full px-3 py-2 transition",
              tab === "register" && "bg-white/10 text-white"
            )}
          >
            Crear cuenta
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}

        {tab === "login" ? (
          <form className="mt-5 space-y-3" onSubmit={handleLogin}>
            <label className="block text-xs text-white/70">
              Correo
              <input
                name="email"
                type="email"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="tu@correo.com"
              />
            </label>
            <label className="block text-xs text-white/70">
              Contraseña
              <input
                name="password"
                type="password"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="••••••••"
              />
            </label>
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-emerald-400 py-2 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? "Ingresando..." : "Entrar"}
            </button>
          </form>
        ) : (
          <form className="mt-5 space-y-3" onSubmit={handleRegister}>
            <label className="block text-xs text-white/70">
              Nombre
              <input
                name="name"
                type="text"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Tu nombre"
              />
            </label>
            <label className="block text-xs text-white/70">
              Correo
              <input
                name="email"
                type="email"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="tu@correo.com"
              />
            </label>
            <label className="block text-xs text-white/70">
              Contraseña
              <input
                name="password"
                type="password"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Crea una contraseña"
              />
            </label>
            <label className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
              <input
                type="checkbox"
                checked={acceptedLegal}
                onChange={(event) => setAcceptedLegal(event.target.checked)}
                className="mt-0.5 h-4 w-4"
              />
              <span>
                Acepto los <a href="/terminos" className="text-emerald-300 hover:underline">Términos</a> y el <a href="/privacidad" className="text-emerald-300 hover:underline">Aviso de Privacidad</a>.
              </span>
            </label>
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-emerald-400 py-2 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? "Creando..." : "Crear cuenta"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
