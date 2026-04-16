"use server"

import { getSupabaseServer } from "@/lib/supabase-server"

export interface Versiculo {
  id: number
  libro: string
  capitulo: number
  versiculo: number
  texto: string
  referencia?: string
}

export interface BibleCatalog {
  books: string[]
  chaptersByBook: Record<string, number[]>
}

export interface BibleVersion {
  id: string
  name: string
  language?: string
}

export interface BiblePassageResult {
  reference: string
  text: string
  versionId?: string
  versionName?: string
  notes?: string[]
}

const LICENSED_SPANISH_BIBLE_FALLBACK: BibleVersion[] = [
  { id: "1637", name: "Spanish NVI", language: "es" },
  { id: "128", name: "Nueva Versión Internacional 2022", language: "es" },
  { id: "2664", name: "Nueva Versión Internacional (Spanish New International Version) 2015", language: "es" },
  { id: "89", name: "La Biblia de las Américas", language: "es" },
  { id: "103", name: "Nueva Biblia de las Américas", language: "es" },
]

const BIBLE_BOOK_DISPLAY_ORDER = [
  "Génesis",
  "Éxodo",
  "Levítico",
  "Números",
  "Deuteronomio",
  "Josué",
  "Jueces",
  "Rut",
  "1 Samuel",
  "2 Samuel",
  "1 Reyes",
  "2 Reyes",
  "1 Crónicas",
  "2 Crónicas",
  "Esdras",
  "Nehemías",
  "Ester",
  "Job",
  "Salmos",
  "Proverbios",
  "Eclesiastés",
  "Cantares",
  "Isaías",
  "Jeremías",
  "Lamentaciones",
  "Ezequiel",
  "Daniel",
  "Oseas",
  "Joel",
  "Amós",
  "Abdías",
  "Jonás",
  "Miqueas",
  "Nahúm",
  "Habacuc",
  "Sofonías",
  "Hageo",
  "Zacarías",
  "Malaquías",
  "Mateo",
  "Marcos",
  "Lucas",
  "Juan",
  "Hechos",
  "Romanos",
  "1 Corintios",
  "2 Corintios",
  "Gálatas",
  "Efesios",
  "Filipenses",
  "Colosenses",
  "1 Tesalonicenses",
  "2 Tesalonicenses",
  "1 Timoteo",
  "2 Timoteo",
  "Tito",
  "Filemón",
  "Hebreos",
  "Santiago",
  "1 Pedro",
  "2 Pedro",
  "1 Juan",
  "2 Juan",
  "3 Juan",
  "Judas",
  "Apocalipsis",
]

const BIBLE_BOOK_ORDER = BIBLE_BOOK_DISPLAY_ORDER.map((book) =>
  book
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
)

const BIBLE_CHAPTER_COUNTS: Record<string, number> = {
  genesis: 50,
  exodo: 40,
  levitico: 27,
  numeros: 36,
  deuteronomio: 34,
  josue: 24,
  jueces: 21,
  rut: 4,
  "1 samuel": 31,
  "2 samuel": 24,
  "1 reyes": 22,
  "2 reyes": 25,
  "1 cronicas": 29,
  "2 cronicas": 36,
  esdras: 10,
  nehemias: 13,
  ester: 10,
  job: 42,
  salmos: 150,
  proverbios: 31,
  eclesiastes: 12,
  cantares: 8,
  isaias: 66,
  jeremias: 52,
  lamentaciones: 5,
  ezequiel: 48,
  daniel: 12,
  oseas: 14,
  joel: 3,
  amos: 9,
  abdias: 1,
  jonas: 4,
  miqueas: 7,
  nahum: 3,
  habacuc: 3,
  sofonias: 3,
  hageo: 2,
  zacarias: 14,
  malaquias: 4,
  mateo: 28,
  marcos: 16,
  lucas: 24,
  juan: 21,
  hechos: 28,
  romanos: 16,
  "1 corintios": 16,
  "2 corintios": 13,
  galatas: 6,
  efesios: 6,
  filipenses: 4,
  colosenses: 4,
  "1 tesalonicenses": 5,
  "2 tesalonicenses": 3,
  "1 timoteo": 6,
  "2 timoteo": 4,
  tito: 3,
  filemon: 1,
  hebreos: 13,
  santiago: 5,
  "1 pedro": 5,
  "2 pedro": 3,
  "1 juan": 5,
  "2 juan": 1,
  "3 juan": 1,
  judas: 1,
  apocalipsis: 22,
}

