import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getBibleCatalog, getBibleChapterVerses, getBiblePassage, getBibleVersions } from "@/lib/bible-actions"
import { formatBibleVersionLabel } from "@/lib/bible-version-labels"
import { BibleControls } from "./bible-controls"
import { VerseBlock } from "./verse-block.tsx"

type BiblePageProps = {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>
}

const PASSAGE_CODE_TO_BOOK: Record<string, string> = {
  GEN: "Génesis",
  EXO: "Éxodo",
  LEV: "Levítico",
  NUM: "Números",
  DEU: "Deuteronomio",
  JOS: "Josué",
  JDG: "Jueces",
  RUT: "Rut",
  "1SA": "1 Samuel",
  "2SA": "2 Samuel",
  "1KI": "1 Reyes",
  "2KI": "2 Reyes",
  "1CH": "1 Crónicas",
  "2CH": "2 Crónicas",
  EZR: "Esdras",
  NEH: "Nehemías",
  EST: "Ester",
  JOB: "Job",
  PSA: "Salmos",
  PRO: "Proverbios",
  ECC: "Eclesiastés",
  SNG: "Cantares",
  ISA: "Isaías",
  JER: "Jeremías",
  LAM: "Lamentaciones",
  EZK: "Ezequiel",
  DAN: "Daniel",
  HOS: "Oseas",
  JOL: "Joel",
  AMO: "Amós",
  OBA: "Abdías",
  JON: "Jonás",
  MIC: "Miqueas",
  NAM: "Nahúm",
  HAB: "Habacuc",
  ZEP: "Sofonías",
  HAG: "Hageo",
  ZEC: "Zacarías",
  MAL: "Malaquías",
  MAT: "Mateo",
  MRK: "Marcos",
  LUK: "Lucas",
  JHN: "Juan",
  ACT: "Hechos",
  ROM: "Romanos",
  "1CO": "1 Corintios",
  "2CO": "2 Corintios",
  GAL: "Gálatas",
  EPH: "Efesios",
  PHP: "Filipenses",
  COL: "Colosenses",
  "1TH": "1 Tesalonicenses",
  "2TH": "2 Tesalonicenses",
  "1TI": "1 Timoteo",
  "2TI": "2 Timoteo",
  TIT: "Tito",
  PHM: "Filemón",
  HEB: "Hebreos",
  JAS: "Santiago",
  "1PE": "1 Pedro",
  "2PE": "2 Pedro",
  "1JN": "1 Juan",
  "2JN": "2 Juan",
  "3JN": "3 Juan",
  JUD: "Judas",
  REV: "Apocalipsis",
}

const TEXT_SIZE_CLASS_BY_KEY: Record<string, string> = {
  sm: "text-[1.3rem] sm:text-[1.45rem]",
  md: "text-[1.5rem] sm:text-[1.7rem]",
  lg: "text-[1.7rem] sm:text-[1.95rem]",
  xl: "text-[1.95rem] sm:text-[2.2rem]",
}

const TEXT_FONT_CLASS_BY_KEY: Record<string, string> = {
  serif: "font-serif",
  sans: "font-sans",
}

function readStringParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

function parseLegacyPassage(value: string | undefined): { book?: string; chapter?: number } {
  if (!value) {
    return {}
  }

  const normalized = value.trim().toUpperCase()
  const parts = normalized.split(".")

  if (parts.length < 2) {
    return {}
  }

  const code = parts[0]
  const chapter = Number(parts[1])
  const book = PASSAGE_CODE_TO_BOOK[code]

  return {
    book,
    chapter: Number.isFinite(chapter) && chapter > 0 ? chapter : undefined,
  }
}

