"use client"

import Link from "next/link"
import { registerAction } from "@/lib/auth-actions"
import { passwordFeedback } from "@/lib/password-feedback"
import { LEGAL_VERSION } from "@/lib/legal"
import { createBrowserClient } from "@supabase/auth-helpers-nextjs"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, ArrowRight, CheckCircle2, Github, Loader2, LockKeyhole, Mail, Sparkles, User } from "lucide-react"
import * as z from "zod"

const schema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email({ message: "Correo inválido" }),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  acceptLegal: z.boolean().refine((value) => value, {
    message: "Debes aceptar los Términos y el Aviso de Privacidad",
  }),
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

export default function RegistroIOSAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pwdFeedback, setPwdFeedback] = useState<string | null>(null)
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      acceptLegal: false,
    },
  })

  const acceptedLegal = watch("acceptLegal")

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const result = await registerAction({
        name: data.name,
        email: data.email,
        password: data.password,
        acceptedLegal: data.acceptLegal,
      })
      if (result?.error) {
        setError(result.error)
        return
      }
      setMessage("Registro completado. Revisa tu correo.")
    } catch {
      setError("Error de servidor")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (value: string) => {
    const feedback = await passwordFeedback({
      length: value.length,
      hasUpper: /[A-Z]/.test(value),
      hasNumber: /\d/.test(value),
      hasSymbol: /[^a-zA-Z0-9]/.test(value),
    })
    if (typeof feedback === "string") setPwdFeedback(feedback)
    else setPwdFeedback(JSON.stringify(feedback))
  }

  const handleOAuthRegister = async (provider: OAuthProvider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
    return error
  }

  const onOAuthClick = async (provider: OAuthProvider) => {
    if (!acceptedLegal) {
      setError("Debes aceptar los Términos y el Aviso de Privacidad para continuar")
      return
    }

    setError(null)
    setMessage(null)
    setOauthLoading(provider)

    try {
      const oauthError = await handleOAuthRegister(provider)
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
        Crea tu cuenta en dos pasos: datos básicos y contraseña.
      </div>

      {error ? (
        <p className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary" role="status">
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </p>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Nombre" icon={<User className="h-4 w-4" />} error={errors.name?.message}>
          <input
            {...register("name")}
            placeholder="Tu nombre"
            className={inputClass}
            disabled={loading}
          />
        </Field>

        <Field label="Correo" icon={<Mail className="h-4 w-4" />} error={errors.email?.message}>
          <input
            {...register("email")}
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
            {...register("password", {
              onChange: (e) => handlePasswordChange(e.target.value),
            })}
            type="password"
            placeholder="Crea una contraseña"
            className={inputClass}
            disabled={loading}
          />
        </Field>

        {pwdFeedback ? (
          <p className="rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">{pwdFeedback}</p>
        ) : null}

        <label className="block rounded-xl border border-border bg-card/60 px-3 py-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-border"
              {...register("acceptLegal")}
            />
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                Acepto los <Link href="/terminos" className="text-primary hover:underline">Términos y Condiciones</Link> y el <Link href="/privacidad" className="text-primary hover:underline">Aviso de Privacidad</Link>.
              </p>
              <p>Versión legal vigente: {LEGAL_VERSION}</p>
            </div>
          </div>
          {errors.acceptLegal?.message ? (
            <p className="mt-2 text-xs text-destructive">{errors.acceptLegal.message}</p>
          ) : null}
        </label>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {loading ? "Registrando..." : "Crear cuenta"}
        </button>

        <Link href="/login" className="block text-center text-xs text-muted-foreground hover:text-foreground">
          Ya tengo cuenta
        </Link>
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
            disabled={oauthLoading !== null || loading}
            aria-label="Continuar con GitHub"
          >
            <Github className="h-4 w-4" />
            GitHub
          </button>

          <button
            onClick={() => onOAuthClick("notion")}
            className={oauthButtonClass}
            disabled={oauthLoading !== null || loading}
            aria-label="Continuar con Notion"
          >
            <Sparkles className="h-4 w-4" />
            Notion
          </button>

          <button
            onClick={() => onOAuthClick("spotify")}
            className={oauthButtonClass}
            disabled={oauthLoading !== null || loading}
            aria-label="Continuar con Spotify"
          >
            <Sparkles className="h-4 w-4" />
            Spotify
          </button>
        </div>
        <p className="text-center text-[11px] text-muted-foreground">
          Al continuar con acceso rápido aceptas los Términos y el Aviso de Privacidad.
        </p>
      </div>
    </div>
  )
}
