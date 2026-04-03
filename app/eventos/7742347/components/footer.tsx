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
    <footer className="bg-muted/30 border-t border-border py-14">
      <div className="mx-auto max-w-6xl px-6">

        {/* Verse dinámico */}
        <div className="text-center max-w-2xl mx-auto">
          {verse ? (
            <>
              <p className="font-serif text-lg text-foreground leading-relaxed">
                “{verse.texto}”
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {verse.referencia}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">Cargando versículo...</p>
          )}
        </div>

        <div className="my-10 h-px w-full bg-border" />

        <div className="flex flex-col items-center gap-6 text-center">

          {/* Nombre Iglesia */}
          <h3 className="font-serif text-xl font-semibold text-foreground">
            Iglesia Cristiana Monte Sion
          </h3>

          {/* Redes */}
          <div className="flex items-center gap-6">
            <a href="https://youtube.com/@montesionoaxaca" target="_blank" className="text-muted-foreground hover:text-primary transition">
              <Youtube className="size-5" />
            </a>
            <a href="https://facebook.com/montesionoax" target="_blank" className="text-muted-foreground hover:text-primary transition">
              <Facebook className="size-5" />
            </a>
            <a href="https://instagram.com/montesionoaxaca" target="_blank" className="text-muted-foreground hover:text-primary transition">
              <Instagram className="size-5" />
            </a>
            <a href="https://tiktok.com/@montesionoaxaca" target="_blank" className="text-muted-foreground hover:text-primary transition">
              <Music2 className="size-5" />
            </a>
          </div>

            <p className="flex flex-col items-center gap-1">
              {/* <span className="flex items-center gap-2">
                Desarrollado con 
                <span className="animate-pulse heart-beat text-red-500">❤️</span>
                y dedicación para la gloria de Dios
              </span> */}

              <span className="text-base italic font-semibold text-foreground">
                A Dios sea la gloria
              </span>

              <span className="text-muted-foreground">
                — Romanos 11:36
              </span>
            </p>
          
          {/* Firma mejorada */}
          <div className="text-xs text-muted-foreground space-y-2">
            <p>
              © <span suppressHydrationWarning>{currentYear ?? ""}</span> Iglesia Cristiana Monte Sion.
              Todos los derechos reservados.
            </p>
          </div>

        </div>
      </div>
    </footer>
  )
}