function normalizeBook(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

function getChapterIndex(chapters: number[], chapter: number): number {
  const idx = chapters.indexOf(chapter)
  return idx >= 0 ? idx : 0
}

function getPassageCodeFromBook(book: string): string | null {
  const normalizedTarget = normalizeBook(book)
  const entry = Object.entries(PASSAGE_CODE_TO_BOOK).find(([, mappedBook]) =>
    normalizeBook(mappedBook) === normalizedTarget
  )

  return entry?.[0] ?? null
}

type ParsedFallbackVerse = {
  verseNumber: string
  text: string
}

function hasLikelyCompleteChapter(verses: Array<{ versiculo: number }>): boolean {
  if (verses.length === 0) {
    return false
  }

  const numbers = verses
    .map((verse) => Number(verse.versiculo))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b)

  if (numbers.length === 0 || numbers[0] !== 1) {
    return false
  }

  for (let index = 1; index < numbers.length; index += 1) {
    if (numbers[index] !== numbers[index - 1] + 1) {
      return false
    }
  }

  return true
}

function parseFallbackVerses(rawText: string): ParsedFallbackVerse[] {
  const normalized = rawText.replace(/\s+/g, " ").trim()
  if (!normalized) {
    return []
  }

  const markerRegex = /(?:^|\s)(\d{1,3})\s+/g
  const markers = Array.from(normalized.matchAll(markerRegex))

  if (markers.length === 0) {
    return []
  }

  const verses: ParsedFallbackVerse[] = []

  for (let i = 0; i < markers.length; i += 1) {
    const current = markers[i]
    const next = markers[i + 1]

    const verseNumber = current[1]
    const start = (current.index ?? 0) + current[0].length
    const end = next?.index ?? normalized.length
    const text = normalized.slice(start, end).trim()

    if (text) {
      verses.push({ verseNumber, text })
    }
  }

  return verses
}

function normalizeVersionName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function isRvr1960Version(name: string): boolean {
  const normalized = normalizeVersionName(name)
  return (
    normalized.includes("rvr1960") ||
    normalized.includes("rvr60") ||
    normalized.includes("rvr 60") ||
    normalized.includes("rvr 1960") ||
    normalized.includes("reina valera 1960")
  )
}

