import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-[100svh] items-center justify-center bg-background px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.5_0.01_255/0.08),transparent_45%)]" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Acceso seguro
          </div>

          <h1 className="text-xl font-semibold text-foreground md:text-2xl">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}

          <Link href="/" className="inline-block text-xs font-medium text-primary hover:underline">
            Volver al inicio
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-border/70 bg-background/60 p-4 md:p-5">
          {children}
        </div>
      </div>
    </div>
  )
}