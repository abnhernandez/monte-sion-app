"use client"

import { useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

type Lesson = {
  title: string
  videoId: string
  series: string
}

const LESSONS: Lesson[] = [
  { title: "¿Quién es Dios?", videoId: "3yOjATMaEOI", series: "Serie base" },
  { title: "¿Cómo buscar a Dios?", videoId: "_7mwHQHkgJg", series: "Serie base" },
  { title: "Unción del Espíritu Santo", videoId: "rTCGZufgONY", series: "Serie base" },
  { title: "¿Cómo honrar a Dios?", videoId: "1182082944", series: "Serie base" },
  { title: "Id y haced discípulos", videoId: "1182083003", series: "Serie base" },

  { title: "El Llamado a Permanecer", videoId: "1182082866", series: "Cápsulas educativas" },
  { title: "Anatomía de la Gratitud", videoId: "1182082895", series: "Cápsulas educativas" },
  { title: "Deconstruyendo el Evangelismo", videoId: "1182082920", series: "Cápsulas educativas" },
  { title: "La Batalla Espiritual", videoId: "1182082944", series: "Cápsulas educativas" },
  { title: "El Secreto para una Fe Viva", videoId: "1182082962", series: "Cápsulas educativas" },
  { title: "Un Día de Preguntas", videoId: "1182082983", series: "Cápsulas educativas" },
  { title: "El Camino Hacia Dios", videoId: "1182083003", series: "Cápsulas educativas" },
]

export default function LessonPage() {
  const params = useParams()
  const id = params.id as string

  // 🔹 encontrar lección por id
  const lesson = useMemo(() => {
    return LESSONS.find((l) => l.videoId === id)
  }, [id])

  // 🔹 progreso automático
  useEffect(() => {
    if (!id) return

    const saved = localStorage.getItem("progress")
    const progress = saved ? JSON.parse(saved) : {}

    const updated = { ...progress, [id]: true }
    localStorage.setItem("progress", JSON.stringify(updated))
  }, [id])

  if (!lesson) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl font-bold">Lección no encontrada</h1>
        <Link href="/lecciones" className="text-blue-600">
          Volver
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 p-6">
      {/* 🔙 back */}
      <Link href="/" className="text-sm text-blue-500">
        ← Volver
      </Link>

      <div className="mx-auto max-w-4xl space-y-6 mt-4">
        {/* 🎬 video */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
          <iframe
            src={`https://player.vimeo.com/video/${lesson.videoId}?autoplay=0`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            title={lesson.title}
          />
        </div>

        {/* 📄 info */}
        <div>
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          <p className="text-sm text-muted-foreground">
            {lesson.series}
          </p>
        </div>
      </div>
    </div>
  )
}