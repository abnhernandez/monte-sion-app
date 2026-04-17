"use client"

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { toast } from "sonner"
import { getBiblePassage, type BiblePassageResult } from "@/lib/bible-actions"
import { summarizeBibleComparison } from "@/lib/bible-compare-ai"

type BibleVersionOption = {
  id: string
  name: string
}

type VerseProps = {
  number: string | number
  text: string
  sizeClassName: string
  fontClassName: string
  referenceLabel: string
  storageKey?: string
  selectionGroupId?: string
  selectionSortOrder?: number
  comparePassage?: string
  compareBibleId?: string
  compareVersions?: BibleVersionOption[]
}

type VerseSelectionEntry = {
  key: string
  referenceLabel: string
  text: string
  sortOrder: number
}

export type DiffToken = {
  value: string
  normalized: string
  isWord: boolean
  significant: boolean
}

export type DiffSpan = {
  kind: "equal" | "added" | "replaced" | "removed"
  text: string
}

type CompareColumnState = {
  key: string
  versionId: string
  versionName: string
  reference: string
  text: string
  isBase: boolean
  isLoading: boolean
  error: string
  similarity: number | null
  diffSpans: DiffSpan[]
}

type RelevantTokenEntry = {
  tokenIndex: number
  normalized: string
  value: string
}

type CompareResultsLookup = Record<string, BiblePassageResult>
type CompareLoadingLookup = Record<string, boolean>
type CompareErrorLookup = Record<string, string>

const verseSelectionGroups = new Map<string, Map<string, VerseSelectionEntry>>()
const verseSelectionListeners = new Set<() => void>()

const verseSelectionCache = new Map<string, VerseSelectionEntry[]>()
const EMPTY_SNAPSHOT: VerseSelectionEntry[] = []

const passageCompareCache = new Map<
  string,
  Promise<BiblePassageResult> | BiblePassageResult
>()

const WORD_TOKEN_REGEX = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu
const SPANISH_STOPWORDS = new Set([
  "a",
  "al",
  "algo",
  "algun",
  "alguna",
  "alguno",
  "algunas",
  "algunos",
  "ante",
  "antes",
  "aquel",
  "aquella",
  "aquellas",
  "aquello",
  "aquellos",
  "asi",
  "aun",
  "bajo",
  "cada",
  "casi",
  "como",
  "con",
  "contra",
  "cual",
  "cuales",
  "cualquier",
  "cuando",
  "de",
  "del",
  "desde",
  "donde",
  "dos",
  "el",
  "ella",
  "ellas",
  "ello",
  "ellos",
  "en",
  "entre",
  "era",
  "eran",
  "eres",
  "es",
  "esa",
  "esas",
  "ese",
  "eso",
  "esos",
  "esta",
  "estaba",
  "estaban",
  "estado",
  "estamos",
  "estan",
  "estar",
  "este",
  "esto",
  "estos",
  "fue",
  "fueron",
  "ha",
  "han",
  "hay",
  "la",
  "las",
  "le",
  "les",
  "lo",
  "los",
  "mas",
  "me",
  "mi",
  "mis",
  "muy",
  "ni",
  "no",
  "nos",
  "nosotros",
  "nuestra",
  "nuestras",
  "nuestro",
  "nuestros",
  "o",
  "os",
  "otra",
  "otras",
  "otro",
  "otros",
  "para",
  "pero",
  "poco",
  "por",
  "porque",
  "que",
  "quien",
  "quienes",
  "se",
  "sea",
  "segun",
  "ser",
  "si",
  "sin",
  "sobre",
  "son",
  "su",
  "sus",
  "tal",
  "tambien",
  "te",
  "tenia",
  "tiene",
  "tienen",
  "todo",
  "tu",
  "tus",
  "un",
  "una",
  "uno",
  "unos",
  "y",
  "ya",
])

function emitVerseSelectionChange() {
  verseSelectionListeners.forEach((listener) => listener())
}

function getVerseSelectionEntries(groupId: string): VerseSelectionEntry[] {
  const current = verseSelectionGroups.get(groupId)
  if (!current) return EMPTY_SNAPSHOT

  const prev = verseSelectionCache.get(groupId)

  const next = Array.from(current.values()).sort(
    (a, b) => a.sortOrder - b.sortOrder
  )

  if (
    prev &&
    prev.length === next.length &&
    prev.every((item, i) => item.key === next[i].key)
  ) {
    return prev
  }

  verseSelectionCache.set(groupId, next)
  return next
}