function normalizeBookName(book: string): string {
  return book
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function getBookSortIndex(book: string): number {
  const normalized = normalizeBookName(book)
  const exactIndex = BIBLE_BOOK_ORDER.indexOf(normalized)

  if (exactIndex >= 0) {
    return exactIndex
  }

  const containsIndex = BIBLE_BOOK_ORDER.findIndex((known) =>
    normalized.includes(known) || known.includes(normalized)
  )

  return containsIndex >= 0 ? containsIndex : Number.MAX_SAFE_INTEGER
}

export async function getBibleCatalog(): Promise<BibleCatalog> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("versiculos")
    .select("libro, capitulo")
    .order("libro", { ascending: true })
    .order("capitulo", { ascending: true })

  if (error || !data) {
    return { books: [], chaptersByBook: {} }
  }

  const chaptersMap = new Map<string, Set<number>>()

  for (const row of data) {
    const book = String(row.libro ?? "").trim()
    const chapter = Number(row.capitulo)

    if (!book || !Number.isFinite(chapter)) {
      continue
    }

    if (!chaptersMap.has(book)) {
      chaptersMap.set(book, new Set<number>())
    }

    chaptersMap.get(book)?.add(chapter)
  }

  const booksInDb = Array.from(chaptersMap.keys())
  const booksInDbByNormalized = new Map<string, string>()

  for (const book of booksInDb) {
    booksInDbByNormalized.set(normalizeBookName(book), book)
  }

  const canonicalBooks = BIBLE_BOOK_DISPLAY_ORDER.map(
    (displayBook) => booksInDbByNormalized.get(normalizeBookName(displayBook)) ?? displayBook
  )

  const extraBooks = booksInDb
    .filter((book) => !BIBLE_BOOK_ORDER.includes(normalizeBookName(book)))
    .sort((a, b) => a.localeCompare(b, "es"))

  const books = [...canonicalBooks, ...extraBooks]

  const chaptersByBook: Record<string, number[]> = {}

  for (const book of books) {
    const normalizedBook = normalizeBookName(book)
    const canonicalChapterCount = BIBLE_CHAPTER_COUNTS[normalizedBook]

    if (canonicalChapterCount && canonicalChapterCount > 0) {
      chaptersByBook[book] = Array.from({ length: canonicalChapterCount }, (_, index) => index + 1)
      continue
    }

    const chapters = Array.from(chaptersMap.get(book) ?? []).sort((a, b) => a - b)
    chaptersByBook[book] = chapters.length > 0 ? chapters : [1]
  }

  return {
    books,
    chaptersByBook,
  }
}

export async function getBibleChapterVerses(
  book: string,
  chapter: number
): Promise<Versiculo[]> {
  const supabase = await getSupabaseServer()

  const runQuery = async (chapterValue: number | string, useIlike = false) => {
    const query = supabase
      .from("versiculos")
      .select("id, libro, capitulo, versiculo, texto, referencia")
      .eq("capitulo", chapterValue)
      .order("versiculo", { ascending: true })

    if (useIlike) {
      return query.ilike("libro", book)
    }

    return query.eq("libro", book)
  }

  const attempts = [
    await runQuery(chapter),
    await runQuery(String(chapter)),
    await runQuery(chapter, true),
    await runQuery(String(chapter), true),
  ]

  for (const { data, error } of attempts) {
    if (!error && data && data.length > 0) {
      return data as Versiculo[]
    }
  }

  return []
}

export async function getBibleVersions(): Promise<BibleVersion[]> {
  try {
    if (!process.env.BIBLE_API_KEY) {
      return LICENSED_SPANISH_BIBLE_FALLBACK
    }

    const res = await fetch("https://api.youversion.com/v1/bibles", {
      headers: {
        "x-yvp-app-key": process.env.BIBLE_API_KEY,
      },
      cache: "no-store",
    })

    if (!res.ok) {
      return LICENSED_SPANISH_BIBLE_FALLBACK
    }

    const data = await res.json()
    const rawBibles = (data?.data?.bibles ?? data?.bibles ?? []) as Array<Record<string, unknown>>

    const versions = rawBibles
      .map((item): BibleVersion | null => {
        const id = String(item.id ?? "").trim()
        const name = String(item.abbreviation ?? item.name ?? "").trim()

        const languageSource = item.language
        let language: string | undefined

        if (typeof languageSource === "string") {
          language = languageSource.trim() || undefined
        } else if (languageSource && typeof languageSource === "object") {
          const languageRecord = languageSource as Record<string, unknown>
          const value = languageRecord.id ?? languageRecord.name
          const normalized = String(value ?? "").trim()
          language = normalized || undefined
        }

        if (!id || !name) {
          return null
        }

        return { id, name, language }
      })
      .filter((value): value is BibleVersion => Boolean(value))

    if (versions.length === 0) {
      return LICENSED_SPANISH_BIBLE_FALLBACK
    }

    const spanish = versions.filter((version) =>
      (version.language ?? "").toLowerCase().includes("es")
    )
    const selected = spanish.length > 0 ? spanish : versions

    const deduped = new Map<string, BibleVersion>()
    for (const version of selected) {
      if (!deduped.has(version.id)) {
        deduped.set(version.id, version)
      }
    }

    return Array.from(deduped.values())
  } catch {
    return LICENSED_SPANISH_BIBLE_FALLBACK
  }
}

