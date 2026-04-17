"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowRight, BookOpen, Clock3, HeartHandshake, Sparkles, Users } from "lucide-react"
import { getServerTime } from "./actions"

const STUDY_GROUP_URL =
  "https://chat.whatsapp.com/Lm9bm3fK9PNGHcHNWkavMr"

function getStatus(date: Date) {
  const hour = (date.getUTCHours() - 6 + 24) % 24
  const isLive = hour >= 22 && hour < 23
  const isLobby = hour >= 21 && hour < 22
  return { isLive, isLobby }
}

function getNextStart(date: Date) {
  const next = new Date(date)
  next.setUTCHours(4, 0, 0, 0)
  if (date.getUTCHours() > 4) next.setDate(next.getDate() + 1)
  return next
}

function getCountdown(target: Date) {
  const diff = target.getTime() - Date.now()
  const h = Math.max(0, Math.floor(diff / 1000 / 60 / 60))
  const m = Math.max(0, Math.floor((diff / 1000 / 60) % 60))
  return { h, m }
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Mexico_City",
  }).format(date)
}

const RESOURCE_LINKS = [
  {
    href: "/versiculos",
    title: "Memoriza versiculos",
    description: "Practica con modo juego y refuerza lo aprendido en el estudio.",
    icon: BookOpen,
  },
  {
    href: "/orar",
    title: "Guia de oracion",
    description: "Una ruta biblica breve para orar antes y despues de la reunion.",
    icon: HeartHandshake,
  },
  {
    href: "/lecciones",
    title: "Lecciones de apoyo",
    description: "Temas complementarios para profundizar durante la semana.",
    icon: Sparkles,
  },
  {
    href: "/peticion",
    title: "Enviar peticion",
    description: "Comparte motivos de oracion y recibe acompanamiento.",
    icon: Users,
  },
] as const

type ReadingRecommendation = {
  day: string
  title: string
  kind: "bible" | "pdf"
  book?: string
  chapter?: number
  downloadUrl?: string
  focus: string
}

const DAILY_READING: ReadingRecommendation[] = [
  { day: "Lunes", title: "Lucas 22", kind: "bible", book: "Lucas", chapter: 22, focus: "Permanecer en oracion y obediencia en tiempos de prueba." },
  { day: "Martes", title: "Lucas 22", kind: "bible", book: "Lucas", chapter: 22, focus: "Recordar el llamado a velar y permanecer firmes." },
  { day: "Miercoles", title: "Lucas 22", kind: "bible", book: "Lucas", chapter: 22, focus: "Reflexionar en la entrega de Cristo y su misericordia." },
  { day: "Jueves", title: "Lucas 22", kind: "bible", book: "Lucas", chapter: 22, focus: "Aplicar el texto al servicio y la fidelidad diaria." },
  {
    day: "Viernes",
    title: "El cristiano con toda la armadura de Dios",
    kind: "pdf",
    downloadUrl: "https://bplojzsfddhfqnygvomh.supabase.co/storage/v1/object/public/PDFs/el%20cristiano%20con%20toda%20la%20armadura%20de%20Dios%20william%20gurnall.pdf",
    focus: "Lectura de profundizacion sobre guerra espiritual y perseverancia.",
  },
]

function getMxWeekday(date: Date): number {
  const shifted = new Date(date.getTime() - 6 * 60 * 60 * 1000)
  const day = shifted.getUTCDay()

  if (day === 0) return 0 // domingo usa lunes
  if (day === 6) return 4 // sabado usa viernes

  return day - 1 // lunes=0 ... viernes=4
}