export default async function BibliaPage({ searchParams }: BiblePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const selectedBookParam = readStringParam(resolvedSearchParams.book)
  const selectedChapterParam = Number(readStringParam(resolvedSearchParams.chapter))
  const selectedVersionParam = readStringParam(resolvedSearchParams.version)
  const selectedTextSizeParam = readStringParam(resolvedSearchParams.textSize)
  const selectedTextFontParam = readStringParam(resolvedSearchParams.textFont)
  const legacyPassageParam = readStringParam(resolvedSearchParams.passage)
  const parsedLegacy = parseLegacyPassage(legacyPassageParam)
  const parsedLegacyBook = parsedLegacy.book ?? ""

  const catalog = await getBibleCatalog()
  const versions = await getBibleVersions()
  const books = catalog.books

  if (books.length === 0) {
    return (
      <main className="min-h-screen">
        <section className="mx-auto w-full max-w-5xl px-4 py-8">
          <p className="text-sm text-muted-foreground">No hay libros disponibles para lectura en este momento.</p>
        </section>
      </main>
    )
  }

  if (versions.length === 0) {
    return (
      <main className="min-h-screen">
        <section className="mx-auto w-full max-w-5xl px-4 py-8">
          <p className="text-sm text-muted-foreground">No hay versiones disponibles desde YouVersion en este momento.</p>
        </section>
      </main>
    )
  }

  const selectedBook =
    (selectedBookParam && books.find((book) => normalizeBook(book) === normalizeBook(selectedBookParam))) ||
    (parsedLegacyBook && books.find((book) => normalizeBook(book) === normalizeBook(parsedLegacyBook))) ||
    books[0]

  const chapters = catalog.chaptersByBook[selectedBook] ?? [1]
  const preferredRvrVersion = versions.find((version) => isRvr1960Version(version.name))
  const selectedVersionFromList =
    versions.find((version) => version.id === selectedVersionParam) ??
    preferredRvrVersion ??
    versions[0]
  const selectedVersionId = selectedVersionParam?.trim() && versions.some((version) => version.id === selectedVersionParam.trim())
    ? selectedVersionParam.trim()
    : selectedVersionFromList.id
  const selectedVersionName =
    versions.find((version) => version.id === selectedVersionId)?.name ?? selectedVersionFromList.name
  const selectedVersionLabel = formatBibleVersionLabel({ id: selectedVersionId, name: selectedVersionName })
  const selectedTextSize =
    selectedTextSizeParam && selectedTextSizeParam in TEXT_SIZE_CLASS_BY_KEY ? selectedTextSizeParam : "md"
  const verseSizeClassName = TEXT_SIZE_CLASS_BY_KEY[selectedTextSize]
  const selectedTextFont =
    selectedTextFontParam && selectedTextFontParam in TEXT_FONT_CLASS_BY_KEY ? selectedTextFontParam : "serif"
  const verseFontClassName = TEXT_FONT_CLASS_BY_KEY[selectedTextFont]
  const selectedChapter =
    chapters.find((ch) => ch === selectedChapterParam) ??
    chapters.find((ch) => ch === parsedLegacy.chapter) ??
    chapters[0]

  const useLocalVerses = isRvr1960Version(selectedVersionName)
  const localVerses = useLocalVerses ? await getBibleChapterVerses(selectedBook, selectedChapter) : []
  const canUseLocalVerses = useLocalVerses && hasLikelyCompleteChapter(localVerses)
  const fallbackCode = getPassageCodeFromBook(selectedBook)
  const fallbackPassage = fallbackCode ? `${fallbackCode}.${selectedChapter}` : null
  const fallbackData = !canUseLocalVerses && fallbackPassage
    ? await getBiblePassage({ bibleId: selectedVersionId, passage: fallbackPassage })
    : null
  const verses = canUseLocalVerses ? localVerses : []
  const parsedFallbackVerses = fallbackData?.text ? parseFallbackVerses(fallbackData.text) : []

  const chapterIndex = getChapterIndex(chapters, selectedChapter)
  const previousChapter = chapters[chapterIndex - 1]
  const nextChapter = chapters[chapterIndex + 1]

  return (
    <main className="min-h-screen bg-[#f6f6f6] text-[#111] dark:bg-background dark:text-foreground">
      <section className="mx-auto w-full max-w-7xl px-3 sm:px-6">
        <header className="sticky top-0 z-20 -mx-3 border-b border-black/10 bg-[#f6f6f6]/95 px-3 py-3 backdrop-blur sm:-mx-6 sm:px-6 dark:border-white/10 dark:bg-background/90">
          <div className="mx-auto w-full max-w-5xl">
            <BibleControls
              books={books}
              chapters={chapters}
              versions={versions}
              selectedBook={selectedBook}
              selectedChapter={selectedChapter}
              selectedVersionId={selectedVersionId}
              selectedVersionName={selectedVersionLabel}
              selectedTextSize={selectedTextSize}
              selectedTextFont={selectedTextFont}
              previousChapter={previousChapter}
              nextChapter={nextChapter}
            />
          </div>
        </header>

        <div className="relative mx-auto mt-10 w-full max-w-5xl pb-16">
          {previousChapter ? (
            <Link
              href={`/bible?book=${encodeURIComponent(selectedBook)}&chapter=${previousChapter}&version=${selectedVersionId}`}
              className="absolute left-0 top-1/2 -translate-x-6 -translate-y-1/2 hidden h-12 w-12 items-center justify-center rounded-full border border-black/15 bg-white/90 text-black/60 shadow-sm hover:text-black sm:inline-flex dark:border-white/15 dark:bg-neutral-900/90 dark:text-white/70"
              aria-label="Capítulo anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
          ) : null}

          {nextChapter ? (
            <Link
              href={`/bible?book=${encodeURIComponent(selectedBook)}&chapter=${nextChapter}&version=${selectedVersionId}`}
              className="absolute right-0 top-1/2 translate-x-6 -translate-y-1/2 hidden h-12 w-12 items-center justify-center rounded-full border border-black/15 bg-white/90 text-black/60 shadow-sm hover:text-black sm:inline-flex dark:border-white/15 dark:bg-neutral-900/90 dark:text-white/70"
              aria-label="Capítulo siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </Link>
          ) : null}

          <article className="mx-auto max-w-2xl">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold tracking-[0.16em] text-black/70 uppercase dark:text-white/70">
                {selectedBook} {selectedChapter}
              </p>
            </div>

            <div className="mb-8 flex flex-wrap justify-center gap-2 sm:hidden">
              {previousChapter ? (
                <Link
                  href={`/bible?book=${encodeURIComponent(selectedBook)}&chapter=${previousChapter}&version=${selectedVersionId}`}
                  className="inline-flex items-center gap-1 rounded-md border border-black/15 px-3 py-1.5 text-sm dark:border-white/15"
                >
                  <ChevronLeft className="h-4 w-4" /> Anterior
                </Link>
              ) : null}
              {nextChapter ? (
                <Link
                  href={`/bible?book=${encodeURIComponent(selectedBook)}&chapter=${nextChapter}&version=${selectedVersionId}`}
                  className="inline-flex items-center gap-1 rounded-md border border-black/15 px-3 py-1.5 text-sm dark:border-white/15"
                >
                  Siguiente <ChevronRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>

            <div data-bible-reading>
              {verses.length > 0 ? (
                <div>
                  {verses.map((verse) => (
                    <VerseBlock
                      key={verse.id}
                      number={verse.versiculo}
                      text={verse.texto}
                      sizeClassName={verseSizeClassName}
                      fontClassName={verseFontClassName}
                      referenceLabel={`${selectedBook} ${selectedChapter}:${verse.versiculo} ${selectedVersionLabel}`}
                    />
                  ))}
                </div>
              ) : fallbackData?.text ? (
                <div className="space-y-3">
                  <p className="text-center text-xs uppercase tracking-[0.12em] text-black/55 dark:text-white/55">
                    {fallbackData.reference}
                  </p>
                  {parsedFallbackVerses.length > 0 ? (
                    <div>
                      {parsedFallbackVerses.map((verse, index) => (
                        <VerseBlock
                          key={`${verse.verseNumber}-${index}`}
                          number={verse.verseNumber}
                          text={verse.text}
                          sizeClassName={verseSizeClassName}
                          fontClassName={verseFontClassName}
                          referenceLabel={`${selectedBook} ${selectedChapter}:${verse.verseNumber} ${selectedVersionLabel}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className={`whitespace-pre-wrap leading-[1.75] text-black/90 dark:text-white/90 ${verseSizeClassName} ${verseFontClassName}`}>
                      {fallbackData.text}
                    </p>
                  )}
                  {fallbackData.notes && fallbackData.notes.length > 0 ? (
                    <aside className="mt-8 rounded-xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-neutral-900/70">
                      <h2 className="mb-2 text-xs font-semibold tracking-[0.14em] text-black/60 uppercase dark:text-white/60">
                        Notas
                      </h2>
                      <ul className="space-y-1.5 text-sm leading-relaxed text-black/75 dark:text-white/75">
                        {fallbackData.notes.map((note, index) => (
                          <li key={`note-${index}`}>
                            <span className="mr-1 text-xs font-semibold text-black/60 dark:text-white/60">[{index + 1}]</span>
                            {note}
                          </li>
                        ))}
                      </ul>
                    </aside>
                  ) : null}
                </div>
              ) : (
                <p className="text-center text-sm text-black/60 dark:text-white/60">
                  No hay versículos cargados para este capítulo.
                </p>
              )}
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}