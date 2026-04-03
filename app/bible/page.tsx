"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { Maximize2, Minimize2, Home } from "lucide-react"
import { getBiblePassage } from "@/lib/bible-actions"

export default function BibliaPage() {
  const [fullscreen, setFullscreen] = useState(false)
  const [text, setText] = useState("")
  const [reference, setReference] = useState("")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const data = await getBiblePassage({
        passage: "JHN.3",
      })

      setText(data.text)
      setReference(data.reference)
    })
  }, [])

  return (
    <div className={fullscreen ? "fixed inset-0 z-50 bg-white dark:bg-black" : "min-h-screen"}>
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-amber-600 inline-flex items-center gap-2">
              <Home className="h-4 w-4" /> Inicio
            </Link>
            <h1 className="font-semibold">
              {reference || "Biblia"}
            </h1>
          </div>

          <button
            onClick={() => setFullscreen(v => !v)}
            className="p-2 rounded-md"
            aria-label="Pantalla completa"
          >
            {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>

        {/* Content */}
        <article className="max-w-3xl mx-auto py-6 leading-relaxed text-sm sm:text-base">
          {isPending ? (
            <p className="opacity-60">Cargando pasaje…</p>
          ) : (
            <div>{text}</div>
          )}
        </article>
      </div>
    </div>
  )
}