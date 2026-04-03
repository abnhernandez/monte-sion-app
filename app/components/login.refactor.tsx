"use client"

import Link from "next/link"
import { loginAction } from "@/lib/auth-actions"
import { createBrowserClient } from "@supabase/auth-helpers-nextjs"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, ArrowRight, Github, Loader2, LockKeyhole, Mail, Sparkles } from "lucide-react"
import * as z from "zod"

const schema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Contraseña inválida"),
})

type FormValues = z.infer<typeof schema>
type OAuthProvider = "github" | "notion" | "spotify"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const inputClass =
  "w-full rounded-xl border border-input bg-background px-10 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"

const oauthButtonClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary disabled:opacity-60"

const handleOAuthLogin = async (provider: OAuthProvider) => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${location.origin}/auth/callback`,
    },
  })
  return error
}

function Field({
  label,
  icon,
  children,
  error,
}: {
  label: string
  icon: React.ReactNode
  children: React.ReactNode
  error?: string
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        {children}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </label>
  )
}

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    setError(null)

    try {
      const result = await loginAction(data)
      if (result?.error) setError(result.error)
    } catch {
      setError("Error de servidor")
    } finally {
      setLoading(false)
    }
  }

  const onOAuthClick = async (provider: OAuthProvider) => {
    setError(null)
    setOauthLoading(provider)
    try {
      const oauthError = await handleOAuthLogin(provider)
      if (oauthError) setError(oauthError.message)
    } catch {
      setError("Error de servidor")
    } finally {
      setOauthLoading(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-secondary/60 p-3 text-xs text-muted-foreground">
        Inicia con correo o usa acceso rápido. Te tomará menos de un minuto.
      </div>

      {error ? (
        <p className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Correo" icon={<Mail className="h-4 w-4" />} error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            placeholder="tu@correo.com"
            className={inputClass}
            disabled={loading}
          />
        </Field>

        <Field
          label="Contraseña"
          icon={<LockKeyhole className="h-4 w-4" />}
          error={errors.password?.message}
        >
          <input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            className={inputClass}
            disabled={loading}
          />
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {loading ? "Ingresando..." : "Entrar ahora"}
        </button>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/registro" className="hover:text-foreground">
            Crear cuenta
          </Link>
          <Link href="/forgot-password" className="hover:text-foreground">
            Recuperar contraseña
          </Link>
        </div>
      </form>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="h-px w-full bg-border" />
          Acceso rápido
          <span className="h-px w-full bg-border" />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            onClick={() => onOAuthClick("github")}
            className={oauthButtonClass}
            disabled={oauthLoading !== null}
            aria-label="Continuar con GitHub"
          >
            <Github className="h-4 w-4" />
            GitHub
          </button>

          <button
            onClick={() => onOAuthClick("notion")}
            className={oauthButtonClass}
            disabled={oauthLoading !== null}
            aria-label="Continuar con Notion"
          >
            <Sparkles className="h-4 w-4" />
            Notion
          </button>

          <button
            onClick={() => onOAuthClick("spotify")}
            className={oauthButtonClass}
            disabled={oauthLoading !== null}
            aria-label="Continuar con Spotify"
          >
            <Sparkles className="h-4 w-4" />
            Spotify
          </button>
        </div>
      </div>
    </div>
  )
}
