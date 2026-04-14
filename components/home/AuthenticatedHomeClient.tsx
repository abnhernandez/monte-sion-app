"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Card from "@/app/components/card"
import Menu from "@/app/components/menu"

type CardItem = {
  title: string
  href: string
  series: string
}

const CARDS: CardItem[] = [
  // Serie base
  { title: "¿Quién es Dios?", href: "/lecciones/clase/789207", series: "Serie base" },
  { title: "¿Cómo buscar a Dios?", href: "/lecciones/clase/790207", series: "Serie base" },
  { title: "Unción del Espíritu Santo", href: "/lecciones/clase/791207", series: "Serie base" },
  { title: "¿Cómo honrar a Dios?", href: "/lecciones/clase/792207", series: "Serie base" },
  { title: "Id y haced discípulos", href: "/lecciones/clase/793207", series: "Serie base" },

  // Cápsulas
  { title: "El Llamado a Permanecer", href: "/lecciones/clase/1182082866", series: "Cápsulas educativas" },
  { title: "Anatomía de la Gratitud", href: "/lecciones/clase/1182082895", series: "Cápsulas educativas" },
  { title: "Deconstruyendo el Evangelismo", href: "/lecciones/clase/1182082920", series: "Cápsulas educativas" },
  { title: "La Batalla Espiritual", href: "/lecciones/clase/1182082944", series: "Cápsulas educativas" },
  { title: "El Secreto para una Fe Viva", href: "/lecciones/clase/1182082962", series: "Cápsulas educativas" },
  { title: "Un Día de Preguntas", href: "/lecciones/clase/1182082983", series: "Cápsulas educativas" },
  { title: "El Camino Hacia Dios", href: "/lecciones/clase/1182083003", series: "Cápsulas educativas" },
]

export default function AuthenticatedHomeClient() {
  const [collapsed, setCollapsed] = useState(false)
  const [query, setQuery] = useState("")
  const [progress, setProgress] = useState<Record<string, boolean>>({})

  // 🔹 Cargar progreso
  useEffect(() => {
    const saved = localStorage.getItem("progress")
    if (saved) setProgress(JSON.parse(saved))
  }, [])

  // 🔹 Guardar progreso
  const markAsCompleted = (href: string) => {
    const updated = { ...progress, [href]: true }
    setProgress(updated)
    localStorage.setItem("progress", JSON.stringify(updated))
  }

  const normalizedQuery = query.trim().toLowerCase()

  // 🔹 Filtrar
  const filteredCards = useMemo(() => {
    if (!normalizedQuery) return CARDS

    return CARDS.filter((card) =>
      card.title.toLowerCase().includes(normalizedQuery) ||
      card.series.toLowerCase().includes(normalizedQuery)
    )
  }, [normalizedQuery])

  // 🔹 Agrupar por series (Netflix style)
  const grouped = useMemo(() => {
    const map: Record<string, CardItem[]> = {}

    filteredCards.forEach((card) => {
      if (!map[card.series]) map[card.series] = []
      map[card.series].push(card)
    })

    return map
  }, [filteredCards])

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-neutral-900">
      <Menu
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />

      <main className="flex-1 p-6 space-y-8">
        {/* 🔍 Buscador */}
        <div className="max-w-md">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar clase..."
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>

        {/* 🎬 Series tipo Netflix */}
        {Object.keys(grouped).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay resultados.
          </p>
        ) : (
          Object.entries(grouped).map(([series, items]) => (
            <section key={series} className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                {series}
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map(({ title, href }) => {
                  const isCompleted = progress[href]

                  return (
                    <div key={href} className="relative group">
                      <Link href={href} className="block">
                        <Card title={title} />
                      </Link>

                      {/* ✅ Indicador de progreso */}
                      {isCompleted && (
                        <span className="absolute top-2 right-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                          ✓ Completado
                        </span>
                      )}

                      {/* ✅ Botón marcar como visto */}
                      <button
                        onClick={() => markAsCompleted(href)}
                        className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        Marcar
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  )
}