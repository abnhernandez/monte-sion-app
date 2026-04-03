import Link from "next/link"
import { CalendarDays, Cake, Gift, HandHeart, Pencil, Power, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BirthdaySummary } from "@/lib/birthdays/types"
import {
  formatBirthdayShortDate,
  getDaysUntilLabel,
  getOccurrenceStatusLabel,
  getOccurrenceStatusTone,
} from "@/lib/birthdays/utils"

type Props = {
  birthday: BirthdaySummary
  canManage: boolean
  onEdit?: (birthday: BirthdaySummary) => void
  onToggleActive?: (birthday: BirthdaySummary) => void
  onDelete?: (birthday: BirthdaySummary) => void
}

export default function BirthdayCard({
  birthday,
  canManage,
  onEdit,
  onToggleActive,
  onDelete,
}: Props) {
  const isActive = birthday.isActive

  return (
    <article className="group rounded-[1.75rem] border border-border/70 bg-card/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-3 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              {birthday.ministryName}
            </div>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold",
                isActive ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700" : "border-border bg-muted/40 text-muted-foreground"
              )}
            >
              {isActive ? "Activo" : "Pausado"}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="truncate text-[1.55rem] font-semibold tracking-tight text-card-foreground sm:text-[1.7rem]">
              {birthday.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Acompaña: {birthday.leaderName ?? "Aún sin asignar"}
            </p>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
            getOccurrenceStatusTone(birthday.nextOccurrence.status)
          )}
        >
          {getOccurrenceStatusLabel(birthday.nextOccurrence.status)}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-muted/25 p-3">
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            <CalendarDays size={14} />
            Próxima fecha
          </p>
          <p className="mt-2 text-sm font-semibold text-card-foreground">
            {formatBirthdayShortDate(birthday.nextOccurrence.birthdayDateForYear)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{getDaysUntilLabel(birthday.daysUntil)}</p>
        </div>

        <div className="rounded-2xl border border-border bg-muted/25 p-3">
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            <Cake size={14} />
            Edad
          </p>
          <p className="mt-2 text-sm font-semibold text-card-foreground">
            Cumple {birthday.nextOccurrence.turningAge} años
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Este año</p>
        </div>

        <div className="rounded-2xl border border-border bg-muted/25 p-3">
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            <Gift size={14} />
            Regalos
          </p>
          <p className="mt-2 text-sm font-semibold text-card-foreground">
            {birthday.reservedGiftCount}/{birthday.giftCount} reservados
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Lista de ideas</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-border bg-background/80 p-4">
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-primary">
            <HandHeart size={14} />
            Enfoque
          </p>
          <p className="mt-2 text-sm leading-6 text-card-foreground">
            {birthday.nextOccurrence.scriptureReference || "Aún sin versículo"}
          </p>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {birthday.nextOccurrence.prayerFocus || "Aún sin motivo para orar"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background/80 p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Pastel</p>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-card-foreground">
            {birthday.cakeNote || "Sin preferencia capturada"}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          href={`/birthdays/${birthday.id}`}
          className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Ver detalle
        </Link>

        {canManage ? (
          <>
            <button
              onClick={() => onEdit?.(birthday)}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              <Pencil size={14} />
              Editar ficha
            </button>
            <button
              onClick={() => onToggleActive?.(birthday)}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              <Power size={14} />
              {birthday.isActive ? "Desactivar" : "Activar"}
            </button>
            {onDelete ? (
              <button
                onClick={() => onDelete(birthday)}
                className="inline-flex items-center gap-2 rounded-full border border-red-400/20 px-4 py-2 text-sm font-medium text-red-200 transition hover:border-red-400/35 hover:text-red-100"
              >
                <Trash2 size={14} />
                Eliminar
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    </article>
  )
}
