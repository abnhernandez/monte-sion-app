import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getBibleCatalog, getBibleChapterVerses, getBiblePassage, getBibleVersions, type BibleVersion } from "@/lib/bible-actions"
import { formatBibleVersionLabel } from "@/lib/bible-version-labels"
import { BibleControls } from "./bible-controls"
import { Verse } from "./verse-block.tsx"
import { parseBibleVerses } from "./verse-parser"

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

type ChapterReading = {
  versionId: string
  versionName: string
  versionLabel: string
  reference: string
  verses: Array<{ number: string | number; text: string }>
  notes?: string[]
}

async function resolveChapterReading({
  book,
  chapter,
  versionId,
  versionName,
}: {
  book: string
  chapter: number
  versionId: string
  versionName: string
}): Promise<ChapterReading> {
  const versionLabel = formatBibleVersionLabel({ id: versionId, name: versionName })
  const fallbackCode = getPassageCodeFromBook(book)

  const useLocalVerses = isRvr1960Version(versionName)
  const localVerses = useLocalVerses ? await getBibleChapterVerses(book, chapter) : []
  const canUseLocalVerses = useLocalVerses && hasLikelyCompleteChapter(localVerses)

  if (canUseLocalVerses) {
    return {
      versionId,
      versionName,
      versionLabel,
      reference: `${book} ${chapter}`,
      verses: localVerses.map((verse) => ({
        number: verse.versiculo,
        text: verse.texto,
      })),
    }
  }

  if (!fallbackCode) {
    return {
      versionId,
      versionName,
      versionLabel,
      reference: `${book} ${chapter}`,
      verses: [],
    }
  }

  const passage = `${fallbackCode}.${chapter}`
  const fallbackData = await getBiblePassage({ bibleId: versionId, passage })
  const verses = fallbackData.verses?.length
    ? fallbackData.verses.map((verse) => ({
        number: verse.number,
        text: verse.text,
      }))
    : fallbackData.text
      ? parseBibleVerses(fallbackData.text).map((verse) => ({
          number: verse.number,
          text: verse.text,
        }))
      : []

  return {
    versionId,
    versionName,
    versionLabel,
    reference: fallbackData.reference ?? `${book} ${chapter}`,
    verses,
    notes: fallbackData.notes,
  }
}

