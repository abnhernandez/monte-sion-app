import Link from "next/link";
import { MapPin, Calendar, HeartHandshake, PlayCircle } from "lucide-react";

export default function LandingHome() {
  return (
    <header className="relative w-full overflow-hidden bg-white dark:bg-black">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-amber-50 dark:from-black dark:via-black dark:to-neutral-950" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-16 sm:py-20 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-5">
            <p className="text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-300">
              Iglesia Cristiana Monte Sion
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white">
              Un lugar para ti en el Reino de Dios
            </h1>

            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200">
              Acompañamos tu caminar en la fe con enseñanza bíblica, comunidad y oración.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/peticion"
                className="inline-flex items-center gap-2 rounded-full bg-amber-600 text-white px-5 py-3 text-sm font-semibold"
              >
                <HeartHandshake className="h-5 w-5" />
                Enviar petición
              </Link>
              <Link
                href="/avisos"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-600 bg-white/90 dark:bg-neutral-800 text-neutral-900 dark:text-white px-5 py-3 text-sm font-semibold"
              >
                <Calendar className="h-5 w-5" />
                Ver avisos
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950 p-4">
              <p className="text-xs text-neutral-500">Reunión general</p>
              <p className="text-lg font-semibold">Domingos 2:30 p.m.</p>
              <p className="text-xs text-neutral-500">Monte Sion · Santa María Atzompa</p>
            </div>
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950 p-4">
              <p className="text-xs text-neutral-500">Reunión de oración</p>
              <p className="text-lg font-semibold">Viernes 6:00 p.m.</p>
              <p className="text-xs text-neutral-500">Abierta a toda la iglesia</p>
            </div>
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950 p-4">
              <p className="text-xs text-neutral-500">Predicaciones</p>
              <Link href="/estudio" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600">
                <PlayCircle className="h-4 w-4" /> Ver recursos
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4" /> Ubicación
            </div>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              Cuicatlán 184, Col. Niños Héroes, Santa María Atzompa.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950 p-4">
            <p className="text-sm font-semibold">¿Cómo debo orar?</p>
            <Link href="/orar" className="mt-2 inline-flex text-xs font-semibold text-amber-600">
              Ver guía
            </Link>
          </div>
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950 p-4">
            <p className="text-sm font-semibold">Biblia</p>
            <Link href="/bible" className="mt-2 inline-flex text-xs font-semibold text-amber-600">
              Leer pasajes
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}