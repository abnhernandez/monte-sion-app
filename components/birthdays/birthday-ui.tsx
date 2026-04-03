import Link from "next/link"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type AccentTone = "primary" | "gold"

type BirthdayMetric = {
  label: string
  value: ReactNode
  note?: string
}

type BirthdayPageFrameProps = {
  children: ReactNode
  className?: string
}

type BirthdayHeroProps = {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
  metrics?: BirthdayMetric[]
  tone?: AccentTone
  backHref?: string
  backLabel?: string
}

type BirthdaySectionProps = {
  eyebrow: string
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  tone?: AccentTone
  children: ReactNode
  className?: string
}

type BirthdayEmptyStateProps = {
  title: string
  description: string
  action?: ReactNode
}

export function BirthdayPageFrame({ children, className }: BirthdayPageFrameProps) {
  return (
    <div
      className={cn(
        "relative isolate min-h-screen overflow-hidden bg-background",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,182,93,0.10),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/70 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
    </div>
  )
}

export function BirthdayHero({
  eyebrow,
  title,
  description,
  actions,
  metrics,
  tone = "primary",
  backHref,
  backLabel = "Volver",
}: BirthdayHeroProps) {
  const accentClassName = tone === "gold" ? "text-[#d9b65d]" : "text-primary"
  const accentSoftClassName = tone === "gold" ? "border-[#d9b65d]/20 bg-[#d9b65d]/10" : "border-primary/20 bg-primary/10"

  return (
    <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-4">
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary/35 hover:text-foreground"
            >
              {backLabel}
            </Link>
          ) : null}

          <div className={cn("inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em]", accentClassName)}>
            <span className={cn("inline-flex h-2 w-2 rounded-full", tone === "gold" ? "bg-[#d9b65d]" : "bg-primary")} />
            {eyebrow}
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">{title}</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">{description}</p>
          </div>
        </div>

        <div className="space-y-3 lg:min-w-[18rem] lg:max-w-[24rem]">
          {actions ? <div className="flex flex-wrap gap-3 lg:justify-end">{actions}</div> : null}
          {metrics && metrics.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.label} className={cn("rounded-2xl border p-4", accentSoftClassName, "bg-muted/35") }>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{metric.value}</p>
                  {metric.note ? <p className="mt-1 text-xs text-muted-foreground">{metric.note}</p> : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export function BirthdaySection({
  eyebrow,
  title,
  description,
  icon,
  action,
  tone = "primary",
  children,
  className,
}: BirthdaySectionProps) {
  const accentClassName = tone === "gold" ? "text-[#d9b65d]" : "text-primary"

  return (
    <section
      className={cn(
        "rounded-[1.75rem] border border-border/70 bg-card/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6",
        className
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2 max-w-3xl">
          <div className={cn("inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em]", accentClassName)}>
            {icon}
            {eyebrow}
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
          {description ? <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
        </div>
        {action ? <div className="flex flex-wrap gap-3 lg:justify-end">{action}</div> : null}
      </div>

      <div className="mt-5">{children}</div>
    </section>
  )
}

export function BirthdayEmptyState({ title, description, action }: BirthdayEmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-border/80 bg-muted/20 p-8 text-center">
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}