export default function EstudioInteractive() {
  const [now, setNow] = useState<Date | null>(null)
  const [showBible, setShowBible] = useState(false)
  const [selectedReadingIndex, setSelectedReadingIndex] = useState<number | null>(null)

  useEffect(() => {
    getServerTime()
      .then((d) => setNow(new Date(d)))
      .catch(() => setNow(new Date()))
  }, [])

  const status = useMemo(() => {
    if (!now) return null
    return getStatus(now)
  }, [now])

  const next = useMemo(() => {
    if (!now) return null
    return getNextStart(now)
  }, [now])

  if (!now || !status || !next) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Cargando sala...
      </main>
    )
  }

  const { isLive, isLobby } = status
  const countdown = getCountdown(next)
  const startsAt = formatTime(next)
  const mode: "live" | "lobby" | "off" = isLive ? "live" : isLobby ? "lobby" : "off"
  const defaultReadingIndex = getMxWeekday(now)
  const activeReadingIndex = selectedReadingIndex ?? defaultReadingIndex
  const activeReading = DAILY_READING[activeReadingIndex]
  const fallbackBibleUrl = "/bible?book=Lucas&chapter=22"
  const bibleUrl = activeReading.kind === "bible" && activeReading.book && activeReading.chapter
    ? `/bible?book=${encodeURIComponent(activeReading.book)}&chapter=${activeReading.chapter}`
    : fallbackBibleUrl

  const openRecommendedReading = (index: number) => {
    const reading = DAILY_READING[index]
    setSelectedReadingIndex(index)

    if (reading.kind === "pdf" && reading.downloadUrl) {
      window.open(reading.downloadUrl, "_blank", "noopener,noreferrer")
      return
    }

    setShowBible(true)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50/70 via-background to-background text-foreground">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 flex justify-center">
          {mode === "live" && (
            <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-1 text-sm font-medium text-red-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              EN VIVO AHORA
            </span>
          )}
          {mode === "lobby" && (
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1 text-sm font-medium text-amber-600">
              Lobby activo, la reunion esta por comenzar
            </span>
          )}
          {mode === "off" && (
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-1 text-sm font-medium text-foreground">
              Proxima reunion en {countdown.h}h {countdown.m}m
            </span>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-border/60 bg-background/95 p-6 shadow-sm sm:p-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-100/80 px-3 py-1 text-xs font-medium text-amber-800">
              <Clock3 className="h-3.5 w-3.5" />
              Encuentro diario 10:00 pm - 11:00 pm (GMT-6)
            </p>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
              Estudio biblico en vivo con lectura directa
            </h1>

            <p className="mt-4 max-w-2xl text-muted-foreground">
              {mode === "live" &&
                "La reunion esta activa. Entra ahora y acompana el estudio con la Biblia desde esta misma pantalla."}
              {mode === "lobby" &&
                "La sala esta por iniciar. Puedes ir preparando lectura y notas antes de conectarte."}
              {mode === "off" &&
                "Prepara tu corazon y llega listo: aqui puedes abrir Biblia, repasar recursos y unirte a tiempo."}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={STUDY_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold shadow-md transition ${
                  mode === "live"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : mode === "lobby"
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "bg-foreground text-background hover:opacity-90"
                }`}
              >
                Unirme a la reunion
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>

              <button
                type="button"
                onClick={() => setShowBible((current) => !current)}
                className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3 text-sm font-semibold transition hover:bg-muted"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                {showBible ? "Ocultar Biblia" : "Abrir Biblia aqui"}
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Estado</p>
                <p className="mt-1 font-medium capitalize">{mode}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Proximo inicio</p>
                <p className="mt-1 font-medium">{startsAt}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Cuenta regresiva</p>
                <p className="mt-1 font-medium">{countdown.h}h {countdown.m}m</p>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-border/60 bg-background/95 p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold">Antes del estudio</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sigue esta secuencia rapida para llegar preparado.
            </p>

            <ol className="mt-5 space-y-3 text-sm">
              <li className="rounded-xl border border-border/60 p-3">1. Abre la lectura en la Biblia integrada.</li>
              <li className="rounded-xl border border-border/60 p-3">2. Repasa un versiculo clave del dia.</li>
              <li className="rounded-xl border border-border/60 p-3">3. Escribe una peticion de oracion si la necesitas.</li>
            </ol>

            <div className="mt-5 rounded-2xl border border-amber-300/40 bg-amber-100/40 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-900 dark:text-amber-200">Lectura recomendada del dia</p>
              <p className="mt-2 text-base font-semibold text-foreground">
                {activeReading.day}: {activeReading.kind === "bible" ? `${activeReading.book} ${activeReading.chapter}` : activeReading.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{activeReading.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{activeReading.focus}</p>
              <button
                type="button"
                onClick={() => openRecommendedReading(activeReadingIndex)}
                className="mt-3 inline-flex items-center rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background transition hover:opacity-90"
              >
                {activeReading.kind === "bible" ? "Abrir lectura en Biblia" : "Descargar libro del viernes"}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {DAILY_READING.map((reading, index) => (
                <button
                  key={`${reading.day}-${reading.book}-${reading.chapter}`}
                  type="button"
                  onClick={() => openRecommendedReading(index)}
                  className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                    activeReadingIndex === index
                      ? "border-primary/50 bg-primary/10 text-foreground"
                      : "border-border/70 bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <p className="font-semibold">{reading.day}</p>
                  <p>{reading.kind === "bible" ? `${reading.book} ${reading.chapter}` : "Recurso PDF"}</p>
                </button>
              ))}
            </div>

            <Link
              href="/enlaces"
              className="mt-6 inline-flex items-center text-sm font-semibold text-primary hover:underline"
            >
              Ver mas recursos
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </aside>
        </div>

        {showBible ? (
          <section className="mt-8 rounded-3xl border border-border/60 bg-background/95 p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Biblia dentro del estudio</h2>
                <p className="text-sm text-muted-foreground">
                  Lectura activa: {activeReading.kind === "bible" ? `${activeReading.book} ${activeReading.chapter}` : "Lucas 22"}. Lee y navega capitulos sin salir de esta pagina.
                </p>
              </div>
              <Link
                href={bibleUrl}
                className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
              >
                Abrir pantalla completa
              </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/70">
              <iframe
                src={bibleUrl}
                title="Biblia integrada"
                className="h-[72vh] min-h-[560px] w-full bg-background"
              />
            </div>
          </section>
        ) : null}

        <section className="mt-8 rounded-3xl border border-border/60 bg-background/95 p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold">Recursos utiles para tu semana</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Todo lo necesario para mantener continuidad entre reuniones.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {RESOURCE_LINKS.map((resource) => {
              const Icon = resource.icon
              return (
                <Link
                  key={resource.href}
                  href={resource.href}
                  className="group rounded-2xl border border-border/70 p-4 transition hover:border-primary/40 hover:bg-muted/40"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/30 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 font-semibold">{resource.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{resource.description}</p>
                  <span className="mt-3 inline-flex items-center text-sm font-medium text-primary">
                    Abrir
                    <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      </section>
    </main>
  )
}