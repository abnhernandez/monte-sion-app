"use client"

import { useEffect, useState, useSyncExternalStore, useTransition } from "react"
import { getRandomVersiculo, type Versiculo } from "@/lib/bible-actions"
import { Youtube, Facebook, Instagram, Music2 } from "lucide-react"


export function Footer() {
  const [verse, setVerse] = useState<Versiculo | null>(null)
  const [, startTransition] = useTransition()
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const currentYear = hydrated ? new Date().getFullYear() : null

  useEffect(() => {
    startTransition(async () => {
      const randomVerse = await getRandomVersiculo()
      setVerse(randomVerse)
    })
  }, [])

  return (
    <footer className="relative bg-[#14090c] border-t border-amber-400/20 py-16">
      <div className="mx-auto max-w-6xl px-6 text-center">

        {/* Verse dinámico */}
        <div className="max-w-2xl mx-auto mb-10">
          {verse ? (
            <>
              <p className="font-serif text-lg md:text-xl text-white/90 leading-relaxed">
                “{verse.texto}”
              </p>
              <p className="mt-2 text-sm font-bold text-amber-400/70">
                {verse.referencia}
              </p>
            </>
          ) : (
            <p className="text-amber-400/50 text-sm">Cargando versículo...</p>
          )}
        </div>

        <div className="my-10 h-px w-full bg-amber-400/30" />

        {/* Nombre Iglesia */}
        <h3 className="font-serif text-2xl md:text-3xl font-bold text-amber-400 mb-6 drop-shadow-[0_0_6px_rgba(255,191,0,0.6)]">
          Iglesia Cristiana Monte Sion
        </h3>

        {/* Redes sociales */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <a href="https://youtube.com/@montesionoaxaca" target="_blank" className="text-amber-400/70 hover:text-amber-400 transition">
            <Youtube className="size-5" />
          </a>
          <a href="https://facebook.com/montesionoax" target="_blank" className="text-amber-400/70 hover:text-amber-400 transition">
            <Facebook className="size-5" />
          </a>
          <a href="https://instagram.com/montesionoaxaca" target="_blank" className="text-amber-400/70 hover:text-amber-400 transition">
            <Instagram className="size-5" />
          </a>
          <a href="https://tiktok.com/@montesionoaxaca" target="_blank" className="text-amber-400/70 hover:text-amber-400 transition">
            <Music2 className="size-5" />
          </a>
        </div>

        {/* Cierre espiritual */}
        <p className="flex flex-col items-center gap-1 mb-6">
          <span className="text-base italic font-semibold text-white/90">
            A Dios sea la gloria
          </span>
          <span className="text-amber-400/70">
            — Romanos 11:36
          </span>
        </p>

        {/* Derechos */}
        <div className="text-xs text-amber-400/50 space-y-2">
          <p>
            © <span suppressHydrationWarning>{currentYear ?? ""}</span> Iglesia Cristiana Monte Sion. Todos los derechos reservados.
          </p>
        </div>

      </div>
    </footer>
  )
}
