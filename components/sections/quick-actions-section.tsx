import Link from "next/link"
import { getQuickActions } from "@/lib/quick-actions-actions"

export async function QuickActionsSection() {
  const actions = await getQuickActions()

  return (
    <section
      className="mx-auto w-full max-w-6xl px-6 py-8"
      aria-labelledby="titulo-acciones"
    >
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="titulo-acciones"
              className="text-xl font-semibold text-card-foreground"
            >
              Acciones rápidas
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Elige lo que necesitas hoy
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-accent transition-colors hover:text-accent/80"
          >
            Ver todo
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:border-accent/30"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