export async function getVersiculos(): Promise<Versiculo[]> {
  const supabase = await getSupabaseServer()

  const { data } = await supabase
    .from("versiculos")
    .select("*")
    .order("id", { ascending: true })

  return data || []
}
 
export async function getRandomVersiculo(): Promise<Versiculo | null> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("versiculos")
    .select("*")

  if (error || !data || data.length === 0) {
    return null
  }

  const random = data[Math.floor(Math.random() * data.length)]
  return random as Versiculo
}
export async function getBiblePassage({
  bibleId = "1637",
  passage = "JHN.3.16",
}: {
  bibleId?: string
  passage?: string
}): Promise<BiblePassageResult> {
  try {
    const res = await fetch(
      `https://api.youversion.com/v1/bibles/${bibleId}/passages/${passage}`,
      {
        headers: {
          "x-yvp-app-key": process.env.BIBLE_API_KEY!,
        },
        cache: "no-store",
      }
    )

    if (!res.ok) {
      const text = await res.text()
      console.error("YouVersion error:", res.status, text)
      return {
        reference: "Error",
        text: "No se pudo cargar el pasaje",
        versionId: bibleId,
      }
    }

    const data = await res.json()

    const stripHtml = (input: string): string => {
      return input
        .replace(/<sup[^>]*>(\d{1,3})<\/sup>/gi, " $1 ")
        .replace(/<br\s*\/?>(\s*)/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\u00a0/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/\n\s+/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    }

    const extractText = (value: unknown): string[] => {
      if (typeof value === "string") {
        const clean = stripHtml(value)

        return clean ? [clean] : []
      }

      if (Array.isArray(value)) {
        return value.flatMap(extractText)
      }

      if (value && typeof value === "object") {
        const record = value as Record<string, unknown>
        const prioritizedKeys = [
          "text",
          "content",
          "body",
          "value",
          "label",
          "items",
          "children",
          "nodes",
          "verses",
        ]

        const prioritized = prioritizedKeys.flatMap((key) =>
          Object.prototype.hasOwnProperty.call(record, key) ? extractText(record[key]) : []
        )

        if (prioritized.length > 0) {
          return prioritized
        }

        return Object.values(record).flatMap(extractText)
      }

      return []
    }

    const extractNotes = (value: unknown): string[] => {
      if (!value) {
        return []
      }

      if (typeof value === "string") {
        const clean = stripHtml(value)
        return clean ? [clean] : []
      }

      if (Array.isArray(value)) {
        return value.flatMap(extractNotes)
      }

      if (typeof value === "object") {
        const record = value as Record<string, unknown>
        const noteCandidate =
          record.note ??
          record.text ??
          record.content ??
          record.body ??
          record.value ??
          null

        const own = noteCandidate ? extractNotes(noteCandidate) : []

        if (own.length > 0) {
          return own
        }

        return Object.values(record).flatMap(extractNotes)
      }

      return []
    }

    const rawContent = data?.data?.content ?? data?.content ?? data
    const extracted = extractText(rawContent)
    const text = extracted.join("\n\n").trim()

    const rawNotes =
      data?.data?.notes ??
      data?.notes ??
      data?.data?.footnotes ??
      data?.footnotes ??
      null

    const notes = [...new Set(extractNotes(rawNotes).filter((note) => note.length > 0))]

    const reference =
      data?.data?.reference ??
      data?.reference ??
      data?.data?.passage ??
      data?.passage ??
      passage

    const versionId =
      String(data?.data?.bible?.id ?? data?.bible?.id ?? bibleId).trim() || bibleId

    const versionName = String(
      data?.data?.bible?.abbreviation ??
        data?.data?.bible?.name ??
        data?.bible?.abbreviation ??
        data?.bible?.name ??
        ""
    ).trim()

    return {
      reference,
      text,
      versionId,
      versionName: versionName || undefined,
      notes: notes.length > 0 ? notes : undefined,
    }
  } catch (error) {
    console.error("YouVersion fetch failed:", error)
    return {
      reference: "Error",
      text: "No se pudo cargar el pasaje",
      versionId: bibleId,
    }
  }
}