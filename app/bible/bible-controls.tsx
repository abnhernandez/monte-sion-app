"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronDown, ChevronLeft, ChevronRight, Square, Volume2, Type } from "lucide-react"
import { formatBibleVersionLabel } from "@/lib/bible-version-labels"

type BibleVersionOption = {
  id: string
  name: string
  language?: string
}

type CapsuleProps = {
  label: string
  value: string
  children: React.ReactNode
  minWidth?: string
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

function Capsule({ label, value, children, minWidth = "min(92vw, 24rem)", isOpen, onOpen, onClose }: CapsuleProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={isOpen ? onClose : onOpen}
        className="flex list-none items-center gap-2 rounded-full border border-black/10 bg-white/85 px-3.5 py-2 text-sm font-medium text-black/80 shadow-sm transition hover:border-black/20 hover:bg-white focus:outline-none dark:border-white/15 dark:bg-neutral-950/85 dark:text-white/85 dark:hover:border-white/25"
        aria-expanded={isOpen}
        aria-label={`${label}: ${value}`}
      >
        <span className="text-[11px] uppercase tracking-[0.16em] text-black/45 dark:text-white/45">{label}</span>
        <span className="max-w-[10rem] truncate">{value}</span>
        <ChevronDown className={`h-4 w-4 opacity-60 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen ? (
        <div
          className="absolute left-0 z-30 mt-2 overflow-hidden rounded-2xl border border-black/10 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-neutral-950"
          style={{ minWidth }}
          onMouseLeave={onClose}
          onMouseEnter={() => undefined}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

type BibleControlsProps = {
  books: string[]
  chapters: number[]
  versions: BibleVersionOption[]
  selectedBook: string
  selectedChapter: number
  selectedVersionId: string
  selectedVersionName: string
  isParallelMode?: boolean
  parallelVersionId?: string
  parallelVersionName?: string
  selectedTextSize: string
  selectedTextFont: string
  previousChapter?: number
  nextChapter?: number
}

const TEXT_SIZE_OPTIONS = [
  { key: "sm", label: "A" },
  { key: "md", label: "AA" },
  { key: "lg", label: "AAA" },
  { key: "xl", label: "AAAA" },
] as const

const TEXT_FONT_OPTIONS = [
  { key: "serif", label: "Source Serif" },
  { key: "sans", label: "Inter" },
] as const

export function BibleControls({
  books,
  chapters,
  versions,
  selectedBook,
  selectedChapter,
  selectedVersionId,
  selectedVersionName,
  isParallelMode = false,
  parallelVersionId = "",
  parallelVersionName = "",
  selectedTextSize,
  selectedTextFont,
  previousChapter,
  nextChapter,
}: BibleControlsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const rootRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<number | null>(null)
  const [openMenu, setOpenMenu] = useState<"book" | "chapter" | "version" | "parallel" | "reader" | null>(null)

  const selectedVersionLabel =
    formatBibleVersionLabel(versions.find((version) => version.id === selectedVersionId) ?? { id: selectedVersionId, name: selectedVersionName })
  const selectedParallelVersionLabel =
    formatBibleVersionLabel(versions.find((version) => version.id === parallelVersionId) ?? { id: parallelVersionId, name: parallelVersionName })

  const chapterOptions = useMemo(() => chapters, [chapters])
  const parallelVersionOptions = useMemo(
    () => versions.filter((version) => version.id !== selectedVersionId),
    [selectedVersionId, versions]
  )
  const defaultParallelVersionId = parallelVersionOptions[0]?.id ?? versions[0]?.id ?? selectedVersionId
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const cancelSpeech = () => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return
      }

      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }

    window.addEventListener("beforeunload", cancelSpeech)
    window.addEventListener("pagehide", cancelSpeech)

    return () => {
      window.removeEventListener("beforeunload", cancelSpeech)
      window.removeEventListener("pagehide", cancelSpeech)
      cancelSpeech()
    }
  }, [])

  const scheduleClose = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
    }

    closeTimerRef.current = window.setTimeout(() => {
      setOpenMenu(null)
    }, 140)
  }

  const cancelClose = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const pushWith = (next: { book?: string; chapter?: number; version?: string; parallel?: boolean; parallelVersion?: string }) => {
    const params = new URLSearchParams(searchParams.toString())

    const book = next.book ?? params.get("book") ?? selectedBook
    const currentChapter = Number(params.get("chapter") ?? selectedChapter)
    const chapterValue = next.chapter ?? (Number.isFinite(currentChapter) ? currentChapter : 1)
    const chapter = String(chapterValue)
    const version = next.version ?? params.get("version") ?? selectedVersionId
    const parallel = next.parallel ?? isParallelMode

    params.set("book", book)
    params.set("chapter", chapter)
    params.set("version", version)
    params.delete("passage")

    if (parallel) {
      const currentParallelVersion = params.get("parallelVersion") ?? parallelVersionId ?? defaultParallelVersionId
      const resolvedParallelVersion = next.parallelVersion ?? currentParallelVersion

      params.set("parallel", "1")
      params.set("parallelVersion", resolvedParallelVersion === version ? defaultParallelVersionId : resolvedParallelVersion)
    } else {
      params.delete("parallel")
      params.delete("parallelVersion")
    }

    setOpenMenu(null)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const toggleParallelMode = () => {
    if (isParallelMode) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("parallel")
      params.delete("parallelVersion")
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
      return
    }

    pushWith({ parallel: true, parallelVersion: defaultParallelVersionId })
  }

  const updateReaderPreference = (next: { textSize?: string; textFont?: string }) => {
    const params = new URLSearchParams(searchParams.toString())

    if (next.textSize) {
      params.set("textSize", next.textSize)
    }

    if (next.textFont) {
      params.set("textFont", next.textFont)
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return
    }

    if (window.speechSynthesis.speaking || isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const readingNode = document.querySelector<HTMLElement>("[data-bible-reading]")
    const text = readingNode?.innerText?.trim()

    if (!text) {
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "es-ES"
    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    const voices = window.speechSynthesis.getVoices()
    const spanishVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith("es"))
    if (spanishVoice) {
      utterance.voice = spanishVoice
    }

    setIsSpeaking(true)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div ref={rootRef} className="rounded-[1.75rem] border border-black/10 bg-white/75 p-2.5 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-neutral-900/72 sm:p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Capsule
            label="Libro"
            value={selectedBook}
            minWidth="min(92vw, 28rem)"
            isOpen={openMenu === "book"}
            onOpen={() => setOpenMenu("book")}
            onClose={scheduleClose}
          >
            <div className="max-h-72 overflow-auto pr-1">
              <div className="grid gap-1 sm:grid-cols-2">
                {books.map((book) => (
                  <button
                    key={book}
                    type="button"
                    onClick={() => pushWith({ book, chapter: 1 })}
                    onMouseEnter={cancelClose}
                    onFocus={cancelClose}
                    className={`rounded-full px-3 py-2 text-left text-sm transition ${
                      book === selectedBook
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "bg-black/5 text-black/80 hover:bg-black/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                    }`}
                  >
                    {book}
                  </button>
                ))}
              </div>
            </div>
          </Capsule>

          <Capsule
            label="Capítulo"
            value={String(selectedChapter)}
            minWidth="min(92vw, 18rem)"
            isOpen={openMenu === "chapter"}
            onOpen={() => setOpenMenu("chapter")}
            onClose={scheduleClose}
          >
            <div className="grid max-h-72 grid-cols-5 gap-1 overflow-auto pr-1">
              {chapterOptions.map((chapter) => (
                <button
                  key={chapter}
                  type="button"
                  onClick={() => pushWith({ chapter })}
                  onMouseEnter={cancelClose}
                  onFocus={cancelClose}
                  className={`inline-flex h-9 items-center justify-center rounded-full text-sm transition ${
                    chapter === selectedChapter
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-black/5 text-black/80 hover:bg-black/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                  }`}
                >
                  {chapter}
                </button>
              ))}
            </div>
          </Capsule>

          <Capsule
            label="Versión"
            value={selectedVersionLabel}
            minWidth="min(92vw, 26rem)"
            isOpen={openMenu === "version"}
            onOpen={() => setOpenMenu("version")}
            onClose={scheduleClose}
          >
            <div className="max-h-72 space-y-1 overflow-auto pr-1">
              {versions.map((version) => (
                <button
                  key={version.id}
                  type="button"
                  onClick={() => pushWith({ version: version.id })}
                  onMouseEnter={cancelClose}
                  onFocus={cancelClose}
                  className={`flex w-full items-center justify-between rounded-full px-3 py-2 text-left text-sm transition ${
                    version.id === selectedVersionId
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-black/5 text-black/80 hover:bg-black/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                  }`}
                >
                  <span className="truncate">{formatBibleVersionLabel(version)}</span>
                </button>
              ))}
            </div>
          </Capsule>

          {isParallelMode ? (
            <Capsule
              label="Paralelo"
              value={selectedParallelVersionLabel}
              minWidth="min(92vw, 26rem)"
              isOpen={openMenu === "parallel"}
              onOpen={() => setOpenMenu("parallel")}
              onClose={scheduleClose}
            >
              <div className="max-h-72 space-y-1 overflow-auto pr-1">
                {parallelVersionOptions.map((version) => (
                  <button
                    key={version.id}
                    type="button"
                    onClick={() => pushWith({ parallel: true, parallelVersion: version.id })}
                    onMouseEnter={cancelClose}
                    onFocus={cancelClose}
                    className={`flex w-full items-center justify-between rounded-full px-3 py-2 text-left text-sm transition ${
                      version.id === parallelVersionId
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "bg-black/5 text-black/80 hover:bg-black/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                    }`}
                  >
                    <span className="truncate">{formatBibleVersionLabel(version)}</span>
                  </button>
                ))}
              </div>
            </Capsule>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <button
            type="button"
            disabled={!previousChapter}
            onClick={() => previousChapter && pushWith({ chapter: previousChapter })}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black/70 transition-all hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:text-white/75 dark:hover:bg-white/10"
            aria-label="Capítulo anterior"
            title="Capítulo anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!nextChapter}
            onClick={() => nextChapter && pushWith({ chapter: nextChapter })}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black/70 transition-all hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:text-white/75 dark:hover:bg-white/10"
            aria-label="Capítulo siguiente"
            title="Capítulo siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="hidden h-5 w-px bg-black/10 dark:bg-white/10 sm:inline-block" />
          <button
            type="button"
            onClick={handleSpeech}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black/65 transition-colors hover:bg-black/5 dark:border-white/15 dark:text-white/70 dark:hover:bg-white/10"
            aria-label={isSpeaking ? "Detener lectura" : "Leer en voz alta"}
            title={isSpeaking ? "Detener lectura" : "Leer en voz alta"}
          >
            {isSpeaking ? <Square className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={toggleParallelMode}
            className={`hidden h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors sm:inline-flex ${
              isParallelMode
                ? "border-[#213c2d] bg-[#213c2d] text-white"
                : "border-black/10 text-black/70 hover:bg-black/5 dark:border-white/15 dark:text-white/75 dark:hover:bg-white/10"
            }`}
            aria-pressed={isParallelMode}
            aria-label={isParallelMode ? "Salir de modo paralelo" : "Activar modo paralelo"}
            title={isParallelMode ? "Salir de modo paralelo" : "Activar modo paralelo"}
          >
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm border border-current/30 text-[8px] leading-none">
              ∥
            </span>
            <span className="hidden sm:inline">Paralelo</span>
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "reader" ? null : "reader")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black/65 transition-colors hover:bg-black/5 dark:border-white/15 dark:text-white/70 dark:hover:bg-white/10"
              aria-label="Configurar lectura"
              title="Configurar lectura"
              aria-expanded={openMenu === "reader"}
            >
              <Type className="h-4 w-4" />
            </button>

            {openMenu === "reader" ? (
              <div className="absolute right-0 z-30 mt-2 w-[min(92vw,22rem)] overflow-hidden rounded-2xl border border-black/10 bg-white p-3 shadow-2xl dark:border-white/10 dark:bg-neutral-950">
                <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-black/60 uppercase dark:text-white/60">
                  Configuracion del lector
                </p>

                <div className="mb-3 grid grid-cols-4 gap-1 rounded-xl border border-black/10 bg-black/5 p-1 dark:border-white/10 dark:bg-white/5">
                  {TEXT_SIZE_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => updateReaderPreference({ textSize: option.key })}
                      className={`rounded-lg px-2 py-2 text-sm font-semibold transition ${
                        selectedTextSize === option.key
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "text-black/70 hover:bg-black/10 dark:text-white/75 dark:hover:bg-white/10"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-1 rounded-xl border border-black/10 bg-black/5 p-1 dark:border-white/10 dark:bg-white/5">
                  {TEXT_FONT_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => updateReaderPreference({ textFont: option.key })}
                      className={`rounded-lg px-2 py-2 text-sm transition ${
                        selectedTextFont === option.key
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "text-black/75 hover:bg-black/10 dark:text-white/75 dark:hover:bg-white/10"
                      } ${option.key === "serif" ? "font-serif" : "font-sans"}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}