import Link from "next/link"
import { ArrowRight, Calendar, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface LessonCardProps {
  title: string
  href: string
  index?: number
  className?: string
  publishedAt?: string | null
  views?: number
}

export function LessonCard({
  title,
  href,
  index,
  className,
  publishedAt,
  views,
}: LessonCardProps) {
  const publishedLabel = publishedAt
    ? new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(publishedAt))
    : null
  return (
    <article
      className={cn(
        "group relative h-full overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/35 hover:shadow-sm",
        className
      )}
    >
      <Link href={href} className="block">
        <div className="relative h-24 overflow-hidden border-b border-border bg-muted/35">
          <div className="absolute inset-0 opacity-30">
            <svg
              className="h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern
                  id={`grid-${index}`}
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 10 0 L 0 0 0 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-accent/20"
                  />
                </pattern>
              </defs>
              <rect width="100" height="100" fill={`url(#grid-${index})`} />
            </svg>
          </div>

          {/* Lesson number badge */}
          {typeof index === "number" && (
            <div className="absolute left-4 top-4">
              <span className="inline-flex h-7 items-center rounded-full bg-background px-2.5 text-xs font-semibold text-muted-foreground">
                Lección {index + 1}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 pb-0">
          <h3 className="text-base font-semibold text-card-foreground line-clamp-2 text-pretty">
            {title}
          </h3>
        </div>
      </Link>

      <div className="p-5 pt-4">

          {(publishedLabel || typeof views === "number") && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-medium text-muted-foreground">
              {publishedLabel && (
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/60 px-3 py-1">
                  <Calendar className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  <span className="text-muted-foreground">Publicado {publishedLabel}</span>
                </span>
              )}
              {typeof views === "number" && (
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/60 px-3 py-1">
                  <Eye className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  <span className="text-muted-foreground">{views.toLocaleString("es-MX")} vistas</span>
                </span>
              )}
            </div>
          )}

        <div className="mt-4 flex items-center justify-between">
          <Link href={href} className="text-sm font-medium text-accent">
            Explorar
          </Link>
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent transition-transform group-hover:translate-x-1">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </article>
  )
}
