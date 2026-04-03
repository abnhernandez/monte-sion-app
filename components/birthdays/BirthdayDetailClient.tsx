"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  BookHeart,
  CalendarDays,
  CheckCheck,
  Clock3,
  HandHeart,
  ScrollText,
  Sparkles,
} from "lucide-react"
import GiftList from "@/components/GiftList"
import BirthdayCommentsThread from "@/components/birthdays/BirthdayCommentsThread"
import { BirthdayHero, BirthdaySection } from "@/components/birthdays/birthday-ui"
import {
  saveBirthdayOccurrence,
  updateBirthdayOccurrenceStatus,
} from "@/lib/birthdays/actions"
import type { BirthdayDetailData, BirthdayOccurrenceStatus } from "@/lib/birthdays/types"
import {
  formatBirthdayDate,
  formatBirthdayDateTime,
  getDaysUntilLabel,
  getOccurrenceStatusLabel,
  getOccurrenceStatusTone,
  getDaysUntilDate,
} from "@/lib/birthdays/utils"
import { canManageBirthdayContent } from "@/lib/roles"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS: { value: BirthdayOccurrenceStatus; label: string }[] = [
  { value: "pending", label: "Por preparar" },
  { value: "prayed", label: "Ya oramos" },
  { value: "ready", label: "Todo listo" },
  { value: "celebrated", label: "Ya se celebró" },
]