function ChapterReadingView({
  reading,
  book,
  chapter,
  selectedVersionLabel,
  verseSizeClassName,
  verseFontClassName,
  versions,
  selectedVersionId,
}: {
  reading: ChapterReading
  book: string
  chapter: number
  selectedVersionLabel: string
  verseSizeClassName: string
  verseFontClassName: string
  versions: BibleVersion[]
  selectedVersionId: string
}) {
  const passageCode = getPassageCodeFromBook(book)
  const selectionGroupId = `${reading.versionId}:${book}:${chapter}`

  return (
    <article className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-sm font-semibold tracking-[0.16em] text-black/60 uppercase dark:text-white/60">
          {reading.versionLabel}
        </p>
        <p className="text-sm text-black/45 dark:text-white/45">{reading.versionName}</p>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">{book} {chapter}</h2>
          <div className="space-y-3">
            {reading.verses.map((verse, index) => (
              <Verse
                key={`${reading.versionId}-${verse.number}-${index}`}
                number={verse.number}
                text={verse.text}
                sizeClassName={verseSizeClassName}
                fontClassName={verseFontClassName}
                referenceLabel={`${book} ${chapter}:${verse.number} ${selectedVersionLabel}`}
                storageKey={`${book}:${chapter}:${verse.number}:${reading.versionId}`}
                selectionGroupId={selectionGroupId}
                selectionSortOrder={index}
                comparePassage={passageCode ? `${passageCode}.${chapter}.${verse.number}` : undefined}
                compareBibleId={reading.versionId}
                compareVersions={versions}
              />
            ))}
          </div>
        </div>

        {reading.notes && reading.notes.length > 0 ? (
          <aside className="rounded-xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-neutral-900/70">
            <h3 className="mb-2 text-xs font-semibold tracking-[0.14em] text-black/60 uppercase dark:text-white/60">
              Notas
            </h3>
            <ul className="space-y-1.5 text-sm leading-relaxed text-black/75 dark:text-white/75">
              {reading.notes.map((note, index) => (
                <li key={`${reading.versionId}-note-${index}`}>
                  <span className="mr-1 text-xs font-semibold text-black/60 dark:text-white/60">[{index + 1}]</span>
                  {note}
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>
    </article>
  )
}

export default async function BibliaPage({ searchParams }: BiblePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const selectedBookParam = readStringParam(resolvedSearchParams.book)
  const selectedChapterParam = Number(readStringParam(resolvedSearchParams.chapter))
  const selectedVersionParam = readStringParam(resolvedSearchParams.version)
  const selectedParallelVersionParam = readStringParam(resolvedSearchParams.parallelVersion)
  const isParallelMode = readStringParam(resolvedSearchParams.parallel) === "1" || readStringParam(resolvedSearchParams.parallel) === "true"
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

  const parallelVersionCandidate =
    selectedParallelVersionParam && versions.some((version) => version.id === selectedParallelVersionParam && version.id !== selectedVersionId)
      ? versions.find((version) => version.id === selectedParallelVersionParam)
      : versions.find((version) => version.id !== selectedVersionId) ?? versions[0]
  const selectedParallelVersionId = isParallelMode ? (parallelVersionCandidate?.id ?? selectedVersionId) : ""
  const selectedParallelVersionName = isParallelMode
    ? (parallelVersionCandidate?.name ?? selectedVersionName)
    : ""

  const [mainReading, parallelReading] = await Promise.all([
    resolveChapterReading({
      book: selectedBook,
      chapter: selectedChapter,
      versionId: selectedVersionId,
      versionName: selectedVersionName,
    }),
    isParallelMode
      ? resolveChapterReading({
          book: selectedBook,
          chapter: selectedChapter,
          versionId: selectedParallelVersionId,
          versionName: selectedParallelVersionName,
        })
      : Promise.resolve(null),
  ])

  const buildChapterHref = (chapter: number) => {
    const params = new URLSearchParams()

    params.set("book", selectedBook)
    params.set("chapter", String(chapter))
    params.set("version", selectedVersionId)

    if (selectedTextSize !== "md") {
      params.set("textSize", selectedTextSize)
    }

    if (selectedTextFont !== "serif") {
      params.set("textFont", selectedTextFont)
    }

    if (isParallelMode) {
      params.set("parallel", "1")
      params.set("parallelVersion", selectedParallelVersionId || parallelVersionCandidate?.id || selectedVersionId)
    }

    return `/bible?${params.toString()}`
  }

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
              selectedVersionName={selectedVersionName}
              isParallelMode={isParallelMode}
              parallelVersionId={selectedParallelVersionId}
              parallelVersionName={selectedParallelVersionName}
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
              href={buildChapterHref(previousChapter)}
              className="absolute left-0 top-1/2 -translate-x-6 -translate-y-1/2 hidden h-12 w-12 items-center justify-center rounded-full border border-black/15 bg-white/90 text-black/60 shadow-sm hover:text-black sm:inline-flex dark:border-white/15 dark:bg-neutral-900/90 dark:text-white/70"
              aria-label="Capítulo anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
          ) : null}

          {nextChapter ? (
            <Link
              href={buildChapterHref(nextChapter)}
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
                  href={buildChapterHref(previousChapter)}
                  className="inline-flex items-center gap-1 rounded-md border border-black/15 px-3 py-1.5 text-sm dark:border-white/15"
                >
                  <ChevronLeft className="h-4 w-4" /> Anterior
                </Link>
              ) : null}
              {nextChapter ? (
                <Link
                  href={buildChapterHref(nextChapter)}
                  className="inline-flex items-center gap-1 rounded-md border border-black/15 px-3 py-1.5 text-sm dark:border-white/15"
                >
                  Siguiente <ChevronRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>

            <div data-bible-reading>
              {isParallelMode && parallelReading ? (
                <div className="grid gap-10 lg:grid-cols-2">
                  <ChapterReadingView
                    reading={mainReading}
                    book={selectedBook}
                    chapter={selectedChapter}
                    selectedVersionLabel={selectedVersionLabel}
                    verseSizeClassName={verseSizeClassName}
                    verseFontClassName={verseFontClassName}
                    versions={versions}
                    selectedVersionId={selectedVersionId}
                  />

                  <ChapterReadingView
                    reading={parallelReading}
                    book={selectedBook}
                    chapter={selectedChapter}
                    selectedVersionLabel={selectedParallelVersionName}
                    verseSizeClassName={verseSizeClassName}
                    verseFontClassName={verseFontClassName}
                    versions={versions}
                    selectedVersionId={selectedParallelVersionId}
                  />
                </div>
              ) : mainReading.verses.length > 0 ? (
                <ChapterReadingView
                  reading={mainReading}
                  book={selectedBook}
                  chapter={selectedChapter}
                  selectedVersionLabel={selectedVersionLabel}
                  verseSizeClassName={verseSizeClassName}
                  verseFontClassName={verseFontClassName}
                  versions={versions}
                  selectedVersionId={selectedVersionId}
                />
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