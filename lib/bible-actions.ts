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

export interface VersiculoProgress {
  user_id: string
  current_verse_id: number | null
  difficulty: number
  practice_mode: boolean
  exam_mode: boolean
  exam_duration_seconds: number
  best_exam_score: number | null
  last_score: number | null
  updated_at?: string
}

export interface VersiculoProgressState {
  isAuthenticated: boolean
  progress: VersiculoProgress | null
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
  verses?: Array<{
    number: number
    text: string
  }>
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

export async function getVersiculoProgressState(): Promise<VersiculoProgressState> {
  const supabase = await getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { isAuthenticated: false, progress: null }
  }

  const { data, error } = await supabase
    .from("versiculo_progress")
    .select("user_id, current_verse_id, difficulty, practice_mode, exam_mode, exam_duration_seconds, best_exam_score, last_score, updated_at")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) {
    return { isAuthenticated: true, progress: null }
  }

  return {
    isAuthenticated: true,
    progress: (data as VersiculoProgress | null) ?? null,
  }
}

export async function saveVersiculoProgress(
  input: Omit<VersiculoProgress, "user_id" | "updated_at">
): Promise<boolean> {
  const supabase = await getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const payload = {
    user_id: user.id,
    current_verse_id: input.current_verse_id,
    difficulty: input.difficulty,
    practice_mode: input.practice_mode,
    exam_mode: input.exam_mode,
    exam_duration_seconds: input.exam_duration_seconds,
    best_exam_score: input.best_exam_score,
    last_score: input.last_score,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from("versiculo_progress")
    .upsert(payload, { onConflict: "user_id" })

  return !error
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

    const extractVerseSegments = (
      value: unknown
    ): Array<{ number: string; text: string }> => {
      if (Array.isArray(value)) {
        return value.flatMap(extractVerseSegments)
      }

      if (!value || typeof value !== "object") {
        return []
      }

      const record = value as Record<string, unknown>
      const numberSource =
        record.number ??
        record.verse_number ??
        record.verseNumber ??
        record.verse ??
        record.verse_no ??
        record.verseNo
      const textSource =
        record.text ??
        record.content ??
        record.body ??
        record.value ??
        record.label

      if (numberSource !== undefined && textSource !== undefined) {
        const number = String(numberSource).trim()
        const verseText =
          typeof textSource === "string" ? stripHtml(textSource) : extractText(textSource).join(" ").trim()

        if (number && verseText) {
          return [{ number, text: verseText }]
        }
      }

      return Object.values(record).flatMap(extractVerseSegments)
    }

    const extractVerseSegmentsFromText = (
      value: unknown
    ): Array<{ number: string; text: string }> => {
      if (typeof value !== "string") {
        return []
      }

      const normalized = stripHtml(value).replace(/\s+/g, " ").trim()
      if (!normalized) {
        return []
      }

      const markers = Array.from(normalized.matchAll(/(?:^|\s)(\d{1,3})(?=\s)/g))
      if (markers.length === 0) {
        return []
      }

      return markers
        .map((current, index) => {
          const next = markers[index + 1]
          const verseNumber = current[1]
          const start = (current.index ?? 0) + current[0].length
          const end = next?.index ?? normalized.length
          const text = normalized.slice(start, end).trim()

          return text ? { number: verseNumber, text } : null
        })
        .filter((value): value is { number: string; text: string } => Boolean(value))
    }

    const rawContent = data?.data?.content ?? data?.content ?? data
    const extracted = extractText(rawContent)
    const extractedText = extracted.join("\n\n").trim()

    const verseSegments = [
      ...extractVerseSegments(data?.data?.verses ?? data?.verses ?? data?.data?.items ?? data?.items ?? null),
      ...extractVerseSegmentsFromText(rawContent),
      ...extractVerseSegmentsFromText(extractedText),
    ]
      .filter((verse, index, list) =>
        index === list.findIndex((candidate) => candidate.number === verse.number && candidate.text === verse.text)
      )

    const text = verseSegments.length > 0
      ? verseSegments.map((verse: { number: string; text: string }) => `${verse.number} ${verse.text}`).join("\n\n")
      : extracted.join("\n\n").trim()
    const verses = verseSegments.length > 0
      ? verseSegments.map((verse: { number: string; text: string }) => ({
          number: Number.parseInt(verse.number, 10),
          text: verse.text,
        }))
      : undefined

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
      verses,
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

// ==================== FUNCIONES PARA EXAMEN ====================

type ParsedVerseReference = {
  book: string
  chapter: number
  verseStart: number
  chapterEnd: number
  verseEnd: number
}

function parseVerseReference(reference: string): ParsedVerseReference | null {
  // Formato esperado: "Mateo 3:16", "Colosenses 1:9-10", "Juan 3:16-18", "1 Corintios 13:1-3".
  const normalized = reference.replace(/\s+/g, " ").trim()
  const match = normalized.match(/^(.+?)\s+(\d+):(\d+)(?:-(?:(\d+):)?(\d+))?$/)

  if (!match) {
    console.warn(`No se pudo parsear la referencia: ${reference}`)
    return null
  }

  const chapter = Number.parseInt(match[2], 10)
  const verseStart = Number.parseInt(match[3], 10)
  const chapterEnd = Number.parseInt(match[4] ?? match[2], 10)
  const verseEnd = Number.parseInt(match[5] ?? match[3], 10)

  return {
    book: match[1].trim(),
    chapter,
    verseStart,
    chapterEnd,
    verseEnd,
  }
}

function convertBookToYouVersionCode(book: string): string | null {
  // Mapeo de nombres de libros al código de YouVersion
  const bookMap: Record<string, string> = {
    "génesis": "GEN",
    "éxodo": "EXO",
    "levítico": "LEV",
    "números": "NUM",
    "deuteronomio": "DEU",
    "josué": "JOS",
    "jueces": "JDG",
    "rut": "RUT",
    "1 samuel": "1SA",
    "2 samuel": "2SA",
    "1 reyes": "1KI",
    "2 reyes": "2KI",
    "1 crónicas": "1CH",
    "2 crónicas": "2CH",
    "esdras": "EZR",
    "nehemías": "NEH",
    "ester": "EST",
    "job": "JOB",
    "salmos": "PSA",
    "proverbios": "PRO",
    "eclesiastés": "ECC",
    "cantares": "SNG",
    "isaías": "ISA",
    "jeremías": "JER",
    "lamentaciones": "LAM",
    "ezequiel": "EZK",
    "daniel": "DAN",
    "oseas": "HOS",
    "joel": "JOL",
    "amós": "AMO",
    "abdías": "OBA",
    "jonás": "JON",
    "miqueas": "MIC",
    "nahúm": "NAM",
    "habacuc": "HAB",
    "sofonías": "ZEP",
    "hageo": "HAG",
    "zacarías": "ZEC",
    "malaquías": "MAL",
    "mateo": "MAT",
    "marcos": "MRK",
    "lucas": "LUK",
    "juan": "JHN",
    "hechos": "ACT",
    "romanos": "ROM",
    "1 corintios": "1CO",
    "2 corintios": "2CO",
    "gálatas": "GAL",
    "efesios": "EPH",
    "filipenses": "PHP",
    "colosenses": "COL",
    "1 tesalonicenses": "1TH",
    "2 tesalonicenses": "2TH",
    "1 timoteo": "1TI",
    "2 timoteo": "2TI",
    "tito": "TIT",
    "filemón": "PHM",
    "hebreos": "HEB",
    "santiago": "JAS",
    "1 pedro": "1PE",
    "2 pedro": "2PE",
    "1 juan": "1JN",
    "2 juan": "2JN",
    "3 juan": "3JN",
    "judas": "JUD",
    "apocalipsis": "REV",
  }

  const normalized = book
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

  return bookMap[normalized] || null
}

function buildYouVersionPassage(book: string, chapter: number, verse: number): string {
  const code = convertBookToYouVersionCode(book)
  if (!code) {
    console.warn(`No se encontró código de YouVersion para: ${book}`)
    return ""
  }
  return `${code}.${chapter}.${verse}`
}

function buildYouVersionPassageRange(
  book: string,
  chapter: number,
  verseStart: number,
  chapterEnd: number,
  verseEnd: number
): string {
  const code = convertBookToYouVersionCode(book)
  if (!code) {
    console.warn(`No se encontró código de YouVersion para: ${book}`)
    return ""
  }

  if (chapter === chapterEnd) {
    return verseStart === verseEnd
      ? `${code}.${chapter}.${verseStart}`
      : `${code}.${chapter}.${verseStart}-${verseEnd}`
  }

  return `${code}.${chapter}.${verseStart}-${code}.${chapterEnd}.${verseEnd}`
}

export async function getVerseFromReference(
  reference: string,
  bibleId: string = "1637"
): Promise<BiblePassageResult> {
  // Primero intenta obtener de la DB local
  const parsed = parseVerseReference(reference)
  
  if (parsed) {
    const { book, chapter, verseStart, chapterEnd, verseEnd } = parsed
    
    const supabase = await getSupabaseServer()
    const query = supabase
      .from("versiculos")
      .select("id, libro, capitulo, versiculo, texto, referencia")
      .ilike("libro", book)

    const { data: localVerses, error } = chapter === chapterEnd
      ? await query
          .eq("capitulo", chapter)
          .gte("versiculo", verseStart)
          .lte("versiculo", verseEnd)
          .order("versiculo", { ascending: true })
      : await query
          .gte("capitulo", chapter)
          .lte("capitulo", chapterEnd)
          .order("capitulo", { ascending: true })
          .order("versiculo", { ascending: true })

    if (!error && localVerses && localVerses.length > 0) {
      const text = localVerses
        .map((verseRow) => `${verseRow.versiculo} ${verseRow.texto}`)
        .join("\n")

      return {
        reference: localVerses[0].referencia || reference,
        text,
        versionId: "local",
        versionName: "Base de Datos Local",
      }
    }

    // Si no encuentra en DB, intenta con YouVersion API
    const passage = buildYouVersionPassageRange(book, chapter, verseStart, chapterEnd, verseEnd)
    if (passage) {
      return getBiblePassage({ bibleId, passage })
    }
  }

  return {
    reference: "Error",
    text: "No se pudo cargar el versículo",
    versionId: bibleId,
  }
}