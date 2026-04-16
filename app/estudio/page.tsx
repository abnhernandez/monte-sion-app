"use client"

import { useEffect, useMemo, useState } from "react"
import { getServerTime } from "./actions"

const STUDY_GROUP_URL =
  "https://chat.whatsapp.com/Lm9bm3fK9PNGHcHNWkavMr"

// horario MX (GMT-6)
function getStatus(date: Date) {
  const hour = (date.getUTCHours() - 6 + 24) % 24

  const isLive = hour >= 22 && hour < 23
  const isLobby = hour >= 21 && hour < 22 // 1h antes

  return { isLive, isLobby }
}

function getNextStart(date: Date) {
  const next = new Date(date)
  next.setUTCHours(4, 0, 0, 0) // 10pm MX = 4am UTC
  if (date.getUTCHours() > 4) next.setDate(next.getDate() + 1)
  return next
}

function getCountdown(target: Date) {
  const diff = target.getTime() - Date.now()

  const h = Math.max(0, Math.floor(diff / 1000 / 60 / 60))
  const m = Math.max(0, Math.floor((diff / 1000 / 60) % 60))

  return { h, m }
}

export default function EstudioInteractive() {
  const [now, setNow] = useState<Date | null>(null)

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

  const mode: "live" | "lobby" | "off" = isLive
    ? "live"
    : isLobby
    ? "lobby"
    : "off"

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-4xl px-6 py-16">

        {/* STATUS BAR */}
        <div className="flex justify-center mb-8">
          {mode === "live" && (
            <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 text-red-500 px-4 py-1 text-sm font-medium">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              EN VIVO AHORA
            </span>
          )}

          {mode === "lobby" && (
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 text-amber-600 px-4 py-1 text-sm font-medium">
              🔔 Lobby activo · La reunión está por comenzar
            </span>
          )}

          {mode === "off" && (
            <span className="inline-flex items-center gap-2 rounded-full border border-border/40 text-muted-foreground px-4 py-1 text-sm">
              Próxima reunión en {countdown.h}h {countdown.m}m
            </span>
          )}
        </div>

        {/* HERO */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Estudio bíblico en vivo
          </h1>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            {mode === "live" &&
              "La reunión está activa ahora mismo. Puedes unirte y participar en la lectura y oración."}

            {mode === "lobby" &&
              "La sala está preparándose. La gente ya está entrando."}

            {mode === "off" &&
              "Cada noche tenemos una reunión en vivo de estudio y oración."}
          </p>
        </div>

        {/* MAIN STAGE CARD */}
        <div className="mt-10 rounded-2xl border border-border/40 bg-background shadow-sm p-6 md:p-8">

          <div className="flex flex-col md:flex-row justify-between gap-6">

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Sala en vivo
              </p>

              <h2 className="text-2xl font-semibold">
                {mode === "live" && "Reunión activa ahora"}
                {mode === "lobby" && "Entrando en minutos"}
                {mode === "off" && "Programada para esta noche"}
              </h2>

              <p className="text-muted-foreground max-w-md">
                {mode === "live" &&
                  "Puedes entrar ahora mismo a la llamada."}

                {mode === "lobby" &&
                  "La sala está abierta y la comunidad ya está conectándose."}

                {mode === "off" &&
                  `Faltan ${countdown.h}h ${countdown.m}m para la próxima reunión.`}
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-2">

              <a
                href={STUDY_GROUP_URL}
                target="_blank"
                className={`inline-flex items-center justify-center rounded-xl px-6 py-4 text-sm font-semibold shadow-md transition ${
                  mode === "live"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : mode === "lobby"
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "bg-foreground text-background hover:opacity-90"
                }`}
              >
                Unirme a la reunión
              </a>

              <p className="text-xs text-center text-muted-foreground">
                10:00 – 11:00 pm (GMT-6)
              </p>

            </div>

          </div>
        </div>

        {/* SECONDARY CONTEXT */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4">

          <div className="rounded-xl border border-border/40 p-4">
            <p className="text-xs text-muted-foreground">Formato</p>
            <p className="mt-1 font-medium">Reunión en vivo</p>
          </div>

          <div className="rounded-xl border border-border/40 p-4">
            <p className="text-xs text-muted-foreground">Estado</p>
            <p className="mt-1 font-medium capitalize">{mode}</p>
          </div>

          <div className="rounded-xl border border-border/40 p-4">
            <p className="text-xs text-muted-foreground">Acceso</p>
            <p className="mt-1 font-medium">WhatsApp</p>
          </div>

        </div>

      </section>
    </main>
  )
}