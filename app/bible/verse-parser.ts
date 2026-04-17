export type ParsedBibleVerse = {
  number: number
  text: string
}

const VERSE_MARKER_REGEX = /(?:^|[\s\u00a0])([1-9]\d{0,2})(?=\s+[A-ZÁÉÍÓÚÑ«"“(¿¡\[])/g

function normalizeBibleText(rawText: string): string {
  return rawText
    .replace(/\u00a0/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/[\t ]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function splitByVerseMarkers(text: string): ParsedBibleVerse[] {
  const markers = Array.from(text.matchAll(VERSE_MARKER_REGEX))

  if (markers.length < 2) {
    return []
  }

  const verses: ParsedBibleVerse[] = []

  for (let index = 0; index < markers.length; index += 1) {
    const current = markers[index]
    const next = markers[index + 1]
    const number = Number.parseInt(current[1], 10)
    const start = (current.index ?? 0) + current[0].length
    const end = next?.index ?? text.length
    const verseText = text.slice(start, end).trim()

    if (Number.isFinite(number) && verseText) {
      verses.push({ number, text: verseText })
    }
  }

  return verses
}

function splitFallbackSentences(text: string): string[] {
  const paragraphSegments = text
    .split(/\n{2,}/g)
    .flatMap((paragraph) =>
      paragraph
        .split(/(?<=[.!?;:])\s+(?=[A-ZÁÉÍÓÚÑ¿¡«"“(\[])/g)
        .map((segment) => segment.trim())
        .filter(Boolean)
    )

  const cleaned = paragraphSegments.filter((segment) => segment.length > 0)

  if (cleaned.length > 1) {
    return cleaned
  }

  const fallbackSegments = text
    .split(/\s{2,}|\n/g)
    .map((segment) => segment.trim())
    .filter(Boolean)

  return fallbackSegments.length > 0 ? fallbackSegments : [text]
}

export function parseBibleVerses(rawText: string): ParsedBibleVerse[] {
  const normalized = normalizeBibleText(rawText)

  if (!normalized) {
    return []
  }

  const numberedVerses = splitByVerseMarkers(normalized)
  if (numberedVerses.length > 0) {
    return numberedVerses
  }

  return splitFallbackSentences(normalized).map((text, index) => ({
    number: index + 1,
    text,
  }))
}
