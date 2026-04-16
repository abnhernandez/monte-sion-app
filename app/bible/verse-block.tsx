"use client"

import { memo, useState } from "react"
import { toast } from "sonner"

type VerseBlockProps = {
  number: string | number
  text: string
  sizeClassName: string
  fontClassName: string
  referenceLabel: string
}

export const VerseBlock = memo(function VerseBlock({
  number,
  text,
  sizeClassName,
  fontClassName,
  referenceLabel,
}: VerseBlockProps) {
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [isCompareOpen, setIsCompareOpen] = useState(false)

  const verseText = `${referenceLabel}\n${text}`

  const handleCopy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      toast.error("Tu navegador no permite copiar aquí.")
      return
    }

    try {
      await navigator.clipboard.writeText(verseText)
      toast.success("Versículo copiado.")
    } catch {
      toast.error("No se pudo copiar el versículo.")
    }
  }

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: referenceLabel,
          text: verseText,
        })
        return
      } catch {
        // Fall back to clipboard below.
      }
    }

    await handleCopy()
  }

  return (
    <>
      <div
        className={`group relative mb-5 rounded-2xl transition ${isHighlighted ? "bg-amber-100/60 dark:bg-amber-200/10" : ""}`}
      >
        <p
          className={`flex items-start gap-2 whitespace-pre-wrap leading-[1.75] tracking-[0.002em] text-black/90 dark:text-white/90 ${sizeClassName} ${fontClassName}`}
        >
          <span className="mt-[0.18em] inline-flex min-w-7 shrink-0 items-center justify-center rounded-full border border-black/10 bg-black/[0.03] px-1.5 py-0.5 text-[0.72em] font-semibold tabular-nums text-black/70 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70">
            {number}
          </span>
          <span className="min-w-0 flex-1 whitespace-pre-wrap">{text}</span>
        </p>

        <div className="pointer-events-none absolute left-10 top-0 z-20 flex translate-y-[-110%] gap-1 rounded-full border border-black/10 bg-white/95 p-1 opacity-0 shadow-lg backdrop-blur transition group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 dark:border-white/10 dark:bg-neutral-950/95">
          <button
            type="button"
            onClick={() => setIsHighlighted((current) => !current)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              isHighlighted
                ? "bg-amber-500 text-white"
                : "text-black/70 hover:bg-black/5 dark:text-white/75 dark:hover:bg-white/10"
            }`}
          >
            Destacar
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-black/70 transition hover:bg-black/5 dark:text-white/75 dark:hover:bg-white/10"
          >
            Copiar
          </button>
          <button
            type="button"
            onClick={() => setIsCompareOpen(true)}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-black/70 transition hover:bg-black/5 dark:text-white/75 dark:hover:bg-white/10"
          >
            Comparar
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-black/70 transition hover:bg-black/5 dark:text-white/75 dark:hover:bg-white/10"
          >
            Compartir
          </button>
        </div>
      </div>

      {isCompareOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-black/10 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-neutral-950">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/50 dark:text-white/50">Comparar versículo</p>
                <h3 className="mt-1 text-lg font-semibold text-black dark:text-white">{referenceLabel}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCompareOpen(false)}
                className="rounded-full border border-black/10 px-3 py-1.5 text-sm text-black/70 transition hover:bg-black/5 dark:border-white/10 dark:text-white/75 dark:hover:bg-white/10"
              >
                Cerrar
              </button>
            </div>

            <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm leading-relaxed text-black/80 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80">
              {text}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-black/75 transition hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
              >
                Copiar texto
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-black/75 transition hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
              >
                Compartir
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
})