function useVerseSelection(groupId?: string) {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (!groupId) return () => {}

      verseSelectionListeners.add(onStoreChange)
      return () => {
        verseSelectionListeners.delete(onStoreChange)
      }
    },
    () => (groupId ? getVerseSelectionEntries(groupId) : EMPTY_SNAPSHOT),
    () => EMPTY_SNAPSHOT
  )
}

function updateVerseSelection(groupId: string, entry: VerseSelectionEntry) {
  const currentGroup =
    verseSelectionGroups.get(groupId) ?? new Map<string, VerseSelectionEntry>()

  if (currentGroup.has(entry.key)) {
    currentGroup.delete(entry.key)
  } else {
    currentGroup.set(entry.key, entry)
  }

  if (currentGroup.size === 0) {
    verseSelectionGroups.delete(groupId)
    verseSelectionCache.delete(groupId)
  } else {
    verseSelectionGroups.set(groupId, currentGroup)
    verseSelectionCache.delete(groupId)
  }

  emitVerseSelectionChange()
}

function clearVerseSelection(groupId: string) {
  if (!verseSelectionGroups.has(groupId)) return

  verseSelectionGroups.delete(groupId)
  verseSelectionCache.delete(groupId)
  emitVerseSelectionChange()
}

function normalizeCompareWord(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

function isSignificantWord(normalized: string): boolean {
  return Boolean(normalized) && !SPANISH_STOPWORDS.has(normalized) && !/^\d+$/u.test(normalized)
}

export function tokenizeCompareText(text: string): DiffToken[] {
  const tokens: DiffToken[] = []
  let lastIndex = 0

  for (const match of text.matchAll(WORD_TOKEN_REGEX)) {
    const word = match[0]
    const start = match.index ?? 0

    if (start > lastIndex) {
      tokens.push({
        value: text.slice(lastIndex, start),
        normalized: "",
        isWord: false,
        significant: false,
      })
    }

    const normalized = normalizeCompareWord(word)

    tokens.push({
      value: word,
      normalized,
      isWord: true,
      significant: isSignificantWord(normalized),
    })

    lastIndex = start + word.length
  }

  if (lastIndex < text.length) {
    tokens.push({
      value: text.slice(lastIndex),
      normalized: "",
      isWord: false,
      significant: false,
    })
  }

  return tokens
}

function getRelevantTokenEntries(tokens: DiffToken[]): RelevantTokenEntry[] {
  return tokens.flatMap((token, tokenIndex) =>
    token.isWord && token.significant
      ? [
          {
            tokenIndex,
            normalized: token.normalized,
            value: token.value,
          },
        ]
      : []
  )
}

function appendDiffSpan(spans: DiffSpan[], kind: DiffSpan["kind"], text: string) {
  if (!text) return

  const previous = spans[spans.length - 1]
  if (previous && previous.kind === kind) {
    previous.text += text
    return
  }

  spans.push({ kind, text })
}

function calculateLcsPairs(
  baseWords: string[],
  targetWords: string[]
): Array<[number, number]> {
  const matrix = Array.from({ length: baseWords.length + 1 }, () =>
    Array<number>(targetWords.length + 1).fill(0)
  )

  for (let baseIndex = baseWords.length - 1; baseIndex >= 0; baseIndex -= 1) {
    for (let targetIndex = targetWords.length - 1; targetIndex >= 0; targetIndex -= 1) {
      if (baseWords[baseIndex] === targetWords[targetIndex]) {
        matrix[baseIndex][targetIndex] = matrix[baseIndex + 1][targetIndex + 1] + 1
      } else {
        matrix[baseIndex][targetIndex] = Math.max(
          matrix[baseIndex + 1][targetIndex],
          matrix[baseIndex][targetIndex + 1]
        )
      }
    }
  }

  const pairs: Array<[number, number]> = []
  let baseCursor = 0
  let targetCursor = 0

  while (baseCursor < baseWords.length && targetCursor < targetWords.length) {
    if (baseWords[baseCursor] === targetWords[targetCursor]) {
      pairs.push([baseCursor, targetCursor])
      baseCursor += 1
      targetCursor += 1
      continue
    }

    if (matrix[baseCursor + 1][targetCursor] >= matrix[baseCursor][targetCursor + 1]) {
      baseCursor += 1
    } else {
      targetCursor += 1
    }
  }

  return pairs
}

function pushRemovedInsertion(
  insertions: Map<number, string[]>,
  index: number,
  words: string[]
) {
  if (words.length === 0) return

  const current = insertions.get(index) ?? []
  insertions.set(index, [...current, ...words])
}

function readPassageText(result?: BiblePassageResult): string {
  if (!result) {
    return ""
  }

  const directText = result.text?.trim()
  if (directText) {
    return directText
  }

  if (result.verses?.length) {
    return result.verses
      .map((verse) => verse.text?.trim())
      .filter(Boolean)
      .join(" ")
      .trim()
  }

  return ""
}

export function buildDiffSpans(baseText: string, targetText: string): DiffSpan[] {
  const baseTokens = tokenizeCompareText(baseText)
  const targetTokens = tokenizeCompareText(targetText)
  const baseRelevant = getRelevantTokenEntries(baseTokens)
  const targetRelevant = getRelevantTokenEntries(targetTokens)

  if (targetTokens.length === 0) {
    return []
  }

  if (baseRelevant.length === 0 && targetRelevant.length === 0) {
    return [{ kind: "equal", text: targetText }]
  }

  const matches = calculateLcsPairs(
    baseRelevant.map((entry) => entry.normalized),
    targetRelevant.map((entry) => entry.normalized)
  )

  const targetStatus = new Map<number, DiffSpan["kind"]>()
  const removedInsertions = new Map<number, string[]>()

  let baseCursor = 0
  let targetCursor = 0

  const segments = [...matches, [baseRelevant.length, targetRelevant.length] as [number, number]]

  for (const [baseMatchIndex, targetMatchIndex] of segments) {
    const removedEntries = baseRelevant.slice(baseCursor, baseMatchIndex)
    const addedEntries = targetRelevant.slice(targetCursor, targetMatchIndex)
    const insertionIndex =
      addedEntries[0]?.tokenIndex ??
      targetRelevant[targetMatchIndex]?.tokenIndex ??
      targetTokens.length

    if (removedEntries.length > 0 && addedEntries.length > 0) {
      const replacedCount = Math.min(removedEntries.length, addedEntries.length)
      const replacedEntries = addedEntries.slice(0, replacedCount)
      const addedOnlyEntries = addedEntries.slice(replacedCount)
      const removedOnlyEntries = removedEntries.slice(replacedCount)

      replacedEntries.forEach((entry) => {
        targetStatus.set(entry.tokenIndex, "replaced")
      })
      pushRemovedInsertion(
        removedInsertions,
        insertionIndex,
        removedEntries.slice(0, replacedCount).map((entry) => entry.value)
      )

      addedOnlyEntries.forEach((entry) => {
        targetStatus.set(entry.tokenIndex, "added")
      })

      pushRemovedInsertion(
        removedInsertions,
        insertionIndex,
        removedOnlyEntries.map((entry) => entry.value)
      )
    } else if (addedEntries.length > 0) {
      addedEntries.forEach((entry) => {
        targetStatus.set(entry.tokenIndex, "added")
      })
    } else if (removedEntries.length > 0) {
      pushRemovedInsertion(
        removedInsertions,
        insertionIndex,
        removedEntries.map((entry) => entry.value)
      )
    }

    if (baseMatchIndex < baseRelevant.length && targetMatchIndex < targetRelevant.length) {
      targetStatus.set(targetRelevant[targetMatchIndex].tokenIndex, "equal")
    }

    baseCursor = baseMatchIndex + 1
    targetCursor = targetMatchIndex + 1
  }

  const spans: DiffSpan[] = []

  for (let tokenIndex = 0; tokenIndex <= targetTokens.length; tokenIndex += 1) {
    const removedWords = removedInsertions.get(tokenIndex)
    if (removedWords?.length) {
      appendDiffSpan(spans, "removed", removedWords.join(" "))
    }

    if (tokenIndex === targetTokens.length) {
      break
    }

    const token = targetTokens[tokenIndex]
    const kind = token.isWord ? targetStatus.get(tokenIndex) ?? "equal" : "equal"
    appendDiffSpan(spans, kind, token.value)
  }

  return spans.length > 0 ? spans : [{ kind: "equal", text: targetText }]
}

export function calculateSimilarity(baseText: string, targetText: string): number {
  const baseWords = new Set(
    tokenizeCompareText(baseText)
      .filter((token) => token.significant)
      .map((token) => token.normalized)
  )
  const targetWords = new Set(
    tokenizeCompareText(targetText)
      .filter((token) => token.significant)
      .map((token) => token.normalized)
  )

  if (baseWords.size === 0 && targetWords.size === 0) {
    return 100
  }

  const union = new Set([...baseWords, ...targetWords])
  let intersection = 0

  baseWords.forEach((word) => {
    if (targetWords.has(word)) {
      intersection += 1
    }
  })

  return union.size === 0 ? 100 : Math.round((intersection / union.size) * 100)
}

async function getCachedComparePassage({
  bibleId,
  passage,
}: {
  bibleId: string
  passage: string
}) {
  const cacheKey = `${bibleId}::${passage}`
  const cachedValue = passageCompareCache.get(cacheKey)

  if (cachedValue) {
    return cachedValue instanceof Promise ? cachedValue : cachedValue
  }

  const request = getBiblePassage({ bibleId, passage })
    .then((result) => {
      passageCompareCache.set(cacheKey, result)
      return result
    })
    .catch((error) => {
      passageCompareCache.delete(cacheKey)
      throw error
    })

  passageCompareCache.set(cacheKey, request)

  return request
}

function omitLookupKey<T>(lookup: Record<string, T>, key: string) {
  if (!(key in lookup)) {
    return lookup
  }

  const next = { ...lookup }
  delete next[key]
  return next
}

function renderDiffSpans(spans: DiffSpan[]) {
  return spans.map((span, index) => {
    if (span.kind === "added") {
      return (
        <span
          key={`diff-${span.kind}-${index}`}
          className="rounded-md bg-emerald-500/18 px-1 py-0.5 text-emerald-200"
        >
          {span.text}
        </span>
      )
    }

    if (span.kind === "replaced") {
      return (
        <span
          key={`diff-${span.kind}-${index}`}
          className="rounded-md bg-amber-400/18 px-1 py-0.5 text-amber-100"
        >
          {span.text}
        </span>
      )
    }

    if (span.kind === "removed") {
      return (
        <span
          key={`diff-${span.kind}-${index}`}
          className="mx-1 inline-flex rounded-full border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 align-middle text-sm text-rose-200 line-through decoration-rose-300/80 decoration-2"
        >
          {span.text}
        </span>
      )
    }

    return <span key={`diff-${span.kind}-${index}`}>{span.text}</span>
  })
}

const Verse = memo(function Verse({
  number,
  text,
  sizeClassName,
  fontClassName,
  referenceLabel,
  storageKey,
  selectionGroupId,
  selectionSortOrder = 0,
  comparePassage,
  compareBibleId,
  compareVersions = [],
}: VerseProps) {
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  const selectionEntries = useVerseSelection(selectionGroupId)

  const isSelected = selectionGroupId
    ? selectionEntries.some((entry) => entry.key === (storageKey ?? referenceLabel))
    : false

  const selectedCopyEntries =
    selectionGroupId && selectionEntries.length > 1 && isSelected
      ? selectionEntries
      : [{ key: storageKey ?? referenceLabel, referenceLabel, text, sortOrder: selectionSortOrder }]

  const [compareVersionId, setCompareVersionId] = useState(
    compareVersions.find((version) => version.id !== compareBibleId)?.id ??
      compareVersions[0]?.id ??
      ""
  )
  const [activeCompareVersionIds, setActiveCompareVersionIds] = useState<string[]>([])
  const [compareResults, setCompareResults] = useState<CompareResultsLookup>({})
  const [compareLoadingById, setCompareLoadingById] = useState<CompareLoadingLookup>({})
  const [compareErrors, setCompareErrors] = useState<CompareErrorLookup>({})
  const [compareError, setCompareError] = useState("")
  const [aiSummary, setAiSummary] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState("")

  const compareColumnRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const compareScrollLockRef = useRef<string | null>(null)
  const autoComparePrimedRef = useRef(false)

  const canShare =
    isHydrated &&
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function"

  const compareVersionMap = useMemo(
    () => new Map(compareVersions.map((version) => [version.id, version])),
    [compareVersions]
  )

  const baseVersionName =
    compareVersionMap.get(compareBibleId ?? "")?.name ?? compareBibleId ?? "-"

  const compareOptions = useMemo(
    () => compareVersions.filter((version) => version.id !== compareBibleId),
    [compareBibleId, compareVersions]
  )

  const availableCompareOptions = useMemo(
    () =>
      compareOptions.filter(
        (version) => !activeCompareVersionIds.includes(version.id)
      ),
    [activeCompareVersionIds, compareOptions]
  )

  const compareLoading = compareVersionId ? Boolean(compareLoadingById[compareVersionId]) : false

  const highlightStorageKey = useMemo(
    () => `bible-verse-highlight:${storageKey ?? referenceLabel}`,
    [referenceLabel, storageKey]
  )

  useEffect(() => {
    const hasCurrentOption =
      compareVersionId &&
      availableCompareOptions.some((version) => version.id === compareVersionId)

    if (hasCurrentOption) {
      return
    }

    const defaultVersion = availableCompareOptions[0]?.id ?? ""
    if (compareVersionId !== defaultVersion) {
      setCompareVersionId(defaultVersion)
    }
  }, [availableCompareOptions, compareVersionId])

  useEffect(() => {
    try {
      setIsHighlighted(
        window.localStorage.getItem(highlightStorageKey) === "1"
      )
    } catch {
      setIsHighlighted(false)
    } finally {
      setIsHydrated(true)
    }
  }, [highlightStorageKey])

  useEffect(() => {
    if (!isHydrated) return

    try {
      window.localStorage.setItem(
        highlightStorageKey,
        isHighlighted ? "1" : "0"
      )
    } catch {}
  }, [highlightStorageKey, isHighlighted, isHydrated])

  useEffect(() => {
    if (isCompareOpen) {
      return
    }

    autoComparePrimedRef.current = false
    setActiveCompareVersionIds([])
    setCompareLoadingById({})
    setCompareErrors({})
    setCompareError("")
    setAiSummary("")
    setAiError("")
    setAiLoading(false)
  }, [isCompareOpen])

  const verseText = `${referenceLabel}\n${text}`
  const multiSelected =
    selectionGroupId ? selectionEntries.length > 1 && isSelected : false

  const showMenu = isHovered || isSelected

  const getClipboardText = useCallback(() => {
    if (!selectionGroupId || !multiSelected) return verseText

    return selectedCopyEntries
      .slice()
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((entry) => `${entry.referenceLabel}\n${entry.text}`)
      .join("\n\n")
  }, [multiSelected, selectedCopyEntries, selectionGroupId, verseText])

  const handleCopy = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      toast.error("Tu navegador no permite copiar aquí.")
      return
    }

    try {
      await navigator.clipboard.writeText(getClipboardText())
      toast.success(
        multiSelected
          ? `${selectedCopyEntries.length} versículos copiados.`
          : "Versículo copiado."
      )
    } catch {
      toast.error("No se pudo copiar el versículo.")
    }
  }, [getClipboardText, multiSelected, selectedCopyEntries.length])

  const handleShare = useCallback(async () => {
    if (!canShare) return

    try {
      await navigator.share({
        title: referenceLabel,
        text: getClipboardText(),
      })
    } catch {}
  }, [canShare, getClipboardText, referenceLabel])

  const handleAddCompareVersion = useCallback(
    async (requestedVersionId?: string) => {
      const versionId = requestedVersionId ?? compareVersionId

      if (!comparePassage || !versionId) {
        setCompareError("Selecciona una versión para comparar.")
        return
      }

      if (versionId === compareBibleId) {
        setCompareError("Elige una versión distinta a la actual.")
        return
      }

      if (compareLoadingById[versionId]) {
        return
      }

      setCompareError("")
      setAiSummary("")
      setAiError("")
      setCompareErrors((current) => omitLookupKey(current, versionId))
      setActiveCompareVersionIds((current) =>
        current.includes(versionId) ? current : [...current, versionId]
      )

      if (compareResults[versionId]) {
        return
      }

      setCompareLoadingById((current) => ({
        ...current,
        [versionId]: true,
      }))

      try {
        const result = await getCachedComparePassage({
          bibleId: versionId,
          passage: comparePassage,
        })

        setCompareResults((current) => ({
          ...current,
          [versionId]: result,
        }))
      } catch {
        setCompareErrors((current) => ({
          ...current,
          [versionId]: "No se pudo cargar la versión seleccionada.",
        }))
      } finally {
        setCompareLoadingById((current) => omitLookupKey(current, versionId))
      }
    },
    [
      compareBibleId,
      compareLoadingById,
      comparePassage,
      compareResults,
      compareVersionId,
    ]
  )

  const handleRemoveCompareVersion = useCallback((versionId: string) => {
    setActiveCompareVersionIds((current) =>
      current.filter((item) => item !== versionId)
    )
    setCompareLoadingById((current) => omitLookupKey(current, versionId))
    setCompareErrors((current) => omitLookupKey(current, versionId))
    setCompareError("")
    setAiSummary("")
    setAiError("")
  }, [])

  useEffect(() => {
    if (!isCompareOpen || autoComparePrimedRef.current || !compareVersionId) {
      return
    }

    autoComparePrimedRef.current = true
    void handleAddCompareVersion(compareVersionId)
  }, [compareVersionId, handleAddCompareVersion, isCompareOpen])

  const compareColumns = useMemo<CompareColumnState[]>(() => {
    const baseColumn: CompareColumnState = {
      key: "__base__",
      versionId: compareBibleId ?? "__base__",
      versionName: baseVersionName,
      reference: referenceLabel,
      text,
      isBase: true,
      isLoading: false,
      error: "",
      similarity: 100,
      diffSpans: [{ kind: "equal", text }],
    }

    const targetColumns = activeCompareVersionIds.map((versionId) => {
      const result = compareResults[versionId]
      const resolvedText = readPassageText(result)

      return {
        key: versionId,
        versionId,
        versionName: compareVersionMap.get(versionId)?.name ?? versionId,
        reference: result?.reference?.trim() || referenceLabel,
        text: resolvedText,
        isBase: false,
        isLoading: Boolean(compareLoadingById[versionId]),
        error: compareErrors[versionId] ?? "",
        similarity: resolvedText ? calculateSimilarity(text, resolvedText) : null,
        diffSpans: resolvedText ? buildDiffSpans(text, resolvedText) : [],
      }
    })

    return [baseColumn, ...targetColumns]
  }, [
    activeCompareVersionIds,
    baseVersionName,
    compareBibleId,
    compareErrors,
    compareLoadingById,
    compareResults,
    compareVersionMap,
    referenceLabel,
    text,
  ])

  const aiReadyComparisons = useMemo(
    () =>
      compareColumns.filter(
        (column) =>
          !column.isBase &&
          !column.isLoading &&
          !column.error &&
          Boolean(column.text.trim())
      ),
    [compareColumns]
  )

  const handleAnalyzeWithAI = useCallback(async () => {
    if (aiReadyComparisons.length === 0) {
      setAiError("Agrega al menos una versión cargada para analizar.")
      return
    }

    setAiLoading(true)
    setAiError("")

    try {
      const result = await summarizeBibleComparison({
        reference: referenceLabel,
        baseVersionId: compareBibleId,
        baseVersionName,
        baseText: text,
        comparisons: aiReadyComparisons.map((column) => ({
          versionId: column.versionId,
          versionName: column.versionName,
          text: column.text,
          similarity: column.similarity ?? 100,
        })),
      })

      setAiSummary(result.summary.trim())
    } catch {
      setAiSummary("")
      setAiError("No se pudo generar el resumen con IA.")
    } finally {
      setAiLoading(false)
    }
  }, [
    aiReadyComparisons,
    baseVersionName,
    compareBibleId,
    referenceLabel,
    text,
  ])

  const setCompareColumnRef = useCallback(
    (columnKey: string, node: HTMLDivElement | null) => {
      if (!node) {
        delete compareColumnRefs.current[columnKey]
        return
      }

      compareColumnRefs.current[columnKey] = node
      const existingColumn = Object.entries(compareColumnRefs.current).find(
        ([key, value]) => key !== columnKey && value
      )?.[1]

      if (existingColumn) {
        node.scrollTop = existingColumn.scrollTop
      }
    },
    []
  )

  const handleColumnScroll = useCallback((columnKey: string, scrollTop: number) => {
    if (compareScrollLockRef.current && compareScrollLockRef.current !== columnKey) {
      return
    }

    compareScrollLockRef.current = columnKey

    Object.entries(compareColumnRefs.current).forEach(([key, node]) => {
      if (key === columnKey || !node) {
        return
      }

      if (Math.abs(node.scrollTop - scrollTop) > 1) {
        node.scrollTop = scrollTop
      }
    })

    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => {
        if (compareScrollLockRef.current === columnKey) {
          compareScrollLockRef.current = null
        }
      })
      return
    }

    compareScrollLockRef.current = null
  }, [])

  const toggleSelected = () => {
    if (!selectionGroupId) return

    updateVerseSelection(selectionGroupId, {
      key: storageKey ?? referenceLabel,
      referenceLabel,
      text,
      sortOrder: selectionSortOrder,
    })
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      toggleSelected()
    }
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        onClick={toggleSelected}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative mb-6 cursor-pointer rounded-2xl px-2 py-1 transition outline-none focus-visible:ring-2 focus-visible:ring-[#213c2d]/40 ${
          isSelected ? "bg-white/[0.03] ring-1 ring-white/10" : ""
        } ${isHighlighted ? "bg-amber-100/60 dark:bg-amber-200/10" : ""}`}
      >
        <p
          className={`whitespace-pre-wrap leading-[1.75] tracking-[0.002em] text-black/90 dark:text-white/90 ${sizeClassName} ${fontClassName}`}
        >
          <span className="mr-2 align-top text-[0.76em] font-medium tabular-nums text-black/45 dark:text-white/45">
            {number}
          </span>
          <span className="whitespace-pre-wrap">{text}</span>
        </p>

        <div
          className={`absolute left-10 top-0 z-20 flex gap-1 rounded-full border border-black/10 bg-white/95 p-1 shadow-lg backdrop-blur transition dark:border-white/10 dark:bg-neutral-950/95 ${
            showMenu
              ? "pointer-events-auto translate-y-[-110%] opacity-100"
              : "pointer-events-none translate-y-[-100%] opacity-0"
          }`}
          onClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              setIsHighlighted((current) => !current)
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              isHighlighted
                ? "bg-[#213c2d] text-white"
                : "text-black/70 hover:bg-black/5 dark:text-white/75 dark:hover:bg-white/10"
            }`}
          >
            Destacar
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              void handleCopy()
            }}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-black/70 transition hover:bg-black/5 dark:text-white/75 dark:hover:bg-white/10"
          >
            {multiSelected ? `Copiar ${selectedCopyEntries.length}` : "Copiar"}
          </button>
          {multiSelected ? (
            <span className="rounded-full px-3 py-1.5 text-xs font-semibold text-black/45 dark:text-white/45">
              {selectedCopyEntries.length} seleccionados
            </span>
          ) : (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                setIsCompareOpen(true)
              }}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-black/70 transition hover:bg-black/5 dark:text-white/75 dark:hover:bg-white/10"
            >
              Comparar
            </button>
          )}
          {canShare ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                void handleShare()
              }}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-black/70 transition hover:bg-black/5 dark:text-white/75 dark:hover:bg-white/10"
            >
              {multiSelected ? `Compartir ${selectedCopyEntries.length}` : "Compartir"}
            </button>
          ) : null}
        </div>
      </div>

      {isCompareOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
          <div className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden bg-[#111111] text-white shadow-2xl sm:h-[88vh] sm:rounded-[2rem] sm:border sm:border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Comparar versiones</p>
                <h3 className="text-2xl font-semibold tracking-tight">{referenceLabel}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCompareOpen(false)}
                className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-white/75 transition hover:bg-white/5"
              >
                Cerrar
              </button>
            </div>

            <div className="flex-1 overflow-hidden px-5 py-5">
              <div className="flex h-full flex-col gap-5">
                <section className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 sm:px-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <div>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/40">Versión base</p>
                        <h4 className="mt-1 text-lg font-semibold text-white">{baseVersionName}</h4>
                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/60">
                          El texto base queda fijo. Agrega una o varias versiones para ver diferencias ligeras por palabras, similitud y un resumen opcional con IA.
                        </p>
                      </div>

                      {activeCompareVersionIds.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {activeCompareVersionIds.map((versionId) => {
                            const versionName =
                              compareVersionMap.get(versionId)?.name ?? versionId

                            return (
                              <button
                                key={`chip-${versionId}`}
                                type="button"
                                onClick={() => handleRemoveCompareVersion(versionId)}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10"
                                aria-label={`Quitar ${versionName}`}
                              >
                                <span>{versionName}</span>
                                <span className="text-white/45">×</span>
                              </button>
                            )
                          })}
                        </div>
                      ) : null}
                    </div>

                    <div className="w-full max-w-xl space-y-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <select
                          value={compareVersionId}
                          onChange={(event) => setCompareVersionId(event.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-3 text-sm text-white outline-none transition focus:border-[#213c2d] sm:max-w-[260px]"
                        >
                          {availableCompareOptions.length > 0 ? (
                            availableCompareOptions.map((version) => (
                              <option key={version.id} value={version.id}>
                                {version.name}
                              </option>
                            ))
                          ) : (
                            <option value="">Sin versiones disponibles</option>
                          )}
                        </select>

                        <button
                          type="button"
                          onClick={() => void handleAddCompareVersion()}
                          disabled={
                            compareLoading ||
                            !compareVersionId ||
                            activeCompareVersionIds.includes(compareVersionId) ||
                            availableCompareOptions.length === 0
                          }
                          className="rounded-full bg-[#213c2d] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {availableCompareOptions.length === 0
                            ? "Sin otra versión"
                            : compareLoading
                              ? "Cargando..."
                              : "Agregar versión"}
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleAnalyzeWithAI()}
                          disabled={aiLoading || aiReadyComparisons.length === 0}
                          className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {aiLoading ? "Analizando..." : "Analizar con IA"}
                        </button>
                      </div>

                      {compareError ? (
                        <p className="text-sm text-rose-400">{compareError}</p>
                      ) : null}

                      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/40">Resumen IA</p>
                            <p className="mt-1 text-sm text-white/55">Manual, breve y centrado en matices de redacción.</p>
                          </div>
                          <span className="rounded-full border border-white/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/60">
                            OpenAI
                          </span>
                        </div>

                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-relaxed text-white/85">
                          {aiLoading ? (
                            <p>Analizando diferencias entre versiones...</p>
                          ) : aiError ? (
                            <p className="text-rose-300">{aiError}</p>
                          ) : aiSummary ? (
                            <p>{aiSummary}</p>
                          ) : (
                            <p className="text-white/55">
                              Agrega al menos una versión cargada y usa el botón de IA para obtener un resumen rápido de similitudes, cambios de énfasis y diferencias visibles.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="flex min-h-0 flex-1 flex-col">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/40">Lectura comparada</p>
                      <p className="mt-1 text-sm text-white/55">
                        Verde: agregado. Amarillo: reemplazo. Rojo: eliminado.
                      </p>
                    </div>
                    <p className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/65">
                      {Math.max(compareColumns.length - 1, 0)} versiones activas
                    </p>
                  </div>

                  <div className="min-h-0 flex-1 overflow-x-auto pb-2">
                    <div className="flex h-full min-w-max gap-4">
                      {compareColumns.map((column) => (
                        <article
                          key={column.key}
                          data-compare-column={column.isBase ? "base" : column.versionId}
                          className="flex h-full w-[min(84vw,22rem)] flex-none flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5"
                        >
                          <div className="border-b border-white/10 px-4 py-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/40">
                                  {column.isBase ? "Versión actual" : "Versión comparada"}
                                </p>
                                <h4 className="mt-1 text-lg font-semibold text-white">{column.versionName}</h4>
                              </div>

                              <div className="flex items-center gap-2">
                                {column.isBase ? (
                                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                                    Actual
                                  </span>
                                ) : column.similarity !== null ? (
                                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                                    {column.similarity}% similar
                                  </span>
                                ) : null}

                                {!column.isBase ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCompareVersion(column.versionId)}
                                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/70 transition hover:bg-white/5"
                                    aria-label={`Quitar ${column.versionName}`}
                                  >
                                    Quitar
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          <div
                            ref={(node) => setCompareColumnRef(column.key, node)}
                            onScroll={(event) =>
                              handleColumnScroll(column.key, event.currentTarget.scrollTop)
                            }
                            data-compare-scroll={column.isBase ? "base" : column.versionId}
                            className="flex-1 overflow-y-auto px-4 py-4"
                          >
                            {column.isLoading ? (
                              <p className="text-lg font-medium leading-[1.85] text-white/65">
                                Cargando comparación...
                              </p>
                            ) : column.error ? (
                              <div className="space-y-3">
                                <p className="text-base font-medium leading-relaxed text-rose-300">
                                  {column.error}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => void handleAddCompareVersion(column.versionId)}
                                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white/85 transition hover:bg-white/5"
                                >
                                  Reintentar
                                </button>
                              </div>
                            ) : column.isBase ? (
                              <p className="whitespace-pre-wrap text-xl font-medium leading-[1.85] text-white/90">
                                {column.text}
                              </p>
                            ) : column.text ? (
                              <p className="whitespace-pre-wrap text-xl font-medium leading-[1.85] text-white/90">
                                {renderDiffSpans(column.diffSpans)}
                              </p>
                            ) : (
                              <p className="text-lg font-medium leading-[1.85] text-white/65">
                                No se pudo cargar la comparación.
                              </p>
                            )}

                            <p className="mt-4 text-sm font-semibold text-white/55">
                              {column.reference}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="border-t border-white/10 px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-white/55">
                  Base fija: {baseVersionName}. Las demás columnas se pueden agregar o quitar sin perder la versión actual.
                </p>

                <button
                  type="button"
                  onClick={() => void handleAddCompareVersion()}
                  disabled={
                    compareLoading ||
                    !compareVersionId ||
                    activeCompareVersionIds.includes(compareVersionId) ||
                    availableCompareOptions.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="text-lg leading-none">+</span>
                  Agregar versión
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
})

export { Verse }
export const VerseBlock = Verse