export default function BirthdayDetailClient({ data }: { data: BirthdayDetailData }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [form, setForm] = useState({
    scriptureReference: data.upcomingOccurrence.scriptureReference,
    scriptureText: data.upcomingOccurrence.scriptureText,
    prayerFocus: data.upcomingOccurrence.prayerFocus,
    celebrationNote: data.upcomingOccurrence.celebrationNote,
  })

  const daysUntilLabel = useMemo(
    () => getDaysUntilLabel(Math.max(0, getDaysUntilDate(data.upcomingOccurrence.birthdayDateForYear))),
    [data.upcomingOccurrence.birthdayDateForYear]
  )
  const canManage = canManageBirthdayContent(data.role)

  function handleSaveOccurrence() {
    startTransition(async () => {
      try {
        await saveBirthdayOccurrence({
          occurrenceId: data.upcomingOccurrence.id,
          ...form,
        })
        setFeedback("Cambios guardados.")
        setErrorMessage(null)
        router.refresh()
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar la info de este cumple.")
      }
    })
  }

  function handleStatusChange(status: BirthdayOccurrenceStatus) {
    startTransition(async () => {
      try {
        await updateBirthdayOccurrenceStatus(data.upcomingOccurrence.id, status)
        setFeedback(`Estado actualizado a ${getOccurrenceStatusLabel(status)}.`)
        setErrorMessage(null)
        router.refresh()
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "No se pudo actualizar el estado.")
      }
    })
  }

  return (
    <div className="space-y-8">
      <BirthdayHero
        eyebrow="Detalle del cumple"
        title={data.birthday.name}
        description={`${data.birthday.ministryName} · Acompaña: ${data.birthday.leaderName ?? "Aún sin asignar"} · Próximo cumple: ${formatBirthdayDate(data.upcomingOccurrence.birthdayDateForYear)} · cumple ${data.upcomingOccurrence.turningAge} años · ${daysUntilLabel}`}
        tone="primary"
        backHref="/birthdays"
        backLabel="Volver al tablero"
        metrics={[
          {
            label: "Estado",
            value: (
              <span
                className={cn(
                  "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
                  getOccurrenceStatusTone(data.upcomingOccurrence.status)
                )}
              >
                {getOccurrenceStatusLabel(data.upcomingOccurrence.status)}
              </span>
            ),
            note: "Estado actual de esta celebración",
          },
          { label: "Ya oramos", value: formatBirthdayDateTime(data.upcomingOccurrence.prayedAt) },
          { label: "Ya se celebró", value: formatBirthdayDateTime(data.upcomingOccurrence.celebratedAt) },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <BirthdaySection
            eyebrow="Resumen útil"
            title="La información clave en un solo vistazo"
            description="Lo esencial queda arriba; lo editable y lo secundario se separan para que la lectura sea rápida."
            icon={<BookHeart size={18} />}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-border bg-muted/25 p-5">
                <div className="flex items-center gap-3 text-primary">
                  <BookHeart size={18} />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">La Palabra</p>
                </div>
                <p className="mt-4 text-lg font-semibold text-foreground">
                  {data.upcomingOccurrence.scriptureReference || "Aún sin versículo"}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {data.upcomingOccurrence.scriptureText || "Agrega un pasaje que acompañe esta nueva etapa."}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-border bg-muted/25 p-5">
                <div className="flex items-center gap-3 text-primary">
                  <HandHeart size={18} />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">Oración</p>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {data.upcomingOccurrence.prayerFocus || "Agrega algo puntual por lo que quieran orar."}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-border bg-muted/25 p-5">
                <div className="flex items-center gap-3 text-primary">
                  <ScrollText size={18} />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">Ideas para este cumple</p>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {data.upcomingOccurrence.celebrationNote || "Guarda aquí ideas claras para este año."}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-border bg-muted/25 p-5">
                <div className="flex items-center gap-3 text-primary">
                  <CalendarDays size={18} />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">Info base</p>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  Fecha base: {formatBirthdayDate(data.birthday.birthDate)}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Cuenta conectada: {data.birthday.linkedProfileName ?? data.birthday.linkedProfileEmail ?? "Sin cuenta"}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Pastel: {data.birthday.cakeNote || "Sin preferencia capturada"}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Nota general: {data.birthday.generalNote || "Sin nota general"}
                </p>
              </div>
            </div>
          </BirthdaySection>

          {canManage ? (
            <BirthdaySection
              eyebrow="Actualizar este cumple"
              title="Editar el contenido de la celebración"
              description="El formulario se mantiene simple para que cada edición sea rápida y sin dudas."
              icon={<Sparkles size={18} />}
            >
              <div className="grid gap-4">
                <input
                  value={form.scriptureReference}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, scriptureReference: event.target.value }))
                  }
                  placeholder="Ej. Jeremías 29:11"
                  className="rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                <textarea
                  value={form.scriptureText}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, scriptureText: event.target.value }))
                  }
                  rows={4}
                  placeholder="Texto breve o una idea clave del versículo"
                  className="rounded-[1.4rem] border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                <textarea
                  value={form.prayerFocus}
                  onChange={(event) => setForm((current) => ({ ...current, prayerFocus: event.target.value }))}
                  rows={3}
                  placeholder="Algo puntual por lo que quieran orar"
                  className="rounded-[1.4rem] border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                <textarea
                  value={form.celebrationNote}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, celebrationNote: event.target.value }))
                  }
                  rows={4}
                  placeholder="Ideas, pendientes o plan para celebrar"
                  className="rounded-[1.4rem] border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>

              {feedback ? <p className="mt-4 text-sm text-primary">{feedback}</p> : null}
              {errorMessage ? <p className="mt-4 text-sm text-destructive">{errorMessage}</p> : null}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={handleSaveOccurrence}
                  disabled={isPending}
                  className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                >
                  Guardar cambios
                </button>
              </div>
            </BirthdaySection>
          ) : null}

          <GiftList
            gifts={data.gifts}
            occurrenceId={data.upcomingOccurrence.id}
            currentUserId={data.currentUserId}
            role={data.role}
          />

          <BirthdayCommentsThread
            birthdayId={data.birthday.id}
            currentUserId={data.currentUserId}
            role={data.role}
            comments={data.comments}
          />
        </section>

        <aside className="space-y-6">
          {canManage ? (
            <BirthdaySection
              eyebrow="Seguimiento"
              title="Cómo va este cumple"
              description="Marca el estado actual con un toque y deja el resto del seguimiento ordenado."
              icon={<CheckCheck size={18} />}
            >
              <div className="grid gap-3">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusChange(status.value)}
                    disabled={isPending}
                    className={cn(
                      "flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition disabled:opacity-60",
                      data.upcomingOccurrence.status === status.value
                        ? "border-primary/35 bg-primary/10 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/35 hover:text-foreground"
                    )}
                  >
                    <span>{status.label}</span>
                    <span className="text-xs text-muted-foreground">Marcar</span>
                  </button>
                ))}
              </div>
            </BirthdaySection>
          ) : null}

          <BirthdaySection
            eyebrow="Cumples cercanos"
            title="Línea de tiempo de celebraciones"
            description="Ubica el año actual frente a los anteriores sin tener que releer todo el registro."
            icon={<Clock3 size={18} />}
          >
            <div className="space-y-3">
              {[data.currentOccurrence, ...data.otherOccurrences].map((occurrence) => (
                <div
                  key={occurrence.id}
                  className={cn(
                    "rounded-2xl border px-4 py-4",
                    occurrence.id === data.upcomingOccurrence.id
                      ? "border-primary/30 bg-primary/10"
                      : "border-border bg-background"
                  )}
                >
                  <p className="text-sm font-semibold text-foreground">
                    {occurrence.celebrationYear} · {formatBirthdayDate(occurrence.birthdayDateForYear)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Este año cumple {occurrence.turningAge} años · {getOccurrenceStatusLabel(occurrence.status)}
                  </p>
                </div>
              ))}
            </div>
          </BirthdaySection>
        </aside>
      </div>
    </div>
  )
}
