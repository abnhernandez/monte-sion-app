"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { AlertCircle, CheckCircle2, KeyRound, LockKeyhole } from "lucide-react"

const schema = z
  .object({
    password: z.string().min(6, "Contraseña mínima 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  })
type FormValues = z.infer<typeof schema>

export default function ResetPasswordForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>("Validando enlace...")
  const [ready, setReady] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session) {
        setError("Enlace inválido o expirado")
        setInfo(null)
        setReady(false)
        return
      }
      setInfo(null)
      setReady(true)
    }
    checkSession()
  }, [])

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({ password: data.password })
      if (error) setError(error.message)
      else router.push("/login")
    } catch {
      setError("Error de servidor")
    } finally {
      setLoading(false)
    }
  }

  const commonInput =
    "w-full rounded-xl border border-input bg-background px-10 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      <div className="rounded-xl border border-border bg-secondary/60 p-3 text-xs text-muted-foreground">
        Elige una contraseña nueva que recuerdes con facilidad y sea segura.
      </div>

      {info ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
          <CheckCircle2 className="h-4 w-4" />
          {info}
        </p>
      ) : null}

      {error ? (
        <p className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      ) : null}

      <label className="block space-y-2">
        <span className="text-xs font-medium text-muted-foreground">Nueva contraseña</span>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input {...register("password")} placeholder="Nueva contraseña" type="password" className={commonInput} disabled={!ready || loading} />
        </div>
      </label>
      {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}

      <label className="block space-y-2">
        <span className="text-xs font-medium text-muted-foreground">Confirmar contraseña</span>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input {...register("confirmPassword")} placeholder="Confirmar contraseña" type="password" className={commonInput} disabled={!ready || loading} />
        </div>
      </label>
      {errors.confirmPassword ? <p className="text-sm text-destructive">{errors.confirmPassword.message}</p> : null}

      <button
        type="submit"
        disabled={!ready || loading}
        className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Actualizar contraseña"}
      </button>

      <Link href="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">
        Volver a iniciar sesión
      </Link>
    </form>
  )
}
