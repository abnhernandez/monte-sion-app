"use client"

import Link from "next/link"
import { forgotPasswordAction } from "@/lib/auth-actions"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Mail, Send } from "lucide-react"
import * as z from "zod"

const schema = z.object({ email: z.string().email("Correo inválido") })
type FormValues = z.infer<typeof schema>

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    setError(null)
    setMessage(null)

    const result = await forgotPasswordAction(data.email)
    if (result?.error) setError(result.error)
    else setMessage("Te enviamos un enlace. Revisa tu correo.")

    setLoading(false)
  }

  const commonInput =
    "w-full rounded-xl border border-input bg-background px-10 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      <div className="rounded-xl border border-border bg-secondary/60 p-3 text-xs text-muted-foreground">
        Escribe tu correo y te enviaremos un enlace para recuperar acceso.
      </div>

      {message ? <p className="text-sm text-primary" role="status">{message}</p> : null}
      {error ? (
        <p className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      ) : null}

      <label className="block space-y-2">
        <span className="text-xs font-medium text-muted-foreground">Correo</span>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input {...register("email")} placeholder="tu@correo.com" type="email" className={commonInput} disabled={loading} />
        </div>
      </label>

      {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {loading ? "Enviando..." : "Enviar enlace"}
      </button>

      <Link href="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">
        Volver a iniciar sesión
      </Link>
    </form>
  )
}
